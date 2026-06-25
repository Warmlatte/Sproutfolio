/**
 * Pure sprite-sheet cell → CSS background math (M6).
 *
 * Resolves a grid sheet cell to the CSS `background-*` properties needed to show
 * a single, integer-scaled, pixel-perfect frame from a sheet. No DOM, no engine.
 * Index validation is delegated to `frameRect`, which throws `RangeError` for
 * out-of-range indices; scale is validated here.
 */

import { frameRect } from '../game/sprites/frame'
import type { GridSheet } from '../game/sprites/types'

/** CSS background properties for one integer-scaled sprite cell. */
export interface SpriteBackgroundStyle {
  readonly width: string
  readonly height: string
  readonly backgroundImage: string
  readonly backgroundPosition: string
  readonly backgroundSize: string
  readonly imageRendering: 'pixelated'
}

/**
 * Background style for the grid cell at `index`, scaled by integer `scale`.
 * Throws `RangeError` when `scale` is not a positive integer, and propagates the
 * `RangeError` from `frameRect` when `index` is out of range.
 */
export function spriteBackground(
  sheet: GridSheet,
  index: number,
  scale: number,
): SpriteBackgroundStyle {
  if (!Number.isInteger(scale) || scale <= 0) {
    throw new RangeError(
      `spriteBackground: scale ${scale} must be a positive integer`,
    )
  }

  const rect = frameRect(sheet, index)
  const sheetW = sheet.cols * sheet.frameW * scale
  const sheetH = sheet.rows * sheet.frameH * scale

  return {
    width: `${rect.sw * scale}px`,
    height: `${rect.sh * scale}px`,
    backgroundImage: `url(${sheet.src})`,
    backgroundPosition: `${-rect.sx * scale}px ${-rect.sy * scale}px`,
    backgroundSize: `${sheetW}px ${sheetH}px`,
    imageRendering: 'pixelated',
  }
}
