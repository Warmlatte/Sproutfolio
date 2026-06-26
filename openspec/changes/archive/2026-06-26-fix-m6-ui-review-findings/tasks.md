## 1. #1 InventoryGrid 標籤正確性（需求 Inventory slot accessible name reflects occupancy）

- [x] 1.1 新增純函式 `inventorySlotLabel(item, index)`（`src/ui/inventorySlotLabel.ts`）：`item === null` 回傳 `empty slot <index>`；已填有 `label` 回傳 `label`；已填無 `label` 回傳 `slot <index>`。驗證：型別檢查通過、函式可獨立匯入。
- [x] 1.2 為 `inventorySlotLabel` 加單元測試（`src/ui/inventorySlotLabel.test.ts`）涵蓋三種占用情境（已填無 label→`slot N`、已填有 label→label、null→`empty slot N`）。驗證：`npx vitest run src/ui/inventorySlotLabel.test.ts` 全綠。
- [x] 1.3 `InventoryGrid` 改以 `inventorySlotLabel(item, index)` 產生 `aria-label`，移除 `item?.label ?? `empty slot ${index}`` 寫法，交付需求 Inventory slot accessible name reflects occupancy。驗證：`#ui` gallery 中對已填未命名格以報讀工具或 DOM 檢視確認 `aria-label` 非「empty slot」。

## 2. #2 DialogBox 鍵盤可及性（需求 Primary component interactions are keyboard operable）

- [x] 2.1 `DialogBox` 改用 `NineSlice as="button"` 承載跳過／前進互動，移除掛在 `div` 上的 `onClick`，保留既有「未完成→skip，完成→onAdvance」邏輯，交付需求 Primary component interactions are keyboard operable。驗證：DOM 中該互動元素為 `<button>` 且可聚焦。
- [x] 2.2 於 `#ui` gallery 手動確認：聚焦 DialogBox 後按 Enter／Space 可跳過揭示、再次按下可觸發 onAdvance（advance count 增加），行為等同滑鼠點擊。驗證：手動走查通過。

## 3. #3 render 期錯誤隔離（需求 Render-time asset errors are contained）

- [x] 3.1 新增 `UIErrorBoundary` class 元件（`src/ui/UIErrorBoundary.tsx`），props `{ fallback?: ReactNode; children: ReactNode }`，以 `getDerivedStateFromError` 捕捉子樹 render 錯誤並渲染 fallback，交付需求 Render-time asset errors are contained。驗證：型別檢查通過。
- [x] 3.2 以 `UIErrorBoundary` 包覆 dev gallery（於 `App.tsx` 的 `#ui` 分支或 `UIGallery` 內），並於 `src/ui/index.ts` 匯出 `UIErrorBoundary` 與其 props 型別。驗證：`index.ts` 匯出可被引用。
- [x] 3.3 於 `#ui` gallery 暫時傳入一個越界 `iconIndex`（如 99）確認顯示 fallback 而非整頁白畫面，確認後移除該臨時測試輸入。驗證：手動走查 App 其餘部分維持掛載。

## 4. #4 / #5 useTypewriter 時序（需求 Typewriter reveal is stable and honors motion preference at runtime）

- [x] 4.1 `useTypewriter` 以 ref 記住上一次 `text`，render 期偵測到 `text` 改變時同步重置可見進度為 0（加守衛避免無限重渲染），使 `shown` 不超出當前文字的當前進度，交付需求 Typewriter reveal is stable and honors motion preference at runtime。驗證：`#ui` gallery DialogBox 換文字時無全文閃現。
- [x] 4.2 `useTypewriter` 改為訂閱 `matchMedia('(prefers-reduced-motion: reduce)')` 的 `change` 事件，命中時即時完成揭示，並於 cleanup 移除監聽。驗證：掛載後切換系統 reduced-motion，揭示立即完成且無監聽殘留。
- [x] 4.3 確認既有 `src/ui/typewriter.test.ts` 仍通過、`revealedCount` 純邏輯未被更動。驗證：`npx vitest run src/ui/typewriter.test.ts` 全綠。

## 5. 驗證與收尾

- [x] 5.1 執行型別檢查與既有測試套件（`nineSliceStyle`、`spriteBackground`、`typewriter`、新 `inventorySlotLabel`），確認全綠。驗證：`tsc` 無誤、`npx vitest run` 全綠。
- [x] 5.2 於 `vite dev` `#ui` gallery 完成五項手動走查（標籤、鍵盤、ErrorBoundary fallback、換文字無閃現、reduced-motion 即時），並依 issue 開票原則於各 `[fix]` 子票 comment 記錄驗證結果。驗證：五項皆通過並有紀錄。
