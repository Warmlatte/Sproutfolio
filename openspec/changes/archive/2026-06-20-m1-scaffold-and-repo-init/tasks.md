## 1. 版控清理（git init 前置）

- [x] 1.1 完成 Safe Spectra database relocation before git init：將撞名的 Spectra 資料庫殼（含 spectra.db）搬移出 `.git` 路徑後，執行 `spectra list` 確認仍能讀到本 change 與 specs，再刪除清空的 `.git` 殼；驗證＝`spectra list` 正常輸出且專案內無殘留 `.git` 殼。
- [x] 1.2 完成 Parent repository removal：刪除上層 `622 Personal Blog` 的 git 目錄、保留其餘檔案（如 `素材/`）不動；驗證＝於專案內執行 `git rev-parse --show-toplevel` 不再解析到上層資料夾。

## 2. 改名與 git 全新初始化

- [x] 2.1 完成 Project renamed to Sproutfolio（資料夾部分）：將專案資料夾 `PersonalWeb` 改名為 `sproutfolio`；驗證＝工作目錄路徑結尾為 `sproutfolio`。
- [x] 2.2 完成 Fresh git initialization：在 `sproutfolio` 內 `git init` 並設預設分支為 `main`、不繼承任何歷史；驗證＝`git status` 顯示 branch main 且 `git log` 無既有 commit。
- [x] 2.3 完成 Gitignore preserves internal-only paths：重寫 `.gitignore`，保留現有忽略（`docs/`、`CLAUDE.md`、`AGENTS.md`、`精選素材`、`.spectra/`、`openspec/.vector-search.db*`）並追加 `node_modules/`、`dist/`、`.DS_Store`；驗證＝`git status --ignored` 顯示前述內部路徑被忽略、未被追蹤。

## 3. Vite + React + TypeScript 骨架

- [x] 3.1 交付 Runnable Vite React TypeScript shell：以 Vite react-ts 範本於現有資料夾建立可運行外殼，`vite.config.ts` 暫不設 `base`；驗證＝`npm run dev` 啟動無編譯錯誤、`npm run build` 成功並輸出至 `dist/`。
- [x] 3.2 交付 Minimal source layout：建立 `index.html` 與 `src/main.tsx`、`src/App.tsx`、`src/constants.ts`、`src/index.css`，由 `main.tsx` 將 `App` 掛載到 root；驗證＝瀏覽器載入後頁面成功渲染 root。
- [x] 3.3 交付 Pixel constant seed：於 `src/constants.ts` 匯出整數常數 `TILE_SIZE=16`、`WORLD_SCALE=3`、`UI_SCALE=2`；驗證＝匯入後三常數為整數且值正確（型別檢查通過）。

## 4. 設計 tokens（Tailwind v4 CSS-first）

- [x] 4.1 交付 Semantic color tokens via Tailwind v4 theme：在 `src/index.css` 以 `@theme` 將 style-guide §2.4 semantic 色彩定義為 Tailwind 顏色 utility，hex 一律取自 `docs/style-guide.md`；驗證＝`bg-surface`/`text-text`/`bg-accent` 渲染色分別等於 #E8CFA6 / #6B4B5B / #EEBA77。
- [x] 4.2 交付 Integer pixel type scale utilities：以 `@theme` font-size 變數產生 `text-pixel-sm/base/lg/xl`，對應 11/22/33/44px；驗證＝套用各 utility 後字級為對應整數 px。

## 5. 像素字體與全域渲染

- [x] 5.1 交付 Pixel font loading：自 `精選素材/fonts/` 複製 `Cubic_11.woff2`、`Cubic_11.woff`、`pixelFont-7-8x14-sproutLands.ttf` 至 `public/fonts/`，並於 `index.css` 設定 `@font-face`（Cubic 11 以 woff2 首選、woff 後備；SproutLands 用 ttf）；驗證＝DevTools Network 顯示字體成功載入、無 404。
- [x] 5.2 交付 Traditional Chinese renders in Cubic 11 與 Decorative English can switch to Sprout Lands：設定字型堆疊 `'Cubic 11','SproutLands',system-ui,monospace`，並提供英文標題切換到 SproutLands 的方式；驗證＝繁中文字以 Cubic 11 顯示、指定英文標題以 Sprout Lands 顯示。
- [x] 5.3 交付 Global pixel rendering：全域套用 `image-rendering: pixelated`、像素字體關抗鋸齒、整數倍縮放；驗證＝瀏覽器放大檢視像素邊緣銳利、無抗鋸齒模糊。

## 6. 驗收畫面

- [x] 6.1 交付 Verification screen 並滿足 At least three verifiable semantic tokens：於 `src/App.tsx` 渲染一段 Cubic 11 繁中測試字、一個 SproutLands 英文標題，以及套用 surface/text/accent 三個 semantic token 的色塊；驗證＝畫面同時呈現兩種字體且三 token 顯示正確 style-guide hex。

## 7. 首個 commit、建立遠端與推送

- [x] 7.1 建立首個 commit 捕捉目前可追蹤狀態（骨架、`public/` 素材、`openspec/`、`.spectra.yaml`、`README.md`），訊息遵循 `chore:` 規範；驗證＝`git log` 出現首個 commit 且 `git status` 乾淨、`git ls-files` 不含被忽略的內部路徑。
- [x] 7.2 完成 Public remote created and pushed：以 `gh repo create Warmlatte/sproutfolio --public --source=. --remote=origin --push` 建立 public 遠端並推送 `main`；驗證＝`git remote -v` 之 origin 指向 `Warmlatte/sproutfolio`，遠端為 public 且 `main` 已上傳。
