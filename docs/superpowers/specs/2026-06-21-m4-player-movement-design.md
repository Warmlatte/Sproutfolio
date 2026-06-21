# M4 設計：角色移動 + 相機跟隨 + 碰撞

> 來源 roadmap：`docs/roadmap/M4-player-movement.md`
> 上游 spec：`docs/superpowers/specs/2026-06-18-game-style-personal-site-design.md` 第四、五節
> 依賴：M3（靜態農場已渲染、`camera.ts` 已有置中夾制、`engine.ts` 已有 teardown 防護）

## 一、目標

讓玩家用鍵盤（方向鍵 / WASD）操控角色在農場自由走動，含四向待機/走路動畫、與障礙（木屋／樹／水）及地圖邊界的碰撞，相機平順跟隨角色並夾在地圖邊界內（RWD 方案 A 的桌機版）。

## 二、關鍵決策（brainstorming 已與使用者確認）

| 主題 | 決策 | 理由 |
|---|---|---|
| 移動模型 | **自由像素移動**（速度向量 + AABB） | roadmap 範圍寫「速度移動」，spec 強調療癒探索手感（Stardew/Sprout Lands 風），格子對齊手感過於生硬。 |
| 碰撞框 | **腳底小框**（約 `16×10px`，對齊精靈底部中央） | top-down 療癒遊戲標準做法；改善貼牆/靠近障礙的移動手感。 |
| 對角線 | **正規化方向向量** | 避免斜走比直走快。 |
| 碰撞資料來源 | **從既有障礙層導出**（不另維護手繪碰撞圖） | 單一真相：碰撞跟著渲染層走，改地圖不會兩邊不同步。 |
| Walk-behind 深度（y-sort） | **排除於 M4**，角色一律畫在靜態世界之上 | 真正深度排序需每幀重排數百個靜態瓦片，過重；M4 聚焦「移動＋碰撞＋相機」三件交付物。日後可小幅優化。 |

## 三、Pixi.js 能力取捨（核心：Pixi 是純渲染器，非遊戲框架）

Pixi 不像 KAPLAY 自帶遊戲框架，因此本里程碑是「混合」：渲染／迴圈／動畫用 Pixi 現成 API，輸入／碰撞／相機數學自己手寫——而後者正是我們**想要**手寫的純函式（可單元測試、像素完美、無黑盒）。

### 直接採用 Pixi 現成 API

| 需求 | Pixi API | 說明 |
|---|---|---|
| 遊戲迴圈 | **`app.ticker`** | 內建每幀回呼，提供 `deltaMS`/`deltaTime`。 |
| 四向走路動畫 | **`AnimatedSprite`** | 傳入該朝向 `textures[]`，設 `animationSpeed`、`play()`/`gotoAndStop()`。取代手動選幀，player.ts 因此更薄。 |
| 相機位移 | `Container.position` | 移動 `world` 容器即可（M3 已在用）。 |
| 像素清晰 | `scaleMode:'nearest'`、`roundPixels` | M3 已設定，沿用。 |

### 必須手寫（Pixi 不提供）

| 需求 | 為何手寫 |
|---|---|
| 鍵盤輸入 → 方向向量 | Pixi 事件系統只管 sprite 的 pointer 互動，不管鍵盤。鍵盤以 DOM 監聽，並讓 `input.ts` 與來源無關（M5 觸控餵入同介面）。 |
| AABB 碰撞解算 | Pixi 無物理／碰撞。roadmap 本就要求「簡單 AABB，不需物理引擎（YAGNI）」，純函式約 30 行、好測。 |
| 相機跟隨＋邊界夾制 | Pixi 無相機概念。`computeFollowOffset` 是純函式，重用既有 `clamp`，像素完美整數位移。 |

### 不採用 `pixi-viewport`（第三方相機套件）

`pixi-viewport` 提供 follow／clamp／拖曳／捏合縮放（連 M5 觸控縮放都包），但：

- 其縮放為連續浮點，**會破壞整數倍像素完美**（style-guide 鐵則）。
- 多一層相依與黑盒；我們的需求用一個純函式即可解決、且能單元測試。

→ **維持手寫純函式相機**，保留像素完美與可測性。M5 觸控縮放屆時亦以整數倍係數自行處理。

## 四、新增 / 變更模組（多個小檔、高內聚、純邏輯可測）

| 檔案 | 職責 | 純度 |
|---|---|---|
| `src/game/input.ts`（新） | 監聽鍵盤（方向鍵 + WASD），輸出與來源無關的正規化方向向量 `{x,y}`；提供 `destroy()` 解除監聽。 | 合成函式 `directionFromKeys` 純可測 |
| `src/game/collision.ts`（新） | `buildSolidSet(map)` 從障礙層導出可碰撞格集合；`resolveMove(box, dx, dy, solids, bounds)` 做 AABB 軸分離碰撞解算。 | 全純，node 可測 |
| `src/game/player.ts`（新） | 角色實體：持有位置／朝向／`AnimatedSprite`；`update(dt, dir, solids)` 推進移動＋套碰撞＋切換動畫。 | 移動/碰撞委派給純函式 |
| `src/game/camera.ts`（擴充） | 既有 `computeCenterOffset` 之外，新增 `computeFollowOffset(playerPx, viewportPx, mapPx, scale)`。 | 全純 |
| `src/game/engine.ts`（變更） | 加入 `app.ticker` 迴圈驅動 player＋相機；recenter 改用容器 `ResizeObserver`（見第八節）；teardown 一併釋放 input 與 ticker。 | — |
| `src/constants.ts`（擴充） | 新增 `PLAYER_SPEED`、`PLAYER_ANIM_FPS`、`PLAYER_HITBOX`，以及角色朝向↔列的具名常數。 | — |

## 五、遊戲迴圈與資料流

`engine.ts` 以 `app.ticker` 加入每幀更新：

```
每幀 ticker(dt = ticker.deltaMS / 1000):
  dir = input.read()                      // {x,y} 已正規化
  player.update(dt, dir, solids)          // 移動 + 碰撞 + 切換動畫
  offset = computeFollowOffset(player.px, screen, MAP_PX, WORLD_SCALE)
  world.position.set(offset.x, offset.y)  // 相機 = 反向位移世界容器
```

- 角色 `AnimatedSprite` 是 **`world` 容器的子物件**（吃同一個 `WORLD_SCALE`），故 player 座標一律用未縮放世界座標，與瓦片一致。
- 相機「跟隨」＝位移整個 `world` 容器讓角色置中，並用既有 clamp 夾住邊界（地圖某軸小於視窗時退回置中）。
- 角色在出生點 `farmMap.anchors.spawn`（`{col:14, row:16}`）初始化。

## 六、`input.ts`

- 監聽 `window` 的 `keydown`/`keyup`，維護按下中的鍵集合。映射：`ArrowUp/W`、`ArrowDown/S`、`ArrowLeft/A`、`ArrowRight/D`。
- `read()` 由按鍵狀態合成方向向量，**對角線正規化**（除以 √2），回傳新物件（immutability）。
- 純合成函式 `directionFromKeys(keys): {x,y}` 抽出，單元測試覆蓋八方向與無輸入。
- `destroy()` 解除監聽，配合引擎 teardown，避免 React Strict Mode 掛載/卸載洩漏。

## 七、`player.ts` 與 `collision.ts`

### 移動

`pos' = pos + dir * PLAYER_SPEED * dt`，位移量交由 `resolveMove` 做軸分離（先 X 後 Y）碰撞修正，達成沿牆滑動。

### 碰撞（`collision.ts`，全純）

- **腳底框**：約 `16×10px`，對齊角色精靈底部中央（精靈 48×48，繪製時錨點讓「腳」踩在所在格）。
- `buildSolidSet(map)`：收集 `house`、`pond`、`trees` 三層瓦片格為 `Set<"col,row">`；`paths`/`grass` 可走。
- `resolveMove(box, dx, dy, solids, bounds)`：軸分離平移，逐軸檢查腳底框與 solid 格重疊；重疊則該軸貼齊格邊界。邊界 `bounds` 為 `[0, MAP_W] × [0, MAP_H]`，夾住腳底框不出界。

### 四向動畫（採 `AnimatedSprite`）

- 依 `dir` 決定朝向；朝向改變時切換為該朝向的走路 `textures[]`。
- 移動中 `play()`（`animationSpeed` 換算 `PLAYER_ANIM_FPS = 8`）；靜止時 `gotoAndStop()` 回該朝向待機幀。
- **朝向↔列對應已確認**：`character_spritesheet.png` 為 4×4（48×48 格），列序為 down/up/left/right，每列 4 幀。對應抽成 `constants.ts` 具名常數（如 `PLAYER_ROW_DOWN`），日後替換素材時只改常數、不動邏輯。

## 八、M3 審查遺留（本里程碑必處理，導入相機跟隨前先做）

`engine.ts` 的 recenter 目前掛 `window` 的 `resize`，但渲染器用 `resizeTo: container`。兩套機制耦合事件順序，且容器尺寸 ≠ 視窗尺寸（M7 加面板/側欄後）會失準。

→ 改為監聽**容器的 `ResizeObserver`**（沿用 `whenSized` 已用過的機制），讓置中/跟隨來源與 `resizeTo` 一致。`detachResize` 改為 `observer.disconnect()`。

## 九、可調常數（放 `constants.ts`，手動走動時微調）

| 常數 | 預設 | 說明 |
|---|---|---|
| `PLAYER_SPEED` | ~60 px/s（未縮放，約 3.75 tiles/s） | 自由像素移動速度 |
| `PLAYER_ANIM_FPS` | 8 | 走路輪播幀率（roadmap 約 8fps） |
| `PLAYER_HITBOX` | `{ w: 16, h: 10 }` | 腳底碰撞框 |

## 十、測試與驗證（依本專案 spec：輕量單元測試 + 手動走動）

### 純邏輯單元測試（Vitest，node 環境）

- `directionFromKeys`：八方向合成、對角線正規化、無輸入回 `{0,0}`。
- `resolveMove`：撞 solid 該軸貼齊、另一軸可滑動、邊界夾制不出界。
- `buildSolidSet`：障礙層格收集正確、可走層不納入。
- `computeFollowOffset`：角色置中、邊界夾制、地圖小於視窗退回置中。

### 手動走動（`vite dev`）

- 四向移動 + 對應走路/待機動畫正確。
- 撞木屋/樹/水被擋、不穿牆、不出界。
- 相機平順跟隨且不露出地圖外。

## 十一、明確排除（YAGNI，留給後續里程碑）

- 手機虛擬搖桿、觸控縮放（M5）。
- 互動偵測與面板、移動暫停橋接（M7）。
- 砍樹等彩蛋動作（M8）。
- Walk-behind 深度排序（y-sort）——見第二節決策。
- 物理引擎、連續浮點縮放、`pixi-viewport`。

## 十二、驗收標準（對應 roadmap）

- [ ] 四方向移動 + 對應走路動畫正確。
- [ ] 障礙與邊界碰撞有效，角色不穿牆/不出界。
- [ ] 相機跟隨且邊界夾制正確。
- [ ] 純邏輯（方向向量正規化、邊界夾制、碰撞解算）有輕量單元測試。
- [ ] M3 遺留的 `ResizeObserver` 重構已完成。
