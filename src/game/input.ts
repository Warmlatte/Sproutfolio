/**
 * Keyboard input (M4). Source-agnostic: `read()` returns a normalized direction
 * vector that consumers (`player`/`engine`) use without knowing where it came
 * from, so M5's touch joystick can feed the same `{x, y}` interface unchanged.
 *
 * `directionFromKeys` is the pure core (no DOM) — unit-tested directly.
 * `createInput` wires it to `window` keydown/keyup and exposes `destroy()` for
 * leak-free teardown alongside the engine.
 */

/** A direction vector. Screen space: +x is right, +y is down (up is negative). */
export interface Direction {
  readonly x: number
  readonly y: number
}

/** `KeyboardEvent.code` values that map to each movement direction. */
const UP_KEYS = ['ArrowUp', 'KeyW'] as const
const DOWN_KEYS = ['ArrowDown', 'KeyS'] as const
const LEFT_KEYS = ['ArrowLeft', 'KeyA'] as const
const RIGHT_KEYS = ['ArrowRight', 'KeyD'] as const

/** Every code we listen for — anything else is ignored. */
const MOVEMENT_KEYS: ReadonlySet<string> = new Set([
  ...UP_KEYS,
  ...DOWN_KEYS,
  ...LEFT_KEYS,
  ...RIGHT_KEYS,
])

const anyPressed = (keys: ReadonlySet<string>, codes: readonly string[]): boolean =>
  codes.some((code) => keys.has(code))

const INV_SQRT2 = 1 / Math.sqrt(2)

/**
 * Resolves a set of pressed key codes to a normalized direction vector. Arrow
 * keys and WASD map to the same axes; opposite keys cancel; diagonals are scaled
 * to magnitude 1 so diagonal movement is not faster than orthogonal. Returns a
 * fresh object on every call (no mutation of caller state).
 */
export function directionFromKeys(keys: ReadonlySet<string>): Direction {
  const x = (anyPressed(keys, RIGHT_KEYS) ? 1 : 0) - (anyPressed(keys, LEFT_KEYS) ? 1 : 0)
  const y = (anyPressed(keys, DOWN_KEYS) ? 1 : 0) - (anyPressed(keys, UP_KEYS) ? 1 : 0)

  if (x !== 0 && y !== 0) {
    return { x: x * INV_SQRT2, y: y * INV_SQRT2 }
  }
  return { x, y }
}

/** A live keyboard input source. `destroy()` is safe to call once on teardown. */
export interface InputSource {
  /** The current normalized direction vector (a new object each call). */
  read(): Direction
  /** Removes window listeners and clears state. */
  destroy(): void
}

/**
 * Creates a keyboard input source bound to `window`. Tracks the set of currently
 * held movement keys via keydown/keyup; `read()` resolves them through
 * `directionFromKeys`.
 */
export function createInput(): InputSource {
  const pressed = new Set<string>()

  const onKeyDown = (event: KeyboardEvent): void => {
    if (MOVEMENT_KEYS.has(event.code)) pressed.add(event.code)
  }
  const onKeyUp = (event: KeyboardEvent): void => {
    pressed.delete(event.code)
  }

  window.addEventListener('keydown', onKeyDown)
  window.addEventListener('keyup', onKeyUp)

  return {
    read(): Direction {
      return directionFromKeys(pressed)
    },
    destroy(): void {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      // Clear held keys so a lingering press can't leak past teardown.
      pressed.clear()
    },
  }
}
