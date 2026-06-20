# 設計文件：M2 — 素材處理與載入管線（引擎無關切片）

> 來源：`docs/roadmap/M2-asset-pipeline.md`、spec 第三節（素材規格）、`精選素材/README.md`（檔案對照）。
> 依賴 M1（已完成：Vite + React + TS 外殼、字體、tokens）。

## 一、目標

建立從 `精選素材/` 到 `public/sprites/` 的素材管線，並以**集中、引擎無關**的切片定義（sprite-sheet → 子圖）描述每張圖，讓日後遊戲與 UI 區塊用一致 key 取用座標，不必各自重算。本期附一個 dev-only debug 檢視頁核對切片正確性。

引擎選型留待 M3：M2 的切片只是純資料結構；M3 選定 KAPLAY/Pixi 後再寫一層轉換成引擎格式。

## 二、已確認決策

- **切片格式**：引擎無關的中介 TS 資料（非直接 KAPLAY 格式）。
- **debug 渲染**：React 頁 + `<canvas>` 切圖（不引入遊戲引擎）。
- **素材範圍**：本期只定義「確定會用的核心集」11 張；cow/chest/egg/fences/doors/hills/paths/bridge 等延後（YAGNI）。
- **新增 Vitest**：作為輕量單元測試框架，跑純切片數學（Vite 原生，非重型框架）。
- **命名偏離 spec**：M2 用 `src/game/sprites/`（catalog/types/frame），不沿用 spec 字面的 `src/game/loader.ts`——M2 純描述切片、不載入、無引擎，叫 loader 名實不符；`loader.ts` 留給 M3 真正的引擎載入層。

## 三、架構與元件

### 3.1 切片型別 — `src/game/sprites/types.ts`

純資料、`readonly`、無引擎相依。discriminated union：

```ts
interface AnimDef {
  readonly from: number   // 0-based，row-major 格索引
  readonly to: number
  readonly loop?: boolean
}

interface GridSheet {
  readonly kind: 'grid'
  readonly key: string          // 'player' | 'water' | 'grass' …
  readonly src: string          // '/sprites/characters/character_spritesheet.png'
  readonly frameW: number
  readonly frameH: number
  readonly cols: number
  readonly rows: number
  readonly anims?: Readonly<Record<string, AnimDef>>
}

interface NineSlice {
  readonly kind: 'nine-slice'
  readonly key: string
  readonly src: string
  readonly width: number        // 來源全寬
  readonly height: number        // 來源全高
  readonly border: number        // 內縮 px（dialog_box = 16）
}

type SpriteSheet = GridSheet | NineSlice
```

### 3.2 切片定義 catalog — `src/game/sprites/catalog.ts`

`Record<string, SpriteSheet>`，key 為邏輯名。本期 11 張（尺寸已由實檔核對）：

| key | src（public 下） | kind | 切片 |
|---|---|---|---|
| player | characters/character_spritesheet.png | grid | 192×192，frame 48×48，4×4；`anims` idle/walk × 四向 |
| playerActions | characters/character_actions.png | grid | 96×576，frame 96×96(暫定)，行列待 debug 核對 |
| grass | tilesets/grass.png | grid | 176×112，16px，11×7 |
| water | tilesets/water.png | grid | 64×16，16px，4×1，`anims.flow` from0 to3 loop |
| woodenHouse | tilesets/wooden_house.png | grid | 112×80（整張，1×1 或依結構）|
| plants | objects/plants.png | grid | 96×32，16px，6×2 |
| grassBiom | objects/grass_biom.png | grid | 144×80，16px，9×5 |
| iconsAll | ui/icons_all.png | grid | 288×48，16px，18×3（54 顆）|
| inventory | ui/inventory_blocks.png | grid | 144×144，16px，9×9 |
| btnSquare | ui/btn_square_26.png | grid | 96×192（狀態格，尺寸待 debug 核對）|
| dialogBox | ui/dialog_box.png | nine-slice | 48×48，border 16 |

> 標「待核對」者的精確 frame 尺寸與動畫行列順序，於 debug 頁目視確認後填入；player 的四向行序（down/up/left/right）以 debug 頁實際顯示為準。

### 3.3 純切片數學 — `src/game/sprites/frame.ts`

CLAUDE.md 指名要單元測試的「9-slice 計算」即在此。純函式、無副作用：

```ts
interface Rect { readonly sx: number; readonly sy: number; readonly sw: number; readonly sh: number }

// row-major；index 越界即丟錯（邊界驗證，不靜默吞錯）
function frameRect(sheet: GridSheet, index: number): Rect

// 回傳 9 個來源矩形（左上→右下），供 debug 與日後 M6 DialogBox 共用
function nineSliceRects(sheet: NineSlice): readonly Rect[]
```

### 3.4 素材複製 — `public/sprites/`

保留分類資料夾複製上述 11 檔：`public/sprites/{characters,tilesets,objects,ui}/`。committed 進版控、由 Vite 直接服務；`精選素材/` 維持為來源。不寫 sync 腳本（檔少，YAGNI）。

### 3.5 debug 檢視頁（React + canvas）

- `src/dev/SpriteCanvas.tsx`：載入 `src` 圖、`ctx.imageSmoothingEnabled = false`，用 `frameRect` 以**整數倍** `drawImage` 繪指定格（dest = src × scale）。處理圖片非同步載入與載入失敗。
- `src/dev/SpriteDebug.tsx`：分區呈現——主角四向待機/走路格、一塊草地、水 4 格、幾個 icon、dialog box（用 `nineSliceRects` 組裝成一個放大面板）。
- `src/App.tsx`：dev-only 切換 `import.meta.env.DEV && location.hash === '#sprites'` 時渲染 `<SpriteDebug/>`，否則維持現有畫面。不引入 react-router。production build 不含此頁。

## 四、檔案異動

新增：
- `src/game/sprites/types.ts`、`catalog.ts`、`frame.ts`
- `src/game/sprites/frame.test.ts`（Vitest）
- `src/dev/SpriteCanvas.tsx`、`src/dev/SpriteDebug.tsx`
- `public/sprites/**`（11 個複製檔）
- Vitest 設定（`vite.config.ts` 加 `test` 區段或 `vitest.config.ts`）、`package.json` 加 `vitest` devDep 與 `"test": "vitest run"` script

修改：
- `src/App.tsx`（dev-only debug 掛載）

## 五、錯誤處理與驗證邊界

- `frameRect` index 越界 → 丟明確錯誤（不回傳壞座標、不靜默）。
- `SpriteCanvas` 圖片載入失敗 → 顯示可見錯誤狀態，不靜默吞錯。
- catalog 的 src 路徑與尺寸是外部資料邊界，由 TypeScript 型別 + debug 頁目視雙重把關。

## 六、測試與驗收

依本專案 spec（非全面 80%）：
- **純邏輯單元測試**（Vitest）：`frameRect` 正確座標與越界丟錯、`nineSliceRects` 九格座標。
- **手動走查**：`npm run dev` → 開 `#sprites` debug 頁，核對主角四向、草地、水 4 格、icons、dialog box **無破圖、無模糊、無錯位**。

驗收標準（對應 roadmap）：
- [ ] `精選素材/` 核心集已進入 `public/sprites/` 並可載入。
- [ ] loader（catalog）對 player、grass、water、icons 等有正確切片定義（尺寸對得上 spec/README）。
- [ ] debug 頁無破圖、無模糊、無錯位。
- [ ] `npm test` 綠燈；`npm run build` tsc 通過且 debug 頁不進產物。

## 七、明確排除（YAGNI）

- 地圖組裝、autotile/bitmask 解算、相機（M3）。
- UI 9-slice **元件**本身（M6；M2 只提供切片數學）。
- 引擎格式轉換層（M3）。
- cow/chest/egg/fences/doors/hills/paths/bridge 等素材切片（之後里程碑按需補）。
- sync 腳本、credit 角落（M9）。
