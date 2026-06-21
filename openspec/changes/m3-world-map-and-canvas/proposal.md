## Why

M1 建立外殼與 design tokens、M2 完成引擎無關的 sprite 切片 catalog，但目前頁面仍是 placeholder，沒有任何遊戲世界。M3 要踏出「可走進去的農場」第一步：選定並接入 canvas 渲染引擎、建立 React↔引擎橋接，並渲染出可辨識的靜態農場地圖，作為後續角色移動（M4）、互動與面板（M7）的地基。

## What Changes

- 接入 **Pixi.js** 作為 canvas 渲染引擎（新增 `pixi.js` 相依）。
- 新增 `<GameCanvas>` React 容器：掛載時建立 Pixi 引擎、卸載時銷毀，對嚴格模式雙重掛載安全、無記憶體洩漏。
- 新增引擎層 `textures.ts`，把 M2 的純資料 catalog（透過既有 `frameRect()`）轉成 `PIXI.Texture`，貼圖設最近鄰取樣保像素清晰；M2 的 `src/game/sprites/` 不變動。
- 新增農場地圖純資料（28×18 瓦片）與 `buildFarmScene`，分層渲染草地底層（單一草地塊鋪滿）、路徑、池塘、木屋、樹叢，並定義四區域錨點供 M4/M7 對齊。
- 相機以 world 容器固定 3× 整數縮放置中，resize 時重算置中、不破版。
- 補一小步素材管線：複製 `paths.png` 到 `public/sprites/objects/` 並在 catalog 加 grid 條目。
- 預留 `events.ts` 引擎↔React 事件型別 stub（僅型別、不接線，M7 使用）。
- `App.tsx` 以 `<GameCanvas>` 取代既有 placeholder，保留 `#sprites` 除錯路由。

## Non-Goals (optional)

(留待 design.md 的 Goals/Non-Goals 章節)

## Capabilities

### New Capabilities

- `game-canvas`: React 容器掛載/銷毀 Pixi 引擎的生命週期、引擎層紋理轉接、相機置中與 resize、貼圖載入錯誤處理、引擎↔React 事件型別 stub。
- `world-map`: 農場靜態地圖的純資料定義（尺寸、分層瓦片、四區域錨點）與 farm 場景的分層渲染組裝。

### Modified Capabilities

(none)

## Impact

- Affected specs: 新增 `game-canvas`、`world-map` 兩個 capability。
- Affected code:
  - New:
    - src/game/engine.ts
    - src/game/textures.ts
    - src/game/camera.ts
    - src/game/events.ts
    - src/game/scenes/farm.ts
    - src/game/map/farmMap.ts
    - src/react/GameCanvas.tsx
    - public/sprites/objects/paths.png
  - Modified:
    - src/constants.ts
    - src/game/sprites/catalog.ts
    - src/App.tsx
    - package.json
  - Removed: (none)
