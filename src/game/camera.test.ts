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

  it('keeps the viewport inside the map when the map is larger (clamp)', () => {
    // scaledMap 300×300, viewport 150×150 → centered offset is negative but the
    // viewport must never show past the map edge.
    const mapPx = { w: 100, h: 100 }
    const viewportPx = { w: 150, h: 150 }
    const scale = 3
    const offset = computeCenterOffset(mapPx, viewportPx, scale)

    const scaledW = mapPx.w * scale
    const scaledH = mapPx.h * scale
    // Upper bound 0 (left/top edge not crossed), lower bound viewport - scaledMap
    // (right/bottom edge not crossed).
    expect(offset.x).toBeLessThanOrEqual(0)
    expect(offset.x).toBeGreaterThanOrEqual(viewportPx.w - scaledW)
    expect(offset.y).toBeLessThanOrEqual(0)
    expect(offset.y).toBeGreaterThanOrEqual(viewportPx.h - scaledH)
  })

  it('returns integer pixel offsets to keep pixels sharp', () => {
    // (201 - 100) / 2 = 50.5 → must be rounded to a whole pixel
    const offset = computeCenterOffset({ w: 100, h: 100 }, { w: 201, h: 201 }, 1)
    expect(Number.isInteger(offset.x)).toBe(true)
    expect(Number.isInteger(offset.y)).toBe(true)
  })
})
