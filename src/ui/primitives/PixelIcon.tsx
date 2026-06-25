/**
 * Pixel icon primitive (M6).
 *
 * Renders a single 16px cell from the `iconsAll` sheet as an inline element,
 * integer-scaled and pixel-perfect via `spriteBackground`. Accessible by
 * default: a `label` exposes the icon as `role="img"` with an accessible name;
 * without one the icon is decorative (`aria-hidden`). Inline-block + middle
 * baseline lets it sit inside a run of text.
 */

import type { CSSProperties } from 'react'
import { spriteBackground } from '../spriteBackground'
import { catalog } from '../../game/sprites/catalog'

export interface PixelIconProps {
  /** Row-major index into the `iconsAll` sheet (18×3). */
  index: number
  /** Integer zoom factor. */
  scale?: number
  /** Accessible name; omit for decorative icons. */
  label?: string
}

export function PixelIcon({ index, scale = 2, label }: PixelIconProps) {
  const background = spriteBackground(catalog.iconsAll, index, scale)
  const style: CSSProperties = {
    ...background,
    display: 'inline-block',
    verticalAlign: 'middle',
    backgroundRepeat: 'no-repeat',
  }

  return (
    <span
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      style={style}
    />
  )
}
