/**
 * Farm scene assembly (M3). Reads the engine-free `farmMap` data and adds one
 * Pixi `Sprite` per tile to the world container, in layer order so higher layers
 * overlap lower ones. Textures come from the engine's `TextureAtlas` (the atlas
 * is loaded per engine instance, so it is injected rather than imported).
 */

import { Container, Sprite } from 'pixi.js'

import { TILE_SIZE } from '../../constants'
import { farmMap, type FarmMap } from '../map/farmMap'
import type { TextureAtlas } from '../textures'

function placeTile(
  world: Container,
  atlas: TextureAtlas,
  sheet: Parameters<TextureAtlas['getTexture']>[0],
  index: number,
  col: number,
  row: number,
): void {
  const sprite = new Sprite(atlas.getTexture(sheet, index))
  sprite.x = col * TILE_SIZE
  sprite.y = row * TILE_SIZE
  world.addChild(sprite)
}

/**
 * Assembles the static farm into `world`: a grass base filling the whole grid,
 * then each map layer (paths, pond, house, trees) in order. Multi-tile prefabs
 * such as the wooden house are placed by their relative sheet positions, so the
 * tile seams line up.
 */
export function buildFarmScene(
  world: Container,
  atlas: TextureAtlas,
  map: FarmMap = farmMap,
): void {
  for (let row = 0; row < map.rows; row += 1) {
    for (let col = 0; col < map.cols; col += 1) {
      placeTile(world, atlas, 'grass', map.grassFill, col, row)
    }
  }

  for (const layer of map.layers) {
    for (const tile of layer.tiles) {
      placeTile(world, atlas, layer.sheet, tile.index, tile.col, tile.row)
    }
  }
}
