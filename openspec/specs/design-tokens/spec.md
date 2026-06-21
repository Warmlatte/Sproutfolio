# design-tokens Specification

## Purpose

TBD - created by archiving change 'm1-scaffold-and-repo-init'. Update Purpose after archive.

## Requirements

### Requirement: Semantic color tokens via Tailwind v4 theme

The system SHALL define the style-guide semantic color tokens as Tailwind v4 `@theme` variables in `index.css`, producing color utilities. Every hex value SHALL be taken from `docs/style-guide.md` and SHALL NOT be invented.

#### Scenario: Semantic color utilities resolve to style-guide hex

- **WHEN** an element uses a semantic color utility such as `bg-surface`, `text-text`, or `bg-accent`
- **THEN** the rendered color matches the hex defined for that semantic token in `docs/style-guide.md`

##### Example: semantic to hex mapping

| Utility | Semantic token | Hex |
| --- | --- | --- |
| `bg-surface` | `--surface` (wood-200) | #E8CFA6 |
| `text-text` | `--text` (wood-800) | #6B4B5B |
| `bg-accent` | `--accent` (gold-500) | #EEBA77 |


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
### Requirement: Integer pixel type scale utilities

The system SHALL expose the style-guide type scale as Tailwind v4 `@theme` font-size variables that produce text utilities at integer multiples of the 11px base.

#### Scenario: Type scale utilities apply integer sizes

- **WHEN** an element uses a pixel type-scale utility
- **THEN** its font size is one of the integer values 11px, 22px, 33px, or 44px

##### Example: type scale mapping

| Utility | px | Role |
| --- | --- | --- |
| `text-pixel-sm` | 11 | note / credit |
| `text-pixel-base` | 22 | body (2x) |
| `text-pixel-lg` | 33 | section title (3x) |
| `text-pixel-xl` | 44 | hero (4x) |


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
### Requirement: At least three verifiable semantic tokens

The system SHALL render at least three semantic tokens (surface, text, accent) through Tailwind utilities so token wiring is verifiable on screen.

#### Scenario: Three tokens display correctly

- **WHEN** the verification screen renders the surface, text, and accent tokens
- **THEN** each displays its correct style-guide hex

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