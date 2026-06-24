import { describe, expect, it } from 'vitest'

import { computeWorldScale } from './scale'

describe('computeWorldScale', () => {
  // Spec `responsive-scaling` example table (SCALE_BP_SM = 640, SCALE_BP_MD = 1024).
  // Breakpoints are inclusive lower bounds: width === breakpoint → higher tier.
  it.each([
    { width: 375, scale: 2, note: 'phone portrait' },
    { width: 639, scale: 2, note: 'just below SM' },
    { width: 640, scale: 3, note: 'equals SM (next tier)' },
    { width: 1023, scale: 3, note: 'just below MD' },
    { width: 1024, scale: 4, note: 'equals MD (next tier)' },
    { width: 1440, scale: 4, note: 'desktop' },
  ])('maps width $width to $scale× ($note)', ({ width, scale }) => {
    expect(computeWorldScale(width)).toBe(scale)
  })

  it('always returns an integer so pixel art stays crisp', () => {
    for (const width of [200, 640, 800, 1024, 2000]) {
      expect(Number.isInteger(computeWorldScale(width))).toBe(true)
    }
  })
})
