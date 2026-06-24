import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  createInput,
  createTouchInput,
  directionFromKeys,
  directionFromVector,
  mergeDirections,
} from './input'

const INV_SQRT2 = 1 / Math.sqrt(2)

describe('directionFromVector', () => {
  // Spec `player-movement` example table (JOYSTICK_DEADZONE_PX = 12).
  it.each([
    { dx: 0, dy: 0, x: 0, y: 0, note: 'idle' },
    { dx: 6, dy: 0, x: 0, y: 0, note: 'within deadzone' },
    { dx: 40, dy: 0, x: 1, y: 0, note: 'right, full speed' },
    { dx: 0, dy: -40, x: 0, y: -1, note: 'up, full speed' },
    { dx: 30, dy: 30, x: INV_SQRT2, y: INV_SQRT2, note: 'normalized diagonal' },
    { dx: 100, dy: 0, x: 1, y: 0, note: 'far past deadzone, still unit' },
  ])('maps displacement ($dx, $dy) to ($x, $y) — $note', ({ dx, dy, x, y }) => {
    const dir = directionFromVector(dx, dy)
    expect(dir.x).toBeCloseTo(x)
    expect(dir.y).toBeCloseTo(y)
  })

  it('returns magnitude 1 for any displacement past the deadzone', () => {
    const dir = directionFromVector(30, 30)
    expect(Math.hypot(dir.x, dir.y)).toBeCloseTo(1)
  })

  it('returns a new object and does not depend on input mutation', () => {
    const a = directionFromVector(40, 0)
    const b = directionFromVector(40, 0)
    expect(a).not.toBe(b)
    expect(a).toEqual(b)
  })
})

describe('directionFromKeys', () => {
  it('returns the zero vector when no keys are pressed', () => {
    expect(directionFromKeys(new Set())).toEqual({ x: 0, y: 0 })
  })

  // Each row of the spec example table is one case.
  it.each([
    { keys: ['ArrowRight'], x: 1, y: 0, note: 'right' },
    { keys: ['KeyD'], x: 1, y: 0, note: 'right (WASD)' },
    { keys: ['ArrowLeft'], x: -1, y: 0, note: 'left' },
    { keys: ['KeyA'], x: -1, y: 0, note: 'left (WASD)' },
    { keys: ['ArrowUp'], x: 0, y: -1, note: 'up is negative y' },
    { keys: ['KeyW'], x: 0, y: -1, note: 'up (WASD)' },
    { keys: ['ArrowDown'], x: 0, y: 1, note: 'down' },
    { keys: ['KeyS'], x: 0, y: 1, note: 'down (WASD)' },
  ])('maps $note to ($x, $y)', ({ keys, x, y }) => {
    expect(directionFromKeys(new Set(keys))).toEqual({ x, y })
  })

  it('normalizes a diagonal so its magnitude is 1, not greater', () => {
    const dir = directionFromKeys(new Set(['ArrowUp', 'ArrowRight']))
    expect(dir.x).toBeCloseTo(INV_SQRT2)
    expect(dir.y).toBeCloseTo(-INV_SQRT2)
    expect(Math.hypot(dir.x, dir.y)).toBeCloseTo(1)
  })

  it('cancels opposite keys to the zero vector', () => {
    expect(directionFromKeys(new Set(['ArrowLeft', 'KeyD']))).toEqual({ x: 0, y: 0 })
    expect(directionFromKeys(new Set(['ArrowUp', 'KeyS']))).toEqual({ x: 0, y: 0 })
  })

  it('treats an arrow key and its WASD twin as the same direction (no doubling)', () => {
    // Pressing both ArrowRight and KeyD must not push twice as far.
    expect(directionFromKeys(new Set(['ArrowRight', 'KeyD']))).toEqual({ x: 1, y: 0 })
  })

  it('ignores unrelated keys', () => {
    expect(directionFromKeys(new Set(['Space', 'Enter']))).toEqual({ x: 0, y: 0 })
  })
})

describe('mergeDirections', () => {
  // Spec `player-movement` example table: keyboard wins when non-zero.
  it.each([
    { kb: { x: 1, y: 0 }, touch: { x: 0, y: 0 }, merged: { x: 1, y: 0 }, note: 'keyboard only' },
    { kb: { x: 0, y: 0 }, touch: { x: 0, y: 1 }, merged: { x: 0, y: 1 }, note: 'touch only' },
    { kb: { x: 1, y: 0 }, touch: { x: 0, y: 1 }, merged: { x: 1, y: 0 }, note: 'keyboard priority' },
    { kb: { x: 0, y: 0 }, touch: { x: 0, y: 0 }, merged: { x: 0, y: 0 }, note: 'both idle' },
  ])('merges kb=$kb touch=$touch → $merged ($note)', ({ kb, touch, merged }) => {
    expect(mergeDirections(kb, touch)).toEqual(merged)
  })

  it('returns a new object and does not mutate either input', () => {
    const kb = { x: 1, y: 0 }
    const touch = { x: 0, y: 1 }
    const merged = mergeDirections(kb, touch)
    expect(merged).not.toBe(kb)
    expect(merged).not.toBe(touch)
    expect(kb).toEqual({ x: 1, y: 0 })
    expect(touch).toEqual({ x: 0, y: 1 })
  })
})

describe('createTouchInput', () => {
  it('reads the zero vector before any direction is set', () => {
    const touch = createTouchInput()
    expect(touch.read()).toEqual({ x: 0, y: 0 })
    touch.destroy()
  })

  it('reflects setDirection on the next read as a new object copy', () => {
    const touch = createTouchInput()
    const dir = { x: 1, y: 0 }
    touch.setDirection(dir)

    const read = touch.read()
    expect(read).toEqual({ x: 1, y: 0 })
    // A new object, not the caller's reference (no shared mutation).
    expect(read).not.toBe(dir)

    touch.destroy()
  })

  it('does not mutate the caller object when it later changes', () => {
    const touch = createTouchInput()
    const dir = { x: 1, y: 0 }
    touch.setDirection(dir)
    // Mutating the caller's object must not affect the stored direction.
    ;(dir as { x: number }).x = -9
    expect(touch.read()).toEqual({ x: 1, y: 0 })
    touch.destroy()
  })

  it('edge-triggers interaction: triggerInteract then consume true once', () => {
    const touch = createTouchInput()
    touch.triggerInteract()
    expect(touch.consumeInteract()).toBe(true)
    expect(touch.consumeInteract()).toBe(false)
    touch.destroy()
  })

  it('reports no interaction before any trigger', () => {
    const touch = createTouchInput()
    expect(touch.consumeInteract()).toBe(false)
    touch.destroy()
  })

  it('returns a new object on each read (no shared mutation)', () => {
    const touch = createTouchInput()
    touch.setDirection({ x: 0, y: 1 })
    expect(touch.read()).not.toBe(touch.read())
    touch.destroy()
  })
})

describe('createInput', () => {
  type Handler = (event: { code: string; preventDefault: ReturnType<typeof vi.fn> }) => void
  let handlers: Record<string, Handler[]>

  beforeEach(() => {
    handlers = {}
    vi.stubGlobal('window', {
      addEventListener: vi.fn((type: string, handler: Handler) => {
        ;(handlers[type] ??= []).push(handler)
      }),
      removeEventListener: vi.fn((type: string, handler: Handler) => {
        handlers[type] = (handlers[type] ?? []).filter((h) => h !== handler)
      }),
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  const fire = (type: string, code: string): ReturnType<typeof vi.fn> => {
    const event = { code, preventDefault: vi.fn() }
    for (const handler of handlers[type] ?? []) handler(event)
    return event.preventDefault
  }

  it('reads the zero vector before any key is pressed', () => {
    const input = createInput()
    expect(input.read()).toEqual({ x: 0, y: 0 })
    input.destroy()
  })

  it('tracks pressed keys and releases them', () => {
    const input = createInput()

    fire('keydown', 'ArrowRight')
    expect(input.read()).toEqual({ x: 1, y: 0 })

    fire('keyup', 'ArrowRight')
    expect(input.read()).toEqual({ x: 0, y: 0 })

    input.destroy()
  })

  it('clears held movement when the window loses focus', () => {
    const input = createInput()
    fire('keydown', 'ArrowRight')
    expect(input.read()).toEqual({ x: 1, y: 0 })

    fire('blur', '')
    expect(input.read()).toEqual({ x: 0, y: 0 })

    input.destroy()
  })

  it('prevents browser defaults for movement and Space, not unrelated keys', () => {
    const input = createInput()
    const movementPreventDefault = fire('keydown', 'ArrowDown')
    // Space is the interact key — prevent the default page scroll.
    const spacePreventDefault = fire('keydown', 'Space')
    const otherPreventDefault = fire('keydown', 'Enter')

    expect(movementPreventDefault).toHaveBeenCalledTimes(1)
    expect(spacePreventDefault).toHaveBeenCalledTimes(1)
    expect(otherPreventDefault).not.toHaveBeenCalled()

    input.destroy()
  })

  it('returns a new object on each read (no shared mutation)', () => {
    const input = createInput()
    fire('keydown', 'ArrowRight')
    const a = input.read()
    const b = input.read()
    expect(a).not.toBe(b)
    expect(a).toEqual(b)
    input.destroy()
  })

  it('stops responding to key events after destroy', () => {
    const input = createInput()
    fire('keydown', 'ArrowRight')
    input.destroy()
    // Listeners are gone; a key event after destroy must not change read().
    fire('keydown', 'ArrowDown')
    expect(input.read()).toEqual({ x: 0, y: 0 })
  })

  it('edge-triggers interaction on Space: first consume true, then false', () => {
    const input = createInput()

    fire('keydown', 'Space')
    // First consume after the press fires exactly once.
    expect(input.consumeInteract()).toBe(true)
    // No new press in between → false.
    expect(input.consumeInteract()).toBe(false)

    input.destroy()
  })

  it('reports no interaction before any Space press', () => {
    const input = createInput()
    expect(input.consumeInteract()).toBe(false)
    input.destroy()
  })

  it('clears the interact flag on destroy', () => {
    const input = createInput()
    fire('keydown', 'Space')
    input.destroy()
    expect(input.consumeInteract()).toBe(false)
  })
})
