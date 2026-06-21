import { lazy, Suspense, useEffect, useState } from 'react'

import { GameCanvas } from './react/GameCanvas'

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

function App() {
  const hash = useHash()

  if (SpriteDebug && hash === '#sprites') {
    return (
      <Suspense fallback={null}>
        <SpriteDebug />
      </Suspense>
    )
  }

  return <GameCanvas />
}

export default App
