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
  const prevTextRef = useRef(text)

  // Render-time reset: when `text` changes, drop the visible progress to 0 in the
  // same render (React re-renders before paint) so the old count never slices the
  // new string into a one-frame full-text flash. Guarded by the ref so it runs
  // only on the change render and converges instead of looping.
  if (prevTextRef.current !== text) {
    prevTextRef.current = text
    skippedRef.current = false
    setCount(0)
  }

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

  useEffect(() => {
    // Track reduced-motion changes that happen after mount: enabling it mid-reveal
    // must complete the reveal immediately without waiting for a text/speed change.
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return
    }
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = () => {
      if (query.matches) {
        // Guard the running raf tick (if any) so it resolves to full text too.
        skippedRef.current = true
        setCount(total)
      }
    }
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [total])

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
