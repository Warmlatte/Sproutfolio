/**
 * Wooden 9-slice container (M6).
 *
 * A general-purpose surface that composes `NineSlice` (dialog_box asset) so
 * content sits inside the frame without overlapping the border art. Padding maps
 * to the style-guide spacing steps via Tailwind utilities: sm/md/lg → 8/16/24px
 * (p-2/p-4/p-6 at the project's 16px root font size).
 */

import type { ReactNode } from 'react'
import { NineSlice } from './primitives/NineSlice'
import { catalog } from '../game/sprites/catalog'

const PANEL_ASSET = catalog.dialogBox.src
const PANEL_SLICE = catalog.dialogBox.border

const PADDING_CLASS = {
  sm: 'p-2', // 8px
  md: 'p-4', // 16px
  lg: 'p-6', // 24px
} as const

type PanelPadding = keyof typeof PADDING_CLASS

export interface PanelProps {
  children?: ReactNode
  padding?: PanelPadding
  className?: string
}

export function Panel({ children, padding = 'md', className }: PanelProps) {
  const classes = [PADDING_CLASS[padding], className].filter(Boolean).join(' ')
  return (
    <NineSlice asset={PANEL_ASSET} slice={PANEL_SLICE} scale={2} className={classes}>
      {children}
    </NineSlice>
  )
}
