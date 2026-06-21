## ADDED Requirements

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

### Requirement: Engine layer adapts the M2 sprite catalog into Pixi textures

The engine SHALL translate the engine-agnostic M2 sprite catalog into `PIXI.Texture` objects without modifying the M2 `src/game/sprites/` modules. A `getTexture(key, index)` function SHALL resolve a catalog grid frame to a texture using the existing `frameRect()` slice math, and every base texture SHALL use nearest-neighbor sampling so scaled pixels stay sharp.

#### Scenario: Catalog frame resolves to a texture

- **WHEN** `getTexture(key, index)` is called with a valid catalog key and in-range frame index
- **THEN** it returns a `PIXI.Texture` whose source rectangle equals `frameRect(sheet, index)` and whose base texture uses nearest-neighbor scaling

#### Scenario: M2 modules stay engine-agnostic

- **WHEN** the texture adapter is implemented
- **THEN** no Pixi.js import or type appears in `src/game/sprites/`, and the adapter lives in the engine layer instead

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

### Requirement: Texture load failure surfaces a visible error

The engine SHALL NOT silently swallow texture load failures. When a required texture fails to load, the engine SHALL catch the error and display a pixel-styled error message inside the container.

#### Scenario: Missing texture shows an error

- **WHEN** a required sprite sheet fails to load
- **THEN** the engine catches the failure and renders a visible pixel-styled error message in the container instead of failing silently

### Requirement: Engine-to-React event types are reserved

The change SHALL define the engine↔React event bus as types only in `src/game/events.ts`: a `GameEvent` union and a typed emitter interface. M3 SHALL NOT emit or subscribe to any event; the wiring is reserved for M7.

#### Scenario: Event types exist without wiring

- **WHEN** the M3 change is complete
- **THEN** `src/game/events.ts` exports a `GameEvent` union and a typed emitter interface, and no runtime emit or subscribe call exists in the M3 code
