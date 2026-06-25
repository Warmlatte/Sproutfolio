/**
 * Presentational inventory grid (M6).
 *
 * Renders a grid of slot tiles (from the `inventory` sheet). Filled cells overlay
 * a `PixelIcon`; `null` cells show only the slot. The grid owns no selection
 * state — it reports clicks via `onSelect(index)` and highlights whatever
 * `selectedIndex` the caller supplies (highlight via CSS `outline`, never a
 * corner radius, to stay within the pixel-art rules).
 */

import type { CSSProperties } from 'react'
import { spriteBackground } from './spriteBackground'
import { PixelIcon } from './primitives/PixelIcon'
import { catalog } from '../game/sprites/catalog'

/** A filled inventory cell. */
export interface InventoryItem {
  /** Index into the iconsAll sheet. */
  iconIndex: number
  /** Accessible name for the cell's icon. */
  label?: string
}

const SLOT_TILE_INDEX = 0
const CELL_SCALE = 2

export interface InventoryGridProps {
  items: ReadonlyArray<InventoryItem | null>
  columns: number
  /** Caller-owned highlighted cell; the grid does not change it on click. */
  selectedIndex?: number
  onSelect?: (index: number) => void
}

export function InventoryGrid({ items, columns, selectedIndex, onSelect }: InventoryGridProps) {
  const slot = spriteBackground(catalog.inventory, SLOT_TILE_INDEX, CELL_SCALE)

  const gridStyle: CSSProperties = {
    display: 'grid',
    gridTemplateColumns: `repeat(${columns}, ${slot.width})`,
    gap: 8,
  }

  return (
    <div style={gridStyle}>
      {items.map((item, index) => {
        const selected = index === selectedIndex
        const cellStyle: CSSProperties = {
          ...slot,
          backgroundRepeat: 'no-repeat',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 0,
          cursor: 'pointer',
        }
        return (
          <button
            // Index identifies the slot position; order is stable for this grid.
            key={index}
            type="button"
            className={selected ? 'outline outline-2 outline-accent' : undefined}
            style={cellStyle}
            onClick={() => onSelect?.(index)}
            aria-pressed={selected}
            aria-label={item?.label ?? `empty slot ${index}`}
          >
            {item ? <PixelIcon index={item.iconIndex} label={item.label} /> : null}
          </button>
        )
      })}
    </div>
  )
}
