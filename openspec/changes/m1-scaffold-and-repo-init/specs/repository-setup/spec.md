## ADDED Requirements

### Requirement: Safe Spectra database relocation before git init

The system SHALL relocate the colliding Spectra database shell out of the `.git` path and verify Spectra still works before deleting the empty shell, so no Spectra state is lost.

#### Scenario: Spectra remains functional after relocation

- **WHEN** the Spectra database shell is moved out of the `.git` path
- **THEN** `spectra list` still resolves the project's changes and specs before the empty `.git` shell is deleted

### Requirement: Parent repository removal

The system SHALL remove the parent project's git directory so the parent folder no longer acts as a git repository, while leaving its other files untouched.

#### Scenario: Parent folder is no longer a repo

- **WHEN** the parent project's git directory is deleted
- **THEN** running `git rev-parse --show-toplevel` from the project no longer resolves to the parent folder, and the parent's non-git files remain in place

### Requirement: Fresh git initialization

The system SHALL initialize a brand-new git repository in the project folder with default branch `main` and SHALL NOT preserve prior commit history.

#### Scenario: New repo starts clean

- **WHEN** `git init` completes in the project folder
- **THEN** the repository is on branch `main` with no inherited history, and the first commit captures the current tracked state

### Requirement: Project renamed to Sproutfolio

The system SHALL name the project folder `sproutfolio` and the GitHub remote repository `sproutfolio`.

#### Scenario: Folder and remote share the Sproutfolio name

- **WHEN** the rename and remote creation are complete
- **THEN** the working directory is `sproutfolio` and the remote repository is named `sproutfolio`

### Requirement: Gitignore preserves internal-only paths

The `.gitignore` SHALL keep curated assets, internal planning notes, and tooling state out of the public repository, while publishing the source, `public/` assets, project docs, and spec artifacts. It SHALL additionally ignore build and OS artifacts.

#### Scenario: Internal-only paths are untracked

- **WHEN** the first commit is created
- **THEN** `精選素材`, `roadmap/` (internal planning), `.spectra/`, and `openspec/.vector-search.db*` are not tracked, and `node_modules/`, `dist/`, and `.DS_Store` are ignored

### Requirement: Public remote created and pushed

The system SHALL create a public GitHub repository under the `Warmlatte` account and push the `main` branch to it.

#### Scenario: Main is published to the public remote

- **WHEN** the remote is created and the push completes
- **THEN** `git remote -v` points `origin` to `Warmlatte/sproutfolio` and `main` is published as a public repository
