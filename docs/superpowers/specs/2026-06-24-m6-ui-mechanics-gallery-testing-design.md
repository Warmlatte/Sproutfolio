# M6 UI 設計系統 — Part 3：9-slice／token 機制、gallery、測試與風險

> 來源：`docs/roadmap/M6-ui-design-system.md`、`docs/style-guide.md`。
> 架構見 [Part 1](./2026-06-24-m6-ui-architecture-design.md)；元件 API 見 [Part 2](./2026-06-24-m6-ui-component-api-design.md)。
> 本文件定義實作機制、預覽頁、測試策略、風險與驗收標準。

## 1. 9-slice 機制（`border-image`）

`<NineSlice>` 是唯一實作 9-slice 的地方，各表面元件組合它。

- **CSS**：`border-image: url(<asset>) <slice> fill` + `border-image-repeat: stretch`。
  - `fill` 保留中央填充（面板底色），角固定、邊與中央拉伸。
  - `border-image-width: <slice × scale>px`，`border-image-slice: <slice>`。
- **整數縮放**：`scale` 必為正整數（預設 2）；`border-image-width` 取整數倍 px，避免模糊。
- **像素渲染**：容器 `image-rendering: pixelated`（已於 `index.css` 全域對 img/canvas 設定，元件容器補上以涵蓋 border-image）。
- **內距**：實際內容區 padding 取自間距階（8 / 16 / 24），透過 Tailwind class 套用於 `<NineSlice>` 的 children wrapper，與 border-image 邊框分離，避免文字壓到邊框美術。

### 素材對照（asset mapping）

| 元件 / 用途 | 素材 | 尺寸 / 切片 | 來源確認 |
|---|---|---|---|
| `DialogBox`、`Panel` | `/sprites/ui/dialog_box.png` | 48×48，slice 16 | spec 釘住 ✅ |
| `PixelButton` 面 | `/sprites/ui/btn_square_26.png` | 32×32／3×6，slice 待測 | ⚠️ `待核對`（見風險） |
| `PixelIcon` | `/sprites/ui/icons_all.png` | 18×3，16px／格（54 格） | catalog ✅ |
| `InventoryGrid` 格底 | `/sprites/ui/inventory_blocks.png` | 9×9，16px／格 | catalog ✅ |

> 座標一律取自 `src/game/sprites/catalog.ts`，不另行硬編。`PixelIcon`／`InventoryGrid` 的切片數學重用 `frame.ts` 的 `frameRect`。

## 2. Token 取用

- 只用 `index.css` `@theme` 既有 semantic token（Tailwind 4 utility：`bg-surface`、`text-text`、`border-border`、`bg-accent`…）。
- 字級用 `text-pixel-sm/base/lg/xl`（11px 整數倍），字體用 `font-pixel`／`font-decorative`。
- 新增顏色需求 → 先更新 `docs/style-guide.md`（從官方 ramp 取色）→ 再於 `index.css @theme` 映射 → 元件才使用。M6 預期不需新色。

## 3. 預覽頁 `UIGallery`（`#ui`）

- `App.tsx` 新增 hash 路由：`#ui → <UIGallery>`，沿用既有 `#sprites` 的 dev-only lazy-import + gate 模式，不入 production 輸出。
- 沿用 `SpriteDebug` 的 `Section` 版面模式：每個元件一個 Section，展示**各狀態**：
  - `PixelButton`：primary／secondary × normal／hover／active／disabled、含 icon／不含 icon。
  - `DialogBox`：逐字打字進行中、含名牌、點擊跳到結尾、完成態。
  - `Panel`：三種 padding。
  - `InventoryGrid`：含物品／空格／選取態。
  - `ProjectCard`：含 thumbnail／tags／可點與不可點。
  - `ContactPanel`：多個連結。
  - `PixelIcon`：列舉若干 index 取樣。
- gallery 為純 React 元件樹，作為 P2 `/design-sync` 的對象。

## 4. 測試策略（依本專案 spec，非全面 80%）

- **純邏輯 → 輕量單元測試（Vitest）**：
  - `useTypewriter(text, speed)`：逐字推進、`skip()` 秒顯全文、`isDone` 轉態、空字串邊界。
  - `PixelIcon`／`InventoryGrid` 的 index→背景位置計算（重用 `frameRect`，已有測試覆蓋切片數學）。
- **視覺 / 像素精度 → gallery 目視驗證**：9-slice 不破圖、整數縮放清晰、各狀態正確、`btn_square` slice 值確認。
- 不導入重型測試框架（YAGNI）；不對純視覺結果寫快照測試。

## 5. 風險與待核對

| 風險 | 影響 | 緩解 |
|---|---|---|
| `btn_square_26` 版面 `待核對`（frame 尺寸／slice 邊框） | `PixelButton` 邊框可能破圖或比例不對 | 先在 gallery 目視確認 slice 值再釘進元件；必要時退而用 `dialog_box` 風格面 + `--accent` 填色。確認後更新 catalog 註解。 |
| `border-image` 邊緣 `stretch` 在非預期比例下模糊 | 長按鈕／寬面板邊緣可能糊 | 維持整數倍 `border-image-width`；如 `stretch` 不理想，改 `round`（需在 gallery 比對）。 |
| `border-image` 無法逐格 `pixelated` 控制 | 理論上像素精度略低於九宮格 div | 整數縮放下實測可接受；若特定元件破圖，該元件可局部改用九宮格 div（Part 1 已允許混合）。 |

## 6. 驗收標準（對齊 roadmap）

- [ ] 7 個元件皆可獨立渲染、props 介面清楚（見 Part 2）。
- [ ] 樣式僅用 semantic token 與 9-slice；grep 不到寫死 hex／`border-radius`。
- [ ] `DialogBox` 逐字打字可運作（含點擊跳結尾、`prefers-reduced-motion`）；9-slice 縮放不破圖。
- [ ] `#ui` gallery 完整呈現各元件各狀態。
- [ ] `useTypewriter` 等純邏輯有單元測試且通過。
- [ ] 元件與遊戲引擎解耦（純 React），可作 design-sync 對象。

## 7. 授權標註（散布時必附）

```
Assets - From: Sprout Lands - By: Cup Nooble — https://cupnooble.itch.io/sprout-lands-asset-pack (非商業)
Font: Cubic 11 (俐方體11號) by ACh-K — SIL OFL 1.1 — https://github.com/ACh-K/Cubic-11
```
