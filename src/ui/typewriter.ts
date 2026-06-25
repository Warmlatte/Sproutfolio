/**
 * Pure typewriter reveal math (M6).
 *
 * Given elapsed time, per-character speed, and the total character count,
 * `revealedCount` returns how many characters should be visible. No timers, no
 * DOM — the `useTypewriter` hook drives this from a rAF clock.
 */

/**
 * Characters visible after `elapsedMs`. A non-positive `speedMs` means "no
 * animation" → reveal everything; non-positive `elapsedMs` → reveal nothing;
 * otherwise `floor(elapsedMs / speedMs)` clamped to `[0, total]`.
 */
export function revealedCount(
  elapsedMs: number,
  speedMs: number,
  total: number,
): number {
  if (speedMs <= 0) return total
  if (elapsedMs <= 0) return 0
  return Math.min(total, Math.floor(elapsedMs / speedMs))
}
