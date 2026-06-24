/**
 * React container for the Pixi game world (M3, extended in M5).
 *
 * Mounts the engine into a ref'd div and destroys it on unmount. The engine's
 * own `destroyed` guard makes this safe under React Strict Mode's double mount.
 *
 * M5: owns the shared `touch` input source, passes it into the engine, and
 * renders the `Joystick` overlay that drives it. Teardown destroys the engine
 * first (it reads `touch` each frame) and then the touch source.
 */

import { useEffect, useRef } from 'react'

import { createEngine } from '../game/engine'
import { createTouchInput, type TouchInputSource } from '../game/input'
import { Joystick } from './Joystick'

export function GameCanvas() {
  const containerRef = useRef<HTMLDivElement>(null)
  // Created once and reused across the engine's lifetime; the Joystick writes to
  // it and the engine reads from it each frame.
  const touchRef = useRef<TouchInputSource | null>(null)
  if (touchRef.current === null) {
    touchRef.current = createTouchInput()
  }
  const touch = touchRef.current

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const engine = createEngine(container, touch)
    return () => {
      // Engine reads `touch` each frame, so stop it before resetting the source.
      engine.destroy()
      touch.destroy()
    }
  }, [touch])

  return (
    <div
      ref={containerRef}
      style={{
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        background: 'var(--color-scene-ground)',
      }}
    >
      <Joystick touch={touch} />
    </div>
  )
}
