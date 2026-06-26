## Context

M7 的網站 UI 疊層需要一套一致、可獨立預覽、與遊戲引擎解耦的 Sprout Lands 風格元件，但 `src/ui/` 尚不存在。專案已具備可重用的基礎：`src/index.css` 的 Tailwind 4 `@theme` semantic token 與字體堆疊、`src/game/sprites/catalog.ts` 的素材座標、`src/game/sprites/frame.ts` 的純切片數學（frameRect / nineSliceRects），以及 `src/dev/SpriteDebug.tsx` 經 `#sprites` hash 掛載的 dev-only 預覽模式。

約束（單一事實來源 docs/style-guide.md）：只用 semantic token、禁止寫死 hex、禁止 border-radius、禁止未列入的顏色；16px 基準、整數倍縮放、image-rendering: pixelated；圓角邊框一律來自 9-slice 素材。測試環境為 vitest node-only（include 僅 src/**/*.test.ts），不導入 jsdom／testing-library／Storybook（YAGNI）。

## Goals / Non-Goals

**Goals**
- 7 個可獨立渲染、props 介面清楚的純 React 元件。
- 一個共用 NineSlice 基元統一 9-slice 渲染。
- 像素數學以純函式單元測試覆蓋。
- dev-only `#ui` gallery 展示各元件各狀態，作為 design-sync 對象。

**Non-Goals**
- 不接實際內容／事件（M7）；不建立 src/data/content.ts。
- 不觸碰 canvas 遊戲世界與互動偵測（M7）。
- 不上傳 Claude Design（P2）。
- 不修改 design-tokens／pixel-typography 規格需求，只消費。
- 不導入 Storybook／重型測試框架。

## Decisions

**D1：9-slice 用 CSS border-image，而非 canvas 或九宮格 div。**
理由：實際 UI 元件（Panel／DialogBox）必須包住 DOM 子元素（文字、按鈕），canvas 無法容納 DOM。border-image 單一元素、可自然包子元素、最易維護；整數倍 border-image-width + pixelated 維持像素精度。替代方案：九宮格 div（逐格 pixelated 控制最精細但 DOM 較重）保留為特定元件破圖時的局部後備。

**D2：共用 NineSlice 基元，各表面元件組合它。**
理由：border-image + 整數縮放 + pixelated 邏輯只寫一次；Panel／DialogBox／PixelButton／ContactPanel 組合 NineSlice 而非各自重寫。回應「元件組合方式」的 API 契約開放問題。替代方案：每個元件各自寫 9-slice（重複、易漂移），否決。

**D3：像素數學抽成純函式（.ts）做 TDD，元件本身用 gallery 目視 + tsc 把關。**
理由：vitest 為 node-only、無 jsdom，且專案規範視覺→手動驗證。spriteBackground、nineSliceStyle、revealedCount 皆可在 node 測；React 元件不寫單元測試。替代方案：加 jsdom／testing-library 測元件（違反 YAGNI），否決。

**D4：DialogBox 採基本 typewriter + 點擊跳結尾。**
理由：最常見的對話框體感，符合 demo 需求。打字中點擊→秒顯全文；完成後點擊→onAdvance；prefers-reduced-motion→直接全顯。替代方案：純逐字（無跳過，體驗差）、完整對話分支系統（屬 M7，過重），皆否決。

**D5：PixelButton 表面先用 dialog_box 9-slice，不釘 btn_square_26。**
理由：catalog 標記 btn_square_26 版面待核對；dialog_box 為 spec 釘住的穩定 9-slice。variant 以 semantic token 控制面色。切換素材的點集中於 PixelButton 內的 ASSET／SLICE 常數，日後核對後可單點替換。

## Implementation Contract

**新增模組與可觀察行為：**

- `spriteBackground(sheet: GridSheet, index: number, scale: number): SpriteBackgroundStyle` — 純函式。回傳 { width, height, backgroundImage, backgroundPosition, backgroundSize, imageRendering }。scale 非正整數或 index 越界時 throw RangeError。驗收：iconsAll index 0 / scale 2 → position '0px 0px'、size '576px 96px'；index 1 → '-32px 0px'；index 18 → '0px -32px'。
- `nineSliceStyle(asset: string, slice: number, scale: number): NineSliceCssStyle` — 純函式。回傳 border-image 相關 CSS。slice／scale 非正整數時 throw RangeError。驗收：slice 16 / scale 2 → borderWidth '32px'、borderImageSlice '16 fill'。
- `revealedCount(elapsedMs: number, speedMs: number, total: number): number` — 純函式。speedMs<=0 或 elapsed 足夠→total；elapsed<=0→0；否則 floor(elapsed/speed) 夾在 [0,total]。
- `useTypewriter(text, speed=30): { shown, isDone, skip }` — hook，用 rAF 推進 revealedCount；prefers-reduced-motion 時立即完成；text 變更時重置。
- `NineSlice(props)` — props { asset, slice, scale=2, as='div'|'button', className?, onClick?, disabled?, children }。唯一套用 border-image 之處。
- `PixelIcon(props)` — { index, scale=2, label? }；label 有則 role=img+aria-label，無則 aria-hidden。
- `Panel(props)` — { children, padding='sm'|'md'|'lg'(預設 md), className? }；padding 對應 8/16/24。
- `PixelButton(props)` — { children, onClick?, variant='primary'|'secondary'(預設 primary), iconIndex?, disabled? }；hover/active/disabled 用 token，按下 1px 位移。
- `DialogBox(props)` — { text, speakerName?, speed=30, onAdvance? }；打字中點擊跳結尾、完成後點擊 onAdvance。
- `InventoryGrid(props)` — 展示型。{ items: ReadonlyArray<InventoryItem|null>, columns, selectedIndex?, onSelect? }；只回呼，不持有選取狀態。
- `ProjectCard(props)` — { title, description, tags?, thumbnailUrl?, href? }；href 存在則整卡外開連結（target=_blank rel=noopener）。
- `ContactPanel(props)` — { links: ReadonlyArray<{ iconIndex, label, href }> }；每連結外開。
- `src/ui/index.ts` — barrel re-export 所有元件與型別。
- `src/ui/gallery/UIGallery.tsx` + `src/App.tsx` 加 `#ui` 路由（沿用 SpriteDebug lazy dev-gate；不入 production）。

**驗收（對應 roadmap）：**
- 7 元件可獨立渲染、props 清楚。
- grep src/ui 無寫死 hex、無 border-radius、無 Tailwind rounded。
- DialogBox typewriter 可運作（含跳結尾、reduced-motion）；9-slice 縮放不破圖。
- `#ui` gallery 完整呈現各元件各狀態。
- npm test 通過（含三個純函式測試）、npm run build 通過。

**範圍邊界：** 僅 src/ui/ 新檔 + src/App.tsx 路由一處。不改 src/game/、不改 src/index.css、不改既有測試。

## Risks / Trade-offs

- [btn_square_26 版面待核對，PixelButton 邊框可能不符預期] → 先用 dialog_box 穩定後備，切換點集中於常數；gallery 目視確認後再替換。
- [border-image 邊緣 stretch 在極端比例下可能模糊] → 維持整數倍 border-image-width；必要時改 round 並於 gallery 比對。
- [border-image 無法逐格 pixelated 控制，理論精度略低於九宮格 div] → 整數縮放下實測可接受；特定元件破圖時可局部改九宮格 div（D1 已保留）。
- [Tailwind padding p-2/p-4/p-6 對應 8/16/24 依賴 16px 根字級] → 專案字級採整數倍，根字級為預設 16px，成立；若日後改根字級需同步檢查。

## Migration Plan

無資料遷移。純新增 src/ui/ 與 src/App.tsx 一處路由；dev-only gallery 不影響 production。實作依 tasks.md 由純函式 → 基元 → 元件 → barrel／驗收，逐 task commit；可隨時中止而不影響既有 M1–M5 功能。
