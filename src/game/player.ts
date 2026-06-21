/**
 * Player entity (M4). Free pixel-velocity movement with four-direction walk/idle
 * animation, drawn via a Pixi `AnimatedSprite`. The movement math is delegated
 * to the pure, tested `resolveMove`; this module is the thin Pixi glue plus the
 * pure `facingFromDirection` decision.
 *
 * The player lives in unscaled world coordinates as a child of the world
 * container (which applies `WORLD_SCALE`). `px` is the FEET point — the sprite's
 * bottom-center — so the collision box hugs the feet while the head can overlap
 * obstacles drawn above (no y-sort in M4).
 */

import { AnimatedSprite, Container, type Texture } from 'pixi.js'

import {
  MAP_COLS,
  MAP_ROWS,
  PLAYER_ANIM_FPS,
  PLAYER_HITBOX,
  PLAYER_ROW_DOWN,
  PLAYER_ROW_LEFT,
  PLAYER_ROW_RIGHT,
  PLAYER_ROW_UP,
  PLAYER_SPEED,
  TILE_SIZE,
} from '../constants'
import { resolveMove, type Bounds } from './collision'
import type { Direction } from './input'
import type { Anchor } from './map/farmMap'
import { catalog } from './sprites/catalog'
import type { TextureAtlas } from './textures'

/** A cardinal facing for the four-direction animation. */
export type Facing = 'down' | 'up' | 'left' | 'right'

/** Facing → spritesheet row, from the (待核對) named constants. */
const FACING_ROW: Record<Facing, number> = {
  down: PLAYER_ROW_DOWN,
  up: PLAYER_ROW_UP,
  left: PLAYER_ROW_LEFT,
  right: PLAYER_ROW_RIGHT,
}

/** Pixi `AnimatedSprite.animationSpeed` is texture-advance per 60fps tick. */
const ANIMATION_SPEED = PLAYER_ANIM_FPS / 60

/**
 * The facing implied by a direction vector. Horizontal wins ties (so a diagonal
 * faces left/right); an idle (zero) vector keeps the `current` facing so the
 * sprite stops on the right idle frame.
 */
export function facingFromDirection(dir: Direction, current: Facing): Facing {
  if (dir.x !== 0 && Math.abs(dir.x) >= Math.abs(dir.y)) {
    return dir.x > 0 ? 'right' : 'left'
  }
  if (dir.y !== 0) {
    return dir.y > 0 ? 'down' : 'up'
  }
  return current
}

/** A running player. `update` is called once per frame by the engine ticker. */
export interface Player {
  /** Advances by `dir * PLAYER_SPEED * dt` (seconds), then resolves collisions. */
  update(dt: number, dir: Direction, solids: ReadonlySet<string>): void
  /** The current feet point in unscaled world coordinates (a fresh object). */
  readonly px: { readonly x: number; readonly y: number }
}

const MAP_BOUNDS: Bounds = { w: MAP_COLS * TILE_SIZE, h: MAP_ROWS * TILE_SIZE }

/** Feet point for an anchor: the tile's horizontal center and bottom edge. */
function feetOf(anchor: Anchor): { x: number; y: number } {
  return {
    x: anchor.col * TILE_SIZE + TILE_SIZE / 2,
    y: anchor.row * TILE_SIZE + TILE_SIZE,
  }
}

/** Builds the four walk-frame textures for one facing row of the player sheet. */
function walkFrames(atlas: TextureAtlas, facing: Facing): Texture[] {
  const cols = catalog.player.cols
  const row = FACING_ROW[facing]
  const frames: Texture[] = []
  for (let c = 0; c < cols; c += 1) {
    frames.push(atlas.getTexture('player', row * cols + c))
  }
  return frames
}

/**
 * Creates the player at `spawn`, adds its sprite to `world`, and returns the
 * movement/animation handle. Textures come from the engine's loaded `atlas`.
 */
export function createPlayer(
  world: Container,
  atlas: TextureAtlas,
  spawn: Anchor,
): Player {
  const facings: readonly Facing[] = ['down', 'up', 'left', 'right']
  const textures = Object.fromEntries(
    facings.map((f) => [f, walkFrames(atlas, f)]),
  ) as Record<Facing, Texture[]>

  let px = feetOf(spawn)
  let facing: Facing = 'down'
  let moving = false

  const sprite = new AnimatedSprite(textures[facing])
  sprite.anchor.set(0.5, 1)
  sprite.animationSpeed = ANIMATION_SPEED
  sprite.loop = true
  sprite.position.set(px.x, px.y)
  sprite.gotoAndStop(0) // start idle on the down-facing still frame
  world.addChild(sprite)

  const update = (
    dt: number,
    dir: Direction,
    solids: ReadonlySet<string>,
  ): void => {
    const dx = dir.x * PLAYER_SPEED * dt
    const dy = dir.y * PLAYER_SPEED * dt
    const box = {
      x: px.x - PLAYER_HITBOX.w / 2,
      y: px.y - PLAYER_HITBOX.h,
      w: PLAYER_HITBOX.w,
      h: PLAYER_HITBOX.h,
    }
    const resolved = resolveMove(box, dx, dy, solids, MAP_BOUNDS)
    px = {
      x: resolved.x + PLAYER_HITBOX.w / 2,
      y: resolved.y + PLAYER_HITBOX.h,
    }
    sprite.position.set(px.x, px.y)

    const nextFacing = facingFromDirection(dir, facing)
    const nextMoving = dir.x !== 0 || dir.y !== 0
    const facingChanged = nextFacing !== facing

    if (facingChanged) {
      facing = nextFacing
      sprite.textures = textures[facing] // swapping textures resets to frame 0
    }
    if (nextMoving) {
      // (Re)start the walk loop when starting to move or switching rows.
      if (!moving || facingChanged) sprite.play()
    } else if (moving) {
      sprite.gotoAndStop(0) // stop on the idle frame for the current facing
    }
    moving = nextMoving
  }

  return {
    update,
    get px() {
      return px
    },
  }
}
