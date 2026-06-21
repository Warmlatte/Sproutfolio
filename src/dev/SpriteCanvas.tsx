/**
 * Dev-only sprite canvas (M2).
 *
 * Loads a sprite sheet and draws a set of source rectangles onto a canvas at an
 * integer scale with image smoothing disabled, so slices can be verified
 * pixel-sharp. Image load failures surface a visible error state rather than
 * failing silently. Not part of the production build (mounted only behind the
 * `#sprites` dev gate in App.tsx).
 */

import { useEffect, useRef, useState } from 'react'
import type { Rect } from '../game/sprites/types'

interface SpriteCanvasProps {
  /** Served URL of the sheet, e.g. `/sprites/tilesets/water.png`. */
  src: string
  /** Source rectangles to draw, laid out left-to-right with `gap` between. */
  rects: readonly Rect[]
  /** Integer zoom factor; non-integers break pixel sharpness. */
  scale: number
  /** Gap in scaled pixels between drawn frames. */
  gap?: number
}

export function isPositiveIntegerScale(scale: number): boolean {
  return Number.isInteger(scale) && scale > 0
}

export function SpriteCanvas({ src, rects, scale, gap = 8 }: SpriteCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [error, setError] = useState<string | null>(null)
  const invalidScale = !isPositiveIntegerScale(scale)

  useEffect(() => {
    if (invalidScale) return

    const canvas = canvasRef.current
    if (!canvas) return

    setError(null)
    const image = new Image()
    let cancelled = false

    image.onload = () => {
      if (cancelled) return
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        setError('2D canvas context unavailable')
        return
      }
      ctx.imageSmoothingEnabled = false
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      let dx = 0
      for (const r of rects) {
        ctx.drawImage(
          image,
          r.sx,
          r.sy,
          r.sw,
          r.sh,
          dx,
          0,
          r.sw * scale,
          r.sh * scale,
        )
        dx += r.sw * scale + gap
      }
    }

    image.onerror = () => {
      if (cancelled) return
      setError(`Failed to load ${src}`)
    }

    image.src = src
    return () => {
      cancelled = true
    }
  }, [src, rects, scale, gap, invalidScale])

  if (invalidScale) {
    return (
      <div role="alert" className="text-pixel-sm text-danger">
        ⚠ Invalid sprite scale: expected a positive integer, received {scale}
      </div>
    )
  }

  if (error) {
    return (
      <div role="alert" className="text-pixel-sm text-danger">
        ⚠ {error}
      </div>
    )
  }

  const width =
    rects.reduce((sum, r) => sum + r.sw * scale + gap, 0) - gap
  const height = rects.reduce((max, r) => Math.max(max, r.sh * scale), 0)
  return (
    <canvas
      ref={canvasRef}
      width={Math.max(width, 1)}
      height={Math.max(height, 1)}
      style={{ imageRendering: 'pixelated' }}
    />
  )
}
