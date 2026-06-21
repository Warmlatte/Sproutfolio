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

// --- Player movement (M4) ---
// Tunable feel values: free pixel-velocity movement, not tile-locked stepping.
// All in unscaled world coordinates (the world container applies WORLD_SCALE).

/** Walk speed in unscaled world pixels per second (≈ 4 tiles/s at TILE_SIZE 16). */
export const PLAYER_SPEED = 64

/** Walk-cycle animation rate in frames per second. */
export const PLAYER_ANIM_FPS = 8

/**
 * Feet-aligned collision box (unscaled px), centered on the player's bottom edge.
 * A small box (about one tile wide, short) gives the standard top-down feel where
 * only the feet collide, so the head can overlap obstacles drawn above.
 */
export const PLAYER_HITBOX = { w: 16, h: 10 } as const

/**
 * Facing → spritesheet row for the 4×4 `player` sheet (48×48 frames).
 * `待核對` — provisional row order pending visual confirmation on the `#sprites`
 * debug page. Correcting the mapping changes only these constants, never logic.
 */
export const PLAYER_ROW_DOWN = 0
export const PLAYER_ROW_UP = 1
export const PLAYER_ROW_LEFT = 2
export const PLAYER_ROW_RIGHT = 3
