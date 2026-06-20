<!-- SPECTRA:START v1.0.2 -->

# Spectra Instructions

This project uses Spectra for Spec-Driven Development(SDD). Specs live in `openspec/specs/`, change proposals in `openspec/changes/`.

## Use `/spectra-*` skills when:

- A discussion needs structure before coding → `/spectra-discuss`
- User wants to plan, propose, or design a change → `/spectra-propose`
- Tasks are ready to implement → `/spectra-apply`
- There's an in-progress change to continue → `/spectra-ingest`
- User asks about specs or how something works → `/spectra-ask`
- Implementation is done → `/spectra-archive`
- Commit only files related to a specific change → `/spectra-commit`

## Workflow

discuss? → propose → apply ⇄ ingest → archive

- `discuss` is optional — skip if requirements are clear
- Requirements change mid-work? Plan mode → `ingest` → resume `apply`

## Parked Changes

Changes can be parked（暫存）— temporarily moved out of `openspec/changes/`. Parked changes won't appear in `spectra list` but can be found with `spectra list --parked`. To restore: `spectra unpark <name>`. The `/spectra-apply` and `/spectra-ingest` skills handle parked changes automatically.

<!-- SPECTRA:END -->

---

# 專案規則 — Sprout Lands 遊戲式個人網站

> 以下為本專案的詳細規範（Spectra 工作流之外的專案規則）。跨工具通用版見 [AGENTS.md](./AGENTS.md)。

## 🌱 專案概述

可走動探索的 2D 像素遊戲式個人網站，使用 Sprout Lands 農場素材。訪客操控角色在農場地圖走動，
靠近建築物觸發內容（關於我 / 專案 / 聯絡方式），並可與場景互動（砍樹、摸雞、挑水等輕量彩蛋）。

- **技術棧**：Vite + React + TypeScript（外殼）＋ canvas 遊戲引擎（KAPLAY 或 Pixi.js，跑在 `<GameCanvas>` 內）＋ Tailwind CSS
- **架構**：混合架構——遊戲世界畫在 canvas，UI 面板用 React 元件疊在上層
- **手機 RWD**：鏡頭跟隨角色（不提醒翻轉），含虛擬搖桿
- **部署**：GitHub Pages（`vite.config.ts` 設 `base`）

## 📚 單一事實來源（修改前必讀，不可各自詮釋）

| 主題 | 來源檔 |
|---|---|
| 架構與範圍 | `docs/superpowers/specs/2026-06-18-game-style-personal-site-design.md` |
| UI 色號 / 語意 token / 字體 / 排版 | `docs/style-guide.md` |
| 網站文字內容（關於我 / 專案 / 聯絡） | `src/data/content.ts`（**使用者日後唯一需改的內容檔**） |
| 素材對照與用途 | `精選素材/README.md` |

## 🎨 風格與 UI 鐵則（細節見 docs/style-guide.md）

- UI 元件**只使用 semantic token**（`--surface`、`--text`、`--accent`…）；**禁止**寫死 hex、**禁止** `border-radius`、**禁止**使用未列於 style-guide 的顏色。
- 像素規範：16px 基準瓦片、**整數倍**縮放、`image-rendering: pixelated`、像素字體關閉抗鋸齒。
- 繁中主字 **Cubic 11（俐方體11號，SIL OFL）**；英文裝飾用 Sprout Lands 像素字體。字級採 11px 整數倍。
- 圓角/邊框一律來自 9-slice 素材，不用 CSS 圓角。
- 新增顏色需求 → 先更新 `docs/style-guide.md`（從官方 ramp 取色）→ 再於 `tailwind.config.ts` 映射 → 元件才使用。

## 🧠 行為準則

**1. 先想再寫**：明說假設；有多種解讀就提出、不要默默選一個；有更簡單做法就講；不清楚就停下來問。
**2. 簡單優先**：只寫解決問題的最小程式碼；不做沒被要求的功能/抽象/彈性；200 行能縮成 50 就重寫。
**3. 外科手術式修改**：只動該動的；不順手「改善」相鄰程式；配合既有風格；只清理自己造成的孤兒程式碼。
**4. 目標導向**：把任務轉成可驗證目標（如「加驗證」→「先寫無效輸入的測試再讓它通過」），多步任務先列簡短計畫並標註各步驗證方式。

## ❌ 絕對禁止

- **絕不**在根目錄新建散落檔案（程式進 `src/`、文件進 `docs/`、素材進 `精選素材/` 或 `public/`）
- **絕不**使用互動式 git 旗標（`-i`，如 `rebase -i`、`add -i`）
- **優先**使用 Read／Grep／Glob 工具，而非 `find`／`grep`／`cat`
- **絕不**建立重複檔案（`xxx_v2.tsx`、`enhanced_xxx.ts`）
- **絕不**硬編碼可設定值（連結、文案 → 放 `content.ts`；常數 → 放 `constants.ts`）
- **絕不**就地修改既有物件——一律回傳新副本（immutability）
- **絕不**靜默吞錯——明確處理或重新拋出
- **絕不**把整包原始 `素材/` 加入版控（授權禁止重新散布素材包；已於 `.gitignore` 排除，只追蹤 `精選素材/`）

## 📝 必要要求

**工作流**
- 完成一個任務就 **commit**（訊息遵循下方規範）；**惟使用者另有指示（如「先不 git」）時，以使用者指示為準**
- 複雜任務（3 步以上）用 **TodoWrite** 拆解
- 編輯前先 **Read** 檔案
- 耗時 >30 秒的探索/批次操作交給 **Task agents**

**開發**
- **Immutability**：建立新物件，不就地修改
- **輸入驗證**：對外部資料（`content.ts`、API 回應、檔案內容）在邊界驗證；TypeScript 型別於編譯期把關
- **測試（依本專案 spec 調整，非全面 80%）**：
  - 純邏輯（方向向量、鄰近判定、9-slice 計算等）→ 輕量單元測試
  - canvas 遊戲與互動 → 以 `vite dev` 在瀏覽器**手動走動驗證**各區域與彩蛋
  - 不導入重型測試框架（YAGNI）

**安全（每次 commit 前）**
- 無硬編碼密鑰（此為純前端靜態站，本不應出現密鑰）
- 外部連結加 `rel="noopener"`、新分頁開啟
- 錯誤訊息不外洩敏感資訊

## 📦 Commit 規範

格式：
```
<type>: <小寫標題，無句點，≤50 字>

<說明「為什麼」的重點條列>
```

Type：`feat` 新功能、`fix` Bug 修復、`refactor` 重構（不改行為）、`docs` 文件、
`test` 測試、`chore` 維護（tooling/deps）、`style` 格式（不影響邏輯）、`perf` 效能。

- 將不同類別的變更分開 commit；避免模糊標題（`update`、`fix stuff`）。
- **commit / push 時機**：在使用者要求時進行；於預設分支上若要做功能性變更，先開分支。

## 🎫 GitHub Issue 開票原則與規範

- **一個 change 一張 ticket**：原則上每個 Spectra change 對應一張 GitHub issue，不混票；範圍過大應拆成多個 change／多張 issue。
- **必加標籤（label）**：每張 issue 開票時即標上對應標籤（功能領域 / 類型），標籤同時作為分支命名的 `{標籤}` 來源。
- **comment 紀錄詳細實作**：實作過程與決策、變更內容、驗證方式記錄於該 issue 的 comment，保持可追溯。
- **Bug 票歸屬**：發現 bug 時，於**相關 issue 底下**另開 bug 票（標 `bug` 標籤並連結原 issue），不在原票直接混記。

## 🔀 分支規範

- **命名格式**：`{標籤}/{功能或階段標題}#{issue號碼}`
  - 例：`feat/world-map#12`、`fix/joystick-drift#27`
  - `{標籤}` 取自該 issue 的標籤；`{功能或階段標題}` 用簡短 kebab-case；`#{issue號碼}` 對應 GitHub issue。
- 於預設分支上要做功能性變更前，先依此規範開分支（呼應 Commit 規範）。

## 🛠️ 標準實作流程

```
roadmap 文件 → superpowers:brainstorming → spectra-propose → 開 issue → 開分支 → spectra-apply
```

1. **roadmap 文件**：確認此次工作在路線圖中的定位與範圍。
2. **superpowers:brainstorming**：釐清需求與設計，再進入實作前的規劃。
3. **spectra-propose**：建立 change proposal（specs / proposal 等產出）。
4. **開 issue**：依上述開票原則建立 GitHub issue（加標籤）。
5. **開分支**：依分支規範 `{標籤}/{功能或階段標題}#{issue號碼}` 建立分支。
6. **spectra-apply**：實作任務，過程於 issue comment 記錄詳細實作。

## 📁 專案結構（依 spec）

```
PersonalWeb/
├── CLAUDE.md / AGENTS.md / README.md
├── .spectra.yaml / openspec/   # Spectra SDD（proposal / specs）
├── vite.config.ts              # base 路徑、build
├── tailwind.config.ts          # 由 style-guide 映射的 semantic token
├── docs/                       # 設計 spec、style-guide
├── 精選素材/                    # 篩選後實際使用的素材（原始 素材/ 不入版控）
├── public/{sprites,fonts}/     # 部署用素材（取自 精選素材/）
└── src/
    ├── main.tsx App.tsx constants.ts
    ├── game/                   # 純遊戲引擎（engine/loader/scenes/player/input/interaction/events）
    ├── react/                  # GameCanvas、Joystick（觸控疊層）
    ├── ui/                     # ★ Sprout Lands React UI 設計系統（可 sync 到 Claude Design）
    ├── overlays/               # 以 ui/ 組成各區域面板，接 content + 事件
    └── data/content.ts         # ★ 內容唯一來源
```

## 🐙 GitHub 與部署

- **遠端 repo（M1 已建立）**：public repo `Warmlatte/sproutfolio` 已於 M1 建立並推送 `main`；後續變更照常 commit／push（預設分支上做功能變更前先依分支規範開分支）。
- **GitHub Pages 部署（留待 M10）**：設定 `vite.config.ts` 的 `base`、發佈流程（`gh-pages` 分支或 GitHub Actions）屬 spec 第八節的部署階段工作，現在不做。
- 「post-commit 自動 push」hook **暫不安裝**：自動推送預設分支不安全，僅於使用者要求時人工推送。

## 🎮 Claude Design 同步（第二階段）

`src/ui/` 是自包含的 React UI 設計系統，元件實作完成後可用 `/design-sync` 上傳到 Claude Design 瀏覽預覽。
注意：Claude Design 僅渲染 React 元件，故 UI 層採 React（非 Vue）；canvas 遊戲世界不納入同步。

## 📄 素材與字體授權（散布時必附）

```
Assets - From: Sprout Lands - By: Cup Nooble — https://cupnooble.itch.io/sprout-lands-asset-pack (非商業)
Font: Cubic 11 (俐方體11號) by ACh-K — SIL OFL 1.1 — https://github.com/ACh-K/Cubic-11
```
