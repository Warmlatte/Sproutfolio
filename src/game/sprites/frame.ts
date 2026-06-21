/**
 * Pure slice math (M2). No side effects, no engine, no DOM.
 *
 * `frameRect` resolves a row-major grid index to its source rectangle;
 * `nineSliceRects` splits a nine-slice sheet into its nine source rectangles.
 * Both validate inputs and throw explicit errors rather than returning an
 * invalid rectangle (see design.md failure modes).
 */

import type { GridSheet, NineSlice, Rect } from './types'

/**
 * Source rectangle for the grid frame at `index`, using row-major ordering.
 * Throws when `index` is not an integer in `[0, cols * rows)`.
 */
export function frameRect(sheet: GridSheet, index: number): Rect {
  const count = sheet.cols * sheet.rows
  if (!Number.isInteger(index) || index < 0 || index >= count) {
    throw new RangeError(
      `frameRect: index ${index} out of range for sheet "${sheet.key}" (0..${count - 1})`,
    )
  }

  const col = index % sheet.cols
  const row = Math.floor(index / sheet.cols)
  return {
    sx: col * sheet.frameW,
    sy: row * sheet.frameH,
    sw: sheet.frameW,
    sh: sheet.frameH,
  }
}

/**
 * The nine source rectangles of a nine-slice sheet, ordered top-left to
 * bottom-right (rows then columns). Corners are `border × border`; edges and
 * the center span the remaining inner dimensions.
 */
export function nineSliceRects(sheet: NineSlice): readonly Rect[] {
  const { width, height, border } = sheet
  if (
    !Number.isInteger(width) ||
    width <= 0 ||
    !Number.isInteger(height) ||
    height <= 0 ||
    !Number.isInteger(border) ||
    border <= 0
  ) {
    throw new RangeError(
      `nineSliceRects: sheet "${sheet.key}" requires positive integer width, height, and border`,
    )
  }

  const innerW = width - 2 * border
  const innerH = height - 2 * border
  if (innerW < 0 || innerH < 0) {
    throw new RangeError(
      `nineSliceRects: border ${border} too large for sheet "${sheet.key}" (${width}×${height})`,
    )
  }

  const xs = [0, border, width - border]
  const ys = [0, border, height - border]
  const widths = [border, innerW, border]
  const heights = [border, innerH, border]

  const rects: Rect[] = []
  for (let row = 0; row < 3; row += 1) {
    for (let col = 0; col < 3; col += 1) {
      rects.push({
        sx: xs[col],
        sy: ys[row],
        sw: widths[col],
        sh: heights[row],
      })
    }
  }
  return rects
}
