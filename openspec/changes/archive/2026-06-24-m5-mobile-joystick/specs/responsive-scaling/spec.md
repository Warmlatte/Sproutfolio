## ADDED Requirements

### Requirement: World scale resolves to an integer multiple that covers the viewport

The system SHALL provide a pure function `computeWorldScale(viewportW, viewportH)` in `src/game/scale.ts` that maps the container size in pixels to an integer world-scale multiplier large enough to cover both viewport dimensions, so the camera always has room to follow and the viewport never reveals empty space past the map edges (the farm map is landscape; a portrait viewport is bound by height, a wide viewport by width). It SHALL compute the cover ratio `max(viewportW / MAP_W_PX, viewportH / MAP_H_PX)` (where `MAP_W_PX = MAP_COLS × TILE_SIZE` and `MAP_H_PX = MAP_ROWS × TILE_SIZE`), round it UP to the next integer, and return at least `MIN_WORLD_SCALE` (2) so pixel art stays chunky on tiny screens. The returned value MUST always be an integer so pixel art stays crisp. The function MUST be pure (no DOM access) and depend only on its arguments.

#### Scenario: Portrait viewport is covered on the height axis

- **WHEN** `computeWorldScale(viewportW, viewportH)` is called with a tall narrow viewport (height the binding axis)
- **THEN** it returns the smallest integer `s` such that `MAP_H_PX × s >= viewportH` (and therefore `MAP_W_PX × s >= viewportW`), never less than `MIN_WORLD_SCALE`

#### Scenario: Wide viewport is covered on the width axis

- **WHEN** `computeWorldScale(viewportW, viewportH)` is called with a wide viewport (width the binding axis)
- **THEN** it returns the smallest integer `s` such that `MAP_W_PX × s >= viewportW`

#### Scenario: Scaled map always covers the viewport

- **WHEN** `computeWorldScale(viewportW, viewportH)` returns a scale `s` for any viewport
- **THEN** `MAP_W_PX × s >= viewportW` and `MAP_H_PX × s >= viewportH`, so the camera follow never falls back to centering with exposed map edges

#### Scenario: Tiny viewport clamps to the minimum scale

- **WHEN** `computeWorldScale(viewportW, viewportH)` is called with a viewport smaller than the map at 1× on both axes
- **THEN** it returns `MIN_WORLD_SCALE` (2)

##### Example: cover scale by viewport (MAP_W_PX = 448, MAP_H_PX = 288, MIN = 2)

| viewportW | viewportH | computeWorldScale | Notes                          |
| --------- | --------- | ----------------- | ------------------------------ |
| 390       | 844       | 3                 | phone portrait (height-bound)  |
| 360       | 640       | 3                 | small phone portrait           |
| 414       | 896       | 4                 | large phone portrait           |
| 1024      | 768       | 3                 | tablet landscape               |
| 1440      | 900       | 4                 | laptop (width-bound)           |
| 1920      | 1080      | 5                 | desktop (width-bound)          |
| 320       | 240       | 2                 | tiny — clamps to MIN           |

### Requirement: Engine applies and recomputes world scale on resize

The engine SHALL compute the initial world scale from `computeWorldScale(container.clientWidth, container.clientHeight)` and apply it to the world container instead of a hardcoded scale. When the existing `ResizeObserver` fires, the engine SHALL recompute the scale from the current container size, update the world container scale, and re-run camera follow so the camera offset matches the new scale. The engine SHALL hold the current scale in a local variable and pass it to the follow computation.

#### Scenario: Initial scale comes from container size

- **WHEN** the engine is created with a container of a given size
- **THEN** the world container scale equals `computeWorldScale(container.clientWidth, container.clientHeight)`

#### Scenario: Resize recomputes scale and camera

- **WHEN** the container size changes and the resize observer fires
- **THEN** the world container scale is updated to `computeWorldScale(newWidth, newHeight)` and the camera follow is recomputed with the new scale
