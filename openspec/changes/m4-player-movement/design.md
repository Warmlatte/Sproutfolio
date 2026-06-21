## Context

M3 已渲染靜態農場：Pixi 引擎、28×18 瓦片、`WORLD_SCALE=3`、`camera.ts` 的純函式 `computeCenterOffset` 置中並夾制邊界、`engine.ts` 具 React Strict Mode 安全的 teardown。`farmMap.ts` 為純資料但**無碰撞資訊**，障礙物（木屋 3×5、池塘 4×3、樹叢單格）只存在於渲染層。角色素材 `character_spritesheet.png` 為 192×192、4×4（48×48 格），但「哪一列對哪個朝向、每列幾幀走路」仍 `待核對`，需在 `#sprites` debug 頁目視確認。`input.ts` 尚未存在；`events.ts` 僅型別（移動暫停橋接留給 M7）。

約束：style-guide 鐵則要求整數倍縮放與最近鄰取樣（像素完美）；本專案測試策略為「純邏輯輕量單元測試 + 瀏覽器手動走動」，不導入重型測試框架。

## Goals / Non-Goals

**Goals:**

- 鍵盤（方向鍵 + WASD）操控角色在農場自由走動，四向待機/走路動畫正確。
- 與木屋/樹/水障礙及地圖邊界碰撞，角色不穿牆、不出界。
- 相機平順跟隨角色並夾在地圖邊界內，不露出地圖外。
- 純邏輯（方向向量正規化、碰撞解算、邊界夾制）有輕量單元測試。
- 完成 M3 程式碼審查遺留的 `ResizeObserver` 重構。

**Non-Goals:**

- 手機虛擬搖桿、觸控縮放（M5）。
- 互動偵測與面板、移動暫停橋接（M7）。
- 砍樹等彩蛋動作（M8）。
- Walk-behind 深度排序（y-sort）：真正走到樹冠/屋頂背後需每幀重排數百個靜態瓦片，過重，留作日後優化。
- 物理引擎、連續浮點縮放、第三方 `pixi-viewport`。

## Decisions

### 採自由像素速度移動而非格子對齊

每幀以 `pos' = pos + dir * PLAYER_SPEED * dt` 推進，達成 Stardew/Sprout Lands 風的平滑探索手感。roadmap 範圍明寫「速度移動」、spec 強調療癒探索；格子對齊（寶可夢式）手感生硬、與 spec 不符。已與使用者確認。

### 腳底小框碰撞，角色一律畫在世界之上

碰撞框取角色精靈底部中央約 `16×10px` 的腳底小框（精靈 48×48，繪製錨點讓腳踩在所在格），改善貼牆/靠近障礙手感，為 top-down 療癒遊戲標準做法。M4 不做 y-sort，角色 `AnimatedSprite` 一律加在 `world` 容器最上層；walk-behind 深度感留待日後。已與使用者確認。

### 碰撞資料從障礙層導出，不另維護手繪碰撞圖

`buildSolidSet(map)` 收集 `house`、`pond`、`trees` 三層瓦片格為 `Set<"col,row">`（`paths`/`grass` 可走）。單一真相：碰撞跟著渲染層走，改地圖不會兩邊不同步。替代方案（在 `farmMap` 另存一份碰撞陣列）會造成雙重真相、易失同步，否決。

### 遊戲迴圈用 Pixi app.ticker，動畫用 AnimatedSprite

Pixi 是純渲染器、非遊戲框架，但提供現成 `app.ticker`（每幀回呼，給 `deltaMS`）與 `AnimatedSprite`（幀動畫，設 `animationSpeed`、`play()`/`gotoAndStop()`）。直接採用可讓 `player.ts` 不必自管幀計時器。輸入/碰撞/相機 Pixi 不提供，須手寫——而那正是想要的純可測模組。

### 相機跟隨用手寫純函式，不採用 pixi-viewport

擴充 `camera.ts` 新增 `computeFollowOffset(playerPx, viewportPx, mapPx, scale)`：理想位移讓角色置中，再用既有 `clamp` 夾進 `[viewport - scaledMap, 0]`；某軸地圖小於視窗時退回 `computeCenterOffset` 置中行為。否決第三方 `pixi-viewport`：其連續浮點縮放破壞整數倍像素完美（style-guide 鐵則），且多一層黑盒，而純函式即可解決並可單元測試。

### resize 來源改為容器 ResizeObserver（M3 遺留修正）

M3 的 recenter 掛 `window` 的 `resize`，但渲染器用 `resizeTo: container`，兩套機制耦合事件順序，且容器尺寸 ≠ 視窗尺寸（M7 加面板/側欄）會失準。改為監聽容器 `ResizeObserver`（沿用 `whenSized` 已用過的機制），`detachResize` 改為 `observer.disconnect()`，讓置中/跟隨來源與 `resizeTo` 一致。導入相機跟隨前先完成此修正。

### 輸入層與來源無關並正規化對角線

`input.ts` 監聽 `window` keydown/keyup 維護按下中的鍵集合，`read()` 合成方向向量並對角線正規化（除以 √2，避免斜走加速），回傳新物件（immutability）。純合成函式 `directionFromKeys(keys)` 抽出可測；`destroy()` 解除監聽配合引擎 teardown。M5 觸控搖桿輸出同一向量介面，`player.ts`/`engine.ts` 不需區分來源。

## Implementation Contract

**觀察行為**：以 `vite dev` 開站，角色出現在出生點 `farmMap.anchors.spawn`（col 14, row 16）。按方向鍵/WASD 角色朝對應方向走動並播放該朝向走路動畫；放開回到該朝向待機幀。對角線移動速度與直線一致（不加速）。撞到木屋/樹/池塘會被擋下並可沿牆滑動；走到地圖邊緣停住不出界。相機平順跟隨角色，地圖邊緣時相機停在邊界、畫面不露出地圖外的空白。視窗/容器縮放時畫面維持正確、`WORLD_SCALE` 不變。

**介面 / 資料形狀**：

- `input.ts`：`createInput(): { read(): { x: number; y: number }; destroy(): void }`；純函式 `directionFromKeys(keys: ReadonlySet<string>): { x: number; y: number }`（已正規化，無輸入回 `{x:0,y:0}`）。
- `collision.ts`：`buildSolidSet(map: FarmMap): ReadonlySet<string>`（鍵格式 `"col,row"`）；`resolveMove(box, dx, dy, solids, bounds): { x: number; y: number }`（回傳修正後的新位置，軸分離解算）。
- `camera.ts`：`computeFollowOffset(playerPx: Offset, viewportPx: Size, mapPx: Size, scale: number): Offset`（`playerPx` 為角色未縮放世界座標點 `{x,y}`，與 player 的 `px` 一致；回傳整數像素位移）。
- `player.ts`：`createPlayer(world, atlas, spawn): { update(dt, dir, solids): void; readonly px: { x: number; y: number } }`。
- `constants.ts` 新增：`PLAYER_SPEED`、`PLAYER_ANIM_FPS`、`PLAYER_HITBOX`、角色朝向↔精靈列具名常數（如 `PLAYER_ROW_DOWN`）。
- `engine.ts`：以 `app.ticker.add` 串接 `input.read` → `player.update` → `computeFollowOffset` → `world.position.set`；teardown 釋放 input、移除 ticker callback、`observer.disconnect()`。

**失敗模式**：素材載入失敗沿用 M3 的像素風錯誤面板（不靜默）。角色朝向↔列對應未確認前，以 `constants.ts` 具名常數承載暫定值，於 `#sprites` 頁確認後只改常數、不動邏輯。

**精靈錨點與腳底點**：48×48 角色幀含透明留白——人物實際只佔幀內第 16–31 列（上緣 16px、腳下 16px 透明）。故 `px`（腳底點）對齊「美術腳線」（幀內 y=32），精靈 anchor 設為 `0.5, (frameH-PLAYER_FOOT_INSET)/frameH`，使「可見的腳」落在 `px`。若錯用 anchor `1.0`（幀底），碰撞與算繪會比可見人物低一格（向下走時人物會停在草叢上方一格、碰撞箱底貼草叢頂）。

**邊界與精靈尺寸**：碰撞用 16×10 腳底框（貼障礙手感），但可見人物本體（自腳底點上延 `PLAYER_BODY.up`、左右各 `PLAYER_BODY.halfW`）比腳底框大。若只夾制腳底框，可見本體會溢出地圖邊緣，而夾在地圖內的相機會把溢出部分藏住（向上走最嚴重 → 看不見角色）。因此 `player` 於 resolveMove 之後再以可見本體範圍夾制腳底點（`x∈[halfW, mapW-halfW]`、`y∈[up, mapH]`），確保可見人物留在地圖內、相機恆能完整顯示。透明留白可無害地落在地圖外。

**驗收標準**：

- Vitest 單元測試涵蓋 `directionFromKeys`（八方向 + 正規化 + 無輸入）、`resolveMove`（撞牆貼齊、另一軸滑動、邊界夾制）、`buildSolidSet`（障礙層收格、可走層排除）、`computeFollowOffset`（置中、邊界夾制、地圖小於視窗退回置中）。
- 手動走動逐項確認：四向移動/動畫、撞木屋/樹/水被擋、不出界、相機跟隨不露地圖外。

**範圍邊界**：

- 範圍內：`input.ts`、`collision.ts`、`player.ts`、`camera.ts` 跟隨函式、`engine.ts` 迴圈與 ResizeObserver 修正、`constants.ts` 常數。
- 範圍外：見 Non-Goals（搖桿、互動面板、彩蛋、y-sort、pixi-viewport）。

## Risks / Trade-offs

- [角色朝向↔精靈列 `待核對`，猜錯會導致動畫朝向不符] → 對應抽成 `constants.ts` 具名常數；先於 `#sprites` debug 頁目視確認再填值，確認後只改常數。
- [速度/碰撞框數值純屬手感，預設可能偏快或偏卡] → 全部放 `constants.ts`，手動走動時微調，不影響邏輯與測試。
- [不做 y-sort，角色永遠畫在樹/屋之上，無法走到其背後] → 已與使用者確認為可接受邊界；feet 框仍改善移動手感，深度感留待日後小幅優化。
- [house 整塊 3×5 設為 solid，無法走到屋後] → M4 接受；roadmap 僅要求「撞木屋被擋」，符合驗收。

## Open Questions

(none — 角色朝向↔列對應屬實作時於 `#sprites` 頁確認的既知步驟，非設計未決問題。)
