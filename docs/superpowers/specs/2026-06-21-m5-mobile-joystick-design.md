# M5 — 手機虛擬搖桿 + RWD 縮放 設計文件

> 來源：`docs/roadmap/M5-mobile-joystick.md`、spec 第五節（輸入與 RWD 方案 A）。
> 依賴 M4（鍵盤操控 + 相機跟隨）。可與 M6 平行。

## 一、目標與範圍

讓觸控裝置也能走動探索：左下虛擬搖桿驅動移動、右下互動鈕送出互動訊號，並依視窗寬度自動調整世界縮放倍率（手機小、桌機大，整數倍保持像素清晰）。方案 A（相機跟隨）已天然支援直立視窗，**不提醒翻轉手機**。

**In Scope**
- `src/react/Joystick.tsx`：觸控搖桿 + 互動鈕疊層（React，疊在 canvas 上）。
- 搖桿/互動鈕輸出餵入 `src/game/input.ts` 的統一介面，玩家與相機不區分來源。
- 觸控偵測：觸控裝置顯示搖桿/互動鈕，非觸控隱藏並顯示鍵盤提示。
- RWD 縮放：依寬度計算整數倍 `WORLD_SCALE`，resize 重算縮放與相機。

**Out of Scope**
- 互動內容面板（M7）。M5 只送出「互動鈕按下」的輸入事件，不負責面板。
- 互動偵測（鄰近判定 / 浮動提示，M6）。
- 彩蛋（M8）。

## 二、整合接縫（核心決策）

採**共享 TouchInput 物件**：在 `GameCanvas` 建立一個實作 `InputSource` 的 `touchInput`，同時傳給引擎與 `Joystick`。引擎每幀合併鍵盤與觸控，玩家/相機完全沿用既有 `Direction` 介面、不知道來源。

```
GameCanvas (React)
 ├─ const touch = createTouchInput()        // 共享物件
 ├─ createEngine(container, touch)            // 引擎合併 keyboard + touch
 └─ <Joystick touch={touch} />               // 觸控疊層驅動 touch 的控制面
```

`touchInput` 對外有兩組介面：
- **消費面（`InputSource`）**：`read()` / `consumeInteract()` / `destroy()`，給引擎每幀讀取。
- **控制面**：`setDirection(dir)` / `triggerInteract()`，給 React `Joystick` 在 pointer 事件時呼叫。

生命週期：`GameCanvas` 的 `useEffect` 建立 `touch` → 建立 `engine` → 卸載時 `engine.destroy()` 後 `touch.destroy()`。引擎不擁有 touch 的生命週期（共享物件由 GameCanvas 管理），但引擎仍擁有自身鍵盤 `InputSource`。

## 三、純函數核心（單元測試對象）

依 CLAUDE.md「純邏輯 → 輕量單元測試」，下列核心無 DOM 依賴、直接測：

| 函數 | 位置 | 職責 |
|---|---|---|
| `directionFromVector(dx, dy)` | `game/input.ts` | 搖桿拖曳位移（相對底座中心）→ 含 deadzone 與 clamp 半徑的正規化 `Direction`。位移在 deadzone 內回 `{0,0}`；過 deadzone 即輸出 magnitude 1 的方向（**全速**，與鍵盤一致，非類比變速）。 |
| `mergeDirections(kb, touch)` | `game/input.ts` | 合併兩來源：鍵盤非零優先，否則用觸控；皆零回 `{0,0}`。回傳新物件，不變更輸入。 |
| `computeWorldScale(width)` | `game/scale.ts`（新） | 固定斷點 → 整數倍縮放。`< SCALE_BP_SM → 2`、`< SCALE_BP_MD → 3`、否則 `4`。保證整數、可預測。 |

`directionFromKeys`（M4 既有）維持不變。

## 四、輸入擴充（`src/game/input.ts`）

- `InputSource` 介面新增 `consumeInteract(): boolean` — **edge-triggered**：自上次呼叫以來若曾按下互動則回 `true` 並清旗標，否則 `false`。確保「按一下＝觸發一次」。
- 鍵盤 `createInput()`：追加監聽 `Space`（`event.code === 'Space'`）→ 設 interact 旗標；`consumeInteract()` 讀取並清除。`destroy()` 一併清旗標與監聽。
- 新增 `createTouchInput(): TouchInputSource`：
  - 實作 `read()`（回目前觸控方向）/ `consumeInteract()` / `destroy()`。
  - 暴露 `setDirection(dir: Direction)`：覆寫內部方向（回存新物件副本，immutability）。
  - 暴露 `triggerInteract()`：設 interact 旗標。
- 不重做移動邏輯——觸控只把正規化向量灌進既有 `Direction` 介面。

## 五、引擎改動（`src/game/engine.ts`）

- 簽章改為 `createEngine(container: HTMLElement, touch: InputSource): EngineHandle`。
- 動態縮放：移除寫死的 `world.scale.set(WORLD_SCALE)`，改為
  - 以 `computeWorldScale(container.clientWidth)` 算出初始 scale，`world.scale.set(scale)`；
  - resize（既有 `ResizeObserver`）時重算 scale → 更新 `world.scale` 與 `follow()`；
  - `follow()` 傳入當前 scale（`computeFollowOffset` 已吃 scale 參數，免改）。以區域變數持有當前 scale。
- 合併輸入：tick 內 `const dir = mergeDirections(keyboard.read(), touch.read())` 餵入 `player.update`。
- 互動：tick 內 `if (keyboard.consumeInteract() || touch.consumeInteract()) { /* M5 暫以 console 驗證 */ }`。互動偵測/面板留 M6/M7。
- 卸載：`stopLoop()` 仍只銷毀引擎自有的鍵盤 `InputSource`；不銷毀共享 touch（由 GameCanvas 負責）。

## 六、觸控疊層（`src/react/Joystick.tsx`，新）

- **觸控偵測**：`matchMedia('(pointer: coarse)').matches || navigator.maxTouchPoints > 0`。
  - 非觸控 → 不渲染搖桿/按鈕，改顯示角落鍵盤提示（「方向鍵 / WASD 移動，空白鍵互動」）。
  - 訂閱 media query change，裝置型態改變時重渲染。
- **搖桿（左下）**：半透明圓底座 + 拇指圓。pointer events（`pointerdown/move/up`，支援滑鼠拖曳測試）：
  - 拖曳 → 算相對底座中心位移 → `directionFromVector` → `touch.setDirection(dir)`；拇指圓位置 clamp 在底座半徑內。
  - 放開 / `pointercancel` → `touch.setDirection({ x: 0, y: 0 })`，拇指歸位。
- **互動鈕（右下）**：半透明圓 + icon（與搖桿同風格，**不用 Sprout 素材**）。`pointerdown` → `touch.triggerInteract()`。
- **樣式**：純 CSS + semantic token（`--surface`、`--outline`、`--accent` 等，半透明），無寫死 hex、無 CSS 圓角以外用途（搖桿為功能性控制項，圓形屬控制元件造型，非裝飾邊框；不套用 9-slice）。`position: fixed` + `env(safe-area-inset-*)` 定位；resize 由 CSS 處理，免額外 JS 重算位置。

> 註：CLAUDE.md「禁止 border-radius」係針對沿用 9-slice 的面板/邊框。虛擬搖桿是觸控控制項、非內容面板，圓形為其固有造型；style-guide 未涵蓋此控制項，故於設計文件明示此例外，避免各自詮釋。

## 七、常數（`src/constants.ts` 擴充）

新增（皆整數）：
- `SCALE_BP_SM` / `SCALE_BP_MD`：縮放斷點寬度（px）。對應 `computeWorldScale` 的 2× / 3× / 4×。
- `JOYSTICK_BASE_PX`（底座直徑，~120）、`JOYSTICK_THUMB_PX`（拇指直徑）、`JOYSTICK_DEADZONE_PX`（deadzone 半徑）。
- `INTERACT_BTN_PX`（互動鈕直徑，~64，拇指可達區）。

`WORLD_SCALE = 3` 保留為桌機/預設參考值；`computeWorldScale` 的中段回傳值與之一致。

## 八、檔案異動清單

| 檔案 | 動作 |
|---|---|
| `src/game/scale.ts` | 新增 `computeWorldScale` |
| `src/game/scale.test.ts` | 新增斷點測試 |
| `src/game/input.ts` | 擴充 `InputSource`（`consumeInteract`）、Space 鍵、`createTouchInput`、`directionFromVector`、`mergeDirections` |
| `src/game/input.test.ts` | 擴充純函數測試 |
| `src/game/engine.ts` | 收 `touch` 參數、動態縮放、合併輸入、互動 console |
| `src/react/Joystick.tsx` | 新增觸控疊層 + 鍵盤提示 |
| `src/react/GameCanvas.tsx` | 建立共享 `touch`、傳入引擎、渲染 `Joystick` |
| `src/constants.ts` | 新增縮放斷點與搖桿/按鈕尺寸 |

## 九、錯誤處理與邊界

- 共享 touch 物件於 GameCanvas 卸載時 `destroy()`，避免懸掛引用（引擎不重複銷毀）。
- 引擎初始化失敗（既有 `showError` 路徑）時不影響 Joystick 渲染；Joystick 不依賴引擎是否成功，但其輸出在引擎未就緒時無消費者（無副作用）。
- `pointercancel` / 視窗失焦：方向歸零，避免角色「卡住續走」。
- resize：scale 重算 + 相機重置（既有 `ResizeObserver`）；搖桿位置由 CSS `fixed` + safe-area 自然成立。

## 十、測試與驗收

**單元測試（Vitest）**
- `scale.test.ts`：`computeWorldScale` 於斷點邊界（含等號邊界）回傳正確整數倍。
- `input.test.ts`：`directionFromVector`（deadzone 內回零、過 deadzone 正規化、超半徑 clamp）、`mergeDirections`（鍵盤優先 / 退回觸控 / 皆零）、`consumeInteract`（按下後首次回 true、再次回 false）。

**手動驗證（`vite dev`，對應驗收標準）**
- [ ] 觸控搖桿可八方向移動，與鍵盤共用同一輸入介面。
- [ ] 直立窄視窗下可走到所有區域（方案 A）。
- [ ] 縮放係數為整數倍、像素清晰；resize 後縮放與相機正確。
- [ ] 非觸控裝置不顯示搖桿，改顯示鍵盤提示。
- [ ] 互動鈕按下於 console 出現互動訊號（M5 暫時驗證）。
