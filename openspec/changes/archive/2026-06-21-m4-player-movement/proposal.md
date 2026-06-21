## Why

M3 已渲染靜態農場，但訪客還無法走動探索。M4 加入鍵盤操控的角色、四向動畫、障礙/邊界碰撞與相機跟隨，達成 spec 第五節「方案 A：鏡頭跟隨」的桌機版核心體驗；輸入層設計為與來源無關，讓 M5 觸控可無痛接入。

## What Changes

- 新增 `input.ts`：鍵盤（方向鍵 + WASD）→ 正規化方向向量，與來源無關（M5 觸控餵入同介面）。
- 新增 `player.ts`：角色實體，自由像素速度移動、四向走路/待機動畫（採 Pixi `AnimatedSprite`）。
- 新增 `collision.ts`：純函式 AABB 腳底框碰撞解算、從地圖障礙層導出可碰撞格集合、地圖邊界夾制。
- 擴充 `camera.ts`：新增相機跟隨函式，以角色為中心並夾在地圖邊界（地圖小於視窗時退回置中）。
- 變更 `engine.ts`：以 `app.ticker` 加入每幀更新迴圈驅動角色與相機；teardown 一併釋放輸入與 ticker。
- 變更 `engine.ts` 的 resize 機制：由 `window` resize 事件改為**容器 `ResizeObserver`**（M3 程式碼審查遺留必處理項），讓置中/跟隨來源與 `resizeTo: container` 一致。
- 擴充 `constants.ts`：新增移動速度、動畫幀率、腳底碰撞框、角色朝向↔精靈列等具名常數。

## Capabilities

### New Capabilities

- `player-movement`: 鍵盤輸入合成方向向量、角色自由像素移動、四向走路/待機動畫。
- `world-collision`: 從地圖障礙層導出可碰撞格、AABB 腳底框軸分離碰撞解算、地圖邊界夾制。
- `camera-follow`: 相機跟隨角色並夾在地圖邊界，容器 `ResizeObserver` 驅動位移重算（含 M3 resize-source 修正）。

### Modified Capabilities

(none)

## Impact

- Affected specs: player-movement, world-collision, camera-follow（皆為新增能力）
- Affected code:
  - New: src/game/input.ts, src/game/collision.ts, src/game/player.ts
  - Modified: src/game/camera.ts, src/game/engine.ts, src/constants.ts
  - Removed: (none)
- Dependencies: 不新增第三方相依（沿用 pixi.js；明確不採用 pixi-viewport，以維持整數倍像素完美）。
