## ADDED Requirements

### Requirement: Farm map is defined as layered immutable data

The farm map SHALL be defined as read-only data in `src/game/map/farmMap.ts` describing a 28×18 tile grid, organized in bottom-to-top layers: grass base (a single grass tile filling the whole grid), paths, pond (a static water frame), the wooden house prefab, and tree clusters. Map dimensions SHALL be exposed as `MAP_COLS = 28` and `MAP_ROWS = 18` constants in `src/constants.ts`. The data SHALL NOT hardcode any rendering or engine type.

#### Scenario: Map data declares dimensions and layers

- **WHEN** `farmMap` is read
- **THEN** it reports a 28×18 grid and exposes ordered layers for grass base, paths, pond, house, and trees as plain immutable data

#### Scenario: Tile indices stay within their sheets

- **WHEN** any layer references a sprite frame
- **THEN** the referenced frame index is within range for its catalog sheet, so `frameRect()` resolves it without throwing

### Requirement: Four region anchors are reserved for later milestones

The farm map SHALL define anchor coordinates for the four content regions — house (top, About), noticeboard (left, Projects), mailbox (right, Contact), and the field-plus-pond cluster (lower center) with the spawn point at lower center. Every anchor coordinate MUST fall within the 28×18 grid. M3 SHALL render only the house, pond, and trees; the noticeboard and mailbox objects are reserved for M7 while their anchors are placed now.

#### Scenario: Anchors are in bounds

- **WHEN** the region anchors are read
- **THEN** each anchor's column is in `[0, 28)` and row is in `[0, 18)`

#### Scenario: M3 draws only static terrain and buildings

- **WHEN** the farm scene renders in M3
- **THEN** grass, paths, pond, house, and trees are drawn, while noticeboard and mailbox objects are not yet drawn

### Requirement: Farm scene assembles tiles into the world container

`buildFarmScene(world)` SHALL read `farmMap` and add a sprite per tile to the world container, placing each at `column × TILE_SIZE, row × TILE_SIZE`, drawn in layer order so higher layers overlap lower ones. Multi-tile prefabs such as the wooden house SHALL be placed by their relative sheet-grid positions so tile seams align correctly.

#### Scenario: Tiles are positioned on the grid

- **WHEN** `buildFarmScene(world)` runs
- **THEN** each tile sprite is positioned at `column × TILE_SIZE, row × TILE_SIZE` and added to the world container in layer order

#### Scenario: Recognizable farm is rendered

- **WHEN** the farm scene finishes assembling
- **THEN** the world shows a grass field, connecting paths, a pond, a wooden house with aligned seams, and several trees, rendered crisply at integer scale

### Requirement: Paths sprite is added to the asset pipeline

The change SHALL copy `paths.png` into `public/sprites/objects/paths.png` and add a corresponding 16×16 grid entry named `paths` to the sprite catalog in `src/game/sprites/catalog.ts`, following the existing pure-data catalog style.

#### Scenario: Paths catalog entry is usable

- **WHEN** the path layer renders
- **THEN** the `paths` catalog entry resolves path tiles from `public/sprites/objects/paths.png` via the texture adapter
