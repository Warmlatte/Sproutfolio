# player-movement Specification

## Purpose

TBD - created by archiving change 'm4-player-movement'. Update Purpose after archive.

## Requirements

### Requirement: Keyboard input resolves to a source-agnostic direction vector

The input module SHALL listen to keyboard `keydown`/`keyup` on the window, tracking the set of currently pressed movement keys, and SHALL expose a `read()` that returns a direction vector `{x, y}`. Arrow keys and WASD MUST map to the same directions (`ArrowUp`/`KeyW` = up, `ArrowDown`/`KeyS` = down, `ArrowLeft`/`KeyA` = left, `ArrowRight`/`KeyD` = right). Diagonal vectors SHALL be normalized so diagonal movement is not faster than orthogonal movement. The module SHALL return a new object on each read (no mutation) and SHALL expose a `destroy()` that removes its listeners. The vector MUST be source-agnostic so a later touch joystick can feed the same interface without changes to consumers.

#### Scenario: Single direction held

- **WHEN** only the up key (ArrowUp or KeyW) is pressed and `read()` is called
- **THEN** it returns a vector pointing up with unit length

#### Scenario: Diagonal is normalized

- **WHEN** up and right are both pressed and `read()` is called
- **THEN** it returns a vector whose magnitude equals 1, not greater

##### Example: direction vector cases

| Pressed keys        | Returned vector (x, y)        | Notes                         |
| ------------------- | ----------------------------- | ----------------------------- |
| (none)              | (0, 0)                        | idle                          |
| ArrowRight          | (1, 0)                        | y down-positive screen space  |
| KeyW                | (0, -1)                       | up is negative y              |
| ArrowUp + ArrowRight| (0.707, -0.707)               | normalized diagonal           |
| ArrowLeft + KeyD    | (0, 0)                        | opposite keys cancel          |

#### Scenario: Listeners are removed on destroy

- **WHEN** `destroy()` is called on the input module
- **THEN** subsequent key events no longer change the result of `read()`


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
### Requirement: Player moves with free pixel velocity

The player SHALL move in unscaled world coordinates as a child of the world container scaled by `WORLD_SCALE`. Each frame the player position SHALL advance by `direction * PLAYER_SPEED * dt` where `dt` is the frame delta in seconds, before collision resolution is applied. The player SHALL spawn at the map's `spawn` anchor. Movement MUST be continuous pixel motion, not tile-locked stepping.

#### Scenario: Player advances while a direction is held

- **WHEN** a non-zero direction vector is supplied for a frame with delta `dt`
- **THEN** the player's intended position moves by `direction * PLAYER_SPEED * dt` before collision is applied

#### Scenario: Player starts at the spawn anchor

- **WHEN** the player is created
- **THEN** its position is the pixel position of the map's `spawn` anchor

#### Scenario: The whole sprite stays within the map at the edges

- **WHEN** the player walks into a map edge (the feet box reaches the boundary)
- **THEN** the feet point is clamped so the entire sprite frame (which is drawn
  upward from the feet and wider than the feet box) stays within the map, so the
  map-clamped camera always keeps the character fully visible


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
### Requirement: Player plays four-direction walk and idle animations

The player SHALL render via a Pixi `AnimatedSprite`. While moving, it SHALL play the walk animation for the facing derived from the current direction at `PLAYER_ANIM_FPS`; while idle, it SHALL stop on the idle frame for that facing. The facing-to-spritesheet-row mapping SHALL be held in named constants so it can be corrected after visual confirmation without changing logic.

#### Scenario: Facing follows movement direction

- **WHEN** the player moves left
- **THEN** the sprite shows the left-facing walk animation playing at `PLAYER_ANIM_FPS`

#### Scenario: Idle stops on a still frame

- **WHEN** the direction vector becomes zero
- **THEN** the sprite stops on the idle frame for the last facing

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