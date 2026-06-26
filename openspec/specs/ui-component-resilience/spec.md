# ui-component-resilience Specification

## Purpose

TBD - created by archiving change 'fix-m6-ui-review-findings'. Update Purpose after archive.

## Requirements

### Requirement: Inventory slot accessible name reflects occupancy

The `InventoryGrid` component SHALL derive each slot's accessible name from whether the slot holds an item, not from whether an optional label was supplied. A slot backed by an item SHALL NOT be announced as empty. When an item has no `label`, the component SHALL fall back to a stable filled-slot name. Only a `null` slot SHALL be announced as empty.

#### Scenario: filled slot without a label is announced as filled

- **WHEN** a slot holds an item whose `label` is omitted
- **THEN** the slot's accessible name is a filled-slot name (e.g. `slot <index>`), and never `empty slot <index>`

#### Scenario: empty slot is announced as empty

- **WHEN** a slot value is `null`
- **THEN** the slot's accessible name is `empty slot <index>`

##### Example: occupancy-to-name mapping

| Slot value | Index | Accessible name |
| ---------- | ----- | --------------- |
| `{ iconIndex: 3 }` (no label) | 0 | `slot 0` |
| `{ iconIndex: 3, label: "Axe" }` | 1 | `Axe` |
| `null` | 2 | `empty slot 2` |


<!-- @trace
source: fix-m6-ui-review-findings
updated: 2026-06-26
code:
  - src/ui/DialogBox.tsx
  - src/ui/UIErrorBoundary.tsx
  - src/ui/InventoryGrid.tsx
  - src/ui/useTypewriter.ts
  - src/ui/index.ts
  - src/App.tsx
  - src/ui/inventorySlotLabel.ts
tests:
  - src/ui/inventorySlotLabel.test.ts
-->

---
### Requirement: Primary component interactions are keyboard operable

Every component interaction that advances or skips content SHALL be exposed through an element with native button semantics or an equivalent role with keyboard activation. The `DialogBox` skip/advance interaction SHALL be operable via Enter and Space, not click only.

#### Scenario: dialog advances via keyboard

- **WHEN** the DialogBox is focused and the user presses Enter or Space while text is still revealing
- **THEN** the reveal is skipped to the full text, matching the behavior of a pointer click

#### Scenario: dialog interaction is focusable

- **WHEN** a keyboard user tabs through the DialogBox
- **THEN** the skip/advance control receives focus and exposes a button role


<!-- @trace
source: fix-m6-ui-review-findings
updated: 2026-06-26
code:
  - src/ui/DialogBox.tsx
  - src/ui/UIErrorBoundary.tsx
  - src/ui/InventoryGrid.tsx
  - src/ui/useTypewriter.ts
  - src/ui/index.ts
  - src/App.tsx
  - src/ui/inventorySlotLabel.ts
tests:
  - src/ui/inventorySlotLabel.test.ts
-->

---
### Requirement: Render-time asset errors are contained

The UI layer SHALL contain render-time errors thrown by component subtrees (such as an out-of-range sprite index that throws `RangeError` during render) so that one failing component does not unmount the whole application. A reusable error boundary SHALL wrap the dev gallery and SHALL be available to wrap region overlays.

#### Scenario: out-of-range icon does not blank the app

- **WHEN** a component subtree throws during render because a sprite index is out of range
- **THEN** the error boundary renders a fallback in place of that subtree and the rest of the application remains mounted


<!-- @trace
source: fix-m6-ui-review-findings
updated: 2026-06-26
code:
  - src/ui/DialogBox.tsx
  - src/ui/UIErrorBoundary.tsx
  - src/ui/InventoryGrid.tsx
  - src/ui/useTypewriter.ts
  - src/ui/index.ts
  - src/App.tsx
  - src/ui/inventorySlotLabel.ts
tests:
  - src/ui/inventorySlotLabel.test.ts
-->

---
### Requirement: Typewriter reveal is stable and honors motion preference at runtime

The typewriter reveal SHALL NOT briefly display the full new text when its source text changes; the visible prefix SHALL never exceed the length implied by the current reveal progress for the current text. The reveal SHALL also respond to `prefers-reduced-motion` changes that occur after the component has mounted.

#### Scenario: changing text does not flash the full new string

- **WHEN** the `text` prop changes from a fully revealed string to a different string
- **THEN** the first render after the change shows no more characters of the new string than the reset progress allows (no full-text flash), then the new string types out

#### Scenario: enabling reduced motion mid-session reveals immediately

- **WHEN** the user enables `prefers-reduced-motion: reduce` while a typewriter is mounted and still revealing
- **THEN** the reveal completes immediately without requiring a `text` or `speed` change

<!-- @trace
source: fix-m6-ui-review-findings
updated: 2026-06-26
code:
  - src/ui/DialogBox.tsx
  - src/ui/UIErrorBoundary.tsx
  - src/ui/InventoryGrid.tsx
  - src/ui/useTypewriter.ts
  - src/ui/index.ts
  - src/App.tsx
  - src/ui/inventorySlotLabel.ts
tests:
  - src/ui/inventorySlotLabel.test.ts
-->