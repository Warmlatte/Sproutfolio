/**
 * Engine-agnostic sprite slice types (M2).
 *
 * Slices are described as plain, immutable TypeScript data with no game-engine
 * dependency. The M3 engine layer will translate these into the chosen engine's
 * format; M2 keeps them as pure data so coordinates can be pinned and verified
 * before engine selection.
 *
 * Source of truth: openspec/changes/m2-asset-pipeline/design.md (Implementation
 * Contract) and specs/asset-pipeline/spec.md.
 */

/** A source rectangle within a sprite sheet, in sheet pixel coordinates. */
export interface Rect {
  readonly sx: number
  readonly sy: number
  readonly sw: number
  readonly sh: number
}

/** A named animation as an inclusive frame-index range over a grid sheet. */
export interface Anim {
  readonly from: number
  readonly to: number
  readonly loop?: boolean
}

/**
 * A grid sheet: frames of uniform size laid out in `cols × rows`, addressed by
 * row-major index. Optional named animations map labels to frame ranges.
 */
export interface GridSheet {
  readonly kind: 'grid'
  readonly key: string
  readonly src: string
  readonly frameW: number
  readonly frameH: number
  readonly cols: number
  readonly rows: number
  readonly anims?: Readonly<Record<string, Anim>>
}

/**
 * A nine-slice sheet: a `width × height` image split into nine regions whose
 * corners are `border × border`. Used for resizable UI surfaces (M6).
 */
export interface NineSlice {
  readonly kind: 'nine-slice'
  readonly key: string
  readonly src: string
  readonly width: number
  readonly height: number
  readonly border: number
}

/** A catalog entry: either a grid sheet or a nine-slice sheet. */
export type SpriteSheet = GridSheet | NineSlice
