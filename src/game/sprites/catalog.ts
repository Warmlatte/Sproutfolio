/**
 * Engine-agnostic sprite slice catalog (M2).
 *
 * Single source of truth for sprite-sheet coordinates used by M3–M7. The `paths`
 * entry (objects/paths.png, 4×4) was added in the M3 change for the path layer.
 * Each entry
 * is keyed by a logical name and describes the sheet as pure data (see
 * ./types.ts). Frame counts are derived from the copied sheet dimensions under
 * `public/sprites/` and divide evenly into the stated grid.
 *
 * Entries marked `待核對` have a frame layout that could not be confirmed
 * without visual inspection; the values divide the sheet evenly and are pending
 * confirmation on the `#sprites` debug page (see design.md Risks). `player`
 * (48×48, 4×4) and `dialogBox` (48×48, border 16) are pinned by the spec.
 */

import type { SpriteSheet } from './types'

/** The fixed M2 logical key set. Adding or removing a key requires a new spec change. */
export type CatalogKey =
  | 'player'
  | 'playerActions'
  | 'grass'
  | 'water'
  | 'woodenHouse'
  | 'plants'
  | 'grassBiom'
  | 'paths'
  | 'iconsAll'
  | 'inventory'
  | 'btnSquare'
  | 'dialogBox'

/**
 * The 11 core sheets for this milestone, keyed by logical name. Typed via
 * `satisfies` so each entry is checked against `SpriteSheet` while keeping its
 * literal types for downstream consumers.
 */
export const catalog = {
  // characters/ — pinned by spec: 48×48 frames in a 4×4 grid.
  // Row order (which row is which facing) is 待核對 on the debug page.
  player: {
    kind: 'grid',
    key: 'player',
    src: '/sprites/characters/character_spritesheet.png',
    frameW: 48,
    frameH: 48,
    cols: 4,
    rows: 4,
  },

  // characters/ — 96×576. 48px frames → 2×12. 待核對 (frame size & action order).
  playerActions: {
    kind: 'grid',
    key: 'playerActions',
    src: '/sprites/characters/character_actions.png',
    frameW: 48,
    frameH: 48,
    cols: 2,
    rows: 12,
  },

  // tilesets/ — 176×112, 16px tiles → 11×7.
  grass: {
    kind: 'grid',
    key: 'grass',
    src: '/sprites/tilesets/grass.png',
    frameW: 16,
    frameH: 16,
    cols: 11,
    rows: 7,
  },

  // tilesets/ — 64×16, 16px tiles → 4×1 animation strip.
  water: {
    kind: 'grid',
    key: 'water',
    src: '/sprites/tilesets/water.png',
    frameW: 16,
    frameH: 16,
    cols: 4,
    rows: 1,
    anims: {
      flow: { from: 0, to: 3, loop: true },
    },
  },

  // tilesets/ — 112×80, 16px tiles → 7×5.
  woodenHouse: {
    kind: 'grid',
    key: 'woodenHouse',
    src: '/sprites/tilesets/wooden_house.png',
    frameW: 16,
    frameH: 16,
    cols: 7,
    rows: 5,
  },

  // objects/ — 96×32, 16px tiles → 6×2.
  plants: {
    kind: 'grid',
    key: 'plants',
    src: '/sprites/objects/plants.png',
    frameW: 16,
    frameH: 16,
    cols: 6,
    rows: 2,
  },

  // objects/ — 144×80, 16px tiles → 9×5.
  grassBiom: {
    kind: 'grid',
    key: 'grassBiom',
    src: '/sprites/objects/grass_biom.png',
    frameW: 16,
    frameH: 16,
    cols: 9,
    rows: 5,
  },

  // objects/ — 64×64, 16px tiles → 4×4. Path tiles connecting the four regions.
  paths: {
    kind: 'grid',
    key: 'paths',
    src: '/sprites/objects/paths.png',
    frameW: 16,
    frameH: 16,
    cols: 4,
    rows: 4,
  },

  // ui/ — 288×48, 16px icons → 18×3.
  iconsAll: {
    kind: 'grid',
    key: 'iconsAll',
    src: '/sprites/ui/icons_all.png',
    frameW: 16,
    frameH: 16,
    cols: 18,
    rows: 3,
  },

  // ui/ — 144×144, 16px slots → 9×9.
  inventory: {
    kind: 'grid',
    key: 'inventory',
    src: '/sprites/ui/inventory_blocks.png',
    frameW: 16,
    frameH: 16,
    cols: 9,
    rows: 9,
  },

  // ui/ — 96×192. 32px frames → 3×6. 待核對 (frame size).
  btnSquare: {
    kind: 'grid',
    key: 'btnSquare',
    src: '/sprites/ui/btn_square_26.png',
    frameW: 32,
    frameH: 32,
    cols: 3,
    rows: 6,
  },

  // ui/ — pinned by spec: 48×48 nine-slice with 16px border.
  dialogBox: {
    kind: 'nine-slice',
    key: 'dialogBox',
    src: '/sprites/ui/dialog_box.png',
    width: 48,
    height: 48,
    border: 16,
  },
} as const satisfies Readonly<Record<CatalogKey, SpriteSheet>>
