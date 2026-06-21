## 1. Catalog contract hardening

- [x] 1.1 Deliver `Sprite catalog exposes a fixed immutable key set` by applying `Use an explicit CatalogKey union for the M2 catalog contract`: define an explicit 11-key `CatalogKey` union and export `catalog` as readonly literal data that satisfies `Readonly<Record<CatalogKey, SpriteSheet>>`; verify with `npm run build` that missing, extra, or directly mutated catalog entries are rejected by TypeScript.

## 2. Automated asset pipeline guards

- [x] 2.1 Deliver `Asset pipeline verification covers catalog and copied assets` by applying `Add catalog and asset tests beside sprite math tests`: add `src/game/sprites/catalog.test.ts` to verify exact catalog keys, `player` 48 by 48 4 by 4 grid, `dialogBox` 48 by 48 border 16 nine-slice, and every catalog `src` starts with `/sprites/`; verify with `npm test`.
- [x] 2.2 Extend the same catalog guard so `npm test` fails when any of the 11 core files is missing from `public/sprites/` or any deferred name fragment `cow`, `chest`, `egg`, `fences`, `doors`, `hills`, `paths`, or `bridge` appears under `public/sprites/`; verify with `npm test`.

## 3. Dev viewer semantic and rendering guards

- [x] 3.1 Deliver `Dev sprite viewer follows semantic UI tokens and stable rendering guards` by applying `Keep dev viewer styling within existing semantic tokens`: replace raw hex error styling in `SpriteCanvas` and `NineSliceBox` with existing semantic token utilities or CSS variables; verify by running `rg -n "#[0-9A-Fa-f]{6}" src/dev` and confirming no matches.
- [x] 3.2 Apply `Stabilize viewer rendering inputs at component boundaries`: make `SpriteCanvas` render a visible semantic-token error for non-positive or non-integer `scale` before drawing, and make dialog nine-slice rects stable across renders by moving them to a module constant or memoized value; verify with `npm test` for the pure contracts and `npm run build` for React/TypeScript integration.

## 4. Final verification

- [x] 4.1 Confirm the full hardening change by running `npm test`, `npm run build`, and a production artifact search for `SpriteDebug`, `#sprites`, and sprite debug copy in `dist`; completion means tests and build pass, and production output still excludes the dev viewer.
