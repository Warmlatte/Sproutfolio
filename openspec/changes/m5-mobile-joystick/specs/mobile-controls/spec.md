## ADDED Requirements

### Requirement: Touch overlay renders only on touch-capable devices

The `Joystick` overlay component (`src/react/Joystick.tsx`) SHALL detect touch capability via `matchMedia('(pointer: coarse)').matches || navigator.maxTouchPoints > 0`. On touch-capable devices it SHALL render the virtual joystick and interact button. On non-touch devices it SHALL NOT render the joystick or interact button and SHALL instead render a corner keyboard hint describing the keyboard controls. The component SHALL subscribe to the media query `change` event and re-render when the device pointer type changes. The keyboard hint text MUST come from a configurable source (content/constants), not be hardcoded in component control logic.

#### Scenario: Touch device shows controls

- **WHEN** the overlay mounts on a device where pointer is coarse or `maxTouchPoints > 0`
- **THEN** the virtual joystick and interact button are rendered and the keyboard hint is not

#### Scenario: Non-touch device shows keyboard hint

- **WHEN** the overlay mounts on a device with no coarse pointer and `maxTouchPoints === 0`
- **THEN** the joystick and interact button are not rendered and a keyboard hint is shown instead

#### Scenario: Pointer type change re-evaluates

- **WHEN** the pointer media query `change` event fires after mount
- **THEN** the overlay re-evaluates touch capability and re-renders the matching layout

### Requirement: Virtual joystick drives the shared touch input

The virtual joystick (bottom-left) SHALL handle pointer events (`pointerdown`/`pointermove`/`pointerup`, also working with mouse drag for testing). On drag it SHALL compute the displacement relative to the base center, convert it via `directionFromVector`, and call `touch.setDirection(dir)`; the thumb visual SHALL be clamped within the base radius. On `pointerup` or `pointercancel` it SHALL call `touch.setDirection({ x: 0, y: 0 })` and return the thumb to center, so the character does not keep moving after release.

#### Scenario: Drag sets direction

- **WHEN** the user drags the thumb past the deadzone toward a direction
- **THEN** `touch.setDirection` is called with the normalized direction from `directionFromVector`

#### Scenario: Release zeroes direction

- **WHEN** the pointer is released or cancelled
- **THEN** `touch.setDirection({ x: 0, y: 0 })` is called and the thumb returns to center

### Requirement: Interact button emits an edge-triggered interaction

The interact button (bottom-right) SHALL be a half-transparent circular control with an icon (not a Sprout Lands asset). On `pointerdown` it SHALL call `touch.triggerInteract()`, setting the interact flag that the engine consumes once via `consumeInteract()`.

#### Scenario: Press triggers interaction once

- **WHEN** the user presses the interact button
- **THEN** `touch.triggerInteract()` is called, and the next engine `consumeInteract()` returns true exactly once for that press

### Requirement: Touch controls use semantic tokens and safe-area positioning

The overlay styling SHALL use only semantic tokens (half-transparent) with no hardcoded hex values. The joystick and interact button SHALL be positioned with `position: fixed` and `env(safe-area-inset-*)` so layout holds across resize without extra JavaScript repositioning. The circular shape of these touch controls is an intentional control-element exception to the project's no-`border-radius` rule (which targets 9-slice panels), documented in the change design.

#### Scenario: Styling avoids hardcoded colors

- **WHEN** the overlay renders its controls
- **THEN** colors come from semantic tokens and no literal hex color is used in the control styles
