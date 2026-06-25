/**
 * Pixel-art button (M6).
 *
 * Composes `NineSlice` as a native `<button>` for the wooden frame, with an inner
 * "face" layer that carries the variant tint (semantic tokens only) above the
 * border-image center. Hover/active/disabled are token-driven; pressing nudges
 * the face down 1px. An optional `iconIndex` prepends a `PixelIcon`.
 *
 * Surface choice (design D5): the frame uses the spec-pinned `dialog_box`
 * 9-slice as a stable fallback while `btn_square_26`'s layout is unconfirmed. The
 * single swap point is `BUTTON_ASSET` / `BUTTON_SLICE` below.
 */

import type { ReactNode } from 'react'
import { NineSlice } from './primitives/NineSlice'
import { PixelIcon } from './primitives/PixelIcon'
import { catalog } from '../game/sprites/catalog'

// Centralized swap point — replace with btn_square_26 once its slice is confirmed.
const BUTTON_ASSET = catalog.dialogBox.src
const BUTTON_SLICE = catalog.dialogBox.border

export type PixelButtonVariant = 'primary' | 'secondary'

// Variant face = background tint + hover tint, using only style-guide tokens.
const VARIANT_FACE: Record<PixelButtonVariant, string> = {
  primary: 'bg-accent group-hover:bg-accent-hover text-text',
  secondary: 'bg-surface-inset group-hover:bg-accent text-text',
}

export interface PixelButtonProps {
  children?: ReactNode
  onClick?: () => void
  variant?: PixelButtonVariant
  /** Optional leading icon (index into iconsAll). */
  iconIndex?: number
  disabled?: boolean
}

export function PixelButton({
  children,
  onClick,
  variant = 'primary',
  iconIndex,
  disabled = false,
}: PixelButtonProps) {
  return (
    <NineSlice
      as="button"
      asset={BUTTON_ASSET}
      slice={BUTTON_SLICE}
      scale={2}
      onClick={onClick}
      disabled={disabled}
      className="group p-0 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
    >
      <span
        className={`${VARIANT_FACE[variant]} text-pixel-base inline-flex items-center gap-2 px-4 py-2 group-active:translate-y-px`}
      >
        {iconIndex !== undefined ? <PixelIcon index={iconIndex} /> : null}
        {children}
      </span>
    </NineSlice>
  )
}
