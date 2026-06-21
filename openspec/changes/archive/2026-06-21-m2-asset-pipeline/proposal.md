## Why

M1 已備妥外殼與字體，但 `public/sprites/` 仍空、程式中沒有任何素材座標定義。後續 M3–M7 的地圖、角色、UI 都需要從 sprite-sheet 取用子圖座標；若各自重算切片座標會重複且易錯。需要一份集中、引擎無關的切片定義作為單一事實來源，並在引擎選型（M3）前先把素材座標釘死、可目視核對。

## What Changes

- 將 `精選素材/` 的核心集 11 張圖複製進 `public/sprites/`（保留 characters/tilesets/objects/ui 分類），由 Vite 直接服務。
- 新增引擎無關的切片型別（discriminated union：`grid` / `nine-slice`）與集中 catalog，以邏輯 key 描述每張圖的 frame 尺寸、行列與動畫格。
- 新增純切片數學函式 `frameRect` 與 `nineSliceRects`（含越界丟錯的邊界驗證），並以 Vitest 單元測試。
- 新增 dev-only 的 React + canvas debug 檢視頁，以整數倍渲染主角四向/草地/水動畫/icons/dialog box 供目視核對。
- 引擎格式轉換層留待 M3；切片只是純資料。

## Non-Goals (optional)

<!-- Non-Goals 記於 design.md 的 Goals/Non-Goals -->

## Capabilities

### New Capabilities

- `asset-pipeline`: 從 `精選素材/` 到 `public/sprites/` 的素材管線、引擎無關的集中切片定義（catalog + 型別 + 純切片數學），以及 dev-only 切片核對檢視頁。

### Modified Capabilities

(none)

## Impact

- Affected specs: asset-pipeline（新增）
- Affected code:
  - New: src/game/sprites/types.ts, src/game/sprites/catalog.ts, src/game/sprites/frame.ts, src/game/sprites/frame.test.ts, src/dev/SpriteCanvas.tsx, src/dev/SpriteDebug.tsx, public/sprites/characters/, public/sprites/tilesets/, public/sprites/objects/, public/sprites/ui/
  - Modified: src/App.tsx, package.json, vite.config.ts
  - Removed: (none)
