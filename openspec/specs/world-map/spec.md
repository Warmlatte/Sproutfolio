# world-map Specification

## Purpose

TBD - created by archiving change 'm3-world-map-and-canvas'. Update Purpose after archive.

## Requirements

### Requirement: Farm map is defined as layered immutable data

The farm map SHALL be defined as read-only data in `src/game/map/farmMap.ts` describing a 28×18 tile grid, organized in bottom-to-top layers: grass base (a single grass tile filling the whole grid), paths, pond (a static water frame), the wooden house prefab, and tree clusters. Map dimensions SHALL be exposed as `MAP_COLS = 28` and `MAP_ROWS = 18` constants in `src/constants.ts`. The data SHALL NOT hardcode any rendering or engine type.

#### Scenario: Map data declares dimensions and layers

- **WHEN** `farmMap` is read
- **THEN** it reports a 28×18 grid and exposes ordered layers for grass base, paths, pond, house, and trees as plain immutable data

#### Scenario: Tile indices stay within their sheets

- **WHEN** any layer references a sprite frame
- **THEN** the referenced frame index is within range for its catalog sheet, so `frameRect()` resolves it without throwing


<!-- @trace
source: m3-world-map-and-canvas
updated: 2026-06-21
code:
  - src/game/sprites/frame.ts
  - src/game/sprites/types.ts
  - docs/superpowers/specs/2026-06-21-m4-player-movement-design.md
  - public/sprites/ui/btn_square_26.png
  - src/react/GameCanvas.tsx
  - public/sprites/characters/character_spritesheet.png
  - src/game/camera.ts
  - public/sprites/objects/grass_biom.png
  - public/sprites/objects/paths.png
  - public/sprites/objects/plants.png
  - public/sprites/ui/inventory_blocks.png
  - src/dev/SpriteCanvas.tsx
  - src/constants.ts
  - src/game/map/farmMap.ts
  - src/game/sprites/catalog.ts
  - vite.config.ts
  - public/sprites/tilesets/wooden_house.png
  - src/game/engine.ts
  - public/sprites/ui/icons_all.png
  - src/dev/SpriteDebug.tsx
  - src/game/events.ts
  - public/sprites/tilesets/water.png
  - src/App.tsx
  - src/game/scenes/farm.ts
  - public/sprites/characters/character_actions.png
  - src/game/textures.ts
  - .github/pull_request_template.md
  - public/sprites/tilesets/grass.png
  - package.json
  - public/sprites/ui/dialog_box.png
tests:
  - src/game/sprites/catalog.test.ts
  - src/game/map/farmMap.test.ts
  - src/dev/SpriteCanvas.test.ts
  - src/game/camera.test.ts
  - src/game/engine.test.ts
  - src/game/sprites/frame.test.ts
  - src/test/node-fs.d.ts
-->

---
### Requirement: Four region anchors are reserved for later milestones

The farm map SHALL define anchor coordinates for the four content regions — house (top, About), noticeboard (left, Projects), mailbox (right, Contact), and the field-plus-pond cluster (lower center) with the spawn point at lower center. Every anchor coordinate MUST fall within the 28×18 grid. M3 SHALL render only the house, pond, and trees; the noticeboard and mailbox objects are reserved for M7 while their anchors are placed now.

#### Scenario: Anchors are in bounds

- **WHEN** the region anchors are read
- **THEN** each anchor's column is in `[0, 28)` and row is in `[0, 18)`

#### Scenario: M3 draws only static terrain and buildings

- **WHEN** the farm scene renders in M3
- **THEN** grass, paths, pond, house, and trees are drawn, while noticeboard and mailbox objects are not yet drawn


<!-- @trace
source: m3-world-map-and-canvas
updated: 2026-06-21
code:
  - src/game/sprites/frame.ts
  - src/game/sprites/types.ts
  - docs/superpowers/specs/2026-06-21-m4-player-movement-design.md
  - public/sprites/ui/btn_square_26.png
  - src/react/GameCanvas.tsx
  - public/sprites/characters/character_spritesheet.png
  - src/game/camera.ts
  - public/sprites/objects/grass_biom.png
  - public/sprites/objects/paths.png
  - public/sprites/objects/plants.png
  - public/sprites/ui/inventory_blocks.png
  - src/dev/SpriteCanvas.tsx
  - src/constants.ts
  - src/game/map/farmMap.ts
  - src/game/sprites/catalog.ts
  - vite.config.ts
  - public/sprites/tilesets/wooden_house.png
  - src/game/engine.ts
  - public/sprites/ui/icons_all.png
  - src/dev/SpriteDebug.tsx
  - src/game/events.ts
  - public/sprites/tilesets/water.png
  - src/App.tsx
  - src/game/scenes/farm.ts
  - public/sprites/characters/character_actions.png
  - src/game/textures.ts
  - .github/pull_request_template.md
  - public/sprites/tilesets/grass.png
  - package.json
  - public/sprites/ui/dialog_box.png
tests:
  - src/game/sprites/catalog.test.ts
  - src/game/map/farmMap.test.ts
  - src/dev/SpriteCanvas.test.ts
  - src/game/camera.test.ts
  - src/game/engine.test.ts
  - src/game/sprites/frame.test.ts
  - src/test/node-fs.d.ts
-->

---
### Requirement: Farm scene assembles tiles into the world container

`buildFarmScene(world)` SHALL read `farmMap` and add a sprite per tile to the world container, placing each at `column × TILE_SIZE, row × TILE_SIZE`, drawn in layer order so higher layers overlap lower ones. Multi-tile prefabs such as the wooden house SHALL be placed by their relative sheet-grid positions so tile seams align correctly.

#### Scenario: Tiles are positioned on the grid

- **WHEN** `buildFarmScene(world)` runs
- **THEN** each tile sprite is positioned at `column × TILE_SIZE, row × TILE_SIZE` and added to the world container in layer order

#### Scenario: Recognizable farm is rendered

- **WHEN** the farm scene finishes assembling
- **THEN** the world shows a grass field, connecting paths, a pond, a wooden house with aligned seams, and several trees, rendered crisply at integer scale


<!-- @trace
source: m3-world-map-and-canvas
updated: 2026-06-21
code:
  - src/game/sprites/frame.ts
  - src/game/sprites/types.ts
  - docs/superpowers/specs/2026-06-21-m4-player-movement-design.md
  - public/sprites/ui/btn_square_26.png
  - src/react/GameCanvas.tsx
  - public/sprites/characters/character_spritesheet.png
  - src/game/camera.ts
  - public/sprites/objects/grass_biom.png
  - public/sprites/objects/paths.png
  - public/sprites/objects/plants.png
  - public/sprites/ui/inventory_blocks.png
  - src/dev/SpriteCanvas.tsx
  - src/constants.ts
  - src/game/map/farmMap.ts
  - src/game/sprites/catalog.ts
  - vite.config.ts
  - public/sprites/tilesets/wooden_house.png
  - src/game/engine.ts
  - public/sprites/ui/icons_all.png
  - src/dev/SpriteDebug.tsx
  - src/game/events.ts
  - public/sprites/tilesets/water.png
  - src/App.tsx
  - src/game/scenes/farm.ts
  - public/sprites/characters/character_actions.png
  - src/game/textures.ts
  - .github/pull_request_template.md
  - public/sprites/tilesets/grass.png
  - package.json
  - public/sprites/ui/dialog_box.png
tests:
  - src/game/sprites/catalog.test.ts
  - src/game/map/farmMap.test.ts
  - src/dev/SpriteCanvas.test.ts
  - src/game/camera.test.ts
  - src/game/engine.test.ts
  - src/game/sprites/frame.test.ts
  - src/test/node-fs.d.ts
-->

---
### Requirement: Paths sprite is added to the asset pipeline

The change SHALL copy `paths.png` into `public/sprites/objects/paths.png` and add a corresponding 16×16 grid entry named `paths` to the sprite catalog in `src/game/sprites/catalog.ts`, following the existing pure-data catalog style.

#### Scenario: Paths catalog entry is usable

- **WHEN** the path layer renders
- **THEN** the `paths` catalog entry resolves path tiles from `public/sprites/objects/paths.png` via the texture adapter

<!-- @trace
source: m3-world-map-and-canvas
updated: 2026-06-21
code:
  - src/game/sprites/frame.ts
  - src/game/sprites/types.ts
  - docs/superpowers/specs/2026-06-21-m4-player-movement-design.md
  - public/sprites/ui/btn_square_26.png
  - src/react/GameCanvas.tsx
  - public/sprites/characters/character_spritesheet.png
  - src/game/camera.ts
  - public/sprites/objects/grass_biom.png
  - public/sprites/objects/paths.png
  - public/sprites/objects/plants.png
  - public/sprites/ui/inventory_blocks.png
  - src/dev/SpriteCanvas.tsx
  - src/constants.ts
  - src/game/map/farmMap.ts
  - src/game/sprites/catalog.ts
  - vite.config.ts
  - public/sprites/tilesets/wooden_house.png
  - src/game/engine.ts
  - public/sprites/ui/icons_all.png
  - src/dev/SpriteDebug.tsx
  - src/game/events.ts
  - public/sprites/tilesets/water.png
  - src/App.tsx
  - src/game/scenes/farm.ts
  - public/sprites/characters/character_actions.png
  - src/game/textures.ts
  - .github/pull_request_template.md
  - public/sprites/tilesets/grass.png
  - package.json
  - public/sprites/ui/dialog_box.png
tests:
  - src/game/sprites/catalog.test.ts
  - src/game/map/farmMap.test.ts
  - src/dev/SpriteCanvas.test.ts
  - src/game/camera.test.ts
  - src/game/engine.test.ts
  - src/game/sprites/frame.test.ts
  - src/test/node-fs.d.ts
-->