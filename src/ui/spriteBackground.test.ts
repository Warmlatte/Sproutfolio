import { describe, it, expect } from 'vitest'
import { spriteBackground } from './spriteBackground'
import { catalog } from '../game/sprites/catalog'

const icons = catalog.iconsAll

describe('spriteBackground', () => {
  // Spec example: icons_all (18×3, 16px cells) at scale 2 → 576×96 sheet.
  it.each([
    { index: 0, position: '0px 0px' },
    { index: 1, position: '-32px 0px' },
    { index: 18, position: '0px -32px' },
  ])(
    'resolves icons_all index $index at scale 2',
    ({ index, position }) => {
      const style = spriteBackground(icons, index, 2)
      expect(style.backgroundPosition).toBe(position)
      expect(style.backgroundSize).toBe('576px 96px')
      expect(style.width).toBe('32px')
      expect(style.height).toBe('32px')
      expect(style.backgroundImage).toBe(`url(${icons.src})`)
      expect(style.imageRendering).toBe('pixelated')
    },
  )

  it.each([
    { scale: 0, label: 'zero' },
    { scale: -2, label: 'negative' },
    { scale: 1.5, label: 'fractional' },
    { scale: Number.NaN, label: 'NaN' },
  ])('throws RangeError for $label scale', ({ scale }) => {
    expect(() => spriteBackground(icons, 0, scale)).toThrow(RangeError)
  })

  it.each([
    { index: -1, label: 'below 0' },
    { index: 54, label: 'at cols*rows' },
  ])('throws RangeError for out-of-range index ($label)', ({ index }) => {
    expect(() => spriteBackground(icons, index, 2)).toThrow(RangeError)
  })
})
