import { describe, expect, it } from 'vitest'

import { MAP_COLS, MAP_ROWS } from '../../constants'
import { catalog } from '../sprites/catalog'
import { frameRect } from '../sprites/frame'
import type { GridSheet } from '../sprites/types'
import { farmMap } from './farmMap'

function gridSheet(key: keyof typeof catalog): GridSheet {
  const sheet = catalog[key]
  if (sheet.kind !== 'grid') {
    throw new Error(`expected grid sheet for "${key}"`)
  }
  return sheet
}

describe('farmMap', () => {
  it('matches the 28×18 map constants', () => {
    expect(farmMap.cols).toBe(MAP_COLS)
    expect(farmMap.rows).toBe(MAP_ROWS)
    expect(MAP_COLS).toBe(28)
    expect(MAP_ROWS).toBe(18)
  })

  it('fills the base with an in-range grass frame', () => {
    expect(() => frameRect(gridSheet('grass'), farmMap.grassFill)).not.toThrow()
  })

  it('declares the expected ordered layers', () => {
    expect(farmMap.layers.map((layer) => layer.name)).toEqual([
      'paths',
      'pond',
      'house',
      'trees',
    ])
  })

  it('keeps every layer tile inside the grid and its sheet range', () => {
    for (const layer of farmMap.layers) {
      const sheet = gridSheet(layer.sheet)
      for (const tile of layer.tiles) {
        expect(tile.col).toBeGreaterThanOrEqual(0)
        expect(tile.col).toBeLessThan(MAP_COLS)
        expect(tile.row).toBeGreaterThanOrEqual(0)
        expect(tile.row).toBeLessThan(MAP_ROWS)
        expect(() => frameRect(sheet, tile.index)).not.toThrow()
      }
    }
  })

  it('places all four region anchors inside the grid', () => {
    const { house, noticeboard, mailbox, field, spawn } = farmMap.anchors
    for (const anchor of [house, noticeboard, mailbox, field, spawn]) {
      expect(anchor.col).toBeGreaterThanOrEqual(0)
      expect(anchor.col).toBeLessThan(MAP_COLS)
      expect(anchor.row).toBeGreaterThanOrEqual(0)
      expect(anchor.row).toBeLessThan(MAP_ROWS)
    }
  })
})
