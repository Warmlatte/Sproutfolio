## ADDED Requirements

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

### Requirement: At least three verifiable semantic tokens

The system SHALL render at least three semantic tokens (surface, text, accent) through Tailwind utilities so token wiring is verifiable on screen.

#### Scenario: Three tokens display correctly

- **WHEN** the verification screen renders the surface, text, and accent tokens
- **THEN** each displays its correct style-guide hex
