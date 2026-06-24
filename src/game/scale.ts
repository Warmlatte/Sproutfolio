/**
 * Responsive world scaling (M5). Derives an integer world-scale multiplier large
 * enough to COVER the viewport, so the camera always has room to follow and the
 * viewport never reveals empty space past the map edges.
 *
 * The farm map is landscape (448×288). A portrait phone is bound by height, a
 * wide desktop by width — a width-only rule under-scales portrait and exposes the
 * map's top/bottom edges. Taking the cover ratio of the more-constrained axis and
 * rounding up fixes both. Pure (no DOM): the engine reads the container size and
 * passes it in, on init and on resize.
 */

import { MAP_COLS, MAP_ROWS, MIN_WORLD_SCALE, TILE_SIZE } from '../constants'

const MAP_W_PX = MAP_COLS * TILE_SIZE
const MAP_H_PX = MAP_ROWS * TILE_SIZE

/**
 * Resolves a viewport size (px) to the smallest integer world-scale that covers
 * both dimensions: `ceil(max(viewportW / MAP_W_PX, viewportH / MAP_H_PX))`,
 * floored at `MIN_WORLD_SCALE`. Guarantees `MAP_*_PX × scale >= viewport`, so the
 * camera follow never falls back to centering with exposed edges.
 */
export function computeWorldScale(viewportW: number, viewportH: number): number {
  const cover = Math.max(viewportW / MAP_W_PX, viewportH / MAP_H_PX)
  return Math.max(MIN_WORLD_SCALE, Math.ceil(cover))
}
