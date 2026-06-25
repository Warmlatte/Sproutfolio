import { describe, it, expect } from 'vitest'
import { revealedCount } from './typewriter'

describe('revealedCount', () => {
  // Spec example: speedMs 30, total 10.
  it.each([
    { elapsedMs: 0, speedMs: 30, expected: 0 },
    { elapsedMs: 95, speedMs: 30, expected: 3 },
    { elapsedMs: 100000, speedMs: 30, expected: 10 },
    { elapsedMs: -50, speedMs: 30, expected: 0 },
    { elapsedMs: 0, speedMs: 0, expected: 10 },
  ])(
    'reveals $expected chars at elapsed $elapsedMs / speed $speedMs',
    ({ elapsedMs, speedMs, expected }) => {
      expect(revealedCount(elapsedMs, speedMs, 10)).toBe(expected)
    },
  )
})
