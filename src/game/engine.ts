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

import { Application, Container } from 'pixi.js'

import { MAP_COLS, MAP_ROWS, TILE_SIZE, WORLD_SCALE } from '../constants'
import { computeCenterOffset } from './camera'
import { buildFarmScene } from './scenes/farm'
import { loadTextureAtlas, type TextureAtlas } from './textures'
import type { CatalogKey } from './sprites/catalog'

/** A running engine instance. `destroy()` is idempotent and safe to call once. */
export interface EngineHandle {
  destroy(): void
}

/** Sheets the farm scene needs loaded before assembly. */
const SCENE_SHEETS: readonly CatalogKey[] = [
  'grass',
  'paths',
  'water',
  'woodenHouse',
  'grassBiom',
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
    'background:#3b2a33',
    'color:#e8cfa6',
    'font-family:monospace',
    'font-size:14px',
    'text-align:center',
    'image-rendering:pixelated',
  ].join(';')
  panel.textContent = `⚠ 農場載入失敗：${message}`
  container.appendChild(panel)
}

/**
 * Waits until `container` has a non-zero size, then resolves. Defers init for a
 * zero-size container so centering never divides into an empty viewport.
 */
function whenSized(container: HTMLElement): Promise<void> {
  if (container.clientWidth > 0 && container.clientHeight > 0) {
    return Promise.resolve()
  }
  return new Promise((resolve) => {
    const observer = new ResizeObserver(() => {
      if (container.clientWidth > 0 && container.clientHeight > 0) {
        observer.disconnect()
        resolve()
      }
    })
    observer.observe(container)
  })
}

export function createEngine(container: HTMLElement): EngineHandle {
  let destroyed = false
  let app: Application | null = null
  let atlas: TextureAtlas | null = null
  let detachResize: (() => void) | null = null

  const init = async (): Promise<void> => {
    try {
      await whenSized(container)
      if (destroyed) return

      const application = new Application()
      await application.init({
        resizeTo: container,
        background: '#7fb65a',
        antialias: false,
        roundPixels: true,
      })
      if (destroyed) {
        application.destroy(true, { children: true })
        return
      }
      app = application
      container.appendChild(app.canvas)

      atlas = await loadTextureAtlas(SCENE_SHEETS)
      if (destroyed) return

      const world = new Container()
      world.scale.set(WORLD_SCALE)
      app.stage.addChild(world)
      buildFarmScene(world, atlas)

      const recenter = (): void => {
        if (!app) return
        const offset = computeCenterOffset(
          MAP_PX,
          { w: app.screen.width, h: app.screen.height },
          WORLD_SCALE,
        )
        world.position.set(offset.x, offset.y)
      }
      recenter()

      window.addEventListener('resize', recenter)
      detachResize = () => window.removeEventListener('resize', recenter)
    } catch (error: unknown) {
      if (!destroyed) showError(container, error)
    }
  }

  void init()

  return {
    destroy(): void {
      destroyed = true
      detachResize?.()
      detachResize = null
      atlas?.destroy()
      atlas = null
      if (app) {
        app.destroy(true, { children: true })
        app = null
      }
    },
  }
}
