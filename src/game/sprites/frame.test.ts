import { describe, it, expect } from 'vitest'
import { frameRect, nineSliceRects } from './frame'
import { catalog } from './catalog'
import type { GridSheet, NineSlice } from './types'

const player = catalog.player satisfies GridSheet
const water = catalog.water satisfies GridSheet
const dialogBox = catalog.dialogBox satisfies NineSlice

describe('frameRect', () => {
  // Spec example: frames on a 4×4 / 48px player sheet
  it.each([
    { index: 0, sx: 0, sy: 0 },
    { index: 4, sx: 0, sy: 48 },
    { index: 5, sx: 48, sy: 48 },
    { index: 15, sx: 144, sy: 144 },
  ])('maps player index $index to row-major rect', ({ index, sx, sy }) => {
    expect(frameRect(player, index)).toEqual({ sx, sy, sw: 48, sh: 48 })
  })

  // Spec example: bounds on a 4×1 / 16px water sheet
  it('maps water index 0 to the first frame', () => {
    expect(frameRect(water, 0)).toEqual({ sx: 0, sy: 0, sw: 16, sh: 16 })
  })

  it('maps water index 3 to the last frame', () => {
    expect(frameRect(water, 3)).toEqual({ sx: 48, sy: 0, sw: 16, sh: 16 })
  })

  it.each([
    { sheet: water, index: -1, label: 'water below 0' },
    { sheet: water, index: 4, label: 'water at cols*rows' },
    { sheet: player, index: -1, label: 'player below 0' },
    { sheet: player, index: 16, label: 'player at cols*rows' },
  ])('throws for out-of-range index ($label)', ({ sheet, index }) => {
    expect(() => frameRect(sheet, index)).toThrow()
  })
})

describe('nineSliceRects', () => {
  it('returns nine 16×16 rects in row-major order for the dialog box', () => {
    const rects = nineSliceRects(dialogBox)
    expect(rects).toHaveLength(9)
    for (const r of rects) {
      expect(r.sw).toBe(16)
      expect(r.sh).toBe(16)
    }
  })

  // Spec example: corners and center of the 48×48 dialog box
  it('places corners and center at the documented coordinates', () => {
    const rects = nineSliceRects(dialogBox)
    expect(rects[0]).toEqual({ sx: 0, sy: 0, sw: 16, sh: 16 }) // top-left
    expect(rects[2]).toEqual({ sx: 32, sy: 0, sw: 16, sh: 16 }) // top-right
    expect(rects[4]).toEqual({ sx: 16, sy: 16, sw: 16, sh: 16 }) // center
    expect(rects[8]).toEqual({ sx: 32, sy: 32, sw: 16, sh: 16 }) // bottom-right
  })
})
