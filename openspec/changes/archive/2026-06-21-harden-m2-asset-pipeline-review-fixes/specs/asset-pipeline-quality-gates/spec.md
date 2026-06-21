## ADDED Requirements

### Requirement: Sprite catalog exposes a fixed immutable key set

The system SHALL expose the M2 sprite catalog as an engine-agnostic immutable TypeScript data object with exactly these logical keys: `player`, `playerActions`, `grass`, `water`, `woodenHouse`, `plants`, `grassBiom`, `iconsAll`, `inventory`, `btnSquare`, and `dialogBox`. The TypeScript contract MUST reject missing keys, extra keys, and direct mutation of catalog values.

#### Scenario: Catalog key contract is enforced

- **WHEN** the sprite catalog is type-checked
- **THEN** it accepts exactly the 11 M2 logical keys and rejects a catalog shape that omits one of those keys or adds an undeclared key

##### Example: exact catalog keys

| Key | Expected kind |
| --- | --- |
| `player` | `grid` |
| `playerActions` | `grid` |
| `grass` | `grid` |
| `water` | `grid` |
| `woodenHouse` | `grid` |
| `plants` | `grid` |
| `grassBiom` | `grid` |
| `iconsAll` | `grid` |
| `inventory` | `grid` |
| `btnSquare` | `grid` |
| `dialogBox` | `nine-slice` |

#### Scenario: Core catalog entries keep their pinned contracts

- **WHEN** tests inspect the `player` and `dialogBox` catalog entries
- **THEN** `player` is a 48 by 48 frame grid with 4 columns and 4 rows, and `dialogBox` is a 48 by 48 nine-slice sheet with border 16

### Requirement: Asset pipeline verification covers catalog and copied assets

The system SHALL include lightweight automated tests that verify the M2 catalog and copied asset set. The tests MUST confirm that every catalog `src` points under `/sprites/`, the public sprite folder contains the 11 core asset files, and deferred sheets for cow, chest, egg, fences, doors, hills, paths, and bridge are absent.

#### Scenario: Catalog and copied assets are guarded by tests

- **WHEN** a developer runs the project test command
- **THEN** the test suite fails if the catalog key set changes, a catalog source path leaves `/sprites/`, a core asset file is missing, or a deferred asset is copied into `public/sprites/`

##### Example: deferred asset guard

| Deferred name fragment | Expected result |
| --- | --- |
| `cow` | absent from `public/sprites/` |
| `chest` | absent from `public/sprites/` |
| `egg` | absent from `public/sprites/` |
| `fences` | absent from `public/sprites/` |
| `doors` | absent from `public/sprites/` |
| `hills` | absent from `public/sprites/` |
| `paths` | absent from `public/sprites/` |
| `bridge` | absent from `public/sprites/` |

### Requirement: Dev sprite viewer follows semantic UI tokens and stable rendering guards

The development-only sprite viewer SHALL use existing semantic token utilities or CSS variables for visible error states and SHALL NOT hard-code raw hex colors. The viewer MUST surface invalid non-positive or non-integer scale values as visible errors before drawing, and nine-slice source rectangles MUST be stable across renders unless the dialog sheet contract changes.

#### Scenario: Viewer error states use semantic tokens

- **WHEN** an image load failure or invalid scale value is rendered by the dev sprite viewer
- **THEN** the visible error message uses an existing semantic text color utility or semantic CSS variable and contains no raw hex color value in the component implementation

#### Scenario: Invalid scale is surfaced before drawing

- **WHEN** the dev sprite viewer receives a scale value that is not a positive integer
- **THEN** it renders a visible error state and does not draw blurred or fractionally scaled sprite output
