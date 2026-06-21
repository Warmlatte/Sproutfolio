/**
 * Camera math (M3). Pure, engine-free, and node-testable — this module MUST NOT
 * import Pixi so it can be unit-tested without a browser environment.
 *
 * M3 renders a static, centered world. `computeCenterOffset` returns the integer
 * pixel offset to apply to the world container so the scaled map is centered in
 * the viewport, clamped so the viewport never shows past the map edge. M4 will
 * reuse the same clamp when the camera starts following the player.
 */

/** A width/height pair in pixels. */
export interface Size {
  readonly w: number
  readonly h: number
}

/** A world-container pixel offset. */
export interface Offset {
  readonly x: number
  readonly y: number
}

/** Clamps `value` into the inclusive range bounded by `a` and `b` (either order). */
function clamp(value: number, a: number, b: number): number {
  const lo = Math.min(a, b)
  const hi = Math.max(a, b)
  return Math.min(Math.max(value, lo), hi)
}

/** Centers one axis: `viewport - scaledMap` is the span; half of it centers. */
function centerAxis(mapPx: number, viewportPx: number, scale: number): number {
  const scaled = mapPx * scale
  const span = viewportPx - scaled
  // Round to whole device pixels so the integer-scaled world stays sharp.
  return clamp(Math.round(span / 2), 0, span)
}

/**
 * The integer offset that centers a `mapPx` map (scaled by integer `scale`)
 * within `viewportPx`. When the scaled map is larger than the viewport the
 * offset is negative but clamped to `[viewport - scaledMap, 0]`, so the viewport
 * never reveals empty space past the map edges.
 */
export function computeCenterOffset(
  mapPx: Size,
  viewportPx: Size,
  scale: number,
): Offset {
  return {
    x: centerAxis(mapPx.w, viewportPx.w, scale),
    y: centerAxis(mapPx.h, viewportPx.h, scale),
  }
}

/**
 * One axis of the player-follow offset. Centers the player, then clamps to
 * `[viewport - scaledMap, 0]` so the viewport never reveals empty space past the
 * map edges. When the scaled map is no larger than the viewport, falls back to
 * the centered value (identical to `computeCenterOffset`).
 */
function followAxis(
  playerCoord: number,
  mapPx: number,
  viewportPx: number,
  scale: number,
): number {
  const scaled = mapPx * scale
  if (scaled <= viewportPx) {
    return centerAxis(mapPx, viewportPx, scale)
  }
  // Round to whole device pixels so the integer-scaled world stays sharp.
  const ideal = Math.round(viewportPx / 2 - playerCoord * scale)
  return clamp(ideal, viewportPx - scaled, 0)
}

/**
 * The integer world-container offset that centers the player in the viewport,
 * clamped to the map bounds. `playerPx` is the player's unscaled world position
 * (a point, consistent with the player's `px`). On any axis where the scaled map
 * fits within the viewport, the offset falls back to centering.
 */
export function computeFollowOffset(
  playerPx: Offset,
  viewportPx: Size,
  mapPx: Size,
  scale: number,
): Offset {
  return {
    x: followAxis(playerPx.x, mapPx.w, viewportPx.w, scale),
    y: followAxis(playerPx.y, mapPx.h, viewportPx.h, scale),
  }
}
