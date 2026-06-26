## Why

PR #16（m6 UI 設計系統，對應 issue #15）的高強度 code review 找出 5 個尚未合併進 dev 的缺陷：1 個真實邏輯錯誤、2 個可及性／健壯性問題、2 個低優先的時序問題。趁這批 UI 元件尚未進入主線、後續區域面板（overlays）尚未大量依賴前修正，成本最低，且可避免錯誤的無障礙語意與整頁崩潰風險被往後沿用。

## What Changes

- **#1 InventoryGrid 標籤邏輯（真實 bug）**：已填格但未提供 `label` 時，目前 `aria-label` 會落到「empty slot N」，把「有內容的格子」錯誤朗讀為「空格」。改為依「格子是否有 item」分支，已填未命名格給穩定的預設名（如 `slot N`），僅 `item === null` 才標為空格。
- **#2 DialogBox 鍵盤可及性**：對話框的「點擊跳過／前進」目前掛在純 `div` 的 `onClick` 上，無 `role`／`tabIndex`／鍵盤處理，鍵盤與螢幕報讀使用者無法操作其主要互動。改為以原生 `<button>` 語意承載該互動（沿用 `NineSlice` 既有的 `as="button"`），使 Enter／Space 可觸發。
- **#3 越界 index 整頁崩潰（健壯性）**：`PixelIcon`／`InventoryGrid`／`ContactPanel` 由內容資料驅動，當 `iconIndex` 越界時 `spriteBackground → frameRect` 會在 render 期同步拋 `RangeError`，而樹中無任何 ErrorBoundary，導致整個 App 卸載成白畫面。新增一個可重用的 `UIErrorBoundary`，包覆 dev gallery 與未來 overlays，讓單一壞 index 降級為局部錯誤而非全站崩潰。
- **#4 useTypewriter 換文字閃現（低）**：`text` 變更後、重置 effect 執行前的那一次 render 會以「舊 count」對「新字串」切片，瞬間閃出新全文再重新打字。改為在 render 期偵測 `text` 變化並同步重置進度，消除閃現。
- **#5 useTypewriter 未追蹤 reduced-motion（低）**：`prefers-reduced-motion` 目前只在每次 `text`／`speed` 變更時讀取一次，使用者於元件掛載後切換系統設定不會生效。改為訂閱 media query 的 `change` 事件，執行期切換即時反映。

## Non-Goals (optional)

- 不更動 m6 既有 UI 元件的視覺設計、配色 token 或像素規範。
- 不替換 `btn_square_26` 等待核對素材（仍沿用 m6 既定的 `dialog_box` 9-slice 回退）。
- 不為所有元件導入重型測試框架；僅對可抽出的純邏輯加輕量單元測試，元件互動沿用 `#ui` gallery 手動走查。
- 不調整 `frameRect`／`spriteBackground` 的「越界即拋錯」契約（fail-fast 維持不變），只在 UI 邊界加入降級保護。

## Capabilities

### New Capabilities

- `ui-component-resilience`: 確立 `src/ui/` 元件庫先前未文件化的健壯性與無障礙行為契約——無障礙名稱需反映格子是否有內容、主要互動需可由鍵盤操作、render 期素材錯誤需被隔離而非導致全站崩潰、打字機揭示需視覺穩定且執行期尊重 reduced-motion。

### Modified Capabilities

(none — 不改動 m6 尚未合併之 ui-component-library change 既有 specs 的規範性需求；本 change 以新 capability 補記先前缺漏的行為保證)

## Impact

- Affected code:
  - Modified:
    - src/ui/InventoryGrid.tsx
    - src/ui/DialogBox.tsx
    - src/ui/useTypewriter.ts
    - src/App.tsx
    - src/ui/index.ts
  - New:
    - src/ui/UIErrorBoundary.tsx
    - src/ui/inventorySlotLabel.ts
    - src/ui/inventorySlotLabel.test.ts
  - Removed: (none)
