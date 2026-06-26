# ui-component-library Specification

## Purpose

TBD - created by archiving change 'm6-ui-design-system'. Update Purpose after archive.

## Requirements

### Requirement: Shared nine-slice surface primitive

The system SHALL provide a single `NineSlice` React primitive that renders a 9-slice surface using CSS `border-image`, with corners fixed and edges/center stretched, and that wraps arbitrary DOM children inside the center region. All surface components (Panel, DialogBox, PixelButton, ContactPanel) SHALL compose `NineSlice` rather than re-implementing 9-slice rendering. `NineSlice` SHALL be the only place in `src/ui/` that applies `border-image`.

#### Scenario: Surface wraps DOM children

- **WHEN** `NineSlice` is rendered with `asset`, `slice`, and child elements
- **THEN** the child elements render inside the surface center and the nine-slice frame surrounds them without clipping

#### Scenario: Rendered as a button

- **WHEN** `NineSlice` receives `as="button"` with an `onClick` handler
- **THEN** it renders a native `<button>` element that invokes `onClick` when activated


<!-- @trace
source: m6-ui-design-system
updated: 2026-06-26
code:
  - src/ui/InventoryGrid.tsx
  - src/ui/Panel.tsx
  - src/ui/index.ts
  - docs/superpowers/specs/2026-06-24-m6-ui-mechanics-gallery-testing-design.md
  - src/ui/UIErrorBoundary.tsx
  - src/ui/ContactPanel.tsx
  - src/ui/nineSliceStyle.ts
  - src/ui/primitives/NineSlice.tsx
  - src/ui/useTypewriter.ts
  - src/ui/PixelButton.tsx
  - docs/superpowers/specs/2026-06-21-m5-mobile-joystick-design.md
  - docs/superpowers/specs/2026-06-24-m6-ui-component-api-design.md
  - src/ui/typewriter.ts
  - docs/superpowers/plans/2026-06-24-m6-ui-design-system.md
  - src/ui/spriteBackground.ts
  - src/ui/gallery/UIGallery.tsx
  - src/ui/DialogBox.tsx
  - src/App.tsx
  - src/ui/ProjectCard.tsx
  - docs/superpowers/specs/2026-06-24-m6-ui-architecture-design.md
  - src/ui/primitives/PixelIcon.tsx
  - src/ui/inventorySlotLabel.ts
tests:
  - src/ui/typewriter.test.ts
  - src/ui/spriteBackground.test.ts
  - src/ui/nineSliceStyle.test.ts
  - src/ui/inventorySlotLabel.test.ts
-->

---
### Requirement: Sprite-sheet cell background computation

The system SHALL provide a pure function `spriteBackground(sheet, index, scale)` that resolves a grid sheet cell to CSS background properties for an integer-scaled, pixel-perfect element. The function SHALL throw a `RangeError` when `scale` is not a positive integer, and SHALL propagate the `RangeError` from frame resolution when `index` is out of range. The returned `imageRendering` value SHALL be `pixelated`.

#### Scenario: Resolves cell background offset

- **WHEN** `spriteBackground` is called for a grid sheet cell at an integer scale
- **THEN** it returns `backgroundPosition` offset by the cell column/row times the scale, and `backgroundSize` equal to the full sheet dimensions times the scale

##### Example: icons_all (18×3, 16px cells) at scale 2

| index | backgroundPosition | backgroundSize | width × height |
| ----- | ------------------ | -------------- | -------------- |
| 0     | `0px 0px`          | `576px 96px`   | 32 × 32        |
| 1     | `-32px 0px`        | `576px 96px`   | 32 × 32        |
| 18    | `0px -32px`        | `576px 96px`   | 32 × 32        |

#### Scenario: Rejects invalid scale

- **WHEN** `spriteBackground` is called with a scale that is zero, negative, or non-integer
- **THEN** it throws a `RangeError`


<!-- @trace
source: m6-ui-design-system
updated: 2026-06-26
code:
  - src/ui/InventoryGrid.tsx
  - src/ui/Panel.tsx
  - src/ui/index.ts
  - docs/superpowers/specs/2026-06-24-m6-ui-mechanics-gallery-testing-design.md
  - src/ui/UIErrorBoundary.tsx
  - src/ui/ContactPanel.tsx
  - src/ui/nineSliceStyle.ts
  - src/ui/primitives/NineSlice.tsx
  - src/ui/useTypewriter.ts
  - src/ui/PixelButton.tsx
  - docs/superpowers/specs/2026-06-21-m5-mobile-joystick-design.md
  - docs/superpowers/specs/2026-06-24-m6-ui-component-api-design.md
  - src/ui/typewriter.ts
  - docs/superpowers/plans/2026-06-24-m6-ui-design-system.md
  - src/ui/spriteBackground.ts
  - src/ui/gallery/UIGallery.tsx
  - src/ui/DialogBox.tsx
  - src/App.tsx
  - src/ui/ProjectCard.tsx
  - docs/superpowers/specs/2026-06-24-m6-ui-architecture-design.md
  - src/ui/primitives/PixelIcon.tsx
  - src/ui/inventorySlotLabel.ts
tests:
  - src/ui/typewriter.test.ts
  - src/ui/spriteBackground.test.ts
  - src/ui/nineSliceStyle.test.ts
  - src/ui/inventorySlotLabel.test.ts
-->

---
### Requirement: Nine-slice CSS value computation

The system SHALL provide a pure function `nineSliceStyle(asset, slice, scale)` that returns the `border-image` CSS properties for a nine-slice surface at an integer scale, using `border-image-slice: <slice> fill` to preserve the center region and `border-image-repeat: stretch`. The function SHALL throw a `RangeError` when `slice` or `scale` is not a positive integer.

#### Scenario: Computes border-image values

- **WHEN** `nineSliceStyle` is called with `slice` 16 and `scale` 2
- **THEN** it returns `borderWidth` and `borderImageWidth` of `32px`, `borderImageSlice` of `16 fill`, and `imageRendering` of `pixelated`

#### Scenario: Rejects invalid slice or scale

- **WHEN** `nineSliceStyle` is called with a `slice` or `scale` that is zero, negative, or non-integer
- **THEN** it throws a `RangeError`


<!-- @trace
source: m6-ui-design-system
updated: 2026-06-26
code:
  - src/ui/InventoryGrid.tsx
  - src/ui/Panel.tsx
  - src/ui/index.ts
  - docs/superpowers/specs/2026-06-24-m6-ui-mechanics-gallery-testing-design.md
  - src/ui/UIErrorBoundary.tsx
  - src/ui/ContactPanel.tsx
  - src/ui/nineSliceStyle.ts
  - src/ui/primitives/NineSlice.tsx
  - src/ui/useTypewriter.ts
  - src/ui/PixelButton.tsx
  - docs/superpowers/specs/2026-06-21-m5-mobile-joystick-design.md
  - docs/superpowers/specs/2026-06-24-m6-ui-component-api-design.md
  - src/ui/typewriter.ts
  - docs/superpowers/plans/2026-06-24-m6-ui-design-system.md
  - src/ui/spriteBackground.ts
  - src/ui/gallery/UIGallery.tsx
  - src/ui/DialogBox.tsx
  - src/App.tsx
  - src/ui/ProjectCard.tsx
  - docs/superpowers/specs/2026-06-24-m6-ui-architecture-design.md
  - src/ui/primitives/PixelIcon.tsx
  - src/ui/inventorySlotLabel.ts
tests:
  - src/ui/typewriter.test.ts
  - src/ui/spriteBackground.test.ts
  - src/ui/nineSliceStyle.test.ts
  - src/ui/inventorySlotLabel.test.ts
-->

---
### Requirement: Typewriter character reveal

The system SHALL provide a pure function `revealedCount(elapsedMs, speedMs, total)` returning how many characters of a string are visible, and a `useTypewriter(text, speed)` hook that drives a per-character reveal, exposes a `skip()` to jump to the full string, and completes immediately when `prefers-reduced-motion: reduce` is set. `DialogBox` SHALL reveal the full text on click while typing, and SHALL invoke `onAdvance` on click once fully revealed.

#### Scenario: Reveal count progresses and clamps

- **WHEN** `revealedCount` is evaluated over increasing elapsed time
- **THEN** it returns `floor(elapsedMs / speedMs)` clamped to `[0, total]`

##### Example: speedMs 30, total 10

| elapsedMs | speedMs | revealedCount |
| --------- | ------- | ------------- |
| 0         | 30      | 0             |
| 95        | 30      | 3             |
| 100000    | 30      | 10            |
| -50       | 30      | 0             |
| 0         | 0       | 10            |

#### Scenario: Click skips then advances

- **WHEN** the user clicks a `DialogBox` while text is still typing
- **THEN** the full text is revealed immediately and `onAdvance` is not yet called
- **WHEN** the user clicks again after full reveal
- **THEN** `onAdvance` is invoked


<!-- @trace
source: m6-ui-design-system
updated: 2026-06-26
code:
  - src/ui/InventoryGrid.tsx
  - src/ui/Panel.tsx
  - src/ui/index.ts
  - docs/superpowers/specs/2026-06-24-m6-ui-mechanics-gallery-testing-design.md
  - src/ui/UIErrorBoundary.tsx
  - src/ui/ContactPanel.tsx
  - src/ui/nineSliceStyle.ts
  - src/ui/primitives/NineSlice.tsx
  - src/ui/useTypewriter.ts
  - src/ui/PixelButton.tsx
  - docs/superpowers/specs/2026-06-21-m5-mobile-joystick-design.md
  - docs/superpowers/specs/2026-06-24-m6-ui-component-api-design.md
  - src/ui/typewriter.ts
  - docs/superpowers/plans/2026-06-24-m6-ui-design-system.md
  - src/ui/spriteBackground.ts
  - src/ui/gallery/UIGallery.tsx
  - src/ui/DialogBox.tsx
  - src/App.tsx
  - src/ui/ProjectCard.tsx
  - docs/superpowers/specs/2026-06-24-m6-ui-architecture-design.md
  - src/ui/primitives/PixelIcon.tsx
  - src/ui/inventorySlotLabel.ts
tests:
  - src/ui/typewriter.test.ts
  - src/ui/spriteBackground.test.ts
  - src/ui/nineSliceStyle.test.ts
  - src/ui/inventorySlotLabel.test.ts
-->

---
### Requirement: Component library uses semantic tokens and 9-slice assets only

Components in `src/ui/` SHALL style themselves using only the style-guide semantic tokens and 9-slice sprite assets. They SHALL NOT contain hardcoded hex color values, SHALL NOT use CSS `border-radius` or Tailwind rounded utilities, and SHALL NOT use colors not listed in the style guide. All sprite scaling SHALL use positive integer factors with `image-rendering: pixelated`.

#### Scenario: No hardcoded colors or rounded corners

- **WHEN** the `src/ui/` source tree is scanned for hardcoded hex values, `border-radius`, or rounded utilities
- **THEN** no matches are found


<!-- @trace
source: m6-ui-design-system
updated: 2026-06-26
code:
  - src/ui/InventoryGrid.tsx
  - src/ui/Panel.tsx
  - src/ui/index.ts
  - docs/superpowers/specs/2026-06-24-m6-ui-mechanics-gallery-testing-design.md
  - src/ui/UIErrorBoundary.tsx
  - src/ui/ContactPanel.tsx
  - src/ui/nineSliceStyle.ts
  - src/ui/primitives/NineSlice.tsx
  - src/ui/useTypewriter.ts
  - src/ui/PixelButton.tsx
  - docs/superpowers/specs/2026-06-21-m5-mobile-joystick-design.md
  - docs/superpowers/specs/2026-06-24-m6-ui-component-api-design.md
  - src/ui/typewriter.ts
  - docs/superpowers/plans/2026-06-24-m6-ui-design-system.md
  - src/ui/spriteBackground.ts
  - src/ui/gallery/UIGallery.tsx
  - src/ui/DialogBox.tsx
  - src/App.tsx
  - src/ui/ProjectCard.tsx
  - docs/superpowers/specs/2026-06-24-m6-ui-architecture-design.md
  - src/ui/primitives/PixelIcon.tsx
  - src/ui/inventorySlotLabel.ts
tests:
  - src/ui/typewriter.test.ts
  - src/ui/spriteBackground.test.ts
  - src/ui/nineSliceStyle.test.ts
  - src/ui/inventorySlotLabel.test.ts
-->

---
### Requirement: Component library public surface

The system SHALL provide seven components exported from `src/ui/index.ts`: `PixelButton`, `DialogBox`, `Panel`, `InventoryGrid`, `ProjectCard`, `ContactPanel`, and `PixelIcon`. Each component SHALL be pure React with no game-engine dependency so the library can be previewed and synced independently. Each component SHALL expose an explicit props interface.

#### Scenario: Components render independently

- **WHEN** any of the seven components is rendered in isolation with valid props
- **THEN** it renders without importing the canvas game engine


<!-- @trace
source: m6-ui-design-system
updated: 2026-06-26
code:
  - src/ui/InventoryGrid.tsx
  - src/ui/Panel.tsx
  - src/ui/index.ts
  - docs/superpowers/specs/2026-06-24-m6-ui-mechanics-gallery-testing-design.md
  - src/ui/UIErrorBoundary.tsx
  - src/ui/ContactPanel.tsx
  - src/ui/nineSliceStyle.ts
  - src/ui/primitives/NineSlice.tsx
  - src/ui/useTypewriter.ts
  - src/ui/PixelButton.tsx
  - docs/superpowers/specs/2026-06-21-m5-mobile-joystick-design.md
  - docs/superpowers/specs/2026-06-24-m6-ui-component-api-design.md
  - src/ui/typewriter.ts
  - docs/superpowers/plans/2026-06-24-m6-ui-design-system.md
  - src/ui/spriteBackground.ts
  - src/ui/gallery/UIGallery.tsx
  - src/ui/DialogBox.tsx
  - src/App.tsx
  - src/ui/ProjectCard.tsx
  - docs/superpowers/specs/2026-06-24-m6-ui-architecture-design.md
  - src/ui/primitives/PixelIcon.tsx
  - src/ui/inventorySlotLabel.ts
tests:
  - src/ui/typewriter.test.ts
  - src/ui/spriteBackground.test.ts
  - src/ui/nineSliceStyle.test.ts
  - src/ui/inventorySlotLabel.test.ts
-->

---
### Requirement: Presentational inventory grid

`InventoryGrid` SHALL be presentational: it SHALL render an item grid where filled cells overlay a `PixelIcon` on a slot-tile background and empty cells (`null`) show only the slot, and it SHALL report selection via `onSelect(index)` without owning selection state. The caller SHALL supply `selectedIndex`.

#### Scenario: Reports selection without owning state

- **WHEN** a user activates a cell in `InventoryGrid`
- **THEN** `onSelect` is called with that cell index and the grid does not change its own highlighted cell

#### Scenario: Renders filled and empty cells

- **WHEN** `items` contains a mix of item objects and `null`
- **THEN** item cells show their icon over the slot and `null` cells show the slot only


<!-- @trace
source: m6-ui-design-system
updated: 2026-06-26
code:
  - src/ui/InventoryGrid.tsx
  - src/ui/Panel.tsx
  - src/ui/index.ts
  - docs/superpowers/specs/2026-06-24-m6-ui-mechanics-gallery-testing-design.md
  - src/ui/UIErrorBoundary.tsx
  - src/ui/ContactPanel.tsx
  - src/ui/nineSliceStyle.ts
  - src/ui/primitives/NineSlice.tsx
  - src/ui/useTypewriter.ts
  - src/ui/PixelButton.tsx
  - docs/superpowers/specs/2026-06-21-m5-mobile-joystick-design.md
  - docs/superpowers/specs/2026-06-24-m6-ui-component-api-design.md
  - src/ui/typewriter.ts
  - docs/superpowers/plans/2026-06-24-m6-ui-design-system.md
  - src/ui/spriteBackground.ts
  - src/ui/gallery/UIGallery.tsx
  - src/ui/DialogBox.tsx
  - src/App.tsx
  - src/ui/ProjectCard.tsx
  - docs/superpowers/specs/2026-06-24-m6-ui-architecture-design.md
  - src/ui/primitives/PixelIcon.tsx
  - src/ui/inventorySlotLabel.ts
tests:
  - src/ui/typewriter.test.ts
  - src/ui/spriteBackground.test.ts
  - src/ui/nineSliceStyle.test.ts
  - src/ui/inventorySlotLabel.test.ts
-->

---
### Requirement: External links open safely

`ProjectCard` (when `href` is set) and every link in `ContactPanel` SHALL open in a new tab with `rel="noopener"`.

#### Scenario: Project card link opens in new tab

- **WHEN** a `ProjectCard` with an `href` is activated
- **THEN** the link opens in a new browser tab and carries `rel="noopener"`


<!-- @trace
source: m6-ui-design-system
updated: 2026-06-26
code:
  - src/ui/InventoryGrid.tsx
  - src/ui/Panel.tsx
  - src/ui/index.ts
  - docs/superpowers/specs/2026-06-24-m6-ui-mechanics-gallery-testing-design.md
  - src/ui/UIErrorBoundary.tsx
  - src/ui/ContactPanel.tsx
  - src/ui/nineSliceStyle.ts
  - src/ui/primitives/NineSlice.tsx
  - src/ui/useTypewriter.ts
  - src/ui/PixelButton.tsx
  - docs/superpowers/specs/2026-06-21-m5-mobile-joystick-design.md
  - docs/superpowers/specs/2026-06-24-m6-ui-component-api-design.md
  - src/ui/typewriter.ts
  - docs/superpowers/plans/2026-06-24-m6-ui-design-system.md
  - src/ui/spriteBackground.ts
  - src/ui/gallery/UIGallery.tsx
  - src/ui/DialogBox.tsx
  - src/App.tsx
  - src/ui/ProjectCard.tsx
  - docs/superpowers/specs/2026-06-24-m6-ui-architecture-design.md
  - src/ui/primitives/PixelIcon.tsx
  - src/ui/inventorySlotLabel.ts
tests:
  - src/ui/typewriter.test.ts
  - src/ui/spriteBackground.test.ts
  - src/ui/nineSliceStyle.test.ts
  - src/ui/inventorySlotLabel.test.ts
-->

---
### Requirement: Dev-only component gallery

The system SHALL provide a dev-only `#ui` gallery that previews each component in its various states, mounted behind a hash gate in `src/App.tsx` using the same dev-gate pattern as the existing `#sprites` viewer, and SHALL NOT be included in production build output.

#### Scenario: Gallery mounts behind hash gate in development

- **WHEN** the app runs in development and the location hash is `#ui`
- **THEN** the gallery renders sections for all seven components and their states

#### Scenario: Gallery excluded from production

- **WHEN** the production build is generated
- **THEN** the gallery module is not present in the production output

<!-- @trace
source: m6-ui-design-system
updated: 2026-06-26
code:
  - src/ui/InventoryGrid.tsx
  - src/ui/Panel.tsx
  - src/ui/index.ts
  - docs/superpowers/specs/2026-06-24-m6-ui-mechanics-gallery-testing-design.md
  - src/ui/UIErrorBoundary.tsx
  - src/ui/ContactPanel.tsx
  - src/ui/nineSliceStyle.ts
  - src/ui/primitives/NineSlice.tsx
  - src/ui/useTypewriter.ts
  - src/ui/PixelButton.tsx
  - docs/superpowers/specs/2026-06-21-m5-mobile-joystick-design.md
  - docs/superpowers/specs/2026-06-24-m6-ui-component-api-design.md
  - src/ui/typewriter.ts
  - docs/superpowers/plans/2026-06-24-m6-ui-design-system.md
  - src/ui/spriteBackground.ts
  - src/ui/gallery/UIGallery.tsx
  - src/ui/DialogBox.tsx
  - src/App.tsx
  - src/ui/ProjectCard.tsx
  - docs/superpowers/specs/2026-06-24-m6-ui-architecture-design.md
  - src/ui/primitives/PixelIcon.tsx
  - src/ui/inventorySlotLabel.ts
tests:
  - src/ui/typewriter.test.ts
  - src/ui/spriteBackground.test.ts
  - src/ui/nineSliceStyle.test.ts
  - src/ui/inventorySlotLabel.test.ts
-->