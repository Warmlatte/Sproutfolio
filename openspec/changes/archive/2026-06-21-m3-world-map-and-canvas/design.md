## Context

M1 完成 Vite + React + TS 外殼與 design tokens；M2 完成引擎無關的 sprite 切片系統（`src/game/sprites/`：`types.ts`、`catalog.ts`、`frame.ts`），以純資料描述各 sheet 座標，`frameRect()` 可將 grid 索引換成 source rect。目前 `App.tsx` 仍是 token/placeholder 畫面，沒有遊戲世界。

M3 要接入 canvas 渲染引擎、建立 React↔引擎橋接，並渲染可辨識的靜態農場地圖。約束：像素規範（16px 基準、整數倍縮放、最近鄰取樣）、不就地修改既有物件、外科手術式修改（不動 M2 的引擎無關設計）、YAGNI。完整視覺規範見 `docs/style-guide.md`，總體架構見 `docs/superpowers/specs/2026-06-18-game-style-personal-site-design.md` 第四、五節。

## Goals / Non-Goals

**Goals:**

- 接入 Pixi.js 並在 `<GameCanvas>` 內運行，React 卸載時正確銷毀、無記憶體洩漏。
- 渲染 28×18 靜態農場：草地底層、路徑、池塘、木屋、樹叢，整數倍放大、像素清晰、接縫正確。
- 相機固定 3× 置中，resize 不破版。
- 以引擎層轉接 M2 純資料 catalog，不變動 M2 的 `src/game/sprites/`。
- 定義四區域錨點，供 M4/M7 對齊。

**Non-Goals:**

- 角色、移動、碰撞、相機跟隨、響應式縮放係數（M4）。
- 虛擬搖桿（M5）。
- 互動偵測、UI 面板、`events.ts` 接線（M7）。
- 水流/植物搖晃等動畫彩蛋（M8）；池塘 M3 只畫靜態首格。
- 開場動畫（M9）。
- bitmask autotile 草地（YAGNI，未排程）；M3 草地以單一塊鋪滿。
- 告示牌與信箱物件的實際繪製（M7）；M3 只就位其錨點座標。

## Decisions

### 採用 Pixi.js 作為渲染引擎

選 Pixi.js（純高效能渲染器）而非 KAPLAY（自帶遊戲框架）。理由：使用者偏好效能與彈性天花板更高、生態成熟穩定。代價是相機、碰撞、遊戲迴圈需自建薄抽象——M3 先建相機與場景組裝層，M4 的跟隨、M7 的互動偵測建於此層之上。新增 `pixi.js` 相依。

替代方案：KAPLAY（API 簡潔、少寫膠水），spec 原預設傾向，但使用者選定 Pixi.js。

### 引擎層 textures.ts 轉接 M2 純資料 catalog

新增 `src/game/textures.ts`：啟動時依 catalog 各條目 `src` 建立每張 sheet 的 base texture，設 `scaleMode = NEAREST`（最近鄰取樣保像素清晰）；提供 `getTexture(key, index)`，內部呼叫 M2 既有 `frameRect()` 取得 source rect 後切出 `PIXI.Texture`。此層是「引擎層翻譯 M2 純資料」，使 M2 的 `src/game/sprites/` 維持引擎無關、零變動。

替代方案：把 Pixi 型別直接寫進 M2 catalog——否決，會污染 M2 的引擎無關設計。

### 農場地圖以分層純資料定義

新增 `src/game/map/farmMap.ts`，以純資料描述 28×18 地圖，分層（由下而上）：①草地底層（單一草地塊鋪滿）②路徑 ③池塘（water sheet 靜態首格）④木屋（wooden_house 預製建物）⑤樹叢（grass_biom 數棵）。並定義四區域錨點座標（小屋上、告示牌左、信箱右、田地+池塘中下、出生點下方中央）。`src/game/scenes/farm.ts` 的 `buildFarmScene(world)` 讀此資料，依層序把每格 `Sprite`（座標 = col/row × `TILE_SIZE`）加入 world 容器；多瓦片建物按 sheet 相對格位整塊拼貼以確保接縫。地圖尺寸常數 `MAP_COLS=28`、`MAP_ROWS=18` 與區域錨點放入 `src/constants.ts`。

替代方案：bitmask autotile 草地——否決（YAGNI，M3 為單一地面）。

### 相機固定整數縮放置中與 resize 重算

新增 `src/game/camera.ts` 純函式 `computeCenterOffset(mapPx, viewportPx, scale)`：回傳 world 容器位移並 clamp 在地圖邊界內。world 容器套用 `WORLD_SCALE=3` 整數縮放。resize 時 renderer 跟著容器尺寸調整並重算置中位移；地圖大於視窗時超出裁切，不破版。容器尺寸為 0 時延後初始化，避免除以零。

替代方案：M3 即做響應式縮放係數與相機跟隨——否決，屬 M4/M5 範圍。

### GameCanvas 生命週期與嚴格模式安全銷毀

新增 `src/react/GameCanvas.tsx`：`useEffect` 內對 ref `div` 呼叫 `createEngine(container)`（`src/game/engine.ts`，建立 `PIXI.Application`、載入本場景貼圖、建 world 容器、呼叫 `buildFarmScene`、回傳 `{ destroy() }`），cleanup 呼叫 `destroy()`（銷毀 application、停 ticker、釋放貼圖）。對 React 19 嚴格模式雙重掛載安全：建立→立即銷毀→再建立不洩漏。`App.tsx` 以 `<GameCanvas>` 取代既有 placeholder，保留 `#sprites` 除錯路由。

### events.ts 事件型別 stub 預留 M7 接線

新增 `src/game/events.ts`：定義 `GameEvent` union（未來如 `{ type: 'open-overlay', payload }`）與 typed emitter 介面，僅型別、不接線。M3 不實際發送或訂閱事件；M7 互動實作時接線。

### 納入 paths 素材管線

複製 `精選素材/objects/paths.png` 到 `public/sprites/objects/paths.png`，於 `src/game/sprites/catalog.ts` 新增 `paths` grid 條目（沿用 M2 純資料風格，frameW/frameH=16）。供路徑層渲染使用。

## Implementation Contract

**Behavior（可觀察行為）：**

- 載入頁面（非 `#sprites`）時，畫面中央出現一塊 canvas，渲染可辨識農場：草地鋪面、路徑、池塘、木屋、數棵樹，整數倍放大、像素清晰（最近鄰、無模糊）。
- 調整視窗大小時地圖維持置中、不破版、縮放係數不變（固定 3×）。
- React 卸載 `<GameCanvas>`（含嚴格模式雙重掛載）後不殘留 canvas、ticker 停止、無記憶體洩漏。

**Interface / data shape：**

- `createEngine(container: HTMLElement): { destroy(): void }`（`src/game/engine.ts`）。
- `getTexture(key: CatalogKey, index: number): PIXI.Texture`（`src/game/textures.ts`）；base texture `scaleMode = NEAREST`。
- `buildFarmScene(world: PIXI.Container): void`（`src/game/scenes/farm.ts`）。
- `computeCenterOffset(mapPx: {w:number;h:number}, viewportPx: {w:number;h:number}, scale: number): {x:number;y:number}`（`src/game/camera.ts`），結果 clamp 在邊界內。
- `farmMap`（`src/game/map/farmMap.ts`）：含尺寸（28×18）、各層瓦片放置、四區域錨點座標的唯讀純資料。
- `GameEvent` union 與 emitter 介面型別（`src/game/events.ts`），僅型別。
- 常數 `MAP_COLS=28`、`MAP_ROWS=18` 與區域錨點（`src/constants.ts`）。
- catalog 新增 `paths` 條目（`src/game/sprites/catalog.ts`）。

**Failure modes：**

- 貼圖載入失敗：`engine.ts` catch 後在容器顯示像素風錯誤訊息，不靜默吞錯。
- 容器尺寸為 0：延後初始化直到有有效尺寸，避免除以零。
- 地圖瓦片索引超出對應 sheet 範圍：組裝時由 `frameRect()` 既有驗證拋出明確錯誤（不回傳無效矩形）。

**Acceptance criteria：**

- 純函式 vitest：`computeCenterOffset` 置中與 clamp 邊界；`farmMap` 合法性（四區域錨點落在 28×18 界內、各層瓦片索引在對應 sheet 範圍）。
- 手動（`vite dev` 瀏覽器）：見草地/路徑/池塘/木屋/樹、整數倍清晰；resize 不破版；卸載後無殘留 canvas 與 ticker。
- 型別檢查通過（`tsc`），無 `any` 滲入引擎邊界。

**Scope boundaries：** 見 Goals / Non-Goals。M3 只做靜態渲染與相機置中；任何移動、互動、動畫、事件接線均不在範圍。

## Risks / Trade-offs

- [Pixi.js 自建相機/碰撞增加後續工作量] → M3 先把相機與場景組裝抽成小模組（`camera.ts`/`scenes/farm.ts`），讓 M4 在既有抽象上擴充跟隨/碰撞，而非重寫。
- [React 19 嚴格模式雙重掛載可能造成重複引擎或洩漏] → `useEffect` cleanup 嚴格呼叫 `destroy()`，並在手動驗證項目明確檢查卸載後無殘留。
- [固定 3× 在小視窗會裁切地圖] → M3 為靜態置中、可接受（demo 以桌機為主）；響應式縮放與相機跟隨在 M4/M5 補上。
- [paths.png 切片格位未經視覺核對] → catalog 條目沿用 16px 格，先取保守的路徑磚；如格位有誤，於 `#sprites` 除錯頁核對後修正 index。

## Open Questions

(無)
