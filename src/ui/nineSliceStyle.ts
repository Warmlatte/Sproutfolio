/**
 * Pure nine-slice → CSS `border-image` math (M6).
 *
 * Produces the `border-image` properties that render a resizable 9-slice surface
 * with corners fixed and edges/center stretched. `border-image-slice: <slice>
 * fill` keeps the center region; an integer-scaled `border-width` preserves
 * pixel sharpness alongside `image-rendering: pixelated`. No DOM, no engine.
 */

/** CSS `border-image` properties for an integer-scaled nine-slice surface. */
export interface NineSliceCssStyle {
  readonly borderStyle: 'solid'
  readonly borderColor: 'transparent'
  readonly borderWidth: string
  readonly borderImageSource: string
  readonly borderImageSlice: string
  readonly borderImageWidth: string
  readonly borderImageRepeat: 'stretch'
  readonly imageRendering: 'pixelated'
}

/**
 * `border-image` style for `asset`, cutting `slice` source pixels per edge and
 * scaling the rendered border by integer `scale`. Throws `RangeError` when
 * `slice` or `scale` is not a positive integer.
 */
export function nineSliceStyle(
  asset: string,
  slice: number,
  scale: number,
): NineSliceCssStyle {
  if (!Number.isInteger(slice) || slice <= 0) {
    throw new RangeError(
      `nineSliceStyle: slice ${slice} must be a positive integer`,
    )
  }
  if (!Number.isInteger(scale) || scale <= 0) {
    throw new RangeError(
      `nineSliceStyle: scale ${scale} must be a positive integer`,
    )
  }

  const border = slice * scale

  return {
    // border-style + border-width reserve the space that border-image fills.
    // border-color is the (invisible) fallback under the image-replaced border.
    borderStyle: 'solid',
    borderColor: 'transparent',
    borderWidth: `${border}px`,
    borderImageSource: `url(${asset})`,
    borderImageSlice: `${slice} fill`,
    borderImageWidth: `${border}px`,
    borderImageRepeat: 'stretch',
    imageRendering: 'pixelated',
  }
}
