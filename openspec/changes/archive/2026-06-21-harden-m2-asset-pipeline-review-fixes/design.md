## Context

M2 asset pipeline 已建立 `src/game/sprites/` catalog、純切片數學、`public/sprites/` 11 張核心素材，以及 `#sprites` dev viewer。Code review 指出三類合併前風險：catalog 型別只用寬鬆 string key、dev viewer 錯誤狀態硬編碼 raw hex、測試未守住 catalog 與 copied assets 的整體 contract。這些風險會影響 M3-M7 依賴 sprite keys 與素材路徑的穩定性。

## Goals / Non-Goals

**Goals:**

- 讓 TypeScript contract 明確描述 11 個 M2 logical keys，並讓 catalog value 以 readonly literal data 暴露。
- 將 dev viewer 的錯誤顯示改為既有 semantic token，不新增 style-guide 顏色。
- 用輕量 Vitest 補足 catalog 與 copied asset set 的回歸守門。
- 修正 dev viewer 內可導致重複載圖或模糊輸出的穩定性缺口。

**Non-Goals:**

- 不改動 sprite sheet 座標本身，除非現有測試證明與圖檔尺寸不一致。
- 不新增新的核心素材，不把 deferred assets 複製進 `public/sprites/`。
- 不引入 React testing library、browser test framework 或影像快照測試。
- 不實作 M3 的引擎載入轉換層。

## Decisions

### Use an explicit CatalogKey union for the M2 catalog contract

`CatalogKey` 應由顯式 union 定義 11 個規格 key，而不是從物件推導或使用 `Record<string, SpriteSheet>`。`catalog` 應使用 `as const satisfies Readonly<Record<CatalogKey, SpriteSheet>>`，讓缺 key、多 key 與直接 mutation 在 typecheck 階段被攔下。替代方案是只靠 runtime test 檢查 key set；這會留下 M3 開發時的型別提示缺口，因此不採用。

### Add catalog and asset tests beside sprite math tests

新增 `src/game/sprites/catalog.test.ts`，使用 Vitest 與 Node fs 檢查 catalog shape、核心素材清單與 deferred asset 排除。這比把檢查寫進 build script 更局部，且符合專案「純邏輯用輕量單元測試」要求。替代方案是只在 PR checklist 目視確認；這無法防止後續變更回歸，因此不採用。

### Keep dev viewer styling within existing semantic tokens

錯誤訊息應使用既有 text utility 或 CSS variable，例如 `text-text-muted` 或 `var(--text-muted)`，不得新增 raw hex。若未來需要真正的 error semantic token，應另開 style-guide change；本 change 不擴充色票。

### Stabilize viewer rendering inputs at component boundaries

`SpriteCanvas` 應在 draw 前檢查 `scale` 是正整數，不符合時顯示明確錯誤，不嘗試畫出可能模糊的結果。`NineSliceBox` 應把 dialog sheet 的 nine-slice rects 移成模組常數或 memoized value，避免 render 期間建立新 array 造成 effect 依賴變動與重複載入圖片。

## Implementation Contract

**Behavior:** 執行測試時，sprite catalog 與 copied assets 會被自動驗證；任一 logical key 缺失或多出、核心素材缺檔、deferred asset 進入 `public/sprites/`、或 catalog source 離開 `/sprites/` 都會讓測試失敗。開發者打開 `#sprites` 時，錯誤訊息仍可見，但 component 程式碼不含 raw hex error color；非正整數 scale 會顯示錯誤，不畫出模糊 canvas。

**Interface / data shape:** `CatalogKey` 是顯式 11-key union；`catalog` 是 readonly `Record<CatalogKey, SpriteSheet>` literal。新增測試檔使用 `npm test` 進入既有 Vitest 流程，不新增 package script。

**Failure modes:** catalog key、asset file、deferred asset、scale guard 的失敗都要用測試或可見錯誤狀態暴露，不得靜默忽略。圖片載入失敗仍維持現有可見 alert 行為，但改用 semantic token styling。

**Acceptance criteria:** `npm test` 通過並包含 catalog/asset guard；`npm run build` 通過；搜尋 `src/dev` 不應命中 raw hex 色碼；production build 仍不包含 `SpriteDebug`、`#sprites` 或 debug viewer 文案。

**Scope boundaries:** In scope = `src/game/sprites/catalog.ts`、`src/game/sprites/catalog.test.ts`、`src/dev/SpriteCanvas.tsx`、`src/dev/SpriteDebug.tsx` 的 contract/test/viewer 穩定性補強。Out of scope = 素材座標重算、引擎 loader、UI 9-slice 元件、style-guide 新 token。

## Risks / Trade-offs

- [顯式 CatalogKey 需要未來新增素材時同步更新 type 與 tests] → 這是刻意的 contract gate；新增素材應透過後續 Spectra change 一併更新。
- [Node fs 測試耦合 `public/sprites/` 檔名] → M2 的驗收本來要求固定核心素材集，耦合可接受且能捕捉授權範圍外素材誤入版控。
- [使用既有 semantic token 可能不如 error red 醒目] → 本 change 不新增設計 token；需要 error 色時另以 style-guide change 處理。
