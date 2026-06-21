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
