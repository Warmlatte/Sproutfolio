## Why

M7 的網站 UI 疊層需要一套一致、可獨立預覽、與遊戲引擎解耦的 Sprout Lands 風格元件。目前 `src/ui/` 尚不存在，UI 元素無處可重用，也無法作為 P2 同步到 Claude Design 的對象。先固定一套元件 API 與 9-slice 渲染機制，能避免 M7 各面板各自詮釋造成風格不一致。

## What Changes

- 新增 `src/ui/` 純 React + Tailwind UI 元件庫，含 7 個元件：PixelButton、DialogBox、Panel、InventoryGrid、ProjectCard、ContactPanel、PixelIcon。
- 新增共用 `NineSlice` 基元，以 CSS `border-image` 統一渲染所有 9-slice 表面（角固定、邊與中心拉伸），各表面元件組合它而非各自重寫。
- 將像素數學抽成純函式做單元測試：sprite 切圖背景定位、nine-slice 的 border-image CSS 值、typewriter 揭字數。
- DialogBox 逐字打字（typewriter）：打字中點擊跳到結尾、完成後點擊觸發 onAdvance、尊重 prefers-reduced-motion。
- 新增 dev-only `#ui` 預覽頁（gallery），沿用既有 `#sprites` dev-gate 模式，展示各元件各狀態；作為 P2 design-sync 對象。
- 元件只使用 style-guide 的 semantic token 與 9-slice 素材，不寫死 hex、不用 border-radius、不用未列入的顏色。

## Non-Goals (optional)

- 不把元件接上實際內容或事件（M7 的 overlays 才做；本變更不建立 src/data/content.ts）。
- 不觸碰 canvas 遊戲世界、互動偵測（M7）。
- 不實際上傳 Claude Design（P2）。
- 不修改既有 design-tokens 或 pixel-typography 規格的需求；本變更僅消費它們。
- 不導入 Storybook 或重型測試框架（YAGNI）。
- 不釘死 btn_square_26 的 9-slice 切片值（catalog 標記待核對）；PixelButton 先以 dialog_box 表面為穩定後備。

## Capabilities

### New Capabilities

- `ui-component-library`: Sprout Lands 風格的自包含 React UI 元件庫——7 個元件、共用 NineSlice 基元、純函式像素數學、dev-only gallery 預覽，全部只用 semantic token 與 9-slice 素材且與遊戲引擎解耦。

### Modified Capabilities

(none)

## Impact

- Affected specs: 新增 ui-component-library
- Affected code:
  - New:
    - src/ui/spriteBackground.ts
    - src/ui/spriteBackground.test.ts
    - src/ui/nineSliceStyle.ts
    - src/ui/nineSliceStyle.test.ts
    - src/ui/typewriter.ts
    - src/ui/typewriter.test.ts
    - src/ui/useTypewriter.ts
    - src/ui/primitives/NineSlice.tsx
    - src/ui/primitives/PixelIcon.tsx
    - src/ui/Panel.tsx
    - src/ui/PixelButton.tsx
    - src/ui/DialogBox.tsx
    - src/ui/InventoryGrid.tsx
    - src/ui/ProjectCard.tsx
    - src/ui/ContactPanel.tsx
    - src/ui/index.ts
    - src/ui/gallery/UIGallery.tsx
  - Modified:
    - src/App.tsx
  - Removed: (none)
- Reused (read-only): src/game/sprites/catalog.ts、src/game/sprites/frame.ts、src/index.css 的 semantic token 與字體堆疊
