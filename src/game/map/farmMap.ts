/**
 * Farm map data (M3). Pure, engine-free data — no Pixi import — so it stays
 * node-testable and is the single source of truth for the static farm layout.
 *
 * The map is 28×18 tiles, assembled in bottom-to-top layers: a single grass
 * tile fills the base, then paths, a static pond, the wooden-house prefab, and
 * tree clusters. Four region anchors mark where M4/M7 content attaches; M3 draws
 * only the static terrain and buildings (noticeboard/mailbox objects come in M7).
 *
 * Frame indices marked `待核對` are visual guesses that divide their sheet
 * evenly but are pending confirmation on the `#sprites` debug page; adjust the
 * named constants below after the manual walkthrough.
 */

import { MAP_COLS, MAP_ROWS } from '../../constants'
import type { CatalogKey } from '../sprites/catalog'

/** A single tile placed at grid `col,row`, drawn from frame `index` of a sheet. */
export interface TilePlacement {
  readonly col: number
  readonly row: number
  readonly index: number
}

/** One render layer: all tiles share a single grid sheet. */
export interface MapLayer {
  readonly name: string
  readonly sheet: CatalogKey
  readonly tiles: readonly TilePlacement[]
}

/** A grid coordinate used to anchor a content region. */
export interface Anchor {
  readonly col: number
  readonly row: number
}

/** Where each content region attaches. M3 renders only house/pond/trees. */
export interface RegionAnchors {
  readonly house: Anchor
  readonly noticeboard: Anchor
  readonly mailbox: Anchor
  readonly field: Anchor
  readonly spawn: Anchor
}

/** The complete static farm definition. */
export interface FarmMap {
  readonly cols: number
  readonly rows: number
  readonly grassFill: number
  readonly layers: readonly MapLayer[]
  readonly anchors: RegionAnchors
}

// --- Visual frame indices (待核對 — confirm on #sprites, then tweak here) ---
const GRASS_FILL = 12 // grass sheet 11×7: a plain center grass tile.
const PATH_TILE = 4 // paths sheet 4×4 (objects/paths.png): a wooden plank tile.
const POND_TILE = 0 // water sheet 4×1: first (static) animation frame.
const TREE_TILE = 0 // grass_biom sheet 9×5: a tree/bush tile.

// --- Wooden house: wooden_house.png (7×5) is a parts sheet, not a single house.
// The left 3×5 block (sheet cols 0-2) is the pre-composed cottage (chimney,
// window, door); we tile exactly that block so the seams line up. ---
const HOUSE_SHEET_COLS = 7 // full sheet width, for row-major index math
const HOUSE_SHEET_COL0 = 0 // sub-grid origin within the sheet
const HOUSE_SHEET_ROW0 = 0
const HOUSE_W = 3 // cottage block is 3 tiles wide
const HOUSE_H = 5 // and 5 tiles tall
const HOUSE_COL0 = 13 // top-center placement on the map
const HOUSE_ROW0 = 1

/** Places the pre-composed cottage sub-block of the sheet at a map origin. */
function houseTiles(col0: number, row0: number): TilePlacement[] {
  const tiles: TilePlacement[] = []
  for (let r = 0; r < HOUSE_H; r += 1) {
    for (let c = 0; c < HOUSE_W; c += 1) {
      const index =
        (HOUSE_SHEET_ROW0 + r) * HOUSE_SHEET_COLS + (HOUSE_SHEET_COL0 + c)
      tiles.push({ col: col0 + c, row: row0 + r, index })
    }
  }
  return tiles
}

/** A solid rectangle of one tile index. */
function rectTiles(
  index: number,
  col0: number,
  row0: number,
  w: number,
  h: number,
): TilePlacement[] {
  const tiles: TilePlacement[] = []
  for (let r = 0; r < h; r += 1) {
    for (let c = 0; c < w; c += 1) {
      tiles.push({ col: col0 + c, row: row0 + r, index })
    }
  }
  return tiles
}

/** A straight run of one tile index (horizontal or vertical). */
function lineTiles(
  index: number,
  col0: number,
  row0: number,
  length: number,
  axis: 'h' | 'v',
): TilePlacement[] {
  const tiles: TilePlacement[] = []
  for (let i = 0; i < length; i += 1) {
    tiles.push({
      col: axis === 'h' ? col0 + i : col0,
      row: axis === 'v' ? row0 + i : row0,
      index,
    })
  }
  return tiles
}

const pathTiles: TilePlacement[] = [
  // Vertical spine from below the house down to the spawn point.
  ...lineTiles(PATH_TILE, 14, 6, 11, 'v'),
  // Horizontal path linking the noticeboard (left) and mailbox (right) anchors.
  ...lineTiles(PATH_TILE, 4, 9, 20, 'h'),
]

const treeTiles: TilePlacement[] = [
  // Top-left grove.
  { col: 1, row: 1, index: TREE_TILE },
  { col: 2, row: 1, index: TREE_TILE },
  { col: 1, row: 2, index: TREE_TILE },
  { col: 2, row: 2, index: TREE_TILE },
  // Top-right grove.
  { col: 25, row: 2, index: TREE_TILE },
  { col: 26, row: 2, index: TREE_TILE },
  { col: 26, row: 3, index: TREE_TILE },
  // Lower scattered trees.
  { col: 6, row: 13, index: TREE_TILE },
  { col: 7, row: 13, index: TREE_TILE },
  { col: 9, row: 5, index: TREE_TILE },
  { col: 21, row: 6, index: TREE_TILE },
]

/** The static farm map. Layers are ordered bottom-to-top over the grass base. */
export const farmMap: FarmMap = {
  cols: MAP_COLS,
  rows: MAP_ROWS,
  grassFill: GRASS_FILL,
  layers: [
    { name: 'paths', sheet: 'paths', tiles: pathTiles },
    { name: 'pond', sheet: 'water', tiles: rectTiles(POND_TILE, 17, 11, 4, 3) },
    { name: 'house', sheet: 'woodenHouse', tiles: houseTiles(HOUSE_COL0, HOUSE_ROW0) },
    { name: 'trees', sheet: 'grassBiom', tiles: treeTiles },
  ],
  anchors: {
    house: { col: 14, row: 3 },
    noticeboard: { col: 4, row: 9 },
    mailbox: { col: 23, row: 9 },
    field: { col: 14, row: 13 },
    spawn: { col: 14, row: 16 },
  },
}
