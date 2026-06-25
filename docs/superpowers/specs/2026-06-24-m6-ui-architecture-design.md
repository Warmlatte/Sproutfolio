# M6 UI 設計系統 — Part 1：架構與共用基元

> 來源：`docs/roadmap/M6-ui-design-system.md`、`docs/style-guide.md`、spec 第五節（`src/ui/`）／第九節（Claude Design 同步）。
> 本文件為 M6 設計的第一部分（架構）；元件 props 介面見 [Part 2](./2026-06-24-m6-ui-component-api-design.md)。

## 範圍

打造一套自包含的 Sprout Lands 風格 React + Tailwind UI 元件庫（`src/ui/`），純 React（無 pixi/遊戲引擎相依），是網站 UI 疊層真正使用的元件，且可獨立預覽，並作為 P2 同步到 Claude Design 的對象。

本文件只定義**架構、檔案結構與共用基元**，不含各元件的 props 細節。

## 已確認的基礎決策（brainstorming）

| 決策 | 選擇 | 理由 |
|---|---|---|
| 9-slice 渲染技術 | **CSS `border-image`** | 單一元素、可自然包住 DOM 子元素（文字／按鈕），最易維護；整數縮放 + `image-rendering: pixelated` 維持像素精度。現有 `SpriteDebug` 的 canvas 9-slice 無法容納 DOM 子元素，故 UI 元件改用 border-image。 |
| 預覽頁 | **自製 gallery（沿用 `#sprites` 模式）** | 零新依賴、符合 YAGNI；純 React 元件可直接 design-sync。新增 `#ui` hash 路由。Storybook 與 YAGNI 衝突且非 design-sync 對象，不採用。 |
| DialogBox 打字 | 基本逐字打字 + 點擊跳到結尾 | 見 Part 2。 |

## 檔案結構

全部新檔進 `src/ui/`，純 React（無 pixi/引擎相依，這是能 design-sync 的前提）：

```
src/ui/
├── primitives/
│   ├── NineSlice.tsx      ← 共用 9-slice 表面基元（border-image）
│   └── PixelIcon.tsx      ← 由 icons_all 切圖（index 定位）
├── PixelButton.tsx
├── DialogBox.tsx
├── Panel.tsx
├── InventoryGrid.tsx
├── ProjectCard.tsx
├── ContactPanel.tsx
├── useTypewriter.ts       ← DialogBox 用的逐字 hook（純邏輯，可單元測試）
└── index.ts               ← barrel export
src/ui/gallery/UIGallery.tsx  ← #ui 預覽頁（沿用 SpriteDebug 的 Section 模式）
```

- 程式進 `src/`，不在根目錄散落檔案。
- `index.ts` 統一 re-export 所有元件與型別。
- gallery 經 `App.tsx` 的 hash 路由掛載（`#ui`），與既有 `#sprites` dev gate 同模式；僅 dev，不入 production 輸出。

## 核心決策：共用 `<NineSlice>` 基元

回應 roadmap 的開放問題「元件 props 命名與組合方式（給 design 代理的 API 契約）」。

`Panel`、`DialogBox`、`PixelButton`、`ContactPanel` 的圓角邊框**全部來自同一個 `<NineSlice>` 基元**，差別只在傳入的素材與切片參數。9-slice 的 `border-image` + 整數縮放 + `pixelated` 邏輯只寫一次，各元件**組合**它而非各自重寫。

```tsx
interface NineSliceProps {
  asset: string      // e.g. '/sprites/ui/dialog_box.png'
  slice: number      // 角切片 px（dialog_box = 16）
  scale?: number     // 整數倍，預設 2
  as?: 'div' | 'button'
  className?: string
  children: React.ReactNode
}
```

實作要點：

- `border-image: url() <slice> fill` + `border-image-repeat: stretch`（角固定、邊／中拉伸）。
- `border-image-width` = `slice × scale` px，確保整數倍、像素清晰。
- 素材 URL 與 slice 透過 CSS 變數注入，方便 Tailwind class 控制內距。
- 容器 `image-rendering: pixelated`（已於 `index.css` 全域設定 img/canvas，必要時於元件補上）。

## 與既有程式的關係

- **重用** `src/game/sprites/frame.ts` 的純切片數學（`frameRect`、`nineSliceRects`）與 `catalog.ts` 的素材座標（`iconsAll` 18×3、`inventory` 9×9、`dialogBox` 48×48/border 16）。這些已是 engine-agnostic，可直接被 `PixelIcon` 等取用座標。
- **重用** `index.css` 既有的 `@theme` semantic token 與字體堆疊（Tailwind 4，無 `tailwind.config.ts`）。元件只用 semantic token，不寫死 hex、不用 `border-radius`、不用未列入 style-guide 的顏色。

## 風格鐵則（沿用 style-guide.md）

- UI 元件**只使用 semantic token**（`--surface`、`--text`、`--accent`…）。
- 像素規範：16px 基準、整數倍縮放、`image-rendering: pixelated`、像素字體關閉抗鋸齒。
- 圓角／邊框一律來自 9-slice 素材，不用 CSS `border-radius`。
- 動態：UI 過場 100–150ms、可用 `steps()`；尊重 `prefers-reduced-motion`。

## 不在範圍

- 元件接上實際內容／事件（M7 的 overlays 才做）。
- canvas 遊戲、互動偵測（M7）。
- 實際上傳 Claude Design（P2）。

## 後續

- 各元件 props 介面 → [Part 2：元件 API 契約](./2026-06-24-m6-ui-component-api-design.md)。
- 9-slice／token 機制細節、gallery、測試與風險 → Part 3（待補）。
