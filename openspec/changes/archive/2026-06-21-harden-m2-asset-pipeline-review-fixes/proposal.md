## Why

M2 asset pipeline 的主功能已大致完成，但 code review 發現 catalog 型別契約、debug viewer 色彩規範與驗證覆蓋仍有缺口。這些缺口若進入 M3-M7，會讓後續引擎載入與素材座標依賴不穩定，且違反專案 semantic token 規則。

## What Changes

- 鎖定 sprite catalog 的 11 個 logical keys，讓缺 key、多 key 或非 readonly catalog 在型別與測試層被擋下。
- 移除 dev sprite viewer 的硬編碼錯誤色，改用既有 semantic token 或已定義 utility。
- 補上 catalog 與素材清單的輕量 Vitest 驗證，涵蓋 player/dialogBox contract、`/sprites/` 路徑與 deferred assets 排除。
- 收斂 dev viewer 的小型穩定性問題：避免 render 期間重建 nine-slice rects，並對非正整數 scale 顯示明確錯誤。

## Capabilities

### New Capabilities

- `asset-pipeline-quality-gates`: 規範 M2 sprite catalog、debug viewer 與測試守門，確保 asset pipeline 的契約可被後續里程碑穩定依賴。

### Modified Capabilities

(none)

## Impact

- Affected specs: asset-pipeline-quality-gates
- Affected code:
  - New: src/game/sprites/catalog.test.ts
  - Modified: src/game/sprites/catalog.ts, src/dev/SpriteCanvas.tsx, src/dev/SpriteDebug.tsx
  - Removed: (none)
