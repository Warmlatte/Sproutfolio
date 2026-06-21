import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { PLAYER_BODY, PLAYER_FOOT_INSET, PLAYER_SPEED, TILE_SIZE } from '../constants'
import { catalog } from './sprites/catalog'

const pixiMock = vi.hoisted(() => ({
  sprites: [] as MockSprite[],
}))

interface MockSprite {
  textures: unknown
  animationSpeed: number
  loop: boolean
  readonly anchor: { set: ReturnType<typeof vi.fn> }
  position: { x: number; y: number; set: (x: number, y: number) => void }
  play: ReturnType<typeof vi.fn>
  gotoAndStop: ReturnType<typeof vi.fn>
}

vi.mock('pixi.js', () => {
  class AnimatedSprite {
    textures: unknown
    animationSpeed = 0
    loop = true
    readonly anchor = { set: vi.fn() }
    position = {
      x: 0,
      y: 0,
      set(this: { x: number; y: number }, x: number, y: number): void {
        this.x = x
        this.y = y
      },
    }
    play = vi.fn()
    gotoAndStop = vi.fn()

    constructor(textures: unknown) {
      this.textures = textures
      pixiMock.sprites.push(this as unknown as MockSprite)
    }
  }
  class Container {
    addChild = vi.fn()
  }
  return { AnimatedSprite, Container }
})

import { createPlayer, facingFromDirection } from './player'

describe('facingFromDirection', () => {
  it('maps cardinal directions to facings', () => {
    expect(facingFromDirection({ x: 1, y: 0 }, 'down')).toBe('right')
    expect(facingFromDirection({ x: -1, y: 0 }, 'down')).toBe('left')
    expect(facingFromDirection({ x: 0, y: -1 }, 'down')).toBe('up')
    expect(facingFromDirection({ x: 0, y: 1 }, 'up')).toBe('down')
  })

  it('prefers the horizontal facing on a normalized diagonal', () => {
    const inv = 1 / Math.sqrt(2)
    expect(facingFromDirection({ x: inv, y: -inv }, 'down')).toBe('right')
    expect(facingFromDirection({ x: -inv, y: inv }, 'down')).toBe('left')
  })

  it('keeps the current facing when idle (zero vector)', () => {
    expect(facingFromDirection({ x: 0, y: 0 }, 'left')).toBe('left')
    expect(facingFromDirection({ x: 0, y: 0 }, 'up')).toBe('up')
  })
})

describe('createPlayer', () => {
  const atlas = { getTexture: vi.fn(() => ({})), destroy: vi.fn() }
  const spawn = { col: 14, row: 16 }

  beforeEach(() => {
    pixiMock.sprites.length = 0
    atlas.getTexture.mockClear()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  const makeWorld = () => ({ addChild: vi.fn() })

  it('spawns at the feet point of the spawn anchor (bottom-center of the tile)', () => {
    const player = createPlayer(makeWorld() as never, atlas as never, spawn)
    // Feet point: tile center horizontally, tile bottom vertically.
    expect(player.px).toEqual({
      x: spawn.col * TILE_SIZE + TILE_SIZE / 2,
      y: spawn.row * TILE_SIZE + TILE_SIZE,
    })
  })

  it('advances the position by direction * speed * dt when nothing blocks', () => {
    const player = createPlayer(makeWorld() as never, atlas as never, spawn)
    const start = player.px
    player.update(0.5, { x: 1, y: 0 }, new Set())
    expect(player.px.x).toBeCloseTo(start.x + PLAYER_SPEED * 0.5)
    expect(player.px.y).toBe(start.y)
  })

  it('returns a fresh px object so callers cannot mutate internal position', () => {
    const player = createPlayer(makeWorld() as never, atlas as never, spawn)
    const snapshot = player.px as { x: number; y: number }
    snapshot.x = -999
    snapshot.y = -999

    expect(player.px).toEqual({
      x: spawn.col * TILE_SIZE + TILE_SIZE / 2,
      y: spawn.row * TILE_SIZE + TILE_SIZE,
    })
  })

  it('does not pass through a solid cell (collision is applied)', () => {
    const player = createPlayer(makeWorld() as never, atlas as never, spawn)
    const start = player.px
    // Solid immediately to the right of the spawn feet box.
    const solids = new Set([`${spawn.col + 1},${spawn.row}`])
    player.update(0.1, { x: 1, y: 0 }, solids)
    expect(player.px.x).toBe(start.x) // blocked, stays at the wall edge
  })

  it('keeps the visible body within the map when walking into the top edge', () => {
    const player = createPlayer(makeWorld() as never, atlas as never, spawn)
    // Walk up far past the edge with no obstacles in the way.
    for (let i = 0; i < 100; i += 1) player.update(1, { x: 0, y: -1 }, new Set())
    // The feet point clamps so the head (px.y - body.up) sits at the map top,
    // i.e. the visible body stays inside the map-clamped camera.
    expect(player.px.y).toBe(PLAYER_BODY.up)
  })

  it('keeps the visible body within the left map edge', () => {
    const left = createPlayer(makeWorld() as never, atlas as never, spawn)
    for (let i = 0; i < 100; i += 1) left.update(1, { x: -1, y: 0 }, new Set())
    expect(left.px.x).toBe(PLAYER_BODY.halfW)
  })

  it('anchors the sprite at the art foot line, not the transparent frame bottom', () => {
    createPlayer(makeWorld() as never, atlas as never, spawn)
    const sprite = pixiMock.sprites[0]
    // The art's feet are at y=32 of the 48px frame (16px of bottom padding), so
    // the anchor must point there — otherwise the character renders one tile
    // above where it collides (collision box appears above bushes).
    const footAnchorY = (catalog.player.frameH - PLAYER_FOOT_INSET) / catalog.player.frameH
    expect(sprite.anchor.set).toHaveBeenCalledWith(0.5, footAnchorY)
    expect(sprite.position.x).toBe(spawn.col * TILE_SIZE + TILE_SIZE / 2)
    expect(sprite.position.y).toBe(spawn.row * TILE_SIZE + TILE_SIZE)
  })
})
