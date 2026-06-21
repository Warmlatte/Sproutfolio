/**
 * Pixel constants — seed values for later world and UI work.
 * All values are integers; non-integer scaling breaks pixel sharpness.
 * Source of truth: docs/style-guide.md §1.
 */

/** Base tile size in pixels — all pixel art derives from a 16×16 grid. */
export const TILE_SIZE = 16

/** Integer zoom applied to the game world (3×). */
export const WORLD_SCALE = 3

/** Integer zoom applied to UI surfaces (2×). */
export const UI_SCALE = 2

/** Farm map width in tiles (M3). 28×18 ≈ 448×288 px at 1×, 1344×864 at 3×. */
export const MAP_COLS = 28

/** Farm map height in tiles (M3). */
export const MAP_ROWS = 18
