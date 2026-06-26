/**
 * Shared nine-slice surface primitive (M6).
 *
 * The single place in `src/ui/` that applies CSS `border-image`. Renders a
 * resizable 9-slice surface (corners fixed, edges/center stretched via
 * `nineSliceStyle`) that wraps arbitrary DOM children in its center region. All
 * surface components (Panel, DialogBox, PixelButton, ContactPanel) compose this
 * rather than re-implementing 9-slice rendering (design D2).
 *
 * Box model: Tailwind preflight sets `box-sizing: border-box`, so the integer
 * `border-width` is carved out of the element box and children land in the
 * center automatically. Visual tinting/padding/press states are layered by
 * composers through `className` (semantic-token utilities) — this primitive
 * owns only the frame.
 */

import type { ReactNode } from 'react'
import { nineSliceStyle } from '../nineSliceStyle'

export interface NineSliceProps {
  /** Served URL of the 9-slice sheet, e.g. `/sprites/ui/dialog_box.png`. */
  asset: string
  /** Source border thickness in sheet pixels (e.g. 16 for dialog_box). */
  slice: number
  /** Integer zoom factor; non-integers break pixel sharpness. */
  scale?: number
  /** Render as a plain surface (`div`) or an interactive `button`. */
  as?: 'div' | 'button'
  className?: string
  onClick?: () => void
  /** Only meaningful for `as="button"`; also guards `onClick` on a `div`. */
  disabled?: boolean
  children?: ReactNode
}

export function NineSlice({
  asset,
  slice,
  scale = 2,
  as = 'div',
  className,
  onClick,
  disabled = false,
  children,
}: NineSliceProps) {
  const style = nineSliceStyle(asset, slice, scale)

  if (as === 'button') {
    return (
      <button
        type="button"
        className={className}
        style={style}
        onClick={onClick}
        disabled={disabled}
      >
        {children}
      </button>
    )
  }

  return (
    <div
      className={className}
      style={style}
      onClick={disabled ? undefined : onClick}
    >
      {children}
    </div>
  )
}
