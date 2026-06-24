## Context

M4 已完成鍵盤操控 + 相機跟隨。輸入層 `src/game/input.ts` 的 `read()` 已回傳 source-agnostic 的 `Direction {x, y}`，spec 明文預留「未來觸控搖桿可餵入同介面而不需改動消費者」。M5 在此基礎上補上觸控輸入與 RWD 縮放。

來源設計：`docs/superpowers/specs/2026-06-21-m5-mobile-joystick-design.md`、spec 第五節方案 A（相機跟隨）。

約束（CLAUDE.md）：
- 純邏輯（方向向量、合併、縮放計算）→ 輕量 Vitest 單元測試；canvas/觸控互動 → `vite dev` 手動走動驗證。
- UI 只用 semantic token，禁止寫死 hex。虛擬搖桿為觸控控制項（非內容面板），圓形為其固有造型，屬 style-guide 未涵蓋的例外，於本設計明示以免各自詮釋。
- immutability：方向一律回傳新物件副本，不就地修改。

## Goals / Non-Goals

**Goals**
- 觸控搖桿八方向移動，與鍵盤共用同一 source-agnostic 輸入介面。
- 互動鈕送出 edge-triggered 互動訊號（按一下＝觸發一次）。
- 依視窗寬度自動套用整數倍世界縮放，resize 時重算縮放與相機。
- 非觸控裝置隱藏搖桿，改顯示鍵盤提示。

**Non-Goals**
- 互動內容面板（M7）：M5 只送出「互動鈕按下」事件，互動以 console 暫驗。
- 互動偵測 / 鄰近判定 / 浮動提示（M6）。
- 彩蛋（M8）。
- 類比變速：過 deadzone 即全速（magnitude 1），與鍵盤一致，非類比。

## Decisions

**D1：共享 TouchInput 物件（核心接縫）**
在 `GameCanvas` 建立一個實作 `InputSource` 的 `touchInput`，同時傳給引擎與 `Joystick`。引擎每幀合併鍵盤與觸控，玩家/相機完全沿用既有 `Direction` 介面、不知道來源。
- 替代方案：以 React state 上拋方向再經 prop 傳入引擎 → 否決，會把每幀輸入綁進 React render 週期，增加延遲與重渲染。共享可變物件讓引擎以 pull 模式每幀讀取，最直接。
- 生命週期：`GameCanvas` 的 `useEffect` 建立 `touch` → 建立 `engine` → 卸載時 `engine.destroy()` 後 `touch.destroy()`。引擎不擁有共享 touch 生命週期，但仍擁有自身鍵盤 `InputSource`。

**D2：`touchInput` 雙介面**
- 消費面（`InputSource`）：`read()` / `consumeInteract()` / `destroy()`，給引擎每幀讀取。
- 控制面：`setDirection(dir)` / `triggerInteract()`，給 React `Joystick` 在 pointer 事件時呼叫。

**D3：edge-triggered 互動**
`InputSource` 新增 `consumeInteract(): boolean`——自上次呼叫以來若曾按下互動則回 `true` 並清旗標，否則 `false`。確保「按一下＝觸發一次」，避免按住連發。鍵盤監聽 `Space`（`event.code === 'Space'`），觸控由 `triggerInteract()` 設旗標。

**D4：固定斷點整數倍縮放**
`computeWorldScale(width)`：`< SCALE_BP_SM → 2`、`< SCALE_BP_MD → 3`、否則 `4`。固定斷點而非連續比例 → 保證整數倍、像素清晰、可預測、可單元測試。`WORLD_SCALE = 3` 保留為桌機/預設參考值，與中段回傳一致。

**D5：搖桿造型例外**
CLAUDE.md「禁止 border-radius」係針對沿用 9-slice 的面板/邊框。虛擬搖桿是觸控控制項、圓形為其固有造型，style-guide 未涵蓋此控制項，故設計明示此例外。樣式用純 CSS + semantic token（半透明），`position: fixed` + `env(safe-area-inset-*)` 定位，resize 由 CSS 處理免額外 JS 重算位置。

## Implementation Contract

### src/game/scale.ts
- `computeWorldScale(width: number): number` — 回傳整數縮放倍率。
  - `width < SCALE_BP_SM` → `2`；`SCALE_BP_SM <= width < SCALE_BP_MD` → `3`；`width >= SCALE_BP_MD` → `4`。
  - 斷點為等號邊界：`width === SCALE_BP_SM` 回 `3`、`width === SCALE_BP_MD` 回 `4`。
- 驗收：`src/game/scale.test.ts` 覆蓋各斷點與等號邊界，回傳值皆為整數。

### src/game/input.ts
- `directionFromVector(dx, dy): Direction` — 搖桿拖曳位移（相對底座中心）→ 正規化方向。
  - 位移半徑 `<= JOYSTICK_DEADZONE_PX` → 回 `{x: 0, y: 0}`。
  - 過 deadzone → 回 magnitude 1 的正規化向量（全速，非類比變速）。
  - 超出 clamp 半徑仍正規化為 magnitude 1（方向不變、量值封頂）。
  - 回新物件，不就地修改。
- `mergeDirections(kb: Direction, touch: Direction): Direction` — 鍵盤非零優先，否則用觸控；皆零回 `{x:0, y:0}`。回新物件，不變更輸入。
- `InputSource` 介面新增 `consumeInteract(): boolean`（edge-triggered，見 D3）。
- 鍵盤 `createInput()`：追加 `Space` 監聽設 interact 旗標；`consumeInteract()` 讀取並清除；`destroy()` 一併清旗標與監聽。既有 `directionFromKeys` 不變。
- `createTouchInput(): TouchInputSource`：實作 `read()`（回目前觸控方向）/ `consumeInteract()` / `destroy()`；暴露 `setDirection(dir)`（回存新副本）/ `triggerInteract()`（設旗標）。
- 驗收：`src/game/input.test.ts` 覆蓋 `directionFromVector`（deadzone 內回零、過 deadzone 正規化、超半徑 clamp）、`mergeDirections`（鍵盤優先 / 退回觸控 / 皆零）、`consumeInteract`（首次回 true、再次回 false）。

### src/game/engine.ts
- 簽章改為 `createEngine(container: HTMLElement, touch: InputSource): EngineHandle`。
- 動態縮放：移除寫死的 `world.scale.set(WORLD_SCALE)`；以 `computeWorldScale(container.clientWidth)` 算初始 scale 並 `world.scale.set(scale)`；既有 `ResizeObserver` 觸發時重算 scale → 更新 `world.scale` 與 `follow()`。以區域變數持有當前 scale 傳給 `follow()`（`computeFollowOffset` 已吃 scale 參數，免改）。
- 合併輸入：tick 內 `const dir = mergeDirections(keyboard.read(), touch.read())` 餵入 `player.update`。
- 互動：tick 內 `if (keyboard.consumeInteract() || touch.consumeInteract()) { /* M5 暫以 console 驗證 */ }`。
- 卸載：`stopLoop()` 仍只銷毀引擎自有鍵盤 `InputSource`，不銷毀共享 touch。

### src/react/Joystick.tsx
- 觸控偵測：`matchMedia('(pointer: coarse)').matches || navigator.maxTouchPoints > 0`；訂閱 media query change，裝置型態改變時重渲染。
- 非觸控 → 不渲染搖桿/按鈕，改顯示角落鍵盤提示（「方向鍵 / WASD 移動，空白鍵互動」，文案經 content/constants，不寫死於元件邏輯）。
- 搖桿（左下）：半透明圓底座 + 拇指圓；pointer events（`pointerdown/move/up`，支援滑鼠拖曳測試）：拖曳 → 算相對底座中心位移 → `directionFromVector` → `touch.setDirection(dir)`，拇指圓 clamp 在底座半徑內；放開 / `pointercancel` → `setDirection({x:0,y:0})`、拇指歸位。
- 互動鈕（右下）：半透明圓 + icon（非 Sprout 素材）；`pointerdown` → `touch.triggerInteract()`。
- 樣式：純 CSS + semantic token（半透明），無寫死 hex；`position: fixed` + `env(safe-area-inset-*)`。

### src/react/GameCanvas.tsx
- `useEffect` 建立共享 `touch = createTouchInput()` → `createEngine(container, touch)` → 渲染 `<Joystick touch={touch} />`；cleanup 先 `engine.destroy()` 再 `touch.destroy()`。

### src/constants.ts
- 新增（皆整數）：`SCALE_BP_SM`、`SCALE_BP_MD`、`JOYSTICK_BASE_PX`（~120）、`JOYSTICK_THUMB_PX`、`JOYSTICK_DEADZONE_PX`、`INTERACT_BTN_PX`（~64）。`WORLD_SCALE = 3` 保留。

**範圍邊界**：In scope — 上列檔案的輸入、縮放、觸控疊層、共享物件生命週期。Out of scope — 互動面板、互動偵測、彩蛋（M6/M7/M8）；類比變速。

## Risks / Trade-offs

- [共享可變物件繞過 React 資料流] → 嚴格限定生命週期由 GameCanvas 掌管、引擎只讀不擁有；卸載順序固定（先 engine 後 touch）。
- [引擎初始化失敗時 Joystick 仍渲染] → Joystick 不依賴引擎是否成功；引擎未就緒時其輸出無消費者、無副作用，可接受。
- [`pointercancel` / 視窗失焦角色卡住續走] → 這些事件一律 `setDirection({x:0,y:0})` 歸零。
- [固定斷點在臨界寬度跳變] → 可接受；換取整數倍像素清晰與可測性，優於連續縮放的模糊風險。

## Migration Plan

無資料遷移。`createEngine` 簽章新增必填 `touch` 參數屬破壞性介面變更，但唯一呼叫點為 `GameCanvas`，同一變更內一併更新；其餘呼叫點為測試，於 `input.test.ts` / `engine.test.ts` 既有測試同步調整。
