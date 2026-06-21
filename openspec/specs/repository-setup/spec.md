# repository-setup Specification

## Purpose

TBD - created by archiving change 'm1-scaffold-and-repo-init'. Update Purpose after archive.

## Requirements

### Requirement: Safe Spectra database relocation before git init

The system SHALL relocate the colliding Spectra database shell out of the `.git` path and verify Spectra still works before deleting the empty shell, so no Spectra state is lost.

#### Scenario: Spectra remains functional after relocation

- **WHEN** the Spectra database shell is moved out of the `.git` path
- **THEN** `spectra list` still resolves the project's changes and specs before the empty `.git` shell is deleted


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
### Requirement: Parent repository removal

The system SHALL remove the parent project's git directory so the parent folder no longer acts as a git repository, while leaving its other files untouched.

#### Scenario: Parent folder is no longer a repo

- **WHEN** the parent project's git directory is deleted
- **THEN** running `git rev-parse --show-toplevel` from the project no longer resolves to the parent folder, and the parent's non-git files remain in place


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
### Requirement: Fresh git initialization

The system SHALL initialize a brand-new git repository in the project folder with default branch `main` and SHALL NOT preserve prior commit history.

#### Scenario: New repo starts clean

- **WHEN** `git init` completes in the project folder
- **THEN** the repository is on branch `main` with no inherited history, and the first commit captures the current tracked state


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
### Requirement: Project renamed to Sproutfolio

The system SHALL name the project folder `sproutfolio` and the GitHub remote repository `sproutfolio`.

#### Scenario: Folder and remote share the Sproutfolio name

- **WHEN** the rename and remote creation are complete
- **THEN** the working directory is `sproutfolio` and the remote repository is named `sproutfolio`


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
### Requirement: Gitignore preserves internal-only paths

The `.gitignore` SHALL keep curated assets, internal planning notes, and tooling state out of the public repository, while publishing the source, `public/` assets, project docs, and spec artifacts. It SHALL additionally ignore build and OS artifacts.

#### Scenario: Internal-only paths are untracked

- **WHEN** the first commit is created
- **THEN** `精選素材`, `roadmap/` (internal planning), `.spectra/`, and `openspec/.vector-search.db*` are not tracked, and `node_modules/`, `dist/`, and `.DS_Store` are ignored


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
### Requirement: Public remote created and pushed

The system SHALL create a public GitHub repository under the `Warmlatte` account and push the `main` branch to it.

#### Scenario: Main is published to the public remote

- **WHEN** the remote is created and the push completes
- **THEN** `git remote -v` points `origin` to `Warmlatte/sproutfolio` and `main` is published as a public repository

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