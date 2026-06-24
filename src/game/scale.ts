/**
 * Responsive world scaling (M5). Maps a container width to an integer world-scale
 * multiplier using fixed breakpoints, so pixel art stays crisp at every size.
 *
 * Pure (no DOM): the engine reads `container.clientWidth` and passes it in, both
 * on init and on resize. Breakpoints are inclusive lower bounds — a width exactly
 * equal to a breakpoint resolves to the higher tier.
 */

import { SCALE_BP_SM, SCALE_BP_MD } from '../constants'

/**
 * Resolves a container width (px) to an integer world-scale multiplier:
 * `< SCALE_BP_SM → 2`, `< SCALE_BP_MD → 3`, otherwise `4`.
 */
export function computeWorldScale(width: number): number {
  if (width < SCALE_BP_SM) return 2
  if (width < SCALE_BP_MD) return 3
  return 4
}
