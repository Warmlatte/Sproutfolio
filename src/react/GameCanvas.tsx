/**
 * React container for the Pixi game world (M3).
 *
 * Mounts the engine into a ref'd div and destroys it on unmount. The engine's
 * own `destroyed` guard makes this safe under React Strict Mode's double mount.
 */

import { useEffect, useRef } from 'react'

import { createEngine } from '../game/engine'

export function GameCanvas() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const engine = createEngine(container)
    return () => engine.destroy()
  }, [])

  return (
    <div
      ref={containerRef}
      style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}
    />
  )
}
