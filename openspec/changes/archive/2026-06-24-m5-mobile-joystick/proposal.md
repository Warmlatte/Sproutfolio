## Why

目前只有鍵盤操控（M4），觸控裝置訪客無法走動探索。M5 補上手機虛擬搖桿與互動鈕，並依視窗寬度自動調整世界縮放倍率，讓小螢幕也能看清像素、走遍全圖。採用 spec 第五節方案 A（相機跟隨），天然支援直立視窗，不需提醒翻轉手機。

## What Changes

- 新增 `src/react/Joystick.tsx`：左下虛擬搖桿 + 右下互動鈕的觸控疊層（React，疊在 canvas 上）；非觸控裝置改顯示角落鍵盤提示。
- 擴充 `src/game/input.ts`：新增 source-agnostic 的 `createTouchInput`、純函數 `directionFromVector` 與 `mergeDirections`，並為 `InputSource` 介面加上 edge-triggered 的 `consumeInteract()`；鍵盤追加 `Space` 互動鍵。
- 新增 `src/game/scale.ts`：`computeWorldScale(width)` 依固定斷點回傳整數倍縮放（2× / 3× / 4×）。
- 改動 `src/game/engine.ts`：簽章收 `touch` 參數、每幀合併鍵盤與觸控方向、依容器寬度動態套用整數倍縮放並於 resize 重算、互動以 console 暫時驗證。
- 改動 `src/react/GameCanvas.tsx`：建立共享 `touch` 物件傳入引擎並渲染 `Joystick`，於卸載時負責 `touch.destroy()`。
- 擴充 `src/constants.ts`：新增縮放斷點與搖桿/互動鈕尺寸常數。

## Non-Goals

<!-- 留待 design.md 的 Goals/Non-Goals 章節記錄 -->

## Capabilities

### New Capabilities

- `mobile-controls`: 觸控裝置偵測、虛擬搖桿與互動鈕疊層、非觸控的鍵盤提示，輸出餵入既有 source-agnostic 輸入介面。
- `responsive-scaling`: 依視窗寬度以固定斷點計算整數倍世界縮放，resize 時重算縮放與相機。

### Modified Capabilities

- `player-movement`: 輸入層擴充——新增觸控輸入來源（`createTouchInput`）、雙來源合併（`mergeDirections`，鍵盤優先）、搖桿向量正規化（`directionFromVector`，含 deadzone 與半徑 clamp），並為 `InputSource` 加上 edge-triggered `consumeInteract()` 與鍵盤 `Space` 互動。

## Impact

- Affected specs: 新增 `mobile-controls`、`responsive-scaling`；修改 `player-movement`。
- Affected code:
  - New: src/game/scale.ts, src/game/scale.test.ts, src/react/Joystick.tsx
  - Modified: src/game/input.ts, src/game/input.test.ts, src/game/engine.ts, src/react/GameCanvas.tsx, src/constants.ts
  - Removed: (none)
