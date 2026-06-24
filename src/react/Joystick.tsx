/**
 * Touch controls overlay (M5). Renders a virtual joystick (bottom-left) and an
 * interact button (bottom-right) on touch-capable devices, driving the shared
 * `touch` input source the engine reads each frame. On non-touch devices it shows
 * a corner keyboard hint instead.
 *
 * The overlay owns the pointer events and pushes state into `touch`; the engine
 * never knows the input came from a finger. Styling uses only semantic tokens
 * (half-transparent via `color-mix`) and `env(safe-area-inset-*)` positioning, so
 * layout holds across resize without extra JavaScript. The circular shape is an
 * intentional control-element exception to the project's no-`border-radius` rule.
 */

import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from 'react'

import {
  INTERACT_BTN_PX,
  JOYSTICK_BASE_PX,
  JOYSTICK_THUMB_PX,
  KEYBOARD_HINT,
} from '../constants'
import { directionFromVector } from '../game/input'
import type { TouchInputSource } from '../game/input'

interface JoystickProps {
  /** Shared touch input source; the joystick drives it, the engine reads it. */
  readonly touch: TouchInputSource
}

const COARSE_POINTER_QUERY = '(pointer: coarse)'

/** True when the device exposes a coarse pointer or any touch points. */
function detectTouch(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia(COARSE_POINTER_QUERY).matches || navigator.maxTouchPoints > 0
}

/** Max distance (px) the thumb center may travel from the base center. */
const THUMB_CLAMP_RADIUS = (JOYSTICK_BASE_PX - JOYSTICK_THUMB_PX) / 2

export function Joystick({ touch }: JoystickProps) {
  const [isTouch, setIsTouch] = useState<boolean>(detectTouch)
  const baseRef = useRef<HTMLDivElement>(null)
  const activePointerRef = useRef<number | null>(null)
  const [thumbOffset, setThumbOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 })

  // Re-evaluate touch capability when the pointer type changes (e.g. a tablet
  // switching between touch and an attached trackpad).
  useEffect(() => {
    const query = window.matchMedia(COARSE_POINTER_QUERY)
    const onChange = (): void => setIsTouch(detectTouch())
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])

  if (!isTouch) {
    return <div style={hintStyle}>{KEYBOARD_HINT}</div>
  }

  const updateFromPointer = (event: PointerEvent<HTMLDivElement>): void => {
    const base = baseRef.current
    if (!base) return
    const rect = base.getBoundingClientRect()
    const dx = event.clientX - (rect.left + rect.width / 2)
    const dy = event.clientY - (rect.top + rect.height / 2)

    touch.setDirection(directionFromVector(dx, dy))

    // Clamp the thumb visual within the base radius (direction unchanged).
    const magnitude = Math.hypot(dx, dy)
    if (magnitude > THUMB_CLAMP_RADIUS) {
      const k = THUMB_CLAMP_RADIUS / magnitude
      setThumbOffset({ x: dx * k, y: dy * k })
    } else {
      setThumbOffset({ x: dx, y: dy })
    }
  }

  const onPointerDown = (event: PointerEvent<HTMLDivElement>): void => {
    activePointerRef.current = event.pointerId
    event.currentTarget.setPointerCapture(event.pointerId)
    updateFromPointer(event)
  }

  const onPointerMove = (event: PointerEvent<HTMLDivElement>): void => {
    if (activePointerRef.current !== event.pointerId) return
    updateFromPointer(event)
  }

  const releasePointer = (): void => {
    activePointerRef.current = null
    touch.setDirection({ x: 0, y: 0 })
    setThumbOffset({ x: 0, y: 0 })
  }

  const onInteractDown = (event: PointerEvent<HTMLButtonElement>): void => {
    event.preventDefault()
    touch.triggerInteract()
  }

  return (
    <>
      <div
        ref={baseRef}
        style={baseStyle}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={releasePointer}
        onPointerCancel={releasePointer}
      >
        <div
          style={{
            ...thumbStyle,
            transform: `translate(${thumbOffset.x}px, ${thumbOffset.y}px)`,
          }}
        />
      </div>
      <button type="button" style={interactStyle} onPointerDown={onInteractDown} aria-label="互動">
        <InteractIcon />
      </button>
    </>
  )
}

/** Simple exclamation icon (not a Sprout Lands asset), inheriting currentColor. */
function InteractIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="10" y="4" width="4" height="10" fill="currentColor" />
      <rect x="10" y="16" width="4" height="4" fill="currentColor" />
    </svg>
  )
}

// ── Styles — semantic tokens only, half-transparent via color-mix, no literal hex ──

const hintStyle: CSSProperties = {
  position: 'fixed',
  left: 'calc(env(safe-area-inset-left, 0px) + 12px)',
  bottom: 'calc(env(safe-area-inset-bottom, 0px) + 12px)',
  padding: '6px 10px',
  background: 'color-mix(in srgb, var(--color-outline) 70%, transparent)',
  color: 'var(--color-text-invert)',
  fontFamily: 'var(--font-pixel)',
  fontSize: 'var(--text-pixel-sm)',
  pointerEvents: 'none',
  userSelect: 'none',
  zIndex: 10,
}

const baseStyle: CSSProperties = {
  position: 'fixed',
  left: 'calc(env(safe-area-inset-left, 0px) + 24px)',
  bottom: 'calc(env(safe-area-inset-bottom, 0px) + 24px)',
  width: `${JOYSTICK_BASE_PX}px`,
  height: `${JOYSTICK_BASE_PX}px`,
  borderRadius: '50%',
  background: 'color-mix(in srgb, var(--color-outline) 28%, transparent)',
  border: '2px solid color-mix(in srgb, var(--color-outline) 55%, transparent)',
  boxSizing: 'border-box',
  touchAction: 'none',
  userSelect: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 10,
}

const thumbStyle: CSSProperties = {
  width: `${JOYSTICK_THUMB_PX}px`,
  height: `${JOYSTICK_THUMB_PX}px`,
  borderRadius: '50%',
  background: 'color-mix(in srgb, var(--color-surface) 78%, transparent)',
  border: '2px solid color-mix(in srgb, var(--color-border) 80%, transparent)',
  boxSizing: 'border-box',
  pointerEvents: 'none',
}

const interactStyle: CSSProperties = {
  position: 'fixed',
  right: 'calc(env(safe-area-inset-right, 0px) + 24px)',
  bottom: 'calc(env(safe-area-inset-bottom, 0px) + 32px)',
  width: `${INTERACT_BTN_PX}px`,
  height: `${INTERACT_BTN_PX}px`,
  borderRadius: '50%',
  background: 'color-mix(in srgb, var(--color-accent) 82%, transparent)',
  border: '2px solid color-mix(in srgb, var(--color-outline) 55%, transparent)',
  color: 'var(--color-outline)',
  boxSizing: 'border-box',
  touchAction: 'none',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 0,
  zIndex: 10,
}
