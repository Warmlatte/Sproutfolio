## ADDED Requirements

### Requirement: World scale resolves to an integer multiple from viewport width

The system SHALL provide a pure function `computeWorldScale(width)` in `src/game/scale.ts` that maps the container width in pixels to an integer world-scale multiplier using fixed breakpoints. Width below `SCALE_BP_SM` SHALL return `2`; width at or above `SCALE_BP_SM` but below `SCALE_BP_MD` SHALL return `3`; width at or above `SCALE_BP_MD` SHALL return `4`. The returned value MUST always be an integer so pixel art stays crisp. The function MUST be pure (no DOM access) and depend only on its `width` argument.

#### Scenario: Narrow viewport scales to 2x

- **WHEN** `computeWorldScale(width)` is called with a width below `SCALE_BP_SM`
- **THEN** it returns the integer `2`

#### Scenario: Mid viewport scales to 3x

- **WHEN** `computeWorldScale(width)` is called with a width at or above `SCALE_BP_SM` and below `SCALE_BP_MD`
- **THEN** it returns the integer `3`

#### Scenario: Wide viewport scales to 4x

- **WHEN** `computeWorldScale(width)` is called with a width at or above `SCALE_BP_MD`
- **THEN** it returns the integer `4`

#### Scenario: Breakpoints are inclusive lower bounds

- **WHEN** `computeWorldScale(width)` is called with `width` exactly equal to a breakpoint
- **THEN** the higher tier applies (the breakpoint is the inclusive lower bound of the next tier)

##### Example: scale by width (SCALE_BP_SM = 640, SCALE_BP_MD = 1024)

| width | computeWorldScale(width) | Notes                  |
| ----- | ------------------------ | ---------------------- |
| 375   | 2                        | phone portrait         |
| 639   | 2                        | just below SM          |
| 640   | 3                        | equals SM (next tier)  |
| 1023  | 3                        | just below MD          |
| 1024  | 4                        | equals MD (next tier)  |
| 1440  | 4                        | desktop                |

### Requirement: Engine applies and recomputes world scale on resize

The engine SHALL compute the initial world scale from `computeWorldScale(container.clientWidth)` and apply it to the world container instead of a hardcoded scale. When the existing `ResizeObserver` fires, the engine SHALL recompute the scale from the current container width, update the world container scale, and re-run camera follow so the camera offset matches the new scale. The engine SHALL hold the current scale in a local variable and pass it to the follow computation.

#### Scenario: Initial scale comes from container width

- **WHEN** the engine is created with a container of a given width
- **THEN** the world container scale equals `computeWorldScale(container.clientWidth)`

#### Scenario: Resize recomputes scale and camera

- **WHEN** the container width changes and the resize observer fires
- **THEN** the world container scale is updated to `computeWorldScale(newWidth)` and the camera follow is recomputed with the new scale
