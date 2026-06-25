import { describe, it, expect } from 'vitest'
import { nineSliceStyle } from './nineSliceStyle'

const asset = '/sprites/ui/dialog_box.png'

describe('nineSliceStyle', () => {
  // Spec example: slice 16 at scale 2.
  it('computes border-image values for slice 16 at scale 2', () => {
    const style = nineSliceStyle(asset, 16, 2)
    expect(style.borderWidth).toBe('32px')
    expect(style.borderImageWidth).toBe('32px')
    expect(style.borderImageSlice).toBe('16 fill')
    expect(style.borderImageRepeat).toBe('stretch')
    expect(style.borderImageSource).toBe(`url(${asset})`)
    expect(style.imageRendering).toBe('pixelated')
  })

  it.each([
    { slice: 0, label: 'zero slice' },
    { slice: -16, label: 'negative slice' },
    { slice: 16.5, label: 'fractional slice' },
    { slice: Number.NaN, label: 'NaN slice' },
  ])('throws RangeError for $label', ({ slice }) => {
    expect(() => nineSliceStyle(asset, slice, 2)).toThrow(RangeError)
  })

  it.each([
    { scale: 0, label: 'zero scale' },
    { scale: -2, label: 'negative scale' },
    { scale: 1.5, label: 'fractional scale' },
    { scale: Number.NaN, label: 'NaN scale' },
  ])('throws RangeError for $label', ({ scale }) => {
    expect(() => nineSliceStyle(asset, 16, scale)).toThrow(RangeError)
  })
})
