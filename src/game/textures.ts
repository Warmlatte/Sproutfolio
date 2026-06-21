/**
 * Engine-layer adapter (M3): translates the engine-agnostic M2 sprite catalog
 * into Pixi textures. This is the ONLY place where M2's pure slice data meets
 * Pixi — `src/game/sprites/` stays free of any Pixi import.
 *
 * A `TextureAtlas` loads the base `TextureSource` for a set of catalog keys
 * (pinned to nearest-neighbor sampling so scaled pixels stay sharp) and hands
 * out per-frame `Texture` objects via `getTexture(key, index)`, reusing the M2
 * `frameRect()` slice math. `destroy()` releases the loaded sources so the
 * engine can tear down without leaking GPU memory.
 */

import { Assets, Rectangle, Texture, type TextureSource } from 'pixi.js'

import { catalog, type CatalogKey } from './sprites/catalog'
import { frameRect } from './sprites/frame'
import type { GridSheet } from './sprites/types'

/** A loaded atlas: resolves catalog grid frames to Pixi textures. */
export interface TextureAtlas {
  /**
   * The texture for frame `index` of grid sheet `key`. Throws if the key was
   * not loaded, the sheet is not a grid sheet, or the index is out of range
   * (the last via the M2 `frameRect` guard).
   */
  getTexture(key: CatalogKey, index: number): Texture
  /** Releases every loaded source. Safe to call once during engine teardown. */
  destroy(): void
}

/**
 * Loads the base sources for `keys` and returns a `TextureAtlas`. Each source is
 * set to nearest-neighbor sampling at load time, so callers cannot accidentally
 * produce a blurry, non-pixel-perfect texture.
 */
export async function loadTextureAtlas(
  keys: readonly CatalogKey[],
): Promise<TextureAtlas> {
  const sources = new Map<CatalogKey, TextureSource>()

  await Promise.all(
    keys.map(async (key) => {
      const texture = await Assets.load<Texture>(catalog[key].src)
      texture.source.scaleMode = 'nearest'
      sources.set(key, texture.source)
    }),
  )

  const getTexture = (key: CatalogKey, index: number): Texture => {
    const source = sources.get(key)
    if (!source) {
      throw new Error(
        `getTexture: sheet "${key}" was not loaded into this atlas`,
      )
    }

    const sheet = catalog[key]
    if (sheet.kind !== 'grid') {
      throw new Error(
        `getTexture: sheet "${key}" is a ${sheet.kind} sheet, not a grid sheet`,
      )
    }

    const rect = frameRect(sheet as GridSheet, index)
    return new Texture({
      source,
      frame: new Rectangle(rect.sx, rect.sy, rect.sw, rect.sh),
    })
  }

  const destroy = (): void => {
    for (const key of sources.keys()) {
      Assets.unload(catalog[key].src)
    }
    sources.clear()
  }

  return { getTexture, destroy }
}
