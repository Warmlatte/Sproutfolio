# pixel-typography Specification

## Purpose

TBD - created by archiving change 'm1-scaffold-and-repo-init'. Update Purpose after archive.

## Requirements

### Requirement: Pixel font loading

The system SHALL load the Cubic 11 font as the primary Traditional Chinese typeface and the Sprout Lands pixel font as the decorative English typeface, with font files served from `public/fonts/`.

#### Scenario: Fonts are available to the app

- **WHEN** the application loads
- **THEN** `@font-face` rules register `Cubic 11` (woff2 preferred, woff fallback) and `SproutLands` (ttf) from `public/fonts/`

#### Scenario: Font stack prefers Cubic 11

- **WHEN** an element inherits the global font family
- **THEN** the stack resolves to `'Cubic 11'` first, then `'SproutLands'`, then `system-ui`, then `monospace`


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
### Requirement: Traditional Chinese renders in Cubic 11

The system SHALL render Traditional Chinese text using Cubic 11 by default.

#### Scenario: CJK text uses Cubic 11

- **WHEN** Traditional Chinese text is shown without an overriding font
- **THEN** it renders in Cubic 11


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
### Requirement: Decorative English can switch to Sprout Lands

The system SHALL allow English headings to opt into the Sprout Lands decorative font.

#### Scenario: English heading uses Sprout Lands

- **WHEN** an English heading opts into the decorative font
- **THEN** it renders in the Sprout Lands pixel font


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
### Requirement: Global pixel rendering

The system SHALL apply global pixel-art rendering rules: `image-rendering: pixelated`, disabled font smoothing for pixel fonts, and integer-only scaling.

#### Scenario: Pixels stay sharp when magnified

- **WHEN** the verification screen is magnified in the browser
- **THEN** pixel edges remain sharp with no anti-aliasing blur

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