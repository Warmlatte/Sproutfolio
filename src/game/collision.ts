/**
 * Collision (M4). Pure, engine-free, node-testable — no Pixi import.
 *
 * Collision data is DERIVED from the map's obstacle render layers rather than a
 * separately hand-maintained grid, so editing the map can never desynchronize
 * what is drawn from what blocks movement (single source of truth).
 */

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
