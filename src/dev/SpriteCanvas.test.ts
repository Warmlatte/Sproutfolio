import { describe, expect, it } from 'vitest'
import { isPositiveIntegerScale } from './SpriteCanvas'

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
