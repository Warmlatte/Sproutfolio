# Sproutfolio — M1 專案骨架、設計 Tokens 與 Git 初始化（設計文件）

> 日期：2026-06-20
> 來源 roadmap：`docs/roadmap/M1-scaffold-and-tokens.md`
> 單一事實來源：`docs/style-guide.md`（tokens/字體/像素規範）、spec 第五節（技術棧/結構）
> 狀態：已通過 brainstorming 決策，待轉成實作計畫（writing-plans）

## 0. 本文件範圍

本設計在原 M1 roadmap（Vite + React + TS + Tailwind 骨架與設計 token）之上，**外加**使用者指定的三件事：

1. 為專案取定英文名 **Sproutfolio**，資料夾與遠端 repo 皆改為此名。
2. 在本資料夾**全新初始化 git**（不保留既有歷史）。
3. 建立 **public** 的 GitHub 遠端 repo 並推送。

### 已定案決策（brainstorming 結論）

| 決策 | 選擇 |
|---|---|
| 專案英文名 / repo 名 | **Sproutfolio**（資料夾 `sproutfolio`、repo `sproutfolio`） |
| Tailwind | **v4，CSS-first（`@theme`）** |
| Git 歷史 | **全新初始化**，以目前狀態做第一個 commit |
| Repo 可見性 | **Public**（owner：`Warmlatte`） |
| 上層 `622 Personal Blog/.git` | **刪除**（連同上層版控一併退場） |
| `.gitignore` 忽略規則 | **保留現有規則**，僅追加工具產物（node_modules/dist/.DS_Store…） |

## 1. 目標

建立一個可 `npm run dev` 啟動、`npm run build` 成功的 Vite + React + TypeScript + Tailwind v4 外殼，並把 `style-guide.md` 的 semantic 設計 token、像素字體（Cubic 11 / Sprout Lands）、像素渲染規範全部接好；同時讓本資料夾成為**自包含、已推上 GitHub 的獨立 public repo（`sproutfolio`）**，作為後續所有 UI/遊戲區塊的一致基礎。

## 2. 現況盤點（為何需要清理）

- 真正的 git repo root 目前在**上層** `622 Personal Blog/`（含 5 個歷史 commit）；`PersonalWeb/` 是其下被搬動過的子資料夾，導致 `git status` 把 `AGENTS.md`、`docs/`、`精選素材/` 等顯示為 deleted（路徑錯位）。
- `PersonalWeb/.git/` **不是 git repo**，而是 Spectra 的資料庫殼：內含 `spectra-app/spectra.db`、`.migrate.lock`、`.migrated`。它與 `git init` 將使用的 `.git` **撞名**，必須先處理。
- `PersonalWeb/.gitignore` 目前忽略：`.spectra/`、`openspec/.vector-search.db*`、`docs/`、`CLAUDE.md`、`AGENTS.md`、`精選素材`。**這些忽略規則是正確的、要保留**——公開 repo 只含程式碼與 `public/` 內已部署素材，內部文件/指令/素材策展夾維持本機私有。
- `gh` 已登入帳號 **Warmlatte**，具建立 repo 權限。

## 3. 實作階段（依序，前置先行）

### Phase A — 清理 Git 與 Spectra 撞名（最先、需逐步驗證）

> 原則：**先驗證再刪除**，不莽撞刪資料；openspec 規格本身是檔案，`.db` 僅為索引快取，最壞情況可重建。

1. 將 `PersonalWeb/.git/spectra-app/`（含 `spectra.db`、`.migrate.lock`、`.migrated`）整包**搬移**到非撞名的暫存路徑。
2. 確認 Spectra 仍可運作：執行 `spectra list` 等指令驗證能讀到既有 changes/specs；若 db 路徑需調整，更新 Spectra 設定或重建索引（從 `openspec/` 檔案）。
3. 驗證通過後，刪除已清空的 `PersonalWeb/.git/` 殼。
4. **刪除上層 `622 Personal Blog/.git`**（使上層退出版控；上層 `.gitignore` 失去作用，保留檔案不動）。

**驗收**：`PersonalWeb/` 內無殘留 `.git`，Spectra 指令正常，`622 Personal Blog/` 不再是 git repo。

### Phase B — 資料夾改名

1. 將資料夾 `PersonalWeb` 改名為 **`sproutfolio`**（最終路徑 `622 Personal Blog/sproutfolio/`）。
2. 後續所有指令、工作目錄以新路徑為準。

> 註：改名在 git 初始化之前完成，避免改名造成的歷史雜訊。

### Phase C — Git 全新初始化、.gitignore、首個 commit、遠端

1. 在 `sproutfolio/` 執行 `git init`，預設分支 `main`。
2. **重寫 `.gitignore`**——保留現有忽略規則，追加工具產物：

   ```gitignore
   # Spectra / OpenSpec（保留）
   .spectra/
   openspec/.vector-search.db*

   # 內部文件與素材策展（保留：公開 repo 不含這些）
   docs/
   CLAUDE.md
   AGENTS.md
   精選素材

   # 工具產物（追加）
   node_modules/
   dist/
   .DS_Store
   *.local
   .vite/
   ```

3. `git add -A` 後做**首個 commit**（型別 `chore`），捕捉目前可追蹤狀態（腳手架 + `public/` 素材 + `openspec/` + `.spectra.yaml` + `README.md`）。
4. 建立遠端並推送：

   ```bash
   gh repo create Warmlatte/sproutfolio --public --source=. --remote=origin --push
   ```

**驗收**：`git remote -v` 指向 `Warmlatte/sproutfolio`，`main` 已推送；`git status` 乾淨；被忽略的 `docs/`、`CLAUDE.md`、`AGENTS.md`、`精選素材` 確實不在追蹤中。

### Phase D — Vite + React + TS 腳手架（建在 `sproutfolio/` 根目錄）

1. 以 Vite `react-ts` 範本初始化於現有資料夾（與既有 `docs/`、`精選素材/`、`openspec/`、`.spectra.yaml` 共存，不覆蓋）。
2. 產出 `package.json`、`index.html`、`vite.config.ts`、`tsconfig*.json`、`public/`、`src/`。
3. `vite.config.ts`：先**不設 `base`**（GitHub Pages base 留 M10）。
4. `src/` 先建最小集合：`main.tsx`、`App.tsx`、`constants.ts`、`index.css`。
5. `src/constants.ts` 放像素常數雛形：

   | 常數 | 值 | 說明 |
   |---|---|---|
   | `TILE_SIZE` | `16` | 基準瓦片 px |
   | `WORLD_SCALE` | `3` | 世界整數倍縮放 |
   | `UI_SCALE` | `2` | UI 整數倍縮放（2–3×） |

**驗收**：`npm run dev` 啟動、`npm run build` 成功。

### Phase E — Tailwind v4（CSS-first）+ 設計 Token

1. 安裝 Tailwind v4 與 `@tailwindcss/vite` plugin，於 `vite.config.ts` 註冊。
2. 在 `src/index.css` 以 `@import "tailwindcss";` 引入，並用 `@theme` 注入 token，**數值一律取自 `docs/style-guide.md`，不臆造 hex**。
3. **Semantic 色彩**（`style-guide.md` §2.4，元件只用這層）映射為 Tailwind 顏色 utility：

   | `@theme` 變數 | 來源語意 | Hex（來自 raw token） | 產生的 utility 例 |
   |---|---|---|---|
   | `--color-surface` | `--surface` ← `--wood-200` | `#E8CFA6` | `bg-surface` |
   | `--color-surface-inset` | `--surface-inset` ← `--wood-400` | `#C49A6C` | `bg-surface-inset` |
   | `--color-border` | `--border` ← `--wood-600` | `#AA7959` | `border-border` |
   | `--color-outline` | `--outline` ← `--wood-800` | `#6B4B5B` | `outline-outline` |
   | `--color-text` | `--text` ← `--wood-800` | `#6B4B5B` | `text-text` |
   | `--color-text-muted` | `--text-muted` ← `--wood-700` | `#90625D` | `text-text-muted` |
   | `--color-text-invert` | `--text-invert` ← `--stone-100` | `#F3F4E7` | `text-text-invert` |
   | `--color-accent` | `--accent` ← `--gold-500` | `#EEBA77` | `bg-accent` |
   | `--color-accent-hover` | `--accent-hover` ← `--gold-300` | `#F2CF8C` | `hover:bg-accent-hover` |
   | `--color-link` | `--link` ← `--plum-500` | `#867FB8` | `text-link` |
   | `--color-success` | `--success` ← `--grass-500` | `#78A158` | `text-success` |
   | `--color-danger` | `--danger` ← `--berry-500` | `#BD757E` | `text-danger` |
   | `--color-scene-sky` | `--scene-sky` ← `--sky-300` | `#92B2D4` | `bg-scene-sky` |
   | `--color-scene-ground` | `--scene-ground` ← `--grass-500` | `#78A158` | `bg-scene-ground` |
   | `--color-scene-water` | `--scene-water` ← `--water-500` | `#7BA6B4` | `bg-scene-water` |

   > 後續若需更多色，先更新 `style-guide.md`（從官方 ramp 取色）→ 再加進 `@theme` → 元件才使用。M1 先落地上述 semantic 層即足夠。

4. **字級階**（`style-guide.md` §3.2，整數倍以維持像素清晰）以 `@theme` 的 `--text-*` 表達：

   | `@theme` 變數 | px | 對應 roadmap 開放問題的字級 | utility |
   |---|---|---|---|
   | `--text-pixel-sm` | `11px` | 11（註解/credit） | `text-pixel-sm` |
   | `--text-pixel-base` | `22px` | 22（內文 2×） | `text-pixel-base` |
   | `--text-pixel-lg` | `33px` | 33（區域標題 3×） | `text-pixel-lg` |
   | `--text-pixel-xl` | `44px` | 44（主標 4×） | `text-pixel-xl` |

   - 行高 `line-height: 1.4`，CJK `letter-spacing: 0`。

**驗收**：≥3 個 semantic token（surface/text/accent）可透過 utility 套用並顯示對應正確 hex；字級 utility 可用。

### Phase F — 字體與全域像素渲染

1. 從 `精選素材/fonts/` 複製到 `public/fonts/`：
   - `Cubic_11.woff2`、`Cubic_11.woff`（繁中主字 Cubic 11）
   - `pixelFont-7-8x14-sproutLands.ttf`（英文裝飾 Sprout Lands）
2. 在 `index.css` 設定 `@font-face`：
   - `'Cubic 11'`：`woff2` 首選、`woff` 後備。
   - `'SproutLands'`：`ttf`。
3. 字型堆疊（`style-guide.md` §3.1）：

   ```css
   font-family: 'Cubic 11', 'SproutLands', system-ui, monospace;
   ```

   - Cubic 11 同涵蓋拉丁字母，繁中與英數統一用它；`SproutLands` 僅用於刻意的英文裝飾標題。
4. 全域像素規範：
   - `image-rendering: pixelated;`
   - 像素字體關抗鋸齒：`-webkit-font-smoothing: none; font-smooth: never;`
   - 整數倍縮放基礎；不引入非整數縮放。

**驗收**：頁面繁中以 Cubic 11 渲染；英文標題可切到 Sprout Lands；放大檢視像素邊緣銳利無模糊。

### Phase G — `App.tsx` 驗收畫面

最小驗收頁，僅為證明 token/字體/像素規範接通（非正式 UI，正式設計系統留 M6）：

- 一段 **Cubic 11** 渲染的繁體中文測試字（`text-text`、`text-pixel-base`）。
- 一個切到 **SproutLands** 字體的英文標題（`text-pixel-lg`）。
- 套 `bg-surface`、`bg-accent`、`bg-scene-ground` 的色塊各一，驗證 semantic 色彩正確。
- 放大檢視（瀏覽器 zoom）像素邊緣銳利。

## 4. 最終驗收標準（對應 roadmap）

- [ ] `npm run dev` 與 `npm run build` 皆成功。
- [ ] 頁面文字以 Cubic 11 渲染（繁中），英文標題可切換到 Sprout Lands 字體。
- [ ] 至少 3 個 semantic token（surface/text/accent）可透過 Tailwind utility 套用並正確顯示對應 hex。
- [ ] 放大檢視像素邊緣銳利（無抗鋸齒模糊）。
- [ ] `sproutfolio/` 為**獨立 git repo**，`main` 已推送至 `Warmlatte/sproutfolio`（public）。
- [ ] `622 Personal Blog/.git` 已刪除；Spectra 指令仍正常運作。
- [ ] `.gitignore` 正確忽略 `docs/`、`CLAUDE.md`、`AGENTS.md`、`精選素材` 等（未被追蹤）。

## 5. 不在範圍（留給其他區塊）

- 任何遊戲引擎、canvas、地圖（M3）。
- UI 元件庫 / 9-slice 元件（M6）。
- GitHub Pages 部署設定與 `vite.config.ts` 的 `base`（M10）。
- `精選素材/` 以外的 `public/sprites/` 全量搬運（依各區塊需要時再取）。

## 6. 風險與處置

| 風險 | 處置 |
|---|---|
| 搬移 Spectra db 後工具找不到 / 索引失效 | 先驗證 `spectra list`；必要時依 `openspec/` 重建索引；搬移而非刪除，保留回復點 |
| `git init` 與既有 `.git` 殼撞名 | Phase A 先清空並刪殼，確認無殘留再 init |
| Tailwind v4 與 docs 中「`tailwind.config.ts`」措辭不符 | 採 CSS-first `@theme`；token 對應表已在本文件固定，後續可同步微調 style-guide 措辭 |
| 公開 repo 誤含內部文件 | `.gitignore` 保留 `docs/`、`CLAUDE.md`、`AGENTS.md`、`精選素材`；首個 commit 後核對 `git ls-files` 確認未追蹤 |

## 7. 授權標註（散布時必附，置於 README）

```
Assets - From: Sprout Lands - By: Cup Nooble — https://cupnooble.itch.io/sprout-lands-asset-pack (非商業)
Font: Cubic 11 (俐方體11號) by ACh-K — SIL OFL 1.1 — https://github.com/ACh-K/Cubic-11
```
