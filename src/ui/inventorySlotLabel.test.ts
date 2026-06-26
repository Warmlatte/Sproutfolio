import { describe, it, expect } from 'vitest'
import { inventorySlotLabel } from './inventorySlotLabel'

describe('inventorySlotLabel', () => {
  // Spec example: occupancy-to-name mapping.
  it.each([
    { item: { iconIndex: 3 }, index: 0, expected: 'slot 0' },
    { item: { iconIndex: 3, label: 'Axe' }, index: 1, expected: 'Axe' },
    { item: null, index: 2, expected: 'empty slot 2' },
  ])('maps $item at index $index to "$expected"', ({ item, index, expected }) => {
    expect(inventorySlotLabel(item, index)).toBe(expected)
  })
})
