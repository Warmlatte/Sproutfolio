## Context

PR #16（m6 UI 設計系統）尚未合併進 dev，高強度 code review 找出 5 個缺陷。相關程式集中在自包含的 `src/ui/` 設計系統，無遊戲引擎耦合；對外契約來自 `src/ui/index.ts`。本 change 在不更動 m6 視覺設計與既有 specs 規範性需求的前提下，補上先前未文件化的健壯性與無障礙行為。對應 GitHub issue #15，修正將直接 commit 進 m6 分支（`m6-ui-design-system`），併同 PR #16 一起進 dev。

## Goals / Non-Goals

**Goals:**

- 修正 `InventoryGrid` 已填格被朗讀為「空格」的真實邏輯錯誤。
- 讓 `DialogBox` 的跳過／前進互動可由鍵盤（Enter／Space）操作。
- 為 UI 邊界加入可重用的 ErrorBoundary，讓 render 期越界 index 降級為局部錯誤而非整頁白畫面。
- 消除 `useTypewriter` 換文字時的全文閃現，並讓 reduced-motion 執行期切換即時生效。

**Non-Goals:**

- 不更動 m6 UI 元件的視覺設計、配色 token、像素規範或 9-slice 素材選擇。
- 不修改 `frameRect` / `spriteBackground` 的「越界即拋 RangeError」fail-fast 契約。
- 不導入重型測試框架；僅對可抽出的純邏輯加輕量單元測試。
- 不調整 `ui-component-library`（m6）既有 specs 的規範性需求。

## Decisions

- **#1 標籤改以「占用狀態」分支，並抽出純函式**：將 slot 名稱計算抽成純函式 `inventorySlotLabel(item, index)`，依 `item === null` 決定空格名，已填未命名格回傳穩定的 `slot <index>`；`InventoryGrid` 改呼叫它。純邏輯可加單元測試，符合本專案「純邏輯加輕量測試」原則。
- **#2 以原生 button 語意承載互動**：`DialogBox` 改用既有的 `NineSlice as="button"` 渲染外框，移除掛在 `div` 上的 onClick，讓點擊與鍵盤共用瀏覽器原生 button 行為，無需自行處理 keydown。維持既有點擊「跳過→前進」流程。
- **#3 新增 `UIErrorBoundary` class 元件**：放在 `src/ui/UIErrorBoundary.tsx`，提供 `fallback` 與 `children`，捕捉子樹 render 錯誤並渲染 fallback。先包覆 dev gallery（`App.tsx` 的 `#ui` 分支或 `UIGallery` 內部），並由 `index.ts` 匯出供日後 overlays 使用。不改動拋錯來源。
- **#4 換文字以 render 期偵測重置**：在 `useTypewriter` 內以 ref 記住上一次的 `text`，render 期偵測到 `text` 改變時同步把可見進度視為 0（React 的「render 期重置衍生狀態」模式，於 setState 加守衛避免迴圈），使 `shown` 永不超出當前文字的當前進度。
- **#5 訂閱 media query 變化**：把 reduced-motion 判定從一次性讀取改為訂閱 `matchMedia('(prefers-reduced-motion: reduce)')` 的 `change` 事件，命中時即時將進度設為完成；元件卸載時移除監聽。

## Implementation Contract

- **行為**：
  - `InventoryGrid`：已填格（即使無 `label`）的 `aria-label` 為 `slot <index>`；`null` 格為 `empty slot <index>`；有 `label` 則用 `label`。
  - `DialogBox`：跳過／前進互動具 button 角色、可聚焦、Enter／Space 可觸發，行為等同滑鼠點擊。
  - `UIErrorBoundary`：子樹於 render 期拋錯時顯示 `fallback`，其餘 App 維持掛載。
  - `useTypewriter`：`text` 改變後首次 render 不閃現新全文；掛載後啟用 reduced-motion 立即完成揭示。
- **介面 / 資料形狀**：
  - 新增純函式 `inventorySlotLabel(item: InventoryItem | null, index: number): string`（`src/ui/inventorySlotLabel.ts`）。
  - 新增 `UIErrorBoundary`，props 形狀 `{ fallback?: ReactNode; children: ReactNode }`。
  - `src/ui/index.ts` 新增匯出 `UIErrorBoundary` 與其 props 型別；其餘公開元件簽章不變。
- **失敗模式**：`UIErrorBoundary` 捕捉 render 期例外並渲染 fallback（dev gallery 用簡短文字 fallback）；`frameRect` / `spriteBackground` 仍對越界 index 拋 `RangeError`（不變）。
- **驗收標準**：
  - `inventorySlotLabel` 單元測試覆蓋三種占用情境（已填無 label／已填有 label／null）。
  - 既有 `nineSliceStyle`、`spriteBackground`、`typewriter` 測試持續通過。
  - `npm run build`（或 `tsc`）型別檢查通過。
  - 於 `vite dev` 的 `#ui` gallery 手動走查：InventoryGrid 報讀正確、DialogBox 可鍵盤跳過／前進、故意傳越界 index 顯示 fallback 不白屏、DialogBox 換文字無閃現、切換系統 reduced-motion 立即生效。
- **範圍邊界**：僅修改 `src/ui/InventoryGrid.tsx`、`src/ui/DialogBox.tsx`、`src/ui/useTypewriter.ts`、`src/ui/index.ts`、`src/App.tsx`，新增 `src/ui/UIErrorBoundary.tsx`、`src/ui/inventorySlotLabel.ts`、`src/ui/inventorySlotLabel.test.ts`。不動遊戲引擎、素材 catalog 與其他 milestone 程式。

## Risks / Trade-offs

- **render 期 setState 重置（#4）**：需以「僅在偵測到 text 改變時」設定，避免無限重渲染；以 ref 守衛。風險低但需謹慎實作。
- **以 button 取代 div（#2）**：button 預設樣式與既有 9-slice 外觀可能有差異；`NineSlice` 既已支援 `as="button"` 且 m6 PixelButton 已驗證此路徑，風險低。
- **ErrorBoundary 範圍（#3）**：本 change 只包覆 dev gallery 並匯出供日後使用；正式 overlays 的包覆留待對應 milestone，避免擴大範圍。
- **reduced-motion 監聽（#5）**：需正確清理監聽避免記憶體洩漏；於 effect cleanup 移除。
