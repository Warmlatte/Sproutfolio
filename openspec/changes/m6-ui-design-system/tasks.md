## 1. 純函式：sprite 切圖背景

- [x] 1.1 在 src/ui/spriteBackground.ts 實作 `spriteBackground(sheet, index, scale)`，回傳 grid 切圖的 CSS background 樣式；scale 非正整數或 index 越界時 throw RangeError。驗證：src/ui/spriteBackground.test.ts 覆蓋 iconsAll index 0/1/18 @ scale 2 的 backgroundPosition／backgroundSize 與錯誤情境，`npx vitest run src/ui/spriteBackground.test.ts` 通過。對應需求：Sprite-sheet cell background computation。

## 2. 純函式：nine-slice CSS 值

- [x] 2.1 在 src/ui/nineSliceStyle.ts 實作 `nineSliceStyle(asset, slice, scale)`，回傳 border-image 相關 CSS（`<slice> fill`、stretch、整數倍 border-width）；slice／scale 非正整數時 throw RangeError。驗證：src/ui/nineSliceStyle.test.ts 覆蓋 slice 16 @ scale 2 與錯誤情境，`npx vitest run src/ui/nineSliceStyle.test.ts` 通過。對應需求：Nine-slice CSS value computation。

## 3. Gallery 骨架與路由

- [x] 3.1 建立 src/ui/gallery/UIGallery.tsx（export `UIGallery` 與可重用的 `GallerySection`）並在 src/App.tsx 加 `#ui` hash 路由，沿用既有 SpriteDebug 的 dev-only lazy 掛載。行為：dev 模式下 location.hash 為 `#ui` 時渲染 gallery 頁。驗證：`npx tsc --noEmit` 通過，`npm run dev` 開 #ui 顯示標題頁且 console 無錯。對應需求：Dev-only component gallery。

## 4. NineSlice 基元

- [x] 4.1 在 src/ui/primitives/NineSlice.tsx 實作 `NineSlice`（組合 nineSliceStyle，支援 as='div'|'button'、onClick、disabled、children），並在 UIGallery 加 NineSlice 區段（scale 2／3）。行為：唯一套用 border-image 之處，子元素落在中心、邊框不破圖。驗證：`npx tsc --noEmit` 通過，#ui 目視角不變形、邊隨內容拉伸、整數縮放清晰。對應需求：Shared nine-slice surface primitive。

## 5. PixelIcon 基元

- [x] 5.1 在 src/ui/primitives/PixelIcon.tsx 實作 `PixelIcon`（用 spriteBackground 由 catalog.iconsAll 切圖，label 控制 aria），並在 UIGallery 加取樣區段。行為：單一 span 顯示指定 index 的 16px 圖示，可嵌入文字。驗證：`npx tsc --noEmit` 通過，#ui 目視 index 1 較 0 右移一格、index 18 為第二列首格。

## 6. Panel 元件

- [x] 6.1 在 src/ui/Panel.tsx 實作 `Panel`（組合 NineSlice，padding sm/md/lg 對應 8/16/24），並在 UIGallery 加三種 padding 區段。行為：通用木色 9-slice 容器，內容不壓到邊框美術。驗證：`npx tsc --noEmit` 通過，#ui 目視三面板內距遞增。

## 7. PixelButton 元件

- [x] 7.1 在 src/ui/PixelButton.tsx 實作 `PixelButton`（組合 NineSlice as=button，variant primary/secondary 以 semantic token 控面色，iconIndex 前置 PixelIcon，hover/active/disabled 狀態，按下 1px 位移；表面用 dialog_box 穩定後備、切換點集中於 ASSET/SLICE 常數），並在 UIGallery 加各狀態區段。行為：可點按鈕，hover 變色、按下位移、disabled 不可點。驗證：`npx tsc --noEmit` 通過，#ui 目視四顆按鈕各狀態正確、木框不破圖。

## 8. 純函式：typewriter 揭字數

- [x] 8.1 在 src/ui/typewriter.ts 實作 `revealedCount(elapsedMs, speedMs, total)`（speedMs<=0→total、elapsed<=0→0、否則 floor(elapsed/speed) 夾在 [0,total]）。驗證：src/ui/typewriter.test.ts 覆蓋 elapsed 0/95/大值/負值與 speed 0，`npx vitest run src/ui/typewriter.test.ts` 通過。對應需求：Typewriter character reveal。

## 9. useTypewriter hook

- [x] 9.1 在 src/ui/useTypewriter.ts 實作 `useTypewriter(text, speed=30)`（用 requestAnimationFrame 推進 revealedCount，提供 skip()，prefers-reduced-motion 立即完成，text 變更時重置），回傳 { shown, isDone, skip }。行為：逐字推進文字、可跳到全文、尊重減少動態。驗證：`npx tsc --noEmit` 通過（行為於 Task 10 的 DialogBox gallery 目視）。

## 10. DialogBox 元件

- [x] 10.1 在 src/ui/DialogBox.tsx 實作 `DialogBox`（組合 NineSlice + useTypewriter，打字中點擊跳結尾、完成後點擊 onAdvance、可選 speakerName），並在 UIGallery 加區段。行為：文字逐字出現帶游標；點擊跳結尾，再點觸發 onAdvance；reduced-motion 直接全顯。驗證：`npx tsc --noEmit` 通過，#ui 目視逐字／跳過／advance 流程正確。

## 11. InventoryGrid 元件

- [x] 11.1 在 src/ui/InventoryGrid.tsx 實作展示型 `InventoryGrid`（格底用 catalog.inventory 切片背景，填充格疊 PixelIcon，null 為空格，只回呼 onSelect(index) 不持有選取狀態，selectedIndex 由呼叫端給），並在 UIGallery 加區段。行為：渲染 N 欄格子、混合填充與空格、標示 selectedIndex、點擊回呼。驗證：`npx tsc --noEmit` 通過，#ui 目視填充/空格/選取並存且點擊 console 印出 index。對應需求：Presentational inventory grid。

## 12. ProjectCard 元件

- [x] 12.1 在 src/ui/ProjectCard.tsx 實作 `ProjectCard`（組合 Panel，title/description/tags/thumbnailUrl/href；href 存在則整卡為 target=_blank rel=noopener 外開連結），並在 UIGallery 加有連結/無連結區段。行為：呈現專案卡內容，有 href 時整卡可點外開。驗證：`npx tsc --noEmit` 通過，#ui 目視兩張卡欄位齊全、連結卡外開新分頁。對應需求：External links open safely。

## 13. ContactPanel 元件

- [x] 13.1 在 src/ui/ContactPanel.tsx 實作 `ContactPanel`（組合 Panel + PixelIcon，links[{iconIndex,label,href}] 每列為 target=_blank rel=noopener 外開連結，色用 --link），並在 UIGallery 加區段。行為：面板內帶圖示連結列，點擊外開。驗證：`npx tsc --noEmit` 通過，#ui 目視連結列正確且外開新分頁。

## 14. Barrel export 與驗收

- [x] 14.1 建立 src/ui/index.ts 統一 re-export 七個元件、useTypewriter 與其 props 型別。驗證：`npx tsc --noEmit` 通過。對應需求：Component library public surface。
- [x] 14.2 驗收掃描：`grep -rnE "#[0-9A-Fa-f]{3,6}\b|border-radius|rounded" src/ui` 無命中；`npm test` 全數通過（含三個純函式測試）；`npm run build` 成功且 gallery 不進 production chunk；#ui 逐段走查七元件各狀態皆正確、9-slice 不破圖。對應需求：Component library uses semantic tokens and 9-slice assets only。
