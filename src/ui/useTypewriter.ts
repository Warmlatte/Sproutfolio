/**
 * Typewriter reveal hook (M6).
 *
 * Drives `revealedCount` from a requestAnimationFrame clock to reveal `text` one
 * character at a time. Exposes `skip()` to jump to the full string, completes
 * immediately when `prefers-reduced-motion: reduce` is set (accessibility), and
 * resets whenever `text` (or `speed`) changes.
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import { revealedCount } from './typewriter'

export interface TypewriterState {
  /** The currently visible prefix of `text`. */
  shown: string
  /** True once every character is revealed. */
  isDone: boolean
  /** Reveal the full text immediately. */
  skip: () => void
}

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

export function useTypewriter(text: string, speed = 30): TypewriterState {
  const total = text.length
  const [count, setCount] = useState(0)
  const skippedRef = useRef(false)

  useEffect(() => {
    // Reset for the new text/speed before (re)starting the reveal.
    skippedRef.current = false
    setCount(0)

    if (speed <= 0 || prefersReducedMotion()) {
      setCount(total)
      return
    }

    let raf = 0
    let start: number | null = null

    const tick = (now: number) => {
      if (start === null) start = now
      // A pending frame after skip() must still resolve to the full text.
      const next = skippedRef.current
        ? total
        : revealedCount(now - start, speed, total)
      setCount(next)
      if (!skippedRef.current && next < total) {
        raf = requestAnimationFrame(tick)
      }
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [text, speed, total])

  const skip = useCallback(() => {
    skippedRef.current = true
    setCount(total)
  }, [total])

  return {
    shown: text.slice(0, count),
    isDone: count >= total,
    skip,
  }
}
