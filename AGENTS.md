<!-- SPECTRA:START v1.0.2 -->

# Spectra Instructions

This project uses Spectra for Spec-Driven Development(SDD). Specs live in `openspec/specs/`, change proposals in `openspec/changes/`.

## Use `$spectra-*` skills when:

- A discussion needs structure before coding → `$spectra-discuss`
- User wants to plan, propose, or design a change → `$spectra-propose`
- Tasks are ready to implement → `$spectra-apply`
- There's an in-progress change to continue → `$spectra-ingest`
- User asks about specs or how something works → `$spectra-ask`
- Implementation is done → `$spectra-archive`
- Commit only files related to a specific change → `$spectra-commit`

## Workflow

discuss? → propose → apply ⇄ ingest → archive

- `discuss` is optional — skip if requirements are clear
- Requirements change mid-work? `ingest` → resume `apply`

## Parked Changes

Changes can be parked（暫存）— temporarily moved out of `openspec/changes/`. Parked changes won't appear in `spectra list` but can be found with `spectra list --parked`. To restore: `spectra unpark <name>`. The `$spectra-apply` and `$spectra-ingest` skills handle parked changes automatically.

<!-- SPECTRA:END -->

---

# 專案規則 — Sprout Lands 遊戲式個人網站

> 跨 AI 編碼工具的通用專案規範（Spectra 工作流之外）。Claude Code 使用者見 [CLAUDE.md](./CLAUDE.md)（完整版，規則一致）。

## 專案概述

可走動探索的 2D 像素遊戲式個人網站，使用 Sprout Lands 農場素材展示專案與自我介紹。

- **技術棧**：Vite + React + TypeScript ＋ canvas 遊戲引擎（KAPLAY 或 Pixi.js）＋ Tailwind CSS
- **架構**：混合——遊戲世界畫在 canvas，UI 面板用 React 元件疊上層
- **手機**：鏡頭跟隨角色 + 虛擬搖桿（不提醒翻轉）
- **部署**：GitHub Pages

## 單一事實來源（修改前必讀）

| 主題 | 來源檔 |
|---|---|
| 架構與範圍 | `docs/superpowers/specs/2026-06-18-game-style-personal-site-design.md` |
| UI 色號 / 語意 token / 字體 / 排版 | `docs/style-guide.md` |
| 網站文字內容 | `src/data/content.ts`（使用者日後唯一需改的內容檔） |
| 素材對照 | `精選素材/README.md` |

## 行為準則

1. **先想再寫**：明說假設、提出多種解讀、指出更簡單做法、不清楚就問。
2. **簡單優先**：只寫最小必要程式碼，不做未被要求的功能/抽象。
3. **外科手術式修改**：只動該動的，配合既有風格，不順手重構無關處。
4. **目標導向**：把任務轉成可驗證目標，多步任務先列簡短計畫與驗證方式。

## 風格與 UI 鐵則（細節見 docs/style-guide.md）

- UI 只用 **semantic token**（`--surface`、`--text`、`--accent`…）；禁止寫死 hex、禁止 `border-radius`、禁止未列入的顏色。
- 16px 基準瓦片、**整數倍**縮放、`image-rendering: pixelated`、像素字體關抗鋸齒。
- 繁中主字 Cubic 11（俐方體11號，SIL OFL）；英文裝飾用 Sprout Lands 像素字體。
- 圓角/邊框來自 9-slice 素材。
- 新增顏色 → 先更新 style-guide → 映射到 tailwind config → 元件才用。

## 絕對禁止

- 不在根目錄散落新檔（程式進 `src/`、文件進 `docs/`、素材進 `精選素材/`／`public/`）。
- 不用互動式 git 旗標（`-i`）。
- 不建重複檔（`xxx_v2`）。
- 不硬編碼可設定值（文案/連結 → `content.ts`；常數 → `constants.ts`）。
- 不就地修改物件（immutability，回傳新副本）。
- 不靜默吞錯。
- 不把整包原始 `素材/` 加入版控（授權限制，僅追蹤 `精選素材/`）。

## 必要要求

- 完成任務就 commit（見下方規範）；**惟使用者另有指示（如「先不 git」）時以使用者為準**；commit/push 僅在使用者要求時，預設分支上做功能變更先開分支。
- 編輯前先讀檔；複雜任務（3 步以上）拆步驟追蹤。
- 測試依 spec：純邏輯寫輕量單元測試；canvas 與互動以 `vite dev` 在瀏覽器手動驗證；不導入重型測試框架。
- 安全：純前端靜態站，無密鑰；外部連結加 `rel="noopener"`。

## Commit 規範

```
<type>: <小寫標題，無句點，≤50 字>

<說明「為什麼」的重點條列>
```
type：`feat` `fix` `refactor` `docs` `test` `chore` `style` `perf`。不同類別分開 commit，避免模糊標題。

## GitHub Issue 開票原則

- **一個 change 一張 ticket**：每個 Spectra change 對應一張 GitHub issue，不混票；範圍過大則拆成多張。
- 開票即標上**標籤（label）**（功能領域／類型），標籤同時作為分支命名的 `{標籤}` 來源。
- 實作過程、決策、變更與驗證記錄於該 issue 的 **comment**，保持可追溯。
- 發現 bug 時於**相關 issue 底下**另開 bug 票（標 `bug` 並連結原 issue），不在原票混記。

## 分支規範

- 命名格式：`{標籤}/{功能或階段標題}#{issue號碼}`（例：`feat/world-map#12`、`fix/joystick-drift#27`）。
- `{標籤}` 取自 issue 標籤、`{功能或階段標題}` 用簡短 kebab-case、`#{issue號碼}` 對應 GitHub issue。
- 預設分支上要做功能變更前，先依此規範開分支。

## 標準實作流程

`roadmap 文件 → brainstorming → spectra-propose → 開 issue → 開分支 → spectra-apply`，過程於 issue comment 記錄詳細實作。

## 專案結構

```
PersonalWeb/
├── CLAUDE.md / AGENTS.md
├── .spectra.yaml / openspec/   Spectra SDD
├── docs/                       設計 spec 與 style-guide
├── 精選素材/                    篩選後實際使用的素材
├── public/{sprites,fonts}/     部署用素材（取自 精選素材/）
└── src/
    ├── game/      純遊戲引擎（engine/loader/scenes/player/input/interaction/events）
    ├── react/     GameCanvas、Joystick
    ├── ui/        Sprout Lands React UI 設計系統（可 sync 到 Claude Design）
    ├── overlays/  以 ui/ 組成各區域面板，接 content + 事件
    └── data/content.ts   內容唯一來源
```

## 授權（散布時必附）

```
Assets - From: Sprout Lands - By: Cup Nooble — https://cupnooble.itch.io/sprout-lands-asset-pack (非商業)
Font: Cubic 11 (俐方體11號) by ACh-K — SIL OFL 1.1 — https://github.com/ACh-K/Cubic-11
```
