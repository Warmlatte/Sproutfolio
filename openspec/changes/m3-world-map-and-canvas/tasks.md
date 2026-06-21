## 1. 相依與素材管線

- [x] 1.1 採用 Pixi.js 作為渲染引擎：在 package.json 新增 `pixi.js` 相依並安裝。完成標準為 `pixi.js` 出現在 dependencies、`npm install` 成功、且在程式中 `import * as PIXI from 'pixi.js'` 不報錯。驗證：`npx tsc --noEmit` 通過、`npm ls pixi.js` 顯示已安裝。
- [x] 1.2 納入 paths 素材管線，使 Paths sprite is added to the asset pipeline：複製 `精選素材/objects/paths.png` 到 `public/sprites/objects/paths.png`，並在 `src/game/sprites/catalog.ts` 新增 16×16 grid 的 `paths` 條目（沿用既有純資料風格）。完成標準為路徑層能透過 catalog 解析路徑磚。驗證：檔案存在、`catalog.paths` 通過 `satisfies SpriteSheet` 型別檢查（`tsc --noEmit`）。

## 2. 引擎層基礎（紋理與相機）

- [x] 2.1 引擎層 textures.ts 轉接 M2 純資料 catalog，達成 Engine layer adapts the M2 sprite catalog into Pixi textures：在 `src/game/textures.ts` 實作 `getTexture(key, index)`，內部用既有 `frameRect()` 取得 source rect，base texture 設 `scaleMode = NEAREST`。完成標準為回傳 `PIXI.Texture` 之 frame 等於 `frameRect(sheet, index)`，且 `src/game/sprites/` 不含任何 Pixi import。驗證：`grep -r "pixi" src/game/sprites` 無命中、`tsc --noEmit` 通過。
- [x] 2.2 相機固定整數縮放置中與 resize 重算，達成 Camera centers the world and survives resize：在 `src/game/camera.ts` 實作純函式 `computeCenterOffset(mapPx, viewportPx, scale)`，回傳置中位移並 clamp 在地圖邊界內。完成標準為大於視窗時偏移夾在邊界、resize 重算後仍置中。驗證：`npx vitest run camera`（涵蓋置中與 clamp 邊界案例）通過。

## 3. 地圖資料與場景組裝

- [x] 3.1 農場地圖以分層純資料定義，達成 Farm map is defined as layered immutable data：在 `src/game/map/farmMap.ts` 以唯讀資料描述 28×18 分層（草地底層單一塊鋪滿、路徑、池塘靜態首格、木屋、樹叢），並在 `src/constants.ts` 新增 `MAP_COLS=28`、`MAP_ROWS=18`。完成標準為各層瓦片索引落在對應 sheet 範圍、資料不含引擎型別。驗證：`npx vitest run farmMap`（檢查尺寸與索引合法性）通過。
- [x] 3.2 在 farmMap 定義 Four region anchors are reserved for later milestones：新增小屋（上）、告示牌（左）、信箱（右）、田地+池塘（中下，出生點下方中央）四區域錨點座標。完成標準為每個錨點 column ∈ [0,28)、row ∈ [0,18)。驗證：`npx vitest run farmMap` 的錨點界內案例通過。
- [x] 3.3 Farm scene assembles tiles into the world container：在 `src/game/scenes/farm.ts` 實作 `buildFarmScene(world)`，依層序把每格 `Sprite`（座標 = col/row × `TILE_SIZE`）加入 world，木屋按 sheet 相對格位整塊拼貼。完成標準為渲染出草地/路徑/池塘/木屋/樹、接縫對齊。驗證：`vite dev` 瀏覽器手動走查，肉眼確認可辨識農場且木屋接縫正確。

## 4. 引擎組裝與 React 橋接

- [x] 4.1 GameCanvas 生命週期與嚴格模式安全銷毀，達成 React container mounts and destroys the Pixi engine：實作 `src/game/engine.ts` 的 `createEngine(container)`（建 `PIXI.Application`、載貼圖、建 world 容器套 `WORLD_SCALE`、呼叫 `buildFarmScene`、回傳 `{ destroy() }`）與 `src/react/GameCanvas.tsx`（useEffect 掛載、cleanup 銷毀），並在 `App.tsx` 以 `<GameCanvas>` 取代 placeholder（保留 `#sprites`）。完成標準為掛載出現 canvas、卸載後無殘留 canvas 且 ticker 停止、Strict Mode 雙重掛載僅留一個實例。驗證：`vite dev` 手動掛載/卸載/切換 `#sprites` 觀察，DevTools 確認無殘留 canvas。
- [x] 4.2 Texture load failure surfaces a visible error：在 `engine.ts` 對貼圖載入加 try/catch，失敗時於容器顯示像素風錯誤訊息、不靜默吞錯。完成標準為缺圖時畫面出現可見錯誤訊息而非空白或 console-only。驗證：手動將某 sheet 路徑改錯，`vite dev` 確認容器顯示錯誤訊息。
- [x] 4.3 events.ts 事件型別 stub 預留 M7 接線，達成 Engine-to-React event types are reserved：在 `src/game/events.ts` 定義 `GameEvent` union 與 typed emitter 介面，僅型別、不接線。完成標準為匯出型別存在且 M3 程式無任何 emit/subscribe 呼叫。驗證：`tsc --noEmit` 通過、`grep -rn "emit\|subscribe" src/game/events.ts src/react` 無執行期呼叫。

## 5. 整體驗證

- [x] 5.1 純函式測試與型別把關全綠：完成標準為 camera 與 farmMap 單元測試全通過、型別檢查無誤。驗證：`npx vitest run` 與 `npx tsc --noEmit` 皆通過。
- [x] 5.2 手動走查驗收標準：完成標準為農場可辨識、resize 不破版（縮放係數固定 3×、地圖置中）、卸載無洩漏。驗證：`vite dev` 依 design Implementation Contract 的 Acceptance criteria 逐項目視確認。
