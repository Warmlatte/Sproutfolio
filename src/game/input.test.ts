import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { createInput, directionFromKeys } from './input'

const INV_SQRT2 = 1 / Math.sqrt(2)

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

describe('createInput', () => {
  type Handler = (event: { code: string }) => void
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

  const fire = (type: string, code: string): void => {
    for (const handler of handlers[type] ?? []) handler({ code })
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
})
