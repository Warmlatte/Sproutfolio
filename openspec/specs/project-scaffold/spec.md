# project-scaffold Specification

## Purpose

TBD - created by archiving change 'm1-scaffold-and-repo-init'. Update Purpose after archive.

## Requirements

### Requirement: Runnable Vite React TypeScript shell

The system SHALL provide a Vite + React + TypeScript application shell that starts in development and produces a production build without errors.

#### Scenario: Development server starts

- **WHEN** a developer runs `npm run dev`
- **THEN** the Vite dev server starts and serves the application without compile errors

#### Scenario: Production build succeeds

- **WHEN** a developer runs `npm run build`
- **THEN** the TypeScript compile and Vite build complete successfully and emit assets into `dist/`


<!-- @trace
source: m1-scaffold-and-repo-init
updated: 2026-06-20
code:
  - .agents/skills/spectra-ask/SKILL.md
  - .agents/skills/spectra-ingest/SKILL.md
  - .agents/skills/spectra-drift/SKILL.md
  - .agents/skills/spectra-apply/SKILL.md
  - AGENTS.md
  - .agents/skills/spectra-audit/SKILL.md
  - .agents/skills/spectra-debug/SKILL.md
  - CLAUDE.md
  - .agents/skills/spectra-commit/SKILL.md
  - .agents/skills/spectra-discuss/SKILL.md
  - docs/style-guide.md
  - docs/superpowers/specs/2026-06-18-game-style-personal-site-design.md
  - docs/superpowers/specs/2026-06-20-sproutfolio-m1-scaffold-design.md
  - LICENSE
  - .agents/skills/spectra-propose/SKILL.md
  - .agents/skills/spectra-archive/SKILL.md
-->

---
### Requirement: Minimal source layout

The system SHALL include a minimal `src/` entry set consisting of `main.tsx`, `App.tsx`, `constants.ts`, and `index.css`, with `index.html` mounting the React root.

#### Scenario: Entry files render the root

- **WHEN** the application loads in the browser
- **THEN** `main.tsx` mounts `App` into the root element defined in `index.html` and the page renders


<!-- @trace
source: m1-scaffold-and-repo-init
updated: 2026-06-20
code:
  - .agents/skills/spectra-ask/SKILL.md
  - .agents/skills/spectra-ingest/SKILL.md
  - .agents/skills/spectra-drift/SKILL.md
  - .agents/skills/spectra-apply/SKILL.md
  - AGENTS.md
  - .agents/skills/spectra-audit/SKILL.md
  - .agents/skills/spectra-debug/SKILL.md
  - CLAUDE.md
  - .agents/skills/spectra-commit/SKILL.md
  - .agents/skills/spectra-discuss/SKILL.md
  - docs/style-guide.md
  - docs/superpowers/specs/2026-06-18-game-style-personal-site-design.md
  - docs/superpowers/specs/2026-06-20-sproutfolio-m1-scaffold-design.md
  - LICENSE
  - .agents/skills/spectra-propose/SKILL.md
  - .agents/skills/spectra-archive/SKILL.md
-->

---
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


<!-- @trace
source: m1-scaffold-and-repo-init
updated: 2026-06-20
code:
  - .agents/skills/spectra-ask/SKILL.md
  - .agents/skills/spectra-ingest/SKILL.md
  - .agents/skills/spectra-drift/SKILL.md
  - .agents/skills/spectra-apply/SKILL.md
  - AGENTS.md
  - .agents/skills/spectra-audit/SKILL.md
  - .agents/skills/spectra-debug/SKILL.md
  - CLAUDE.md
  - .agents/skills/spectra-commit/SKILL.md
  - .agents/skills/spectra-discuss/SKILL.md
  - docs/style-guide.md
  - docs/superpowers/specs/2026-06-18-game-style-personal-site-design.md
  - docs/superpowers/specs/2026-06-20-sproutfolio-m1-scaffold-design.md
  - LICENSE
  - .agents/skills/spectra-propose/SKILL.md
  - .agents/skills/spectra-archive/SKILL.md
-->

---
### Requirement: Verification screen

The `App` component SHALL render a verification screen that exercises the design tokens, both fonts, and pixel rendering so the foundation can be visually confirmed.

#### Scenario: Foundation is visually verifiable

- **WHEN** the verification screen renders
- **THEN** it shows Traditional Chinese text in the primary pixel font, an English heading in the decorative pixel font, and color blocks using semantic surface and accent tokens

<!-- @trace
source: m1-scaffold-and-repo-init
updated: 2026-06-20
code:
  - .agents/skills/spectra-ask/SKILL.md
  - .agents/skills/spectra-ingest/SKILL.md
  - .agents/skills/spectra-drift/SKILL.md
  - .agents/skills/spectra-apply/SKILL.md
  - AGENTS.md
  - .agents/skills/spectra-audit/SKILL.md
  - .agents/skills/spectra-debug/SKILL.md
  - CLAUDE.md
  - .agents/skills/spectra-commit/SKILL.md
  - .agents/skills/spectra-discuss/SKILL.md
  - docs/style-guide.md
  - docs/superpowers/specs/2026-06-18-game-style-personal-site-design.md
  - docs/superpowers/specs/2026-06-20-sproutfolio-m1-scaffold-design.md
  - LICENSE
  - .agents/skills/spectra-propose/SKILL.md
  - .agents/skills/spectra-archive/SKILL.md
-->