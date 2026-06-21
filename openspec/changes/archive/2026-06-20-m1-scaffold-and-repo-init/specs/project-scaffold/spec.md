## ADDED Requirements

### Requirement: Runnable Vite React TypeScript shell

The system SHALL provide a Vite + React + TypeScript application shell that starts in development and produces a production build without errors.

#### Scenario: Development server starts

- **WHEN** a developer runs `npm run dev`
- **THEN** the Vite dev server starts and serves the application without compile errors

#### Scenario: Production build succeeds

- **WHEN** a developer runs `npm run build`
- **THEN** the TypeScript compile and Vite build complete successfully and emit assets into `dist/`

### Requirement: Minimal source layout

The system SHALL include a minimal `src/` entry set consisting of `main.tsx`, `App.tsx`, `constants.ts`, and `index.css`, with `index.html` mounting the React root.

#### Scenario: Entry files render the root

- **WHEN** the application loads in the browser
- **THEN** `main.tsx` mounts `App` into the root element defined in `index.html` and the page renders

### Requirement: Pixel constant seed

The `constants.ts` module SHALL export integer pixel constants for tile size and integer scale factors used by later world and UI work.

#### Scenario: Constants are defined as integers

- **WHEN** `constants.ts` is imported
- **THEN** it exposes `TILE_SIZE`, `WORLD_SCALE`, and `UI_SCALE` as integer values

##### Example: seed constant values

| Constant | Value | Meaning |
| --- | --- | --- |
| `TILE_SIZE` | 16 | base tile in px |
| `WORLD_SCALE` | 3 | integer world zoom |
| `UI_SCALE` | 2 | integer UI zoom |

### Requirement: Verification screen

The `App` component SHALL render a verification screen that exercises the design tokens, both fonts, and pixel rendering so the foundation can be visually confirmed.

#### Scenario: Foundation is visually verifiable

- **WHEN** the verification screen renders
- **THEN** it shows Traditional Chinese text in the primary pixel font, an English heading in the decorative pixel font, and color blocks using semantic surface and accent tokens
