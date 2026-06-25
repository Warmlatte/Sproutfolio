## ADDED Requirements

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

### Requirement: Touch input feeds the source-agnostic direction interface

The input module SHALL provide `createTouchInput()` that returns a touch input source implementing the consumer-facing `InputSource` (`read()`, `consumeInteract()`, `destroy()`) plus a control-facing surface (`setDirection(dir)`, `triggerInteract()`). `read()` SHALL return the current touch direction as a new object. `setDirection(dir)` SHALL overwrite the internal direction by storing a new copy (no mutation of the caller's object). The touch source MUST be usable by the engine through the same `Direction` interface as the keyboard, with no changes required in player or camera consumers.

#### Scenario: setDirection then read reflects the value

- **WHEN** `setDirection({x: 1, y: 0})` is called and then `read()` is called
- **THEN** `read()` returns a vector equal to `{x: 1, y: 0}` as a new object

#### Scenario: Touch source is consumed like the keyboard

- **WHEN** the engine reads from a touch input source via `read()`
- **THEN** it receives a `Direction` with the same shape as the keyboard source, requiring no consumer changes

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

### Requirement: Interaction input is edge-triggered across keyboard and touch

The `InputSource` interface SHALL include `consumeInteract(): boolean` that is edge-triggered: it SHALL return `true` if an interaction was pressed since the last call and clear the flag, otherwise `false`, so one press triggers exactly one interaction. The keyboard `createInput()` SHALL listen for `Space` (via `event.code === 'Space'`) to set the interact flag, and its `destroy()` SHALL clear the flag and remove listeners. The engine SHALL treat the interaction as fired when either the keyboard or touch `consumeInteract()` returns true in a frame.

#### Scenario: First consume after press returns true

- **WHEN** an interaction is pressed and `consumeInteract()` is called
- **THEN** it returns `true`

#### Scenario: Second consume without a new press returns false

- **WHEN** `consumeInteract()` is called again with no new press in between
- **THEN** it returns `false`
