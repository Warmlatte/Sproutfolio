## Context

M1 已完成 Vite + React + TS 外殼、字體與 design tokens，但 `public/sprites/` 仍空、程式中沒有任何素材切片座標。`精選素材/` 已備好分類好的核心圖檔（瓦片基準 16×16）。引擎選型（KAPLAY/Pixi）依 spec 留待 M3 決定，因此 M2 必須在「不綁引擎」的前提下，把素材座標釘死並可目視核對。單一事實來源：spec 第三節（素材規格）與 `精選素材/README.md`。

## Goals / Non-Goals

**Goals:**

- 把核心集 11 張素材複製進 `public/sprites/` 並可被 Vite 服務。
- 提供一份集中、引擎無關的切片定義（型別 + catalog），讓 M3–M7 以一致 key 取用座標。
- 提供純切片數學（含邊界驗證）並以輕量單元測試保護。
- 提供 dev-only 的切片核對檢視頁，整數倍渲染、無破圖/模糊/錯位。

**Non-Goals:**

- 地圖組裝、autotile/bitmask 解算、相機（M3）。
- 引擎格式轉換層（M3 選定引擎後才寫）。
- UI 9-slice 元件本身（M6；M2 只提供切片數學）。
- cow/chest/egg/fences/doors/hills/paths/bridge 等素材切片（後續里程碑按需補）。
- sync 腳本、credit 角落（M9）、production 可見的 debug 頁。

## Decisions

### 切片定義採引擎無關的中介資料

切片以純 TS 資料結構描述，不直接寫 KAPLAY `loadSprite` 格式。M3 選定引擎後再寫一層轉換把 catalog 映射成引擎格式。理由：spec 明訂引擎選型留 M3，提前綁定會違反里程碑邊界且增加返工風險。替代方案（直接寫 KAPLAY 格式）被否決，因為會在 M2 提前鎖死引擎。

### 切片型別使用 discriminated union（grid 與 nine-slice）

以 `kind` 欄位區分 `GridSheet`（frameW/H、cols/rows、選用 anims）與 `NineSlice`（width/height/border）。全部 `readonly`，更新一律回傳新物件（immutability）。理由：grid 與 9-slice 的座標計算本質不同，union 讓型別把關取用方式；相較單一寬鬆型別更安全。

### 純切片數學獨立成模組並以 Vitest 測試

`frameRect(sheet, index)` 與 `nineSliceRects(sheet)` 為無副作用純函式，index 越界即丟明確錯誤（邊界驗證、不靜默吞錯）。新增 Vitest（Vite 原生、輕量）跑這兩個函式的測試。理由：CLAUDE.md 指名「9-slice 計算」屬應單元測試的純邏輯；Vitest 與既有 Vite 工具鏈一致，非重型框架。

### 素材以複製方式進 public/sprites（不寫 sync 腳本）

把核心集 11 檔複製進 `public/sprites/{characters,tilesets,objects,ui}/`，committed 進版控、由 Vite 直接服務；`精選素材/` 維持為來源。理由：檔少（11 個），一次性複製最簡單；sync 腳本屬 YAGNI 彈性，不在本期建立。

### debug 檢視用 React + canvas、dev-only 以 #sprites hash 切換

`SpriteCanvas` 載入圖、關閉影像平滑、用 `frameRect` 以整數倍 `drawImage` 繪格；`SpriteDebug` 分區呈現主角四向/草地/水 4 格/icons/dialog box。`App.tsx` 僅在 `import.meta.env.DEV && location.hash === '#sprites'` 渲染，不引入 react-router、不進 production build。理由：與「引擎無關」一致，純驗證切片資料；hash 閘門零相依且自動排除於產物。替代方案（引擎場景）被否決，因為會提前引入引擎。

### 目錄命名為 src/game/sprites/ 而非 spec 字面的 loader.ts

M2 純描述切片、不載入、無引擎，叫 loader 名實不符；改用 `src/game/sprites/`（types/catalog/frame），把 `loader.ts` 留給 M3 真正的引擎載入層。此為對 spec 字面結構的明確偏離，已與使用者確認同意。

## Implementation Contract

**行為**：開發者執行 `npm run dev` 後在網址加上 `#sprites`，畫面顯示切片核對頁，分區呈現主角四向待機/走路格、一塊草地、水動畫 4 格、數個 icon、一個放大的 dialog box，全部以整數倍清晰渲染、無破圖/模糊/錯位；移除 hash 則回到原本畫面。production build 不含此頁。

**介面 / 資料形狀**：
- `SpriteSheet = GridSheet | NineSlice`（以 `kind` 區分）。
- `GridSheet`：`{ kind:'grid'; key; src; frameW; frameH; cols; rows; anims? }`，`anims` 為 `Record<string,{from;to;loop?}>`。
- `NineSlice`：`{ kind:'nine-slice'; key; src; width; height; border }`。
- catalog 匯出 `Record<string, SpriteSheet>`，本期 11 個 key：player、playerActions、grass、water、woodenHouse、plants、grassBiom、iconsAll、inventory、btnSquare、dialogBox。
- `frameRect(sheet: GridSheet, index: number): { sx; sy; sw; sh }`，row-major。
- `nineSliceRects(sheet: NineSlice): readonly Rect[]`，回傳 9 個來源矩形（左上→右下）。

**失敗模式**：`frameRect` 的 index 越界（<0 或 ≥ cols×rows）丟出明確錯誤訊息；`SpriteCanvas` 圖片載入失敗顯示可見錯誤狀態，皆不靜默吞錯。

**驗收**：
- `npm test`（Vitest）對 `frameRect`（正確座標 + 越界丟錯）與 `nineSliceRects`（九格座標）綠燈。
- `npm run build`：`tsc --noEmit` 通過，且產物不含 debug 頁。
- 手動：`#sprites` 頁目視核對上述五區無破圖/模糊/錯位；標「待核對」的精確 frame 尺寸與 player 四向行序於此頁確認後填入 catalog。

**範圍邊界**：In scope = 素材複製、切片型別、catalog（11 張）、純切片數學 + 測試、dev debug 頁、App.tsx dev 掛載、Vitest 設定。Out of scope = 見 Non-Goals。

## Risks / Trade-offs

- [部分 sheet 的 frame 尺寸/行序需目視確認（playerActions、btnSquare、player 行序）] → 以 debug 頁作為核對機制，確認後即填入 catalog；catalog 數值與圖檔尺寸由型別 + 目視雙重把關。
- [複製素材造成 repo 內與 `精選素材/` 重複] → 可接受；檔少且 `精選素材/` 為來源，未來更新以手動同步處理。
- [新增 Vitest 相依] → 為 Vite 原生輕量框架，與既有工具鏈一致，風險低。
- [debug 頁誤入 production] → 以 `import.meta.env.DEV` + hash 雙重閘門，並於驗收以 build 產物確認排除。
