## 1. 常數基礎

- [x] 1.1 於 `src/constants.ts` 新增整數常數 `MIN_WORLD_SCALE = 2`、`JOYSTICK_BASE_PX`（~120）、`JOYSTICK_THUMB_PX`、`JOYSTICK_DEADZONE_PX = 12`、`INTERACT_BTN_PX`（~64），並保留 `WORLD_SCALE = 3`。（cover 改版後移除 `SCALE_BP_SM/MD`。）完成時：下游 `scale.ts`、`input.ts`、`Joystick.tsx` 可匯入這些常數。驗證：`pnpm tsc --noEmit` 型別通過，值皆為整數（人工檢視）。

## 2. RWD 整數縮放（純函數，TDD）

- [x] 2.1 先在 `src/game/scale.test.ts` 寫失敗測試覆蓋 `computeWorldScale` 的 cover 表（直立高吃緊 390×844→3、寬螢幕寬吃緊 1920×1080→5、迷你 320×240→2 夾 MIN，及 cover 不變式）。對應 spec `responsive-scaling`「World scale resolves to an integer multiple that covers the viewport」。驗證：`pnpm vitest run src/game/scale.test.ts` 先 RED。
- [x] 2.2 於 `src/game/scale.ts` 實作 `computeWorldScale(viewportW, viewportH)`：`max(MIN_WORLD_SCALE, ceil(max(viewportW/MAP_W_PX, viewportH/MAP_H_PX)))`，回傳整數、純函數無 DOM、保證蓋滿視窗。驗證：2.1 測試轉 GREEN。

## 3. 搖桿向量與方向合併（純函數，TDD）

- [x] 3.1 先在 `src/game/input.test.ts` 補失敗測試：`directionFromVector` 依 spec 範例表（(0,0)→(0,0)、(6,0)→(0,0) deadzone 內、(40,0)→(1,0)、(0,-40)→(0,-1)、(30,30)→(0.707,0.707)、(100,0)→(1,0)）。對應 spec `player-movement`「Joystick displacement resolves to a normalized direction vector」。驗證：`pnpm vitest run src/game/input.test.ts` 先 RED。
- [x] 3.2 於 `src/game/input.ts` 實作 `directionFromVector(dx, dy)`：magnitude `<= JOYSTICK_DEADZONE_PX` 回 `{0,0}`，否則回正規化 magnitude 1 向量；回新物件不就地修改。驗證：3.1 測試 GREEN。
- [x] 3.3 先補失敗測試：`mergeDirections` 依 spec 範例表（鍵盤優先 / 退回觸控 / 皆零）。對應 spec `player-movement`「Keyboard and touch directions merge with keyboard priority」。驗證：測試先 RED。
- [x] 3.4 於 `src/game/input.ts` 實作 `mergeDirections(kb, touch)`：鍵盤非零優先、否則觸控、皆零回 `{0,0}`，回新物件不變更輸入。驗證：3.3 測試 GREEN。

## 4. 互動旗標與觸控輸入來源（TDD）

- [x] 4.1 先補失敗測試：`consumeInteract` edge-triggered（按下後首次回 `true`、再次無新按下回 `false`）。對應 spec `player-movement`「Interaction input is edge-triggered across keyboard and touch」。驗證：測試先 RED。
- [x] 4.2 於 `src/game/input.ts` 為 `InputSource` 介面新增 `consumeInteract(): boolean`，鍵盤 `createInput()` 監聽 `Space`（`event.code === 'Space'`）設旗標、`consumeInteract()` 讀取並清除、`destroy()` 清旗標與監聽。驗證：4.1 測試 GREEN。
- [x] 4.3 先補失敗測試：`createTouchInput` 的 `setDirection` 後 `read()` 回相同值的新物件、`triggerInteract()` 後 `consumeInteract()` 回 true once。對應 spec `player-movement`「Touch input feeds the source-agnostic direction interface」。驗證：測試先 RED。
- [x] 4.4 於 `src/game/input.ts` 實作 `createTouchInput()`：實作 `read()` / `consumeInteract()` / `destroy()` 並暴露 `setDirection(dir)`（回存新副本）/ `triggerInteract()`。驗證：4.3 測試 GREEN，且 `pnpm vitest run` 全綠。

## 5. 引擎整合（動態縮放 + 合併輸入 + 互動）

- [x] 5.1 於 `src/game/engine.ts` 將 `createEngine` 簽章改為 `createEngine(container, touch)`，移除寫死 `world.scale.set(WORLD_SCALE)`，改以 `computeWorldScale(container.clientWidth)` 設初始 scale，並於既有 `ResizeObserver` 重算 scale → 更新 `world.scale` 與 `follow()`（以區域變數持有當前 scale 傳給 `computeFollowOffset`）。對應 spec `responsive-scaling`「Engine applies and recomputes world scale on resize」。驗證：更新 `src/game/engine.test.ts` 既有測試並 `pnpm vitest run src/game/engine.test.ts` 通過。
- [x] 5.2 引擎 tick 內以 `mergeDirections(keyboard.read(), touch.read())` 餵入 `player.update`，並於 `keyboard.consumeInteract() || touch.consumeInteract()` 為真時 console 輸出互動訊號（M5 暫驗）；`stopLoop()` 僅銷毀自有鍵盤來源、不銷毀共享 touch。驗證：`pnpm vitest run` 全綠，`vite dev` 中按 Space 於 console 見互動訊號。

## 6. 觸控疊層 Joystick

- [x] 6.1 新增 `src/react/Joystick.tsx`：以 `matchMedia('(pointer: coarse)').matches || navigator.maxTouchPoints > 0` 偵測觸控，觸控裝置渲染搖桿+互動鈕、非觸控改顯示鍵盤提示（文案來自 content/constants），並訂閱 media query `change` 重渲染。對應 spec `mobile-controls`「Touch overlay renders only on touch-capable devices」。驗證：`vite dev` 桌機見鍵盤提示、行動模擬器見搖桿。
- [x] 6.2 搖桿（左下）pointer events：拖曳→相對底座中心位移→`directionFromVector`→`touch.setDirection(dir)`、拇指 clamp 於底座半徑內；`pointerup`/`pointercancel`→`setDirection({x:0,y:0})` 拇指歸位。互動鈕（右下）`pointerdown`→`touch.triggerInteract()`。對應 spec `mobile-controls`「Virtual joystick drives the shared touch input」「Interact button emits an edge-triggered interaction」。驗證：`vite dev` 觸控拖曳可八方向移動、放開即停、按互動鈕 console 見訊號。
- [x] 6.3 疊層樣式採純 CSS + semantic token（半透明、無寫死 hex）、`position: fixed` + `env(safe-area-inset-*)` 定位。對應 spec `mobile-controls`「Touch controls use semantic tokens and safe-area positioning」。驗證：人工檢視 CSS 無 literal hex，`vite dev` 於有 safe-area 的視窗定位正確。

## 7. GameCanvas 接線與整體驗收

- [x] 7.1 於 `src/react/GameCanvas.tsx` 的 `useEffect` 建立共享 `touch = createTouchInput()` → `createEngine(container, touch)` → 渲染 `<Joystick touch={touch} />`；cleanup 先 `engine.destroy()` 再 `touch.destroy()`。完成時：搖桿輸出經共享物件驅動引擎與相機。驗證：`pnpm tsc --noEmit` 通過、`pnpm vitest run` 全綠。
- [x] 7.2 `vite dev` 手動走動驗收（對應 design 第十節）：觸控八方向移動與鍵盤共用介面、直立窄視窗可走遍全圖、縮放整數倍像素清晰且 resize 後相機正確、非觸控顯示鍵盤提示、互動鈕於 console 出現訊號。驗證：逐項目視確認並記錄於對應 GitHub issue comment。
