/**
 * Inventory slot accessible-name derivation (M6 fix).
 *
 * Derives a slot's accessible name from whether it holds an item, not from
 * whether an optional `label` was supplied. A filled slot is never announced as
 * empty: when its item has no `label`, it falls back to a stable `slot <index>`
 * name. Only a `null` slot is announced as `empty slot <index>`.
 */

import type { InventoryItem } from './InventoryGrid'

export function inventorySlotLabel(item: InventoryItem | null, index: number): string {
  if (item === null) {
    return `empty slot ${index}`
  }
  return item.label ?? `slot ${index}`
}
