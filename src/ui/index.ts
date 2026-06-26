/**
 * Public surface of the Sprout Lands UI component library (M6).
 *
 * Re-exports the seven components (PixelButton, DialogBox, Panel, InventoryGrid,
 * ProjectCard, ContactPanel, PixelIcon), the shared NineSlice primitive, the
 * useTypewriter hook, and every public props/data type. All are pure React with
 * no game-engine dependency, so the library can be previewed and synced
 * independently (P2 design-sync).
 */

export { PixelButton } from './PixelButton'
export type { PixelButtonProps, PixelButtonVariant } from './PixelButton'

export { DialogBox } from './DialogBox'
export type { DialogBoxProps } from './DialogBox'

export { Panel } from './Panel'
export type { PanelProps } from './Panel'

export { InventoryGrid } from './InventoryGrid'
export type { InventoryGridProps, InventoryItem } from './InventoryGrid'

export { ProjectCard } from './ProjectCard'
export type { ProjectCardProps } from './ProjectCard'

export { ContactPanel } from './ContactPanel'
export type { ContactPanelProps, ContactLink } from './ContactPanel'

export { PixelIcon } from './primitives/PixelIcon'
export type { PixelIconProps } from './primitives/PixelIcon'

export { NineSlice } from './primitives/NineSlice'
export type { NineSliceProps } from './primitives/NineSlice'

export { useTypewriter } from './useTypewriter'
export type { TypewriterState } from './useTypewriter'

export { UIErrorBoundary } from './UIErrorBoundary'
export type { UIErrorBoundaryProps } from './UIErrorBoundary'
