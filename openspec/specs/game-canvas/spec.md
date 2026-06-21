# game-canvas Specification

## Purpose

TBD - created by archiving change 'm3-world-map-and-canvas'. Update Purpose after archive.

## Requirements

### Requirement: React container mounts and destroys the Pixi engine

The `<GameCanvas>` React component SHALL create a Pixi.js engine instance when it mounts and SHALL fully destroy that instance when it unmounts, leaving no residual canvas, ticker, or texture in memory. The teardown MUST be safe under React 19 Strict Mode's mount–unmount–remount cycle (create → immediately destroy → create again without leaking).

#### Scenario: Engine starts on mount

- **WHEN** `<GameCanvas>` mounts into the DOM
- **THEN** `createEngine(container)` runs and a Pixi `Application` canvas is attached inside the container element

#### Scenario: Engine is destroyed on unmount

- **WHEN** `<GameCanvas>` unmounts
- **THEN** the effect cleanup calls `destroy()`, the Pixi `Application` is destroyed, its ticker is stopped, and no canvas element remains in the container

#### Scenario: Strict Mode double mount does not leak

- **WHEN** React Strict Mode mounts, unmounts, then remounts `<GameCanvas>`
- **THEN** exactly one live engine instance and one canvas exist after the sequence, with the first instance fully destroyed


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
### Requirement: Engine layer adapts the M2 sprite catalog into Pixi textures

The engine SHALL translate the engine-agnostic M2 sprite catalog into `PIXI.Texture` objects without modifying the M2 `src/game/sprites/` modules. A `getTexture(key, index)` function SHALL resolve a catalog grid frame to a texture using the existing `frameRect()` slice math, and every base texture SHALL use nearest-neighbor sampling so scaled pixels stay sharp.

#### Scenario: Catalog frame resolves to a texture

- **WHEN** `getTexture(key, index)` is called with a valid catalog key and in-range frame index
- **THEN** it returns a `PIXI.Texture` whose source rectangle equals `frameRect(sheet, index)` and whose base texture uses nearest-neighbor scaling

#### Scenario: M2 modules stay engine-agnostic

- **WHEN** the texture adapter is implemented
- **THEN** no Pixi.js import or type appears in `src/game/sprites/`, and the adapter lives in the engine layer instead


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
### Requirement: Camera centers the world and survives resize

The engine SHALL render the world through a container scaled by the integer `WORLD_SCALE` and positioned by a pure `computeCenterOffset` function that centers the map within the viewport and clamps the offset to the map bounds. On viewport resize the renderer SHALL resize and the center offset SHALL be recomputed, keeping the map centered without visual breakage. The integer scale factor MUST NOT change on resize.

#### Scenario: Map is centered on first render

- **WHEN** the engine starts with a known container size
- **THEN** `computeCenterOffset` returns an offset that centers the scaled map in the viewport, clamped within the map bounds

#### Scenario: Resize keeps the map centered

- **WHEN** the container is resized
- **THEN** the renderer resizes and the center offset is recomputed, the map stays centered, and `WORLD_SCALE` is unchanged

##### Example: clamp at boundary

- **GIVEN** a map larger than the viewport on the X axis
- **WHEN** `computeCenterOffset` is computed
- **THEN** the returned x offset is clamped so the viewport never shows past the map edge

#### Scenario: Zero-size container defers init

- **WHEN** the container reports a width or height of 0
- **THEN** engine initialization is deferred until a valid size is available, avoiding division by zero


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
### Requirement: Texture load failure surfaces a visible error

The engine SHALL NOT silently swallow texture load failures. When a required texture fails to load, the engine SHALL catch the error and display a pixel-styled error message inside the container.

#### Scenario: Missing texture shows an error

- **WHEN** a required sprite sheet fails to load
- **THEN** the engine catches the failure and renders a visible pixel-styled error message in the container instead of failing silently


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
### Requirement: Engine-to-React event types are reserved

The change SHALL define the engine↔React event bus as types only in `src/game/events.ts`: a `GameEvent` union and a typed emitter interface. M3 SHALL NOT emit or subscribe to any event; the wiring is reserved for M7.

#### Scenario: Event types exist without wiring

- **WHEN** the M3 change is complete
- **THEN** `src/game/events.ts` exports a `GameEvent` union and a typed emitter interface, and no runtime emit or subscribe call exists in the M3 code

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