/**
 * Typewriter dialog box (M6).
 *
 * Composes `NineSlice` (dialog_box surface) with `useTypewriter` to reveal text
 * character by character, with a blinking cursor while typing. Clicking while
 * typing reveals the full text immediately; clicking once fully revealed invokes
 * `onAdvance`. Respects `prefers-reduced-motion` (text shows instantly) via the
 * hook. An optional `speakerName` is shown above the text.
 */

import { NineSlice } from './primitives/NineSlice'
import { useTypewriter } from './useTypewriter'
import { catalog } from '../game/sprites/catalog'

const DIALOG_ASSET = catalog.dialogBox.src
const DIALOG_SLICE = catalog.dialogBox.border

export interface DialogBoxProps {
  text: string
  speakerName?: string
  speed?: number
  onAdvance?: () => void
}

export function DialogBox({ text, speakerName, speed = 30, onAdvance }: DialogBoxProps) {
  const { shown, isDone, skip } = useTypewriter(text, speed)

  const handleClick = () => {
    if (!isDone) {
      skip()
      return
    }
    onAdvance?.()
  }

  return (
    <NineSlice
      as="button"
      asset={DIALOG_ASSET}
      slice={DIALOG_SLICE}
      scale={2}
      onClick={handleClick}
      className="p-4 cursor-pointer text-pixel-base text-left"
    >
      {speakerName ? (
        <span className="text-accent" style={{ display: 'block', margin: '0 0 8px' }}>
          {speakerName}
        </span>
      ) : null}
      <span style={{ display: 'block', margin: 0 }}>
        {shown}
        {!isDone ? (
          <span className="animate-pulse" aria-hidden="true">
            ▋
          </span>
        ) : null}
      </span>
    </NineSlice>
  )
}
