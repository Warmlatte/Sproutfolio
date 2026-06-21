import { describe, expect, it } from 'vitest'

import { computeCenterOffset } from './camera'

describe('computeCenterOffset', () => {
  it('centers a map that is smaller than the viewport', () => {
    // scaledMap = 100×100, viewport 300×200 → margins (300-100)/2, (200-100)/2
    expect(computeCenterOffset({ w: 100, h: 100 }, { w: 300, h: 200 }, 1)).toEqual({
      x: 100,
      y: 50,
    })
  })

  it('applies the integer scale before centering', () => {
    // mapPx 100×100 at 3× → scaledMap 300×300, viewport 360×360 → margin 30
    expect(computeCenterOffset({ w: 100, h: 100 }, { w: 360, h: 360 }, 3)).toEqual({
      x: 30,
      y: 30,
    })
  })

  it('centers a map larger than the viewport with a negative offset', () => {
    // scaledMap 300×300, viewport 150×150 → span = 150 - 300 = -150, centered at
    // round(-150 / 2) = -75. Asserting the exact value (not just the bounds)
    // catches any regression in the centering math, since a bounds-only check
    // would still pass with a broken offset anywhere in [-150, 0].
    const offset = computeCenterOffset({ w: 100, h: 100 }, { w: 150, h: 150 }, 3)
    expect(offset).toEqual({ x: -75, y: -75 })

    const scaled = 100 * 3
    const viewport = 150
    // The clamp range that M4's player-follow camera will reuse: the offset must
    // stay within [viewport - scaledMap, 0] so the viewport never reveals empty
    // space past the map edges.
    expect(offset.x).toBeLessThanOrEqual(0)
    expect(offset.x).toBeGreaterThanOrEqual(viewport - scaled)
  })

  it('returns integer pixel offsets to keep pixels sharp', () => {
    // (201 - 100) / 2 = 50.5 → must be rounded to a whole pixel
    const offset = computeCenterOffset({ w: 100, h: 100 }, { w: 201, h: 201 }, 1)
    expect(Number.isInteger(offset.x)).toBe(true)
    expect(Number.isInteger(offset.y)).toBe(true)
  })
})
