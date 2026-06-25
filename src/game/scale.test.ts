import { describe, expect, it } from 'vitest'

import { MAP_COLS, MAP_ROWS, TILE_SIZE } from '../constants'
import { computeWorldScale } from './scale'

const MAP_W = MAP_COLS * TILE_SIZE // 448
const MAP_H = MAP_ROWS * TILE_SIZE // 288

describe('computeWorldScale', () => {
  // Spec `responsive-scaling` example table (MAP_W=448, MAP_H=288, MIN=2).
  // Cover scale = ceil(max(viewportW/MAP_W, viewportH/MAP_H)), floored at 2.
  it.each([
    { w: 390, h: 844, scale: 3, note: 'phone portrait (height-bound)' },
    { w: 360, h: 640, scale: 3, note: 'small phone portrait' },
    { w: 414, h: 896, scale: 4, note: 'large phone portrait' },
    { w: 1024, h: 768, scale: 3, note: 'tablet landscape' },
    { w: 1440, h: 900, scale: 4, note: 'laptop (width-bound)' },
    { w: 1920, h: 1080, scale: 5, note: 'desktop (width-bound)' },
    { w: 320, h: 240, scale: 2, note: 'tiny — clamps to MIN' },
  ])('maps viewport $w×$h to $scale× ($note)', ({ w, h, scale }) => {
    expect(computeWorldScale(w, h)).toBe(scale)
  })

  it('always returns an integer', () => {
    for (const [w, h] of [
      [390, 844],
      [800, 600],
      [1920, 1080],
      [2560, 1440],
    ]) {
      expect(Number.isInteger(computeWorldScale(w, h))).toBe(true)
    }
  })

  it('never returns less than the minimum scale of 2', () => {
    expect(computeWorldScale(1, 1)).toBe(2)
    expect(computeWorldScale(100, 100)).toBe(2)
  })

  it('always produces a scale that covers both viewport dimensions', () => {
    // The cover invariant: no exposed map edges on any axis, any viewport.
    for (const [w, h] of [
      [390, 844],
      [414, 896],
      [1024, 768],
      [1440, 900],
      [1920, 1080],
      [2560, 1600],
    ]) {
      const scale = computeWorldScale(w, h)
      expect(MAP_W * scale).toBeGreaterThanOrEqual(w)
      expect(MAP_H * scale).toBeGreaterThanOrEqual(h)
    }
  })
})
