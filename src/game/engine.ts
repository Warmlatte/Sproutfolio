/**
 * Pixi engine bootstrap (M3). Owns the engine lifecycle behind a tiny handle so
 * the React container can mount and tear it down safely.
 *
 * `createEngine` returns synchronously with a `destroy()` while kicking off async
 * init (Pixi `Application.init` + asset loading). A `destroyed` guard makes the
 * mount→unmount→remount cycle of React Strict Mode leak-free: if teardown runs
 * before init finishes, the half-built engine is disposed instead of attached.
 *
 * The world is a single container scaled by the integer `WORLD_SCALE`; the map
 * is centered via the pure `computeCenterOffset` and re-centered on resize. Asset
 * load failures surface a visible pixel-styled message instead of failing silently.
 */

import { Application, Container, type Ticker } from 'pixi.js'

import { MAP_COLS, MAP_ROWS, TILE_SIZE, WORLD_SCALE } from '../constants'
import { computeFollowOffset } from './camera'
import { buildSolidSet } from './collision'
import { createInput, type InputSource } from './input'
import { farmMap } from './map/farmMap'
import { createPlayer } from './player'
import { buildFarmScene } from './scenes/farm'
import { loadTextureAtlas, type TextureAtlas } from './textures'
import type { CatalogKey } from './sprites/catalog'

/** A running engine instance. `destroy()` is idempotent and safe to call once. */
export interface EngineHandle {
  destroy(): void
}

/** Sheets the farm scene and player need loaded before assembly. */
const SCENE_SHEETS: readonly CatalogKey[] = [
  'grass',
  'paths',
  'water',
  'woodenHouse',
  'grassBiom',
  'player',
]

const MAP_PX = { w: MAP_COLS * TILE_SIZE, h: MAP_ROWS * TILE_SIZE }

/** Renders a visible pixel-styled error panel inside the container. */
function showError(container: HTMLElement, error: unknown): void {
  const message = error instanceof Error ? error.message : String(error)
  const panel = document.createElement('div')
  panel.setAttribute('data-engine-error', 'true')
  panel.style.cssText = [
    'display:flex',
    'align-items:center',
    'justify-content:center',
    'width:100%',
    'height:100%',
    'padding:16px',
    'box-sizing:border-box',
    'background:var(--color-outline)',
    'color:var(--color-text-invert)',
    'font-family:var(--font-pixel)',
    'font-size:var(--text-pixel-sm)',
    'text-align:center',
    'image-rendering:pixelated',
  ].join(';')
  panel.textContent = `⚠ 農場載入失敗：${message}`
  container.replaceChildren(panel)
}

function destroyApp(app: Application | null): null {
  if (app) {
    app.destroy(true, { children: true })
  }
  return null
}

function destroyAtlas(atlas: TextureAtlas | null): null {
  atlas?.destroy()
  return null
}

/**
 * Waits until `container` has a non-zero size, then resolves. Defers init for a
 * zero-size container so centering never divides into an empty viewport.
 */
function waitForSize(container: HTMLElement): {
  readonly promise: Promise<void>
  readonly cancel: () => void
} {
  if (container.clientWidth > 0 && container.clientHeight > 0) {
    return { promise: Promise.resolve(), cancel: () => {} }
  }
  let observer: ResizeObserver | null = null
  let resolvePromise: () => void = () => {}
  const promise = new Promise<void>((resolve) => {
    resolvePromise = resolve
    observer = new ResizeObserver(() => {
      if (container.clientWidth > 0 && container.clientHeight > 0) {
        observer?.disconnect()
        observer = null
        resolve()
      }
    })
    observer.observe(container)
  })
  return {
    promise,
    cancel: () => {
      observer?.disconnect()
      observer = null
      resolvePromise()
    },
  }
}

export function createEngine(container: HTMLElement): EngineHandle {
  let destroyed = false
  let app: Application | null = null
  let atlas: TextureAtlas | null = null
  let input: InputSource | null = null
  let tick: ((ticker: Ticker) => void) | null = null
  let detachResize: (() => void) | null = null

  /** Releases the per-frame loop, input listeners, and resize observer. */
  const stopLoop = (): void => {
    if (app && tick) app.ticker.remove(tick)
    tick = null
    input?.destroy()
    input = null
    detachResize?.()
    detachResize = null
  }

  const init = async (): Promise<void> => {
    try {
      const sizeWaiter = waitForSize(container)
      detachResize = sizeWaiter.cancel
      await sizeWaiter.promise
      detachResize = null
      if (destroyed) return

      const application = new Application()
      await application.init({
        resizeTo: container,
        backgroundAlpha: 0,
        antialias: false,
        roundPixels: true,
      })
      if (destroyed) {
        destroyApp(application)
        return
      }
      app = application
      container.appendChild(app.canvas)

      const loadedAtlas = await loadTextureAtlas(SCENE_SHEETS)
      if (destroyed) {
        destroyAtlas(loadedAtlas)
        return
      }
      atlas = loadedAtlas

      const world = new Container()
      world.scale.set(WORLD_SCALE)
      app.stage.addChild(world)
      buildFarmScene(world, atlas)

      const solids = buildSolidSet(farmMap)
      const player = createPlayer(world, atlas, farmMap.anchors.spawn)
      input = createInput()

      // Reposition the world so the camera centers on the player, clamped to the
      // map. Used both per-frame and on container resize.
      const follow = (): void => {
        if (!app) return
        const offset = computeFollowOffset(
          player.px,
          { w: app.screen.width, h: app.screen.height },
          MAP_PX,
          WORLD_SCALE,
        )
        world.position.set(offset.x, offset.y)
      }
      follow()

      // Recompute from the CONTAINER's size, not the window — the two can differ
      // once panels/sidebars arrive (M7). Pixi's resize plugin listens to
      // window resize, so container-only changes must be applied explicitly first.
      const resizeObserver = new ResizeObserver(() => {
        app?.resize()
        follow()
      })
      resizeObserver.observe(container)
      detachResize = () => resizeObserver.disconnect()

      // Per-frame loop: read input → advance the player → follow the camera.
      tick = (ticker: Ticker): void => {
        const dt = ticker.deltaMS / 1000
        player.update(dt, input?.read() ?? { x: 0, y: 0 }, solids)
        follow()
      }
      app.ticker.add(tick)
    } catch (error: unknown) {
      stopLoop()
      atlas = destroyAtlas(atlas)
      app = destroyApp(app)
      if (!destroyed) showError(container, error)
    }
  }

  void init()

  return {
    destroy(): void {
      destroyed = true
      stopLoop()
      atlas = destroyAtlas(atlas)
      app = destroyApp(app)
    },
  }
}
