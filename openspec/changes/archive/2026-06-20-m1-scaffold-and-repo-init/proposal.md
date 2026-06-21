## Why

目前專案處於可運作前的「零」狀態：尚無任何可執行的前端外殼，且版控嚴重錯位——真正的 git repo root 在上層 `622 Personal Blog/`，本資料夾內名為 `.git` 的目錄其實是 Spectra 資料庫殼（與 `git init` 撞名）。M1 要一次把這兩件事補齊：建立可 `npm run dev` 的 Vite + React + TS + Tailwind v4 外殼並接好 style-guide 的設計基礎，同時把本資料夾整理成自包含、已推上 GitHub 的獨立 public repo，作為後續所有 UI／遊戲區塊的一致地基。

## What Changes

- 建立 Vite + React + TypeScript 可運行外殼（`npm run dev` / `npm run build` 皆成功），含最小 `src/`（`main.tsx`、`App.tsx`、`constants.ts`、`index.css`）與驗收畫面。
- 導入 Tailwind v4（CSS-first），於 `index.css` 用 `@theme` 把 `docs/style-guide.md` 的 semantic 色彩 token 與整數倍字級階映射成 utility，hex 一律取自 style-guide。
- 載入像素字體（Cubic 11 繁中主字、Sprout Lands 英文裝飾）並設定全域像素渲染規範（`image-rendering: pixelated`、關抗鋸齒、整數倍縮放）。
- 整理版控：先安全搬移 Spectra db 殼並驗證 `spectra list` 正常，刪除本資料夾內撞名的 `.git` 殼，**刪除**上層 `622 Personal Blog/.git`，於本資料夾全新 `git init`（不保留既有歷史）。
- 將專案資料夾與 GitHub 遠端 repo 命名為 **Sproutfolio**（資料夾 `sproutfolio`、repo `sproutfolio`），建立 **public** 遠端（owner `Warmlatte`）並推送 `main`。
- 重寫 `.gitignore`：保留現有忽略規則（`docs/`、`CLAUDE.md`、`AGENTS.md`、`精選素材`、`.spectra/`、`openspec/.vector-search.db*`），追加工具產物（`node_modules/`、`dist/`、`.DS_Store` 等），使公開 repo 只含程式碼與 `public/` 內素材。

## Non-Goals (optional)

- 不含任何遊戲引擎、canvas、地圖（留待 M3）。
- 不含 UI 元件庫與 9-slice 元件（留待 M6）。
- 不設定 GitHub Pages 部署與 `vite.config.ts` 的 `base`（留待 M10）。
- 不保留上層 repo 的既有 5 個 commit 歷史（明確採全新初始化）。
- 不變更上層 `622 Personal Blog/` 其餘檔案（如 `素材/`），僅移除其 `.git` 使其退出版控。

## Capabilities

### New Capabilities

- `project-scaffold`: 可運行的 Vite + React + TypeScript 外殼、像素常數雛形與最小驗收畫面。
- `design-tokens`: Tailwind v4 `@theme` 將 style-guide 的 semantic 色彩與整數倍字級映射為 utility。
- `pixel-typography`: 像素字體載入（Cubic 11 / Sprout Lands）與全域像素渲染規範。
- `repository-setup`: 版控清理、全新 git 初始化、資料夾與遠端 repo 改名為 Sproutfolio、建立 public 遠端並推送。

### Modified Capabilities

(none)

## Impact

- Affected specs: 新增 `project-scaffold`、`design-tokens`、`pixel-typography`、`repository-setup` 四個 capability。
- Affected code:
  - New:
    - package.json
    - index.html
    - vite.config.ts
    - tsconfig.json
    - tsconfig.node.json
    - src/main.tsx
    - src/App.tsx
    - src/constants.ts
    - src/index.css
    - public/fonts/Cubic_11.woff2
    - public/fonts/Cubic_11.woff
    - public/fonts/pixelFont-7-8x14-sproutLands.ttf
    - README.md
  - Modified:
    - .gitignore
  - Removed:
    - 本資料夾內撞名的 Spectra 資料庫殼目錄（先驗證再刪），以及上層專案的 git 目錄（使其退出版控）。以散文描述，因其路徑無法以專案根目錄相對路徑表示。
