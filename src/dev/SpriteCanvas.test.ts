import { describe, expect, it } from 'vitest'
import { isPositiveIntegerScale, spriteCanvasDimensions } from './SpriteCanvas'

describe('isPositiveIntegerScale', () => {
  it.each([
    { scale: 1, expected: true },
    { scale: 4, expected: true },
    { scale: 0, expected: false },
    { scale: -1, expected: false },
    { scale: 1.5, expected: false },
  ])('returns $expected for scale $scale', ({ scale, expected }) => {
    expect(isPositiveIntegerScale(scale)).toBe(expected)
  })
})

describe('spriteCanvasDimensions', () => {
  it('sums scaled rect widths and gaps while using the tallest scaled rect', () => {
    expect(
      spriteCanvasDimensions(
        [
          { sx: 0, sy: 0, sw: 16, sh: 16 },
          { sx: 16, sy: 0, sw: 8, sh: 24 },
          { sx: 24, sy: 0, sw: 4, sh: 12 },
        ],
        3,
        6,
      ),
    ).toEqual({ width: 96, height: 72 })
  })

  it('returns a one-pixel fallback size when there are no rects', () => {
    expect(spriteCanvasDimensions([], 4, 8)).toEqual({ width: 1, height: 1 })
  })
})
