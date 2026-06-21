/**
 * Dev-only sprite debug viewer (M2).
 *
 * Renders five verification sections so catalog slices can be checked visually:
 * player four-direction frames, one grass tile, the four water frames, several
 * icons, and an enlarged dialog box assembled from its nine slices. Mounted only
 * behind the `#sprites` dev gate in App.tsx; never part of production output.
 */

import { useEffect, useRef, useState } from 'react'
import { SpriteCanvas, isPositiveIntegerScale } from './SpriteCanvas'
import { catalog } from '../game/sprites/catalog'
import { frameRect, nineSliceRects } from '../game/sprites/frame'

// Pure slice math is resolved once at module load.
// Player: first frame of each of the 4 rows = the four facings (row order 待核對).
const playerFacings = [0, 4, 8, 12].map((i) => frameRect(catalog.player, i))
const grassTile = [frameRect(catalog.grass, 0)]
const waterFrames = [0, 1, 2, 3].map((i) => frameRect(catalog.water, i))
const iconSamples = [0, 1, 2, 3, 4, 5].map((i) => frameRect(catalog.iconsAll, i))
const dialogSheet = catalog.dialogBox
const dialogBoxRects = nineSliceRects(dialogSheet)

interface SectionProps {
  title: string
  note?: string
  children: React.ReactNode
}

function Section({ title, note, children }: SectionProps) {
  return (
    <section style={{ marginBottom: 32 }}>
      <h2 className="font-decorative text-pixel-lg">{title}</h2>
      {note ? (
        <p className="text-pixel-sm text-text-muted" style={{ marginBottom: 8 }}>
          {note}
        </p>
      ) : null}
      {children}
    </section>
  )
}

interface NineSliceBoxProps {
  scale: number
  /** Target box size in scaled pixels. */
  targetW: number
  targetH: number
}

/** Draws the dialog box enlarged via its nine slices (corners fixed, edges/center stretched). */
function NineSliceBox({ scale, targetW, targetH }: NineSliceBoxProps) {
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

      const corner = dialogSheet.border * scale
      const destXs = [0, corner, targetW - corner]
      const destYs = [0, corner, targetH - corner]
      const destWs = [corner, targetW - 2 * corner, corner]
      const destHs = [corner, targetH - 2 * corner, corner]

      dialogBoxRects.forEach((r, i) => {
        const col = i % 3
        const row = Math.floor(i / 3)
        ctx.drawImage(
          image,
          r.sx,
          r.sy,
          r.sw,
          r.sh,
          destXs[col],
          destYs[row],
          destWs[col],
          destHs[row],
        )
      })
    }

    image.onerror = () => {
      if (cancelled) return
      setError(`Failed to load ${dialogSheet.src}`)
    }

    image.src = dialogSheet.src
    return () => {
      cancelled = true
    }
  }, [scale, targetW, targetH, invalidScale])

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

  return (
    <canvas
      ref={canvasRef}
      width={targetW}
      height={targetH}
      style={{ imageRendering: 'pixelated' }}
    />
  )
}

export function SpriteDebug() {
  return (
    <main className="bg-surface text-text" style={{ minHeight: '100vh', padding: 32 }}>
      <h1 className="font-decorative text-pixel-xl">Sprite slice debug</h1>
      <p className="text-pixel-sm text-text-muted" style={{ marginBottom: 32 }}>
        Dev-only viewer (#sprites). Verify slices are sharp and correctly placed.
      </p>

      <Section title="Player — four facings" note="row order 待核對">
        <SpriteCanvas src={catalog.player.src} rects={playerFacings} scale={4} />
      </Section>

      <Section title="Grass tile">
        <SpriteCanvas src={catalog.grass.src} rects={grassTile} scale={8} />
      </Section>

      <Section title="Water — 4 frames">
        <SpriteCanvas src={catalog.water.src} rects={waterFrames} scale={8} />
      </Section>

      <Section title="Icons (first 6)">
        <SpriteCanvas src={catalog.iconsAll.src} rects={iconSamples} scale={4} />
      </Section>

      <Section title="Dialog box — enlarged via nine slices">
        <NineSliceBox scale={4} targetW={320} targetH={200} />
      </Section>
    </main>
  )
}
