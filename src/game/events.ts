/**
 * Engine↔React event bus — TYPES ONLY (M3 stub).
 *
 * M3 defines the contract so the bridge's shape is pinned, but does NOT wire it
 * up: there is no emit or subscribe call anywhere in M3. M7 implements the
 * emitter and connects interaction triggers to React overlays.
 */

/** The content regions a game interaction can ask React to open. */
export type OverlayRegion = 'about' | 'projects' | 'contact'

/** Events the engine sends to React. */
export type GameEvent =
  | { readonly type: 'open-overlay'; readonly region: OverlayRegion }
  | { readonly type: 'close-overlay' }

/** A listener for engine events. */
export type GameEventListener = (event: GameEvent) => void

/**
 * The typed bridge React and the engine will share in M7. `subscribe` returns an
 * unsubscribe function. M3 ships only this type; no implementation is created.
 */
export interface GameEventEmitter {
  readonly emit: (event: GameEvent) => void
  readonly subscribe: (listener: GameEventListener) => () => void
}
