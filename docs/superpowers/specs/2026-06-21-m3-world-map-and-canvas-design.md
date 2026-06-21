# 設計文件：M3 — 遊戲世界（地圖渲染 + GameCanvas 容器）

- 日期：2026-06-21
- 狀態：設計待使用者最終確認
- 來源：`docs/roadmap/M3-world-map-and-canvas.md`、總體 spec `2026-06-18-game-style-personal-site-design.md`（第四、五節）
- 依賴：M1（外殼/tokens）、M2（素材切片 catalog）已完成

## 一、目標

建立 canvas 遊戲世界的基礎：選定並接入渲染引擎、以 `<GameCanvas>` React 容器負責掛載/銷毀引擎，
並渲染出農場主場景的**靜態**瓦片地圖（草地、路徑、池塘、木屋、樹叢），含相機置中基礎。
角色、移動、碰撞、相機跟隨（M4）、互動與 UI 面板（M7）不在本區塊。

## 二、關鍵決策（已與使用者確認）

| 項目 | 決定 | 備註 |
|---|---|---|
| 遊戲引擎 | **Pixi.js** | 純高效能渲染器；相機/碰撞/遊戲迴圈自建薄抽象。M4 的跟隨、M7 的互動偵測建於此層 |
| 地圖尺寸 | **28×18 瓦片** | 1× 為 448×288px，3× 放大 1344×864px。桌機幾乎整圖可見、手機鏡頭有移動空間、緊湊不空曠 |
| 草地鋪面 | **單一草地塊鋪滿底層** | YAGNI；bitmask autotile 留待真有多地形交界時再做 |
| 路徑 | **M3 納入** | 需補一小步素材管線：複製 `paths.png` 並於 `catalog.ts` 加 grid 條目 |
| 相機 | **固定 3× 整數縮放、置中、resize 重算** | 跟隨/夾邊界留 M4；響應式縮放係數留 M4/M5 |

## 三、模組架構與檔案佈局

沿用總體 spec 的原則：多個小檔、引擎無關純資料（M2 `sprites/`）與引擎層（Pixi）分離。

```
src/
├── constants.ts            # +MAP_COLS=28, MAP_ROWS=18, 區域錨點座標
├── game/
│   ├── engine.ts           # createEngine(container) → { destroy() }
│   ├── textures.ts         # M2 catalog（純資料）→ PIXI.Texture 轉接層
│   ├── camera.ts           # world Container 置中/clamp 純計算
│   ├── events.ts           # 引擎↔React 事件型別 stub（M7 接線）
│   ├── scenes/
│   │   └── farm.ts         # buildFarmScene(world): 組裝瓦片圖層
│   ├── map/
│   │   └── farmMap.ts      # 地圖純資料：尺寸/圖層瓦片/區域錨點
│   └── sprites/            # M2 既有；catalog.ts 加 paths 一筆
├── react/
│   └── GameCanvas.tsx      # useEffect 掛載引擎、unmount 銷毀
└── App.tsx                 # 以 <GameCanvas/> 取代 placeholder（保留 #sprites 路由）
```

- 依賴：`package.json` 新增 `pixi.js`。
- 素材：`paths.png` 複製到 `public/sprites/objects/`，`catalog.ts` 新增對應 grid 條目（沿用 M2 純資料風格）。

## 四、Pixi 引擎層與 M2 轉接

### `textures.ts`（轉接層）
- 啟動時用 catalog 各條目的 `src` 建立 `BaseTexture`，設 `scaleMode = NEAREST`（最近鄰取樣，保像素清晰）。
- 提供 `getTexture(key, index)`：呼叫 M2 既有的 `frameRect()` 算出 source rect，切出 `PIXI.Texture`。
- 此層是「引擎層翻譯 M2 純資料」；M2 的 `src/game/sprites/` 完全不變動，維持引擎無關。

### `engine.ts`
- `createEngine(container)`：
  1. 建 `PIXI.Application`，canvas 填滿容器。
  2. `await` 載入本場景所需貼圖（grass、water、wooden_house、grass_biom、paths）。
  3. 建 `world` 容器並套用 `WORLD_SCALE=3`。
  4. 呼叫 `buildFarmScene(world)`。
  5. 回傳 `{ destroy() }`：銷毀 application、停止 ticker、釋放貼圖，避免記憶體洩漏。

## 五、地圖資料與 farm 場景

### `farmMap.ts`（純資料）
- 描述 28×18 地圖，分層（由下而上）：
  1. **草地底層**：單一草地塊鋪滿。
  2. **路徑**：連接四區域，引導走動、避免空曠。
  3. **池塘**：water sheet，M3 先畫靜態首格（流動動畫留 M4/M8）。
  4. **木屋**：wooden_house 預製建物。
  5. **樹叢**：grass_biom 數棵。
- 定義四區域**錨點座標**（小屋上、告示牌左、信箱右、田地+池塘中下、出生點下方中央）供 M4/M7 對齊。
  M3 只實際畫木屋/池塘/樹；告示牌與信箱物件留 M7，但錨點先就位。

### `farm.ts`
- `buildFarmScene(world)`：讀 `farmMap`，依層序把每格 `Sprite`（座標 = `col/row × TILE_SIZE`）加入 `world`。
- 木屋等多瓦片預製建物，按其在 sheet 的相對格位整塊拼貼，確保接縫正確。

## 六、相機與 resize

- `camera.ts` 純函式 `computeCenterOffset(mapPx, viewportPx, scale)`：回傳 `world` 容器位移，clamp 在地圖邊界內。M3 為靜態置中。
- resize：監聽容器尺寸變化 → renderer resize → 重算置中位移。
- 固定 3× 整數縮放；地圖大於視窗時超出部分裁切，不破版。
- 容器尺寸為 0 時延後初始化，避免除以零。

## 七、React 橋接

- `GameCanvas.tsx`：`useEffect` 內對 ref `div` 呼叫 `createEngine`，cleanup 呼叫 `destroy()`；對 React 18/19 嚴格模式的雙重掛載安全（建立→立即銷毀→再建立不洩漏）。
- `events.ts`：定義 `GameEvent` union（如未來 `{ type: 'open-overlay', payload }`）與 typed emitter 介面，**只定義型別、不接線**，M7 使用。

## 八、錯誤處理與邊界

- 貼圖載入失敗：`engine.ts` catch → 在容器顯示像素風錯誤訊息，不靜默吞錯（呼應總體 spec 第六節）。
- 容器尺寸為 0：延後初始化直到有有效尺寸。
- 外部資料：本區塊不讀 `content.ts`；地圖以型別化純資料定義，索引於組裝時驗證落在 sheet 範圍。

## 九、測試與驗證

- **純函式輕量單元測試**（vitest）：
  - `computeCenterOffset`：置中正確、clamp 在邊界內。
  - `farmMap` 合法性：區域錨點落在 28×18 界內、各圖層瓦片索引有效。
- **canvas 渲染（手動）**：`vite dev` 瀏覽器走查——
  - 可見草地鋪面、池塘、木屋、幾棵樹、路徑；整數倍放大、像素清晰。
  - resize 視窗不破版（縮放係數正確、地圖置中）。
  - 卸載無洩漏（ticker 停止、無殘留 canvas）。
- 不導入重型測試框架（YAGNI）。

## 十、驗收標準（對應 roadmap）

- [ ] Pixi.js 已接入，能在 `<GameCanvas>` 內運行；React 卸載時引擎正確銷毀。
- [ ] farm 場景渲染靜態地圖，木屋等預製建物接縫正確。
- [ ] resize 視窗不破版（縮放係數正確）。
- [ ] 路徑可見並連接四區域錨點。

## 十一、明確排除（留給其他區塊）

- 角色、移動、碰撞、相機跟隨、響應式縮放係數（M4）。
- 虛擬搖桿（M5）。
- 互動偵測、UI 面板、`events.ts` 接線（M7）。
- 水流/植物搖晃等動畫彩蛋（M8）。
- 開場動畫（M9）。
- bitmask autotile 草地（YAGNI，未排程）。
