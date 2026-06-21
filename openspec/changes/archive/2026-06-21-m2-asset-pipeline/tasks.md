## 1. 素材複製到 public/sprites

- [x] 1.1 採「素材以複製方式進 public/sprites（不寫 sync 腳本）」，把核心集 11 張圖複製進 `public/sprites/` 的 characters/tilesets/objects/ui 分類，達成 Curated assets served from public/sprites。驗證：dev server 取 `/sprites/tilesets/water.png` 為原始 64×16；確認 cow/chest/egg/fences/doors/hills/paths/bridge 不在 `public/sprites/`。

## 2. 切片型別與 catalog

- [x] 2.1 依「目錄命名為 src/game/sprites/ 而非 spec 字面的 loader.ts」與「切片型別使用 discriminated union（grid 與 nine-slice）」，在 `src/game/sprites/types.ts` 定義 readonly 的 `SpriteSheet`（以 `kind` 區分 grid/nine-slice），作為 Engine-agnostic sprite slice catalog 的型別基礎。驗證：`tsc --noEmit` 通過，grid 與 nine-slice 欄位符合 design Implementation Contract。
- [x] 2.2 依「切片定義採引擎無關的中介資料」在 `src/game/sprites/catalog.ts` 建立 Engine-agnostic sprite slice catalog，以 11 個邏輯 key 描述各 sheet 的 src/frame 尺寸/格數/anims（player 為 4×4 的 48px grid、dialogBox 為 border16 的 nine-slice）。驗證：catalog 含 11 個 key；player 與 dialogBox 條目符合 spec 對應 scenario；標「待核對」項於 debug 頁確認後填入。

## 3. 純切片數學與測試

- [x] 3.1 依「純切片數學獨立成模組並以 Vitest 測試」，在 `src/game/sprites/frame.ts` 實作 Frame rectangle computation with bounds validation 的 `frameRect`（row-major 計算、index 越界丟明確錯誤、不靜默）。驗證：Vitest 覆蓋 4×4/48px 與 4×1/16px 表格案例（含 -1 與越界丟錯）綠燈。
- [x] 3.2 在 `src/game/sprites/frame.ts` 實作 Nine-slice rectangle computation 的 `nineSliceRects`（回傳九格、row-major、角落 border×border）。驗證：Vitest 對 48×48 border16 的角落與中心座標綠燈。
- [x] 3.3 落實「純切片數學獨立成模組並以 Vitest 測試」的工具鏈：新增 `vitest` devDependency、`vite.config.ts` test 設定與 `package.json` 的 `"test": "vitest run"`。驗證：`npm test` 可執行並通過 3.1/3.2 測試。

## 4. dev 切片核對檢視頁

- [x] 4.1 依「debug 檢視用 React + canvas、dev-only 以 #sprites hash 切換」，在 `src/dev/SpriteCanvas.tsx` 以 canvas（`imageSmoothingEnabled=false`）用 `frameRect` 整數倍 `drawImage` 繪格，圖片載入失敗顯示可見錯誤狀態。驗證：`#sprites` 頁畫面清晰無模糊；給錯誤 src 時顯示錯誤而非靜默。
- [x] 4.2 在 `src/dev/SpriteDebug.tsx` 組裝 Dev-only sprite debug viewer 的五區（主角四向、一塊草地、水 4 格、數個 icon、由 `nineSliceRects` 組裝的 dialog box）。驗證：手動目視五區無破圖、無錯位。
- [x] 4.3 在 `src/App.tsx` 以 `import.meta.env.DEV && location.hash === '#sprites'` 掛載 Dev-only sprite debug viewer，不引入 react-router。驗證：有 `#sprites` 顯示檢視頁、無 hash 回原畫面、`npm run build` 產物不含 debug 頁。
