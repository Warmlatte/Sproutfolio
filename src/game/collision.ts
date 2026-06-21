/**
 * Collision (M4). Pure, engine-free, node-testable — no Pixi import.
 *
 * Collision data is DERIVED from the map's obstacle render layers rather than a
 * separately hand-maintained grid, so editing the map can never desynchronize
 * what is drawn from what blocks movement (single source of truth).
 */

import { TILE_SIZE } from '../constants'
import type { FarmMap } from './map/farmMap'

/** Layer names that block movement. Walkable layers (`paths`, `grass`) are absent. */
const SOLID_LAYERS: ReadonlySet<string> = new Set(['house', 'pond', 'trees'])

/** Grid-cell key used by the solid set and `resolveMove`. */
export const cellKey = (col: number, row: number): string => `${col},${row}`

/**
 * The set of blocked grid cells (`"col,row"`), collected from the map's obstacle
 * layers (`house`, `pond`, `trees`). Walkable layers are excluded so the player
 * can walk on grass and paths.
 */
export function buildSolidSet(map: FarmMap): ReadonlySet<string> {
  const solids = new Set<string>()
  for (const layer of map.layers) {
    if (!SOLID_LAYERS.has(layer.name)) continue
    for (const tile of layer.tiles) {
      solids.add(cellKey(tile.col, tile.row))
    }
  }
  return solids
}

/** An axis-aligned box: top-left corner `(x, y)` with size `w × h` (unscaled px). */
export interface Box {
  readonly x: number
  readonly y: number
  readonly w: number
  readonly h: number
}

/** Map pixel extent the feet box is clamped within. */
export interface Bounds {
  readonly w: number
  readonly h: number
}

/** A resolved top-left position. */
export interface Position {
  readonly x: number
  readonly y: number
}

// A hair less than a tile so a box whose far edge sits exactly on a cell
// boundary counts as touching that cell, not overlapping the next one.
const EPSILON = 1e-6

const clamp = (value: number, lo: number, hi: number): number =>
  Math.min(Math.max(value, lo), hi)

/** Whether a box `[x, x+w) × [y, y+h)` overlaps any solid grid cell. */
function overlapsSolid(
  x: number,
  y: number,
  w: number,
  h: number,
  solids: ReadonlySet<string>,
): boolean {
  const c0 = Math.floor(x / TILE_SIZE)
  const c1 = Math.floor((x + w - EPSILON) / TILE_SIZE)
  const r0 = Math.floor(y / TILE_SIZE)
  const r1 = Math.floor((y + h - EPSILON) / TILE_SIZE)
  for (let r = r0; r <= r1; r += 1) {
    for (let c = c0; c <= c1; c += 1) {
      if (solids.has(cellKey(c, r))) return true
    }
  }
  return false
}

/**
 * Resolves an attempted move of feet box `box` by `(dx, dy)` against `solids`,
 * then clamps within `bounds`. Resolution is AXIS-SEPARATED: x and y are applied
 * independently so blocking one axis still allows sliding along the other. When
 * the box would overlap a solid on an axis, motion on that axis stops at the
 * cell edge. The feet box is finally clamped inside the map so the player never
 * leaves it. Returns a new position (no mutation of `box`).
 */
export function resolveMove(
  box: Box,
  dx: number,
  dy: number,
  solids: ReadonlySet<string>,
  bounds: Bounds,
): Position {
  // --- X axis ---
  let nx = box.x + dx
  if (dx !== 0 && overlapsSolid(nx, box.y, box.w, box.h, solids)) {
    if (dx > 0) {
      const col = Math.floor((nx + box.w - EPSILON) / TILE_SIZE)
      nx = col * TILE_SIZE - box.w
    } else {
      const col = Math.floor(nx / TILE_SIZE)
      nx = (col + 1) * TILE_SIZE
    }
  }
  nx = clamp(nx, 0, bounds.w - box.w)

  // --- Y axis (using the resolved x for the perpendicular span) ---
  let ny = box.y + dy
  if (dy !== 0 && overlapsSolid(nx, ny, box.w, box.h, solids)) {
    if (dy > 0) {
      const row = Math.floor((ny + box.h - EPSILON) / TILE_SIZE)
      ny = row * TILE_SIZE - box.h
    } else {
      const row = Math.floor(ny / TILE_SIZE)
      ny = (row + 1) * TILE_SIZE
    }
  }
  ny = clamp(ny, 0, bounds.h - box.h)

  return { x: nx, y: ny }
}
