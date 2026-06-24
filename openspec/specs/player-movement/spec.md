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

#### Scenario: The visible body stays within the map at the edges

- **WHEN** the player walks into a map edge (the feet box reaches the boundary)
- **THEN** the feet point is clamped so the visible character body (which is
  drawn upward from the feet and wider than the feet box) stays within the map,
  so the map-clamped camera always keeps the character fully visible while
  transparent frame padding may harmlessly extend past the map edge


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

---
### Requirement: Joystick displacement resolves to a normalized direction vector

The input module SHALL provide a pure function `directionFromVector(dx, dy)` that converts a joystick drag displacement (relative to the base center, in pixels) into a `Direction {x, y}`. When the displacement magnitude is less than or equal to `JOYSTICK_DEADZONE_PX`, it SHALL return `{x: 0, y: 0}`. When the displacement magnitude exceeds the deadzone, it SHALL return the normalized vector with magnitude 1 (full speed, matching keyboard — not analog speed), regardless of how far past the deadzone the displacement reaches. The function MUST return a new object and MUST NOT mutate its inputs.

#### Scenario: Inside deadzone returns zero

- **WHEN** `directionFromVector(dx, dy)` is called with a displacement magnitude at or below `JOYSTICK_DEADZONE_PX`
- **THEN** it returns `{x: 0, y: 0}`

#### Scenario: Past deadzone returns unit vector

- **WHEN** `directionFromVector(dx, dy)` is called with a displacement magnitude beyond `JOYSTICK_DEADZONE_PX`
- **THEN** it returns a vector whose magnitude equals 1 pointing in the displacement direction

##### Example: direction from displacement (JOYSTICK_DEADZONE_PX = 12)

| dx  | dy  | Returned vector (x, y) | Notes                    |
| --- | --- | ---------------------- | ------------------------ |
| 0   | 0   | (0, 0)                 | idle                     |
| 6   | 0   | (0, 0)                 | within deadzone          |
| 40  | 0   | (1, 0)                 | right, full speed        |
| 0   | -40 | (0, -1)                | up, full speed           |
| 30  | 30  | (0.707, 0.707)         | normalized diagonal      |
| 100 | 0   | (1, 0)                 | far past deadzone, still unit |


<!-- @trace
source: m5-mobile-joystick
updated: 2026-06-24
code:
  - src/game/input.ts
  - src/constants.ts
  - src/game/engine.ts
  - src/react/GameCanvas.tsx
  - docs/superpowers/specs/2026-06-21-m5-mobile-joystick-design.md
  - src/game/scale.ts
  - src/react/Joystick.tsx
tests:
  - src/game/engine.test.ts
  - src/game/scale.test.ts
  - src/game/input.test.ts
-->

---
### Requirement: Touch input feeds the source-agnostic direction interface

The input module SHALL provide `createTouchInput()` that returns a touch input source implementing the consumer-facing `InputSource` (`read()`, `consumeInteract()`, `destroy()`) plus a control-facing surface (`setDirection(dir)`, `triggerInteract()`). `read()` SHALL return the current touch direction as a new object. `setDirection(dir)` SHALL overwrite the internal direction by storing a new copy (no mutation of the caller's object). The touch source MUST be usable by the engine through the same `Direction` interface as the keyboard, with no changes required in player or camera consumers.

#### Scenario: setDirection then read reflects the value

- **WHEN** `setDirection({x: 1, y: 0})` is called and then `read()` is called
- **THEN** `read()` returns a vector equal to `{x: 1, y: 0}` as a new object

#### Scenario: Touch source is consumed like the keyboard

- **WHEN** the engine reads from a touch input source via `read()`
- **THEN** it receives a `Direction` with the same shape as the keyboard source, requiring no consumer changes


<!-- @trace
source: m5-mobile-joystick
updated: 2026-06-24
code:
  - src/game/input.ts
  - src/constants.ts
  - src/game/engine.ts
  - src/react/GameCanvas.tsx
  - docs/superpowers/specs/2026-06-21-m5-mobile-joystick-design.md
  - src/game/scale.ts
  - src/react/Joystick.tsx
tests:
  - src/game/engine.test.ts
  - src/game/scale.test.ts
  - src/game/input.test.ts
-->

---
### Requirement: Keyboard and touch directions merge with keyboard priority

The input module SHALL provide a pure function `mergeDirections(kb, touch)` that combines two direction vectors: when the keyboard vector is non-zero it SHALL win; otherwise the touch vector SHALL be used; when both are zero it SHALL return `{x: 0, y: 0}`. The function MUST return a new object and MUST NOT mutate either input. The engine SHALL feed the merged direction into the player update each frame.

#### Scenario: Keyboard wins when non-zero

- **WHEN** `mergeDirections(kb, touch)` is called with a non-zero keyboard vector and any touch vector
- **THEN** it returns the keyboard vector

#### Scenario: Falls back to touch when keyboard is zero

- **WHEN** `mergeDirections(kb, touch)` is called with a zero keyboard vector and a non-zero touch vector
- **THEN** it returns the touch vector

##### Example: merge cases

| kb (x, y) | touch (x, y) | merged (x, y) | Notes              |
| --------- | ------------ | ------------- | ------------------ |
| (1, 0)    | (0, 0)       | (1, 0)        | keyboard only      |
| (0, 0)    | (0, 1)       | (0, 1)        | touch only         |
| (1, 0)    | (0, 1)       | (1, 0)        | keyboard priority  |
| (0, 0)    | (0, 0)       | (0, 0)        | both idle          |


<!-- @trace
source: m5-mobile-joystick
updated: 2026-06-24
code:
  - src/game/input.ts
  - src/constants.ts
  - src/game/engine.ts
  - src/react/GameCanvas.tsx
  - docs/superpowers/specs/2026-06-21-m5-mobile-joystick-design.md
  - src/game/scale.ts
  - src/react/Joystick.tsx
tests:
  - src/game/engine.test.ts
  - src/game/scale.test.ts
  - src/game/input.test.ts
-->

---
### Requirement: Interaction input is edge-triggered across keyboard and touch

The `InputSource` interface SHALL include `consumeInteract(): boolean` that is edge-triggered: it SHALL return `true` if an interaction was pressed since the last call and clear the flag, otherwise `false`, so one press triggers exactly one interaction. The keyboard `createInput()` SHALL listen for `Space` (via `event.code === 'Space'`) to set the interact flag, and its `destroy()` SHALL clear the flag and remove listeners. The engine SHALL treat the interaction as fired when either the keyboard or touch `consumeInteract()` returns true in a frame.

#### Scenario: First consume after press returns true

- **WHEN** an interaction is pressed and `consumeInteract()` is called
- **THEN** it returns `true`

#### Scenario: Second consume without a new press returns false

- **WHEN** `consumeInteract()` is called again with no new press in between
- **THEN** it returns `false`

<!-- @trace
source: m5-mobile-joystick
updated: 2026-06-24
code:
  - src/game/input.ts
  - src/constants.ts
  - src/game/engine.ts
  - src/react/GameCanvas.tsx
  - docs/superpowers/specs/2026-06-21-m5-mobile-joystick-design.md
  - src/game/scale.ts
  - src/react/Joystick.tsx
tests:
  - src/game/engine.test.ts
  - src/game/scale.test.ts
  - src/game/input.test.ts
-->