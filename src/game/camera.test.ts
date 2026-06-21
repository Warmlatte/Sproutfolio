import { describe, expect, it } from 'vitest'

import { computeCenterOffset, computeFollowOffset } from './camera'

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

describe('computeFollowOffset', () => {
  // A map larger than the viewport on both axes, so the camera can follow.
  const map = { w: 1000, h: 1000 }
  const view = { w: 200, h: 200 }

  it('centers the player when far from every map edge', () => {
    const player = { x: 500, y: 500 }
    const offset = computeFollowOffset(player, view, map, 1)
    // Player screen position = offset + player*scale must be the viewport center.
    expect(offset.x + player.x).toBe(view.w / 2)
    expect(offset.y + player.y).toBe(view.h / 2)
    expect(offset).toEqual({ x: -400, y: -400 })
  })

  it('clamps the offset at the near (top-left) map edge', () => {
    const offset = computeFollowOffset({ x: 50, y: 50 }, view, map, 1)
    // Clamped to 0 so the viewport never shows empty space before the map.
    expect(offset).toEqual({ x: 0, y: 0 })
  })

  it('clamps the offset at the far (bottom-right) map edge', () => {
    const offset = computeFollowOffset({ x: 980, y: 980 }, view, map, 1)
    // Clamped to viewport - scaledMap = 200 - 1000 = -800.
    expect(offset).toEqual({ x: -800, y: -800 })
  })

  it('applies the integer scale before centering', () => {
    // map 100×100 at 3× → scaled 300; viewport 360; player at 50 (unscaled).
    const offset = computeFollowOffset({ x: 50, y: 50 }, { w: 360, h: 360 }, { w: 100, h: 100 }, 3)
    // ideal = round(180 - 150) = 30, within clamp [-60+... ] → centered on player.
    expect(offset.x + 50 * 3).toBe(180)
    expect(offset.y + 50 * 3).toBe(180)
  })

  it('falls back to the centered value when the scaled map is smaller than the viewport on an axis', () => {
    // x axis: map 50 wide at 1× = 50 < 200 → fallback; y axis: 1000 > 200 → follow.
    const narrow = { w: 50, h: 1000 }
    const offset = computeFollowOffset({ x: 25, y: 980 }, view, narrow, 1)
    const centered = computeCenterOffset(narrow, view, 1)
    expect(offset.x).toBe(centered.x)
    // y still follows + clamps to far edge.
    expect(offset.y).toBe(view.h - narrow.h * 1)
  })

  it('returns integer pixel offsets', () => {
    const offset = computeFollowOffset({ x: 50, y: 50 }, { w: 201, h: 201 }, { w: 25, h: 25 }, 1)
    expect(Number.isInteger(offset.x)).toBe(true)
    expect(Number.isInteger(offset.y)).toBe(true)
  })
})
