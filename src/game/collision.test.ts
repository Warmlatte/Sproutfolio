import { describe, expect, it } from 'vitest'

import { buildSolidSet } from './collision'
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
