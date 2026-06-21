## 1. 常數（constants.ts）

- [ ] 1.1 在 `constants.ts` 新增 `PLAYER_SPEED`、`PLAYER_ANIM_FPS`、`PLAYER_HITBOX`，以及角色朝向↔精靈列具名常數（如 `PLAYER_ROW_DOWN`），作為「採自由像素速度移動而非格子對齊」的可調參數來源。驗證：`npx tsc --noEmit` 型別通過，數值對齊 design 第九節（人工 review）。

## 2. 輸入層（input.ts）

- [ ] 2.1 實作 `input.ts`，落實「輸入層與來源無關並正規化對角線」決策：監聽 window `keydown`/`keyup` 維護按鍵集合，純函式 `directionFromKeys` 將方向鍵/WASD 合成已正規化方向向量並回傳新物件，`destroy()` 解除監聽。滿足需求「Keyboard input resolves to a source-agnostic direction vector」。驗證：新增 `input.test.ts`，Vitest 覆蓋八方向、對角線 magnitude=1、相反鍵抵銷、無輸入回 `{0,0}`，`npx vitest run` 綠燈。

## 3. 碰撞純函式（collision.ts）

- [ ] 3.1 實作 `buildSolidSet(map)`，落實「碰撞資料從障礙層導出，不另維護手繪碰撞圖」決策：從 `house`/`pond`/`trees` 層收集 `"col,row"` 格、排除 `grass`/`paths`。滿足需求「Solid cells are derived from the map's obstacle layers」。驗證：新增 `collision.test.ts` 斷言障礙格在集合內、可走格不在，`npx vitest run` 綠燈。
- [ ] 3.2 實作 `resolveMove(box, dx, dy, solids, bounds)`，落實「腳底小框碰撞，角色一律畫在世界之上」決策：以 `PLAYER_HITBOX` 腳底框軸分離解算、撞 solid 該軸貼齊格邊、`bounds` 夾制不出界。滿足需求「Movement is resolved against solids with a feet hitbox and map bounds」。驗證：`collision.test.ts` 覆蓋單軸阻擋另一軸可滑動、邊界夾制、無碰撞時全量套用，`npx vitest run` 綠燈。

## 4. 相機跟隨（camera.ts）

- [ ] 4.1 擴充 `camera.ts` 新增 `computeFollowOffset(playerPx, viewportPx, mapPx, scale)`，落實「相機跟隨用手寫純函式，不採用 pixi-viewport」決策：以角色為中心、重用 `clamp` 夾進地圖邊界、某軸地圖小於視窗退回置中、回傳整數像素。滿足需求「Camera follows the player clamped to map bounds」。驗證：擴充 `camera.test.ts` 覆蓋內部置中、邊界夾制、小軸退回置中，`npx vitest run` 綠燈。

## 5. 角色實體（player.ts）

- [ ] 5.1 實作 `player.ts` 的移動與生成，落實「採自由像素速度移動而非格子對齊」：角色為 `world` 子物件，於出生點 `spawn` 生成，`update(dt, dir, solids)` 以 `dir * PLAYER_SPEED * dt` 推進後交 `resolveMove` 修正。滿足需求「Player moves with free pixel velocity」。驗證：`vite dev` 手動走動，角色從出生點起步、撞木屋/樹/水被擋、不出界、對角不加速。
- [ ] 5.2 實作 `player.ts` 的四向動畫，落實「遊戲迴圈用 Pixi app.ticker，動畫用 AnimatedSprite」中的動畫部分：以 `AnimatedSprite` 依朝向切走路 `textures[]`、移動 `play()`（`animationSpeed` 換算 `PLAYER_ANIM_FPS`）、靜止 `gotoAndStop()` 待機幀；朝向↔列取自常數。滿足需求「Player plays four-direction walk and idle animations」。驗證：先於 `#sprites` debug 頁確認列序並回填常數，`vite dev` 手動確認四向走/待機動畫正確。

## 6. 引擎整合（engine.ts）

- [ ] 6.1 將 `engine.ts` 的 recenter 由 `window` `resize` 事件改為容器 `ResizeObserver`，落實「resize 來源改為容器 ResizeObserver（M3 遺留修正）」：`detachResize` 改為 `observer.disconnect()`，使置中/跟隨來源與 `resizeTo: container` 一致。滿足需求「Engine drives the player and camera each frame and follows container resize」之 resize 部分。驗證：`vite dev` 縮放視窗與（模擬）容器尺寸變化，畫面維持正確、`WORLD_SCALE` 不變。
- [ ] 6.2 在 `engine.ts` 以 `app.ticker.add` 串接每幀迴圈（落實「遊戲迴圈用 Pixi app.ticker，動畫用 AnimatedSprite」的迴圈部分）：`input.read` → `player.update` → `computeFollowOffset` → `world.position.set`；建立 player 前先 `buildSolidSet`。滿足需求「Engine drives the player and camera each frame and follows container resize」。驗證：`vite dev` 手動走動，相機平順跟隨且不露地圖外。
- [ ] 6.3 在 `engine.ts` teardown 釋放輸入與迴圈：移除 ticker callback、`observer.disconnect()`、`input.destroy()`，確保 React Strict Mode 掛載/卸載/重掛無洩漏。對應需求「Engine drives the player and camera each frame and follows container resize」之 teardown 場景。驗證：`engine.test.ts` 斷言 teardown 後不再有 ticker 更新與監聽，`npx vitest run` 綠燈。

## 7. 驗收

- [ ] 7.1 全量單元測試與手動走動驗收：`npx vitest run` 全綠（input/collision/camera/engine），並以 `vite dev` 逐項確認四向移動+動畫、撞木屋/樹/水被擋、不出界、相機跟隨不露地圖外，對齊 design 的驗收標準。
