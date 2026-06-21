# asset-pipeline Specification

## Purpose

TBD - created by archiving change 'm2-asset-pipeline'. Update Purpose after archive.

## Requirements

### Requirement: Curated assets served from public/sprites

The system SHALL place the milestone's core asset set under `public/sprites/`, organized into `characters/`, `tilesets/`, `objects/`, and `ui/` subfolders, so Vite serves each file at a stable URL path. The core set SHALL contain exactly these 11 sheets: character_spritesheet, character_actions, grass, water, wooden_house, plants, grass_biom, icons_all, inventory_blocks, btn_square_26, dialog_box.

#### Scenario: Core asset is reachable at its served path

- **WHEN** the dev server runs and a request targets `/sprites/tilesets/water.png`
- **THEN** the file is served with its original pixel dimensions (64×16) and is not modified

#### Scenario: Deferred assets are not copied

- **WHEN** the core set is assembled
- **THEN** `public/sprites/` does not include cow, chest, egg, fences, doors, hills, paths, or bridge sheets


<!-- @trace
source: m2-asset-pipeline
updated: 2026-06-21
code:
  - .github/ISSUE_TEMPLATE/spectra-change.md
  - public/sprites/objects/grass_biom.png
  - package.json
  - src/App.tsx
  - docs/superpowers/specs/2026-06-21-m3-world-map-and-canvas-design.md
  - public/sprites/ui/btn_square_26.png
  - src/dev/SpriteDebug.tsx
  - src/game/sprites/types.ts
  - CLAUDE.md
  - src/dev/SpriteCanvas.tsx
  - public/sprites/characters/character_actions.png
  - public/sprites/objects/plants.png
  - public/sprites/ui/icons_all.png
  - public/sprites/characters/character_spritesheet.png
  - public/sprites/ui/inventory_blocks.png
  - AGENTS.md
  - public/sprites/tilesets/wooden_house.png
  - public/sprites/ui/dialog_box.png
  - src/game/sprites/catalog.ts
  - vite.config.ts
  - public/sprites/tilesets/grass.png
  - public/sprites/tilesets/water.png
  - src/game/sprites/frame.ts
tests:
  - src/game/sprites/frame.test.ts
  - src/dev/SpriteCanvas.test.ts
  - src/game/sprites/catalog.test.ts
  - src/test/node-fs.d.ts
-->

---
### Requirement: Engine-agnostic sprite slice catalog

The system SHALL define sprite slices as plain TypeScript data with no game-engine dependency. Each entry SHALL be a discriminated union member keyed by `kind`: a `grid` sheet (`key`, `src`, `frameW`, `frameH`, `cols`, `rows`, optional `anims`) or a `nine-slice` sheet (`key`, `src`, `width`, `height`, `border`). The catalog SHALL expose all 11 core sheets keyed by logical name. All catalog values SHALL be immutable; updates SHALL return new objects rather than mutating in place.

#### Scenario: Grid sheet describes the player spritesheet

- **WHEN** the catalog entry for `player` is read
- **THEN** it is a `grid` sheet with `src` pointing under `/sprites/`, frame size 48×48, and a 4×4 grid

#### Scenario: Nine-slice sheet describes the dialog box

- **WHEN** the catalog entry for `dialogBox` is read
- **THEN** it is a `nine-slice` sheet with width 48, height 48, and border 16


<!-- @trace
source: m2-asset-pipeline
updated: 2026-06-21
code:
  - .github/ISSUE_TEMPLATE/spectra-change.md
  - public/sprites/objects/grass_biom.png
  - package.json
  - src/App.tsx
  - docs/superpowers/specs/2026-06-21-m3-world-map-and-canvas-design.md
  - public/sprites/ui/btn_square_26.png
  - src/dev/SpriteDebug.tsx
  - src/game/sprites/types.ts
  - CLAUDE.md
  - src/dev/SpriteCanvas.tsx
  - public/sprites/characters/character_actions.png
  - public/sprites/objects/plants.png
  - public/sprites/ui/icons_all.png
  - public/sprites/characters/character_spritesheet.png
  - public/sprites/ui/inventory_blocks.png
  - AGENTS.md
  - public/sprites/tilesets/wooden_house.png
  - public/sprites/ui/dialog_box.png
  - src/game/sprites/catalog.ts
  - vite.config.ts
  - public/sprites/tilesets/grass.png
  - public/sprites/tilesets/water.png
  - src/game/sprites/frame.ts
tests:
  - src/game/sprites/frame.test.ts
  - src/dev/SpriteCanvas.test.ts
  - src/game/sprites/catalog.test.ts
  - src/test/node-fs.d.ts
-->

---
### Requirement: Frame rectangle computation with bounds validation

The system SHALL compute the source rectangle for a grid frame from its row-major index via a pure function `frameRect(sheet, index)` returning `{ sx, sy, sw, sh }`. The function SHALL throw an explicit error when the index is negative or greater than or equal to `cols * rows`, and SHALL NOT silently return an invalid rectangle.

#### Scenario: Index maps to row-major source rectangle

- **WHEN** `frameRect` is called with a valid in-range index
- **THEN** it returns the source rectangle for that frame using row-major ordering

##### Example: frames on a 4×4 / 48px player sheet

| index | sx  | sy  | sw | sh |
| ----- | --- | --- | -- | -- |
| 0     | 0   | 0   | 48 | 48 |
| 4     | 0   | 48  | 48 | 48 |
| 5     | 48  | 48  | 48 | 48 |
| 15    | 144 | 144 | 48 | 48 |

#### Scenario: Out-of-range index throws

- **WHEN** `frameRect` is called with an index below 0 or at/above `cols * rows`
- **THEN** it throws an error and returns no rectangle

##### Example: bounds on a 4×1 / 16px water sheet

| index | result            |
| ----- | ----------------- |
| -1    | throws            |
| 0     | sx=0, sy=0        |
| 3     | sx=48, sy=0       |
| 4     | throws            |


<!-- @trace
source: m2-asset-pipeline
updated: 2026-06-21
code:
  - .github/ISSUE_TEMPLATE/spectra-change.md
  - public/sprites/objects/grass_biom.png
  - package.json
  - src/App.tsx
  - docs/superpowers/specs/2026-06-21-m3-world-map-and-canvas-design.md
  - public/sprites/ui/btn_square_26.png
  - src/dev/SpriteDebug.tsx
  - src/game/sprites/types.ts
  - CLAUDE.md
  - src/dev/SpriteCanvas.tsx
  - public/sprites/characters/character_actions.png
  - public/sprites/objects/plants.png
  - public/sprites/ui/icons_all.png
  - public/sprites/characters/character_spritesheet.png
  - public/sprites/ui/inventory_blocks.png
  - AGENTS.md
  - public/sprites/tilesets/wooden_house.png
  - public/sprites/ui/dialog_box.png
  - src/game/sprites/catalog.ts
  - vite.config.ts
  - public/sprites/tilesets/grass.png
  - public/sprites/tilesets/water.png
  - src/game/sprites/frame.ts
tests:
  - src/game/sprites/frame.test.ts
  - src/dev/SpriteCanvas.test.ts
  - src/game/sprites/catalog.test.ts
  - src/test/node-fs.d.ts
-->

---
### Requirement: Nine-slice rectangle computation

The system SHALL compute the nine source rectangles of a `nine-slice` sheet via a pure function `nineSliceRects(sheet)` returning nine rectangles ordered top-left to bottom-right (rows then columns). Corner rectangles SHALL be `border × border`; edges and center SHALL span the remaining inner dimensions.

#### Scenario: Dialog box splits into nine regions

- **WHEN** `nineSliceRects` is called on the `dialogBox` sheet (48×48, border 16)
- **THEN** it returns nine 16×16 rectangles covering the full sheet in row-major order

##### Example: corners and center of the 48×48 dialog box

| region       | sx | sy | sw | sh |
| ------------ | -- | -- | -- | -- |
| top-left     | 0  | 0  | 16 | 16 |
| top-right    | 32 | 0  | 16 | 16 |
| center       | 16 | 16 | 16 | 16 |
| bottom-right | 32 | 32 | 16 | 16 |


<!-- @trace
source: m2-asset-pipeline
updated: 2026-06-21
code:
  - .github/ISSUE_TEMPLATE/spectra-change.md
  - public/sprites/objects/grass_biom.png
  - package.json
  - src/App.tsx
  - docs/superpowers/specs/2026-06-21-m3-world-map-and-canvas-design.md
  - public/sprites/ui/btn_square_26.png
  - src/dev/SpriteDebug.tsx
  - src/game/sprites/types.ts
  - CLAUDE.md
  - src/dev/SpriteCanvas.tsx
  - public/sprites/characters/character_actions.png
  - public/sprites/objects/plants.png
  - public/sprites/ui/icons_all.png
  - public/sprites/characters/character_spritesheet.png
  - public/sprites/ui/inventory_blocks.png
  - AGENTS.md
  - public/sprites/tilesets/wooden_house.png
  - public/sprites/ui/dialog_box.png
  - src/game/sprites/catalog.ts
  - vite.config.ts
  - public/sprites/tilesets/grass.png
  - public/sprites/tilesets/water.png
  - src/game/sprites/frame.ts
tests:
  - src/game/sprites/frame.test.ts
  - src/dev/SpriteCanvas.test.ts
  - src/game/sprites/catalog.test.ts
  - src/test/node-fs.d.ts
-->

---
### Requirement: Dev-only sprite debug viewer

The system SHALL provide a development-only viewer that renders catalog sprites onto a canvas at integer scale with image smoothing disabled, so slices can be verified visually. The viewer SHALL display the player four-direction frames, one grass tile, the four water frames, several icons, and the dialog box assembled from its nine slices. The viewer SHALL render only when `import.meta.env.DEV` is true and the location hash equals `#sprites`, and SHALL NOT be included in the production build. Image load failures SHALL surface a visible error state rather than failing silently.

#### Scenario: Viewer shown via hash in dev

- **WHEN** the app runs in dev mode and the location hash is `#sprites`
- **THEN** the debug viewer renders the sprite verification sections at integer scale without blur

#### Scenario: Viewer absent without hash

- **WHEN** the app runs without the `#sprites` hash
- **THEN** the normal app view renders and the debug viewer is not shown

#### Scenario: Viewer excluded from production build

- **WHEN** a production build is produced
- **THEN** the debug viewer is not present in the build output

<!-- @trace
source: m2-asset-pipeline
updated: 2026-06-21
code:
  - .github/ISSUE_TEMPLATE/spectra-change.md
  - public/sprites/objects/grass_biom.png
  - package.json
  - src/App.tsx
  - docs/superpowers/specs/2026-06-21-m3-world-map-and-canvas-design.md
  - public/sprites/ui/btn_square_26.png
  - src/dev/SpriteDebug.tsx
  - src/game/sprites/types.ts
  - CLAUDE.md
  - src/dev/SpriteCanvas.tsx
  - public/sprites/characters/character_actions.png
  - public/sprites/objects/plants.png
  - public/sprites/ui/icons_all.png
  - public/sprites/characters/character_spritesheet.png
  - public/sprites/ui/inventory_blocks.png
  - AGENTS.md
  - public/sprites/tilesets/wooden_house.png
  - public/sprites/ui/dialog_box.png
  - src/game/sprites/catalog.ts
  - vite.config.ts
  - public/sprites/tilesets/grass.png
  - public/sprites/tilesets/water.png
  - src/game/sprites/frame.ts
tests:
  - src/game/sprites/frame.test.ts
  - src/dev/SpriteCanvas.test.ts
  - src/game/sprites/catalog.test.ts
  - src/test/node-fs.d.ts
-->