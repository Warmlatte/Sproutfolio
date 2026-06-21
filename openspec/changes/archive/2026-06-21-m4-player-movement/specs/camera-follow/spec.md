## ADDED Requirements

### Requirement: Camera follows the player clamped to map bounds

The camera module SHALL provide `computeFollowOffset(playerPx, viewportPx, mapPx, scale)` that returns the integer world-container offset which centers the player in the viewport, then clamps the offset to `[viewport - scaledMap, 0]` on each axis so the viewport never reveals empty space past the map edges. When the scaled map is smaller than the viewport on an axis, the offset SHALL fall back to the centered value (matching `computeCenterOffset`). The returned offset MUST be integer pixels so the integer-scaled world stays sharp.

#### Scenario: Player centered in map interior

- **WHEN** the player is far from every map edge
- **THEN** the offset positions the player at the viewport center

#### Scenario: Offset clamps at the map edge

- **WHEN** the player approaches a map edge
- **THEN** the offset is clamped so the viewport stops at the map boundary and shows no empty space past it

#### Scenario: Small axis falls back to centering

- **WHEN** the scaled map is smaller than the viewport on an axis
- **THEN** the offset on that axis equals the centered value from `computeCenterOffset`

### Requirement: Engine drives the player and camera each frame and follows container resize

The engine SHALL run a per-frame update via the Pixi ticker that reads input, updates the player, and repositions the world container using `computeFollowOffset`. The engine SHALL recompute the offset and resize source from a container `ResizeObserver` rather than a window resize event, so the centering/follow source is consistent with `resizeTo: container`. The integer `WORLD_SCALE` MUST NOT change on resize. Engine teardown SHALL stop the ticker update, disconnect the observer, and destroy the input module, leaving nothing running.

#### Scenario: Camera tracks the player every frame

- **WHEN** the player moves during a ticker frame
- **THEN** the world container position is updated to keep the player centered within map-clamped bounds

#### Scenario: Container resize keeps the view correct

- **WHEN** the container is resized (independent of window size)
- **THEN** the ResizeObserver fires, the follow offset is recomputed, and `WORLD_SCALE` is unchanged

#### Scenario: Teardown stops the loop

- **WHEN** the engine is destroyed
- **THEN** the ticker update is removed, the ResizeObserver is disconnected, and the input listeners are removed
