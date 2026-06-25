# M6 UI 設計系統 — Part 2：元件 API 契約

> 來源：`docs/roadmap/M6-ui-design-system.md`、`docs/style-guide.md`。
> 架構與共用基元見 [Part 1](./2026-06-24-m6-ui-architecture-design.md)。
> 本文件定義 7 個元件的 props 介面，作為實作與 design 代理的 API 契約。

## 共通約定

- 所有 props 皆 `Readonly` 友善、**無就地修改**（immutability）。
- 型別放各元件檔頂，`src/ui/index.ts` 統一 re-export。
- 樣式只用 semantic token；不寫死 hex、不用 `border-radius`、不用未列入 style-guide 的顏色。
- 外部連結一律 `target="_blank"` + `rel="noopener"`。

## 1. `PixelIcon`

由 `icons_all`（18×3, 16px，共 54 格）切圖。單一 `<span>` 以 `background-position` 定位切圖（非 canvas），方便嵌在文字／按鈕內。

```tsx
interface PixelIconProps {
  index: number       // 0–53，對應 icons_all 格子
  scale?: number      // 整數倍，預設 2
  label?: string      // 無障礙；有則 role="img" + aria-label，無則 aria-hidden
}
```

## 2. `PixelButton`

組合 `NineSlice`（`as="button"`）。

```tsx
interface PixelButtonProps {
  children: React.ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary'   // primary 面用 --accent，secondary 用 --surface
  iconIndex?: number                   // 可選前置 PixelIcon
  disabled?: boolean
}
```

- 狀態 hover／active／disabled 用 semantic token 切換面色 + 1px 像素位移（`steps()`、100–150ms），不寫死 hex。
- ⚠️ **切片素材待核對**：`btn_square_26`（catalog 標 `待核對`，32×32／3×6）的 slice 邊框值需在 gallery 上目視確認後釘住（列入 Part 3 風險）。

## 3. `DialogBox`

組合 `NineSlice`（`dialog_box.png`, slice 16）+ `useTypewriter`。

```tsx
interface DialogBoxProps {
  text: string
  speakerName?: string        // 有則顯示名牌
  speed?: number              // ms/字，預設 30
  onAdvance?: () => void      // 全文顯示後點擊觸發
}
```

- 打字中點擊 → 秒顯全文；完成後點擊 → `onAdvance()`。
- `prefers-reduced-motion` 時直接顯示全文。
- `useTypewriter(text, speed)` 回傳 `{ shown, isDone, skip }`，純邏輯，可單元測試（RED→GREEN）。

## 4. `Panel`

通用 9-slice 容器，組合 `NineSlice`。

```tsx
interface PanelProps {
  children: React.ReactNode
  padding?: 'sm' | 'md' | 'lg'   // 對應 8 / 16 / 24 間距階
  className?: string
}
```

## 5. `InventoryGrid`

展示型（presentational）；格底用 `inventory`（9×9, 16px）切片。

```tsx
interface InventoryItem { iconIndex: number; label?: string }
interface InventoryGridProps {
  items: ReadonlyArray<InventoryItem | null>  // null = 空格
  columns: number
  selectedIndex?: number
  onSelect?: (index: number) => void          // M6 只回呼，不含選取狀態邏輯
}
```

> 設計選擇：M6 的 `InventoryGrid` 為**展示型**——只負責渲染與回呼 `onSelect(index)`，不持有選取狀態邏輯（選取狀態由呼叫端在 M7 控制）。

## 6. `ProjectCard`

組合 `Panel`。

```tsx
interface ProjectCardProps {
  title: string
  description: string
  tags?: ReadonlyArray<string>
  thumbnailUrl?: string
  href?: string                 // 有則整卡可點，外開 + rel="noopener"
}
```

## 7. `ContactPanel`

組合 `Panel` + `PixelIcon`。

```tsx
interface ContactLink { iconIndex: number; label: string; href: string }
interface ContactPanelProps {
  links: ReadonlyArray<ContactLink>   // 外開 target="_blank" rel="noopener"
}
```

## 待確認（brainstorming 進行中）

- `InventoryGrid` 做成展示型（只回呼、不含選取狀態邏輯）是否符合 M7 預期。
- `ProjectCard` / `ContactPanel` 欄位是否對齊 M7 的 `content.ts` 內容結構。

> 這兩點待使用者確認；確認後本文件定稿，接著補 Part 3（9-slice／token 機制、gallery、測試與風險）。
