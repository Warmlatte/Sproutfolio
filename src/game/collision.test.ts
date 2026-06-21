import { describe, expect, it } from 'vitest'

import { buildSolidSet, resolveMove, type Box } from './collision'
import { farmMap, type FarmMap } from './map/farmMap'

describe('buildSolidSet', () => {
  it('includes a tree cell and excludes a path cell (spec example)', () => {
    // farmMap has a tree at (1,1) and a path tile at (14,9).
    const solids = buildSolidSet(farmMap)
    expect(solids.has('1,1')).toBe(true)
    expect(solids.has('14,9')).toBe(false)
  })

  it('marks every house, pond, and tree cell as solid', () => {
    const solids = buildSolidSet(farmMap)
    for (const layer of farmMap.layers) {
      if (layer.name === 'house' || layer.name === 'pond' || layer.name === 'trees') {
        for (const tile of layer.tiles) {
          expect(solids.has(`${tile.col},${tile.row}`)).toBe(true)
        }
      }
    }
  })

  it('never marks a path cell as solid', () => {
    const solids = buildSolidSet(farmMap)
    const paths = farmMap.layers.find((l) => l.name === 'paths')
    expect(paths).toBeDefined()
    for (const tile of paths!.tiles) {
      // A path cell is only solid if an obstacle layer also covers it; the M3
      // map keeps paths clear, so none should be present.
      expect(solids.has(`${tile.col},${tile.row}`)).toBe(false)
    }
  })

  it('derives solids only from obstacle layers, ignoring walkable ones', () => {
    const map: FarmMap = {
      cols: 4,
      rows: 4,
      grassFill: 0,
      layers: [
        { name: 'paths', sheet: 'paths', tiles: [{ col: 0, row: 0, index: 0 }] },
        { name: 'pond', sheet: 'water', tiles: [{ col: 2, row: 2, index: 0 }] },
        { name: 'trees', sheet: 'grassBiom', tiles: [{ col: 3, row: 3, index: 0 }] },
      ],
      anchors: farmMap.anchors,
    }
    const solids = buildSolidSet(map)
    expect([...solids].sort()).toEqual(['2,2', '3,3'])
  })
})

describe('resolveMove', () => {
  // TILE_SIZE is 16. Feet box matches PLAYER_HITBOX (16×10).
  const box = (x: number, y: number): Box => ({ x, y, w: 16, h: 10 })
  const bigBounds = { w: 1000, h: 1000 }

  it('applies the full move when nothing is hit and bounds allow it (free move)', () => {
    const result = resolveMove(box(16, 16), 5, 7, new Set(), bigBounds)
    expect(result).toEqual({ x: 21, y: 23 })
  })

  it('stops the blocked axis at the wall edge but slides along the other', () => {
    // Solid cell (2,1) spans x[32,48), y[16,32).
    const solids = new Set(['2,1'])
    // Start clear in (1,1); move right into the wall and down along it.
    const result = resolveMove(box(16, 18), 16, 4, solids, bigBounds)
    // x is stopped flush against the wall's left edge (col2*16 - boxW = 16)...
    expect(result.x).toBe(16)
    // ...while y still slides freely.
    expect(result.y).toBe(22)
  })

  it('stops at the wall right edge when moving left into a solid', () => {
    const solids = new Set(['1,1']) // x[16,32), y[16,32)
    const result = resolveMove(box(34, 18), -16, 0, solids, bigBounds)
    // Snapped to the wall's right edge (col2*16 = 32).
    expect(result.x).toBe(32)
    expect(result.y).toBe(18)
  })

  it('does not tunnel through a solid cell during a large single-frame move', () => {
    const solids = new Set(['2,1']) // x[32,48), y[16,32)
    const result = resolveMove(box(0, 18), 64, 0, solids, bigBounds)
    expect(result).toEqual({ x: 16, y: 18 })
  })

  it('clamps the feet box within the map bounds (cannot leave the map)', () => {
    const bounds = { w: 64, h: 64 }
    const result = resolveMove(box(50, 50), 30, 30, new Set(), bounds)
    // Cannot exceed bounds.w - boxW and bounds.h - boxH.
    expect(result.x).toBe(64 - 16)
    expect(result.y).toBe(64 - 10)
    expect(result.x).toBeLessThanOrEqual(64 - 16)
    expect(result.y).toBeLessThanOrEqual(64 - 10)
  })

  it('clamps at the top-left origin', () => {
    const result = resolveMove(box(4, 3), -20, -20, new Set(), bigBounds)
    expect(result).toEqual({ x: 0, y: 0 })
  })

  it('stays flush against a wall without false collisions when already touching', () => {
    // Box right edge exactly at the wall's left edge (x+w = 32, wall col2).
    const solids = new Set(['2,1'])
    const result = resolveMove(box(16, 18), 0, 0, solids, bigBounds)
    expect(result).toEqual({ x: 16, y: 18 })
  })
})
