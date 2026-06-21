# world-collision Specification

## Purpose

TBD - created by archiving change 'm4-player-movement'. Update Purpose after archive.

## Requirements

### Requirement: Solid cells are derived from the map's obstacle layers

The collision module SHALL provide `buildSolidSet(map)` that derives the set of blocked grid cells from the map's obstacle layers (`house`, `pond`, `trees`), returning a set keyed by `"col,row"`. Walkable layers (`paths`, `grass`) MUST NOT be included. The collision data MUST be derived from the existing render layers rather than a separately maintained grid, so editing the map cannot desynchronize rendering from collision.

#### Scenario: Obstacle layers become solid

- **WHEN** `buildSolidSet(map)` runs on a map with house, pond, and tree tiles
- **THEN** every grid cell occupied by those layers is present in the returned set

#### Scenario: Walkable layers stay clear

- **WHEN** `buildSolidSet(map)` runs
- **THEN** cells that belong only to the grass base or paths layer are absent from the set

##### Example: solid set membership

- **GIVEN** a map with a tree at (1,1) and a path at (14,9)
- **WHEN** `buildSolidSet(map)` runs
- **THEN** the set contains "1,1" and does not contain "14,9"


<!-- @trace
source: m4-player-movement
updated: 2026-06-21
code:
  - src/game/collision.ts
  - src/game/camera.ts
  - src/game/engine.ts
  - src/game/input.ts
  - src/constants.ts
  - src/game/player.ts
tests:
  - src/game/engine.test.ts
  - src/game/input.test.ts
  - src/game/camera.test.ts
  - src/game/collision.test.ts
  - src/game/player.test.ts
-->

---
### Requirement: Movement is resolved against solids with a feet hitbox and map bounds

The collision module SHALL provide `resolveMove(box, dx, dy, solids, bounds)` that resolves an attempted move using a feet-aligned AABB (`PLAYER_HITBOX`, about 16×10 px at the sprite's bottom-center). Resolution SHALL be axis-separated: the x and y components are applied independently so that blocking one axis still allows sliding along the other. When the feet box would overlap a solid cell on an axis, movement on that axis SHALL be stopped at the cell edge. The feet box SHALL be clamped within the map bounds so the player never leaves the map.

#### Scenario: Solid blocks one axis but allows sliding

- **WHEN** the player moves diagonally into a wall that is solid only on the x axis
- **THEN** the x component is stopped at the wall edge and the y component still applies

#### Scenario: Player cannot leave the map

- **WHEN** the player moves toward a map edge with no room left
- **THEN** the feet box is clamped at the map boundary and the position does not exceed it

#### Scenario: Free move applies fully

- **WHEN** the attempted move hits no solid cell and stays within bounds
- **THEN** the resolved position equals the attempted position

<!-- @trace
source: m4-player-movement
updated: 2026-06-21
code:
  - src/game/collision.ts
  - src/game/camera.ts
  - src/game/engine.ts
  - src/game/input.ts
  - src/constants.ts
  - src/game/player.ts
tests:
  - src/game/engine.test.ts
  - src/game/input.test.ts
  - src/game/camera.test.ts
  - src/game/collision.test.ts
  - src/game/player.test.ts
-->