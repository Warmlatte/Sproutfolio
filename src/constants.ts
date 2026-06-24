/**
 * Pixel constants — seed values for later world and UI work.
 * All values are integers; non-integer scaling breaks pixel sharpness.
 * Source of truth: docs/style-guide.md §1.
 */

/** Base tile size in pixels — all pixel art derives from a 16×16 grid. */
export const TILE_SIZE = 16

/** Integer zoom applied to the game world (3×). Default/desktop reference; the
 * engine now derives the live scale per viewport width via `computeWorldScale`. */
export const WORLD_SCALE = 3

// --- Responsive scaling breakpoints (M5) ---
// Fixed width breakpoints map to integer world-scale tiers so pixel art stays
// crisp at every size. Inclusive lower bounds: width === breakpoint → next tier.

/** Below this container width, the world renders at 2× (phone portrait). */
export const SCALE_BP_SM = 640

/** At/above SM and below this width → 3×; at/above this width → 4× (desktop). */
export const SCALE_BP_MD = 1024

// --- Touch controls (M5) ---
// On-screen overlay sizes in CSS pixels (not world pixels). Integers keep the
// pixel-styled controls aligned to whole device pixels.

/** Diameter of the virtual joystick base ring. */
export const JOYSTICK_BASE_PX = 120

/** Diameter of the draggable joystick thumb. */
export const JOYSTICK_THUMB_PX = 56

/** Drag displacement at or below this radius (px) reads as no movement. */
export const JOYSTICK_DEADZONE_PX = 12

/** Diameter of the interact button. */
export const INTERACT_BTN_PX = 64

/** Corner hint shown on non-touch devices, describing the keyboard controls. */
export const KEYBOARD_HINT = '方向鍵 / WASD 移動，空白鍵互動'

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
 * The character art occupies rows 16–31 of every 48×48 `player` frame: 16px of
 * transparent padding above the head and 16px below the feet. The feet point
 * `px` must map to the art's foot line (y=32), NOT the frame's bottom edge —
 * otherwise collision and rendering sit one tile below the visible character.
 */
export const PLAYER_FOOT_INSET = 16

/**
 * Visible-character extent from the feet point `px`, measured from the sheet
 * (content rows 16–31, ~14px wide): `up` px to the head, `halfW` px each side.
 * Used to clamp the player so the visible body stays inside the map (and thus
 * inside the map-clamped camera).
 */
export const PLAYER_BODY = { up: 16, halfW: 8 } as const

/**
 * Facing → spritesheet row for the 4×4 `player` sheet (48×48 frames).
 * Confirmed visually from `character_spritesheet.png`: rows are down/up/left/right.
 */
export const PLAYER_ROW_DOWN = 0
export const PLAYER_ROW_UP = 1
export const PLAYER_ROW_LEFT = 2
export const PLAYER_ROW_RIGHT = 3
