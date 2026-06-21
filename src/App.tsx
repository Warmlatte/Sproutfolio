import { lazy, Suspense, useEffect, useState } from 'react'
import { TILE_SIZE, WORLD_SCALE, UI_SCALE } from './constants'

// Dev-only sprite debug viewer. Gating the dynamic import on `import.meta.env.DEV`
// (statically `false` in production) lets Rollup drop the dev chunk from the
// build, so the viewer is never present in production output.
const SpriteDebug = import.meta.env.DEV
  ? lazy(() =>
      import('./dev/SpriteDebug').then((m) => ({ default: m.SpriteDebug })),
    )
  : null

/** Tracks `location.hash` so toggling `#sprites` swaps views without a reload. */
function useHash(): string {
  const [hash, setHash] = useState(() => window.location.hash)
  useEffect(() => {
    const onChange = () => setHash(window.location.hash)
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])
  return hash
}

/**
 * Three semantic tokens rendered through Tailwind utilities so the
 * design-token wiring is verifiable on screen. Hex values are the
 * style-guide reference, shown as a label for visual confirmation.
 */
const SEMANTIC_SWATCHES = [
  { token: 'surface', hex: '#E8CFA6', swatchClass: 'bg-surface' },
  { token: 'text', hex: '#6B4B5B', swatchClass: 'bg-text' },
  { token: 'accent', hex: '#EEBA77', swatchClass: 'bg-accent' },
] as const

function App() {
  const hash = useHash()

  if (SpriteDebug && hash === '#sprites') {
    return (
      <Suspense fallback={null}>
        <SpriteDebug />
      </Suspense>
    )
  }

  return (
    <main className="bg-surface text-text" style={{ minHeight: '100vh', padding: 32 }}>
      <h1 className="font-decorative text-pixel-xl">Sproutfolio</h1>

      <p className="text-pixel-base">繁體中文測試字：種一座可以走進去的個人農場。</p>

      <p className="text-pixel-sm text-text-muted">
        TILE_SIZE={TILE_SIZE} · WORLD_SCALE={WORLD_SCALE} · UI_SCALE={UI_SCALE}
      </p>

      <section style={{ marginTop: 32 }}>
        <h2 className="font-decorative text-pixel-lg">Semantic tokens</h2>
        <ul
          style={{
            display: 'flex',
            gap: 16,
            listStyle: 'none',
            padding: 0,
            margin: 0,
          }}
        >
          {SEMANTIC_SWATCHES.map(({ token, hex, swatchClass }) => (
            <li key={token}>
              <div className={swatchClass} style={{ width: 64, height: 64 }} />
              <div className="text-pixel-sm">{token}</div>
              <div className="text-pixel-sm text-text-muted">{hex}</div>
            </li>
          ))}
        </ul>
      </section>
    </main>
  )
}

export default App
