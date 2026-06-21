import { describe, expect, it } from 'vitest'
import { readdirSync, statSync } from 'node:fs'
import { catalog, type CatalogKey } from './catalog'
import type { SpriteSheet } from './types'

type CatalogContract = Readonly<Record<CatalogKey, SpriteSheet>>

const catalogContract: CatalogContract = catalog
const spritesRoot = new URL('../../../public/sprites/', import.meta.url)
const coreAssetFiles = [
  'characters/character_actions.png',
  'characters/character_spritesheet.png',
  'objects/grass_biom.png',
  'objects/plants.png',
  'tilesets/grass.png',
  'tilesets/water.png',
  'tilesets/wooden_house.png',
  'ui/btn_square_26.png',
  'ui/dialog_box.png',
  'ui/icons_all.png',
  'ui/inventory_blocks.png',
] as const
const deferredAssetFragments = [
  'cow',
  'chest',
  'egg',
  'fences',
  'doors',
  'hills',
  'paths',
  'bridge',
] as const

function listSpriteFiles(dir: URL = spritesRoot, prefix = ''): string[] {
  return readdirSync(dir).flatMap((name) => {
    const child = new URL(name, dir)
    const relativePath = `${prefix}${name}`
    if (statSync(child).isDirectory()) {
      return listSpriteFiles(new URL(`${name}/`, dir), `${relativePath}/`)
    }
    return relativePath
  })
}

describe('sprite catalog contract', () => {
  it('exposes the exact M2 logical keys', () => {
    expect(Object.keys(catalogContract).sort()).toEqual([
      'btnSquare',
      'dialogBox',
      'grass',
      'grassBiom',
      'iconsAll',
      'inventory',
      'plants',
      'player',
      'playerActions',
      'water',
      'woodenHouse',
    ])
  })

  it('keeps catalog values readonly at the TypeScript boundary', () => {
    if (false) {
      // @ts-expect-error catalog entries are immutable literal data
      catalog.player.frameW = 24
    }
    expect(catalog.player.frameW).toBe(48)
  })

  it('keeps player and dialog box entries pinned to the M2 contract', () => {
    expect(catalog.player).toMatchObject({
      kind: 'grid',
      src: '/sprites/characters/character_spritesheet.png',
      frameW: 48,
      frameH: 48,
      cols: 4,
      rows: 4,
    })

    expect(catalog.dialogBox).toEqual({
      kind: 'nine-slice',
      key: 'dialogBox',
      src: '/sprites/ui/dialog_box.png',
      width: 48,
      height: 48,
      border: 16,
    })
  })

  it('keeps every catalog source under the public sprites route', () => {
    for (const sheet of Object.values(catalogContract)) {
      expect(sheet.src).toMatch(/^\/sprites\//)
    }
  })

  it('keeps the copied public sprite files to the 11 core assets', () => {
    expect(listSpriteFiles().sort()).toEqual([...coreAssetFiles].sort())
  })

  it.each(deferredAssetFragments)(
    'keeps deferred asset fragment "%s" out of public sprites',
    (fragment) => {
      expect(listSpriteFiles().some((path) => path.includes(fragment))).toBe(false)
    },
  )
})
