# M6 UI 設計系統元件庫 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 打造 `src/ui/` 自包含的 Sprout Lands 風格 React + Tailwind UI 元件庫（7 個元件 + 共用基元 + `#ui` 預覽頁），純 React、可獨立預覽、可 design-sync。

**Architecture:** 一個共用 `<NineSlice>` 基元用 CSS `border-image` 渲染所有 9-slice 表面；各表面元件（Panel／DialogBox／PixelButton／ContactPanel）組合它。所有像素數學（sprite 背景定位、nine-slice CSS 值、typewriter 揭字數）抽成純 `.ts` 函式做 TDD 單元測試；React 元件本身在 `#ui` gallery 目視驗證 + `tsc --noEmit` 型別把關。沿用既有 M2 的 `catalog.ts`／`frame.ts` 座標與 `#sprites` dev-gate 模式。

**Tech Stack:** Vite 6 + React 19 + TypeScript 5.7 + Tailwind 4（CSS `@theme`）+ Vitest 4（node env）。無新增依賴（YAGNI）。

## Global Constraints

逐條複製自 specs，每個 task 都隱含適用：

- **只用 semantic token**：`bg-surface` `bg-surface-inset` `border-border` `text-text` `text-text-muted` `text-text-invert` `bg-accent` `bg-accent-hover` `text-link` `text-success` `text-danger`（定義於 `src/index.css @theme`）。**禁止寫死 hex、禁止 `border-radius`、禁止未列入 style-guide 的顏色。**
- **像素規範**：16px 基準、`scale` 必為**正整數**、`image-rendering: pixelated`、像素字體關閉抗鋸齒。
- **字級**：`text-pixel-sm`(11) / `text-pixel-base`(22) / `text-pixel-lg`(33) / `text-pixel-xl`(44)；字體 `font-pixel` / `font-decorative`。
- **間距階**：`4 / 8 / 16 / 24 / 32 / 48` px。`Panel` padding：sm=8、md=16、lg=24。
- **9-slice 圓角邊框一律來自素材**，不用 CSS 圓角。
- **Immutability**：建立新物件，不就地修改；props `Readonly` 友善。
- **錯誤處理**：純函式對非法輸入 `throw RangeError`，不靜默吞錯。
- **外部連結**：`target="_blank"` + `rel="noopener"`。
- **動態**：UI 過場 100–150ms、可用 `steps()`；尊重 `prefers-reduced-motion`。
- **測試環境**：vitest `environment: 'node'`、`include: ['src/**/*.test.ts']`。單元測試只寫**純 `.ts` 邏輯**；React 元件不寫單元測試，改以 gallery 目視 + `tsc --noEmit`。
- **檔案位置**：全部新檔進 `src/ui/`，不在根目錄散落。
- **素材座標**：一律取自 `src/game/sprites/catalog.ts`，不另行硬編座標。
- **Commit 格式**：`<type>: <小寫標題，無句點，≤50字>`，type ∈ feat/fix/refactor/docs/test/chore/style/perf。

## 素材對照（locked）

| 元件 | catalog key | 尺寸 |
|---|---|---|
| DialogBox／Panel 表面 | `dialogBox`（nine-slice） | 48×48，border 16 |
| PixelButton 面 | `btnSquare`（grid） | 32×32／3×6，⚠️`待核對` |
| PixelIcon | `iconsAll`（grid） | 18×3，16px（54 格） |
| InventoryGrid 格底 | `inventory`（grid） | 9×9，16px |

## 檔案結構（locked）

```
src/ui/
├── spriteBackground.ts        ← 純：grid 切圖→CSS background 樣式（TDD）
├── spriteBackground.test.ts
├── nineSliceStyle.ts          ← 純：border-image CSS 值（TDD）
├── nineSliceStyle.test.ts
├── typewriter.ts              ← 純：揭字數計算（TDD）
├── typewriter.test.ts
├── useTypewriter.ts           ← hook：包 typewriter + rAF + reduced-motion
├── primitives/
│   ├── NineSlice.tsx
│   └── PixelIcon.tsx
├── Panel.tsx
├── PixelButton.tsx
├── DialogBox.tsx
├── InventoryGrid.tsx
├── ProjectCard.tsx
├── ContactPanel.tsx
├── index.ts                   ← barrel export
└── gallery/UIGallery.tsx      ← #ui 預覽頁
src/App.tsx                     ← 修改：加 #ui 路由
```

確認的產品決策：`InventoryGrid` 為**展示型**（只回呼 `onSelect`，不持有選取狀態）；`ProjectCard` 欄位 = title/description/tags/thumbnailUrl/href；`ContactPanel` = links[{iconIndex,label,href}]。

---

### Task 1: `spriteBackground` 純函式（grid 切圖 → CSS 樣式）

被 PixelIcon、InventoryGrid 共用：把 grid sheet 的某格轉成 CSS background 定位樣式。

**Files:**
- Create: `src/ui/spriteBackground.ts`
- Test: `src/ui/spriteBackground.test.ts`

**Interfaces:**
- Consumes: `frameRect` from `src/game/sprites/frame.ts`；`GridSheet` from `src/game/sprites/types.ts`。
- Produces: `spriteBackground(sheet: GridSheet, index: number, scale: number): SpriteBackgroundStyle`，其中
  `interface SpriteBackgroundStyle { width: number; height: number; backgroundImage: string; backgroundPosition: string; backgroundSize: string; imageRendering: 'pixelated' }`。

- [ ] **Step 1: Write the failing test**

```ts
// src/ui/spriteBackground.test.ts
import { describe, it, expect } from 'vitest'
import { spriteBackground } from './spriteBackground'
import { catalog } from '../game/sprites/catalog'

describe('spriteBackground', () => {
  it('maps iconsAll index 0 at scale 2 to a top-left background', () => {
    const s = spriteBackground(catalog.iconsAll, 0, 2)
    expect(s).toEqual({
      width: 32,
      height: 32,
      backgroundImage: 'url(/sprites/ui/icons_all.png)',
      backgroundPosition: '0px 0px',
      backgroundSize: '576px 96px', // 288*2 × 48*2
      imageRendering: 'pixelated',
    })
  })

  it('offsets background-position by column at scale 2', () => {
    const s = spriteBackground(catalog.iconsAll, 1, 2)
    expect(s.backgroundPosition).toBe('-32px 0px') // col 1 → 16*2
  })

  it('offsets to the next row by row-major index', () => {
    const s = spriteBackground(catalog.iconsAll, 18, 2) // first cell of row 1
    expect(s.backgroundPosition).toBe('0px -32px')
  })

  it.each([0, -1, 1.5, Number.NaN])('throws for non-positive-integer scale %s', (scale) => {
    expect(() => spriteBackground(catalog.iconsAll, 0, scale)).toThrow(RangeError)
  })

  it('propagates frameRect range errors for bad index', () => {
    expect(() => spriteBackground(catalog.iconsAll, 999, 2)).toThrow(RangeError)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/ui/spriteBackground.test.ts`
Expected: FAIL（`Cannot find module './spriteBackground'`）

- [ ] **Step 3: Write minimal implementation**

```ts
// src/ui/spriteBackground.ts
/**
 * Pure: resolve a grid sheet cell to CSS background properties for an
 * integer-scaled, pixel-perfect <span>. No DOM, no React.
 */
import { frameRect } from '../game/sprites/frame'
import type { GridSheet } from '../game/sprites/types'

export interface SpriteBackgroundStyle {
  readonly width: number
  readonly height: number
  readonly backgroundImage: string
  readonly backgroundPosition: string
  readonly backgroundSize: string
  readonly imageRendering: 'pixelated'
}

export function spriteBackground(
  sheet: GridSheet,
  index: number,
  scale: number,
): SpriteBackgroundStyle {
  if (!Number.isInteger(scale) || scale <= 0) {
    throw new RangeError(
      `spriteBackground: scale must be a positive integer, received ${scale}`,
    )
  }
  const rect = frameRect(sheet, index) // validates index, throws RangeError
  const sheetW = sheet.frameW * sheet.cols
  const sheetH = sheet.frameH * sheet.rows
  return {
    width: rect.sw * scale,
    height: rect.sh * scale,
    backgroundImage: `url(${sheet.src})`,
    backgroundPosition: `${-rect.sx * scale}px ${-rect.sy * scale}px`,
    backgroundSize: `${sheetW * scale}px ${sheetH * scale}px`,
    imageRendering: 'pixelated',
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/ui/spriteBackground.test.ts`
Expected: PASS（all assertions）

- [ ] **Step 5: Commit**

```bash
git add src/ui/spriteBackground.ts src/ui/spriteBackground.test.ts
git commit -m "feat: add spriteBackground sprite-sheet css helper"
```

---

### Task 2: `nineSliceStyle` 純函式（border-image CSS 值）

`<NineSlice>` 基元的 CSS 計算抽成純函式，方便 TDD 鎖定整數倍邊框寬。

**Files:**
- Create: `src/ui/nineSliceStyle.ts`
- Test: `src/ui/nineSliceStyle.test.ts`

**Interfaces:**
- Produces: `nineSliceStyle(asset: string, slice: number, scale: number): NineSliceCssStyle`，其中
  `interface NineSliceCssStyle { borderStyle: 'solid'; borderWidth: string; borderImageSource: string; borderImageSlice: string; borderImageWidth: string; borderImageRepeat: 'stretch'; imageRendering: 'pixelated' }`。

- [ ] **Step 1: Write the failing test**

```ts
// src/ui/nineSliceStyle.test.ts
import { describe, it, expect } from 'vitest'
import { nineSliceStyle } from './nineSliceStyle'

describe('nineSliceStyle', () => {
  it('computes border-image css for slice 16 at scale 2', () => {
    expect(nineSliceStyle('/sprites/ui/dialog_box.png', 16, 2)).toEqual({
      borderStyle: 'solid',
      borderWidth: '32px', // 16*2, integer multiple keeps it crisp
      borderImageSource: 'url(/sprites/ui/dialog_box.png)',
      borderImageSlice: '16 fill', // fill keeps the centre region
      borderImageWidth: '32px',
      borderImageRepeat: 'stretch',
      imageRendering: 'pixelated',
    })
  })

  it.each([0, -1, 1.5, Number.NaN])('throws for bad slice %s', (slice) => {
    expect(() => nineSliceStyle('/a.png', slice, 2)).toThrow(RangeError)
  })

  it.each([0, -1, 1.5, Number.NaN])('throws for bad scale %s', (scale) => {
    expect(() => nineSliceStyle('/a.png', 16, scale)).toThrow(RangeError)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/ui/nineSliceStyle.test.ts`
Expected: FAIL（`Cannot find module './nineSliceStyle'`）

- [ ] **Step 3: Write minimal implementation**

```ts
// src/ui/nineSliceStyle.ts
/**
 * Pure: compute CSS border-image properties for a nine-slice surface at an
 * integer scale. `fill` preserves the centre region as the surface background.
 */
export interface NineSliceCssStyle {
  readonly borderStyle: 'solid'
  readonly borderWidth: string
  readonly borderImageSource: string
  readonly borderImageSlice: string
  readonly borderImageWidth: string
  readonly borderImageRepeat: 'stretch'
  readonly imageRendering: 'pixelated'
}

export function nineSliceStyle(
  asset: string,
  slice: number,
  scale: number,
): NineSliceCssStyle {
  if (!Number.isInteger(slice) || slice <= 0) {
    throw new RangeError(`nineSliceStyle: slice must be a positive integer, received ${slice}`)
  }
  if (!Number.isInteger(scale) || scale <= 0) {
    throw new RangeError(`nineSliceStyle: scale must be a positive integer, received ${scale}`)
  }
  const width = `${slice * scale}px`
  return {
    borderStyle: 'solid',
    borderWidth: width,
    borderImageSource: `url(${asset})`,
    borderImageSlice: `${slice} fill`,
    borderImageWidth: width,
    borderImageRepeat: 'stretch',
    imageRendering: 'pixelated',
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/ui/nineSliceStyle.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/ui/nineSliceStyle.ts src/ui/nineSliceStyle.test.ts
git commit -m "feat: add nineSliceStyle border-image css helper"
```

---

### Task 3: `#ui` gallery 骨架 + App.tsx 路由

先立空 gallery 與路由，後續每個元件 task 往裡面加 section 做目視驗證。

**Files:**
- Create: `src/ui/gallery/UIGallery.tsx`
- Modify: `src/App.tsx`

**Interfaces:**
- Produces: `UIGallery` named export；`GallerySection({ title, note?, children })` named export（供後續 task 重用）。

- [ ] **Step 1: Create the gallery scaffold**

```tsx
// src/ui/gallery/UIGallery.tsx
/**
 * Dev-only UI design-system preview (#ui). Mirrors src/dev/SpriteDebug.tsx:
 * one Section per component showing each state. Never in production output.
 * Sections are appended as each M6 component lands.
 */

interface GallerySectionProps {
  title: string
  note?: string
  children: React.ReactNode
}

export function GallerySection({ title, note, children }: GallerySectionProps) {
  return (
    <section style={{ marginBottom: 32 }}>
      <h2 className="font-decorative text-pixel-lg">{title}</h2>
      {note ? (
        <p className="text-pixel-sm text-text-muted" style={{ marginBottom: 8 }}>
          {note}
        </p>
      ) : null}
      {children}
    </section>
  )
}

export function UIGallery() {
  return (
    <main className="bg-surface text-text" style={{ minHeight: '100vh', padding: 32 }}>
      <h1 className="font-decorative text-pixel-xl">UI design system</h1>
      <p className="text-pixel-sm text-text-muted" style={{ marginBottom: 32 }}>
        Dev-only preview (#ui). Verify nine-slice surfaces, tokens and states.
      </p>
      {/* component sections appended by later tasks */}
    </main>
  )
}
```

- [ ] **Step 2: Add the `#ui` route to App.tsx**

In `src/App.tsx`, mirror the existing `SpriteDebug` dev-gate pattern. After the `SpriteDebug` lazy declaration add:

```tsx
const UIGallery = import.meta.env.DEV
  ? lazy(() =>
      import('./ui/gallery/UIGallery').then((m) => ({ default: m.UIGallery })),
    )
  : null
```

Inside `function App()`, before the existing `#sprites` block, add:

```tsx
  if (UIGallery && hash === '#ui') {
    return (
      <Suspense fallback={null}>
        <UIGallery />
      </Suspense>
    )
  }
```

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit`
Expected: PASS（no errors）

- [ ] **Step 4: Visual verify**

Run: `npm run dev`，開瀏覽器到 `http://localhost:5173/#ui`。
Expected: 看到木色背景頁、標題「UI design system」與說明文字，無 console 錯誤。

- [ ] **Step 5: Commit**

```bash
git add src/ui/gallery/UIGallery.tsx src/App.tsx
git commit -m "feat: add #ui gallery scaffold and route"
```

---

### Task 4: `NineSlice` 基元 + gallery 區段

**Files:**
- Create: `src/ui/primitives/NineSlice.tsx`
- Modify: `src/ui/gallery/UIGallery.tsx`

**Interfaces:**
- Consumes: `nineSliceStyle` (Task 2)。
- Produces: `NineSlice(props: NineSliceProps)`，
  `interface NineSliceProps { asset: string; slice: number; scale?: number; as?: 'div' | 'button'; className?: string; onClick?: () => void; disabled?: boolean; children: React.ReactNode }`。預設 `scale=2`、`as='div'`。

- [ ] **Step 1: Implement NineSlice**

```tsx
// src/ui/primitives/NineSlice.tsx
/**
 * Shared 9-slice surface. Renders a single element whose border-image is the
 * sprite's nine slices (corners fixed, edges/centre stretched). Children flow
 * inside the centre region. The only place border-image is applied in src/ui.
 */
import type { CSSProperties } from 'react'
import { nineSliceStyle } from '../nineSliceStyle'

export interface NineSliceProps {
  asset: string
  slice: number
  scale?: number
  as?: 'div' | 'button'
  className?: string
  onClick?: () => void
  disabled?: boolean
  children: React.ReactNode
}

export function NineSlice({
  asset,
  slice,
  scale = 2,
  as = 'div',
  className,
  onClick,
  disabled,
  children,
}: NineSliceProps) {
  const style = nineSliceStyle(asset, slice, scale) as CSSProperties

  if (as === 'button') {
    return (
      <button type="button" className={className} style={style} onClick={onClick} disabled={disabled}>
        {children}
      </button>
    )
  }
  return (
    <div className={className} style={style}>
      {children}
    </div>
  )
}
```

- [ ] **Step 2: Add a NineSlice section to the gallery**

In `src/ui/gallery/UIGallery.tsx`, add the import and a section inside `<main>`:

```tsx
import { NineSlice } from '../primitives/NineSlice'
```

```tsx
      <GallerySection title="NineSlice (dialog_box, slice 16)" note="raw surface primitive at scale 2 / 3">
        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
          <NineSlice asset="/sprites/ui/dialog_box.png" slice={16} scale={2} className="text-text p-4">
            scale 2
          </NineSlice>
          <NineSlice asset="/sprites/ui/dialog_box.png" slice={16} scale={3} className="text-text p-4">
            scale 3 · wider content to check edge stretch
          </NineSlice>
        </div>
      </GallerySection>
```

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit`
Expected: PASS

- [ ] **Step 4: Visual verify**

Run: `npm run dev`，到 `#ui`。
Expected: 兩個木框面板，角不變形、邊隨內容拉伸不破圖、整數縮放清晰。

- [ ] **Step 5: Commit**

```bash
git add src/ui/primitives/NineSlice.tsx src/ui/gallery/UIGallery.tsx
git commit -m "feat: add NineSlice border-image surface primitive"
```

---

### Task 5: `PixelIcon` 基元 + gallery 區段

**Files:**
- Create: `src/ui/primitives/PixelIcon.tsx`
- Modify: `src/ui/gallery/UIGallery.tsx`

**Interfaces:**
- Consumes: `spriteBackground` (Task 1)、`catalog.iconsAll`。
- Produces: `PixelIcon(props: PixelIconProps)`，`interface PixelIconProps { index: number; scale?: number; label?: string }`，預設 `scale=2`。

- [ ] **Step 1: Implement PixelIcon**

```tsx
// src/ui/primitives/PixelIcon.tsx
/**
 * A single 16×16 icon sliced from icons_all (18×3, 54 icons) via background
 * positioning — a plain <span> so it nests inside text and buttons.
 */
import type { CSSProperties } from 'react'
import { catalog } from '../../game/sprites/catalog'
import { spriteBackground } from '../spriteBackground'

export interface PixelIconProps {
  index: number
  scale?: number
  label?: string
}

export function PixelIcon({ index, scale = 2, label }: PixelIconProps) {
  const bg = spriteBackground(catalog.iconsAll, index, scale)
  const style: CSSProperties = {
    display: 'inline-block',
    width: bg.width,
    height: bg.height,
    backgroundImage: bg.backgroundImage,
    backgroundPosition: bg.backgroundPosition,
    backgroundSize: bg.backgroundSize,
    backgroundRepeat: 'no-repeat',
    imageRendering: 'pixelated',
  }
  return (
    <span
      style={style}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    />
  )
}
```

- [ ] **Step 2: Add a PixelIcon section to the gallery**

Add import and section in `UIGallery.tsx`:

```tsx
import { PixelIcon } from '../primitives/PixelIcon'
```

```tsx
      <GallerySection title="PixelIcon" note="icons_all 18×3 — sample indices">
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {[0, 1, 2, 3, 4, 5, 6, 7, 18, 36].map((i) => (
            <PixelIcon key={i} index={i} scale={3} label={`icon ${i}`} />
          ))}
        </div>
      </GallerySection>
```

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit`
Expected: PASS

- [ ] **Step 4: Visual verify**

Run: `npm run dev`，到 `#ui`。
Expected: 一排清晰像素圖示，index 1 較 index 0 右移一格，index 18 為第二列首格。

- [ ] **Step 5: Commit**

```bash
git add src/ui/primitives/PixelIcon.tsx src/ui/gallery/UIGallery.tsx
git commit -m "feat: add PixelIcon sprite icon component"
```

---

### Task 6: `Panel` 元件 + gallery 區段

**Files:**
- Create: `src/ui/Panel.tsx`
- Modify: `src/ui/gallery/UIGallery.tsx`

**Interfaces:**
- Consumes: `NineSlice` (Task 4)。
- Produces: `Panel(props: PanelProps)`，`interface PanelProps { children: React.ReactNode; padding?: 'sm' | 'md' | 'lg'; className?: string }`，預設 `padding='md'`。

- [ ] **Step 1: Implement Panel**

```tsx
// src/ui/Panel.tsx
/**
 * General wood-surface container. Composes NineSlice (dialog_box) and applies
 * spacing-scale padding to the content region. Used directly and as the base
 * for ProjectCard / ContactPanel.
 */
import { NineSlice } from './primitives/NineSlice'

const DIALOG_ASSET = '/sprites/ui/dialog_box.png'
const DIALOG_SLICE = 16

const PADDING: Record<'sm' | 'md' | 'lg', string> = {
  sm: 'p-2', // 8px
  md: 'p-4', // 16px
  lg: 'p-6', // 24px
}

export interface PanelProps {
  children: React.ReactNode
  padding?: 'sm' | 'md' | 'lg'
  className?: string
}

export function Panel({ children, padding = 'md', className }: PanelProps) {
  return (
    <NineSlice asset={DIALOG_ASSET} slice={DIALOG_SLICE} className="text-text">
      <div className={[PADDING[padding], className].filter(Boolean).join(' ')}>
        {children}
      </div>
    </NineSlice>
  )
}
```

> Tailwind padding 對照間距階：`p-2`=8、`p-4`=16、`p-6`=24（Tailwind 4 預設 0.25rem=4px 基準，rem 在 16px 根字級下成立）。

- [ ] **Step 2: Add a Panel section to the gallery**

```tsx
import { Panel } from '../Panel'
```

```tsx
      <GallerySection title="Panel" note="padding sm / md / lg">
        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
          <Panel padding="sm"><span className="text-pixel-base">sm</span></Panel>
          <Panel padding="md"><span className="text-pixel-base">md</span></Panel>
          <Panel padding="lg"><span className="text-pixel-base">lg</span></Panel>
        </div>
      </GallerySection>
```

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit`
Expected: PASS

- [ ] **Step 4: Visual verify**

Run: `npm run dev`，到 `#ui`。
Expected: 三個木框面板，內距依序變大，文字不壓到邊框美術。

- [ ] **Step 5: Commit**

```bash
git add src/ui/Panel.tsx src/ui/gallery/UIGallery.tsx
git commit -m "feat: add Panel nine-slice container"
```

---

### Task 7: `PixelButton` 元件 + gallery 區段

**Files:**
- Create: `src/ui/PixelButton.tsx`
- Modify: `src/ui/gallery/UIGallery.tsx`

**Interfaces:**
- Consumes: `NineSlice` (Task 4)、`PixelIcon` (Task 5)。
- Produces: `PixelButton(props: PixelButtonProps)`，
  `interface PixelButtonProps { children: React.ReactNode; onClick?: () => void; variant?: 'primary' | 'secondary'; iconIndex?: number; disabled?: boolean }`，預設 `variant='primary'`。

> ⚠️ **`btnSquare` 待核對**：本 task 先用 `dialog_box` 9-slice 作按鈕表面 + variant 控制面色（primary=`bg-accent`、secondary=`bg-surface-inset`），這是穩定可行的後備方案（Part 3 風險表已列）。若日後在 gallery 確認 `btn_square_26` 的 slice 值，再改用其素材；切換點僅在本檔的 `ASSET`/`SLICE` 常數。

- [ ] **Step 1: Implement PixelButton**

```tsx
// src/ui/PixelButton.tsx
/**
 * Pixel push-button. Composes NineSlice (as button) for the wood frame, with
 * the face tinted by semantic tokens per variant and a 1px press offset.
 * Asset is dialog_box (stable); btn_square_26 layout is 待核對 (see plan risk).
 */
import { NineSlice } from './primitives/NineSlice'
import { PixelIcon } from './primitives/PixelIcon'

const ASSET = '/sprites/ui/dialog_box.png'
const SLICE = 16

const FACE: Record<'primary' | 'secondary', string> = {
  primary: 'bg-accent text-text hover:bg-accent-hover',
  secondary: 'bg-surface-inset text-text-invert hover:bg-surface',
}

export interface PixelButtonProps {
  children: React.ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary'
  iconIndex?: number
  disabled?: boolean
}

export function PixelButton({
  children,
  onClick,
  variant = 'primary',
  iconIndex,
  disabled,
}: PixelButtonProps) {
  const face = [
    FACE[variant],
    'text-pixel-base',
    'transition-[translate] duration-100 ease-[steps(2)]',
    'active:translate-y-px',
    disabled ? 'opacity-50 pointer-events-none' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <NineSlice asset={ASSET} slice={SLICE} as="button" onClick={onClick} disabled={disabled}>
      <span className={face} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '4px 8px' }}>
        {iconIndex !== undefined ? <PixelIcon index={iconIndex} scale={2} /> : null}
        {children}
      </span>
    </NineSlice>
  )
}
```

- [ ] **Step 2: Add a PixelButton section to the gallery**

```tsx
import { PixelButton } from '../PixelButton'
```

```tsx
      <GallerySection title="PixelButton" note="primary / secondary · icon · disabled — hover & press states live">
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
          <PixelButton onClick={() => alert('primary')}>主要動作</PixelButton>
          <PixelButton variant="secondary" onClick={() => alert('secondary')}>次要</PixelButton>
          <PixelButton iconIndex={0}>含圖示</PixelButton>
          <PixelButton disabled>已停用</PixelButton>
        </div>
      </GallerySection>
```

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit`
Expected: PASS

- [ ] **Step 4: Visual verify**

Run: `npm run dev`，到 `#ui`。
Expected: 四顆按鈕；hover 變色、按下有 1px 位移、disabled 半透明不可點；木框不破圖。

- [ ] **Step 5: Commit**

```bash
git add src/ui/PixelButton.tsx src/ui/gallery/UIGallery.tsx
git commit -m "feat: add PixelButton component"
```

---

### Task 8: `typewriter` 純函式（揭字數）

**Files:**
- Create: `src/ui/typewriter.ts`
- Test: `src/ui/typewriter.test.ts`

**Interfaces:**
- Produces: `revealedCount(elapsedMs: number, speedMs: number, total: number): number` — 在 `elapsedMs` 後、每 `speedMs` 揭一字、夾在 `[0, total]`。`speedMs <= 0` 視為立即全顯。

- [ ] **Step 1: Write the failing test**

```ts
// src/ui/typewriter.test.ts
import { describe, it, expect } from 'vitest'
import { revealedCount } from './typewriter'

describe('revealedCount', () => {
  it('reveals nothing at elapsed 0', () => {
    expect(revealedCount(0, 30, 10)).toBe(0)
  })

  it('reveals floor(elapsed / speed) characters', () => {
    expect(revealedCount(95, 30, 10)).toBe(3) // floor(95/30)=3
  })

  it('clamps to total length', () => {
    expect(revealedCount(100000, 30, 10)).toBe(10)
  })

  it('treats non-positive speed as instant full reveal', () => {
    expect(revealedCount(0, 0, 10)).toBe(10)
    expect(revealedCount(5, -1, 10)).toBe(10)
  })

  it('never returns negative for negative elapsed', () => {
    expect(revealedCount(-50, 30, 10)).toBe(0)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/ui/typewriter.test.ts`
Expected: FAIL（`Cannot find module './typewriter'`）

- [ ] **Step 3: Write minimal implementation**

```ts
// src/ui/typewriter.ts
/**
 * Pure: how many characters of a string should be visible after `elapsedMs`
 * at `speedMs` per character. speedMs <= 0 means show everything at once
 * (used for the prefers-reduced-motion / skip paths).
 */
export function revealedCount(elapsedMs: number, speedMs: number, total: number): number {
  if (speedMs <= 0) return total
  if (elapsedMs <= 0) return 0
  return Math.min(total, Math.floor(elapsedMs / speedMs))
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/ui/typewriter.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/ui/typewriter.ts src/ui/typewriter.test.ts
git commit -m "feat: add typewriter revealedCount helper"
```

---

### Task 9: `useTypewriter` hook

**Files:**
- Create: `src/ui/useTypewriter.ts`

**Interfaces:**
- Consumes: `revealedCount` (Task 8)。
- Produces: `useTypewriter(text: string, speed?: number): { shown: string; isDone: boolean; skip: () => void }`，預設 `speed=30`。`prefers-reduced-motion: reduce` 時直接完成。

- [ ] **Step 1: Implement the hook**

```ts
// src/ui/useTypewriter.ts
/**
 * Drives a per-character reveal of `text` using requestAnimationFrame and the
 * pure revealedCount helper. skip() jumps to the full string. Respects
 * prefers-reduced-motion by completing immediately. Resets when text changes.
 */
import { useEffect, useRef, useState } from 'react'
import { revealedCount } from './typewriter'

const REDUCED =
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

export function useTypewriter(text: string, speed = 30) {
  const [count, setCount] = useState(0)
  const startRef = useRef<number | null>(null)

  useEffect(() => {
    setCount(0)
    startRef.current = null

    if (REDUCED || speed <= 0) {
      setCount(text.length)
      return
    }

    let raf = 0
    const tick = (now: number) => {
      if (startRef.current === null) startRef.current = now
      const elapsed = now - startRef.current
      const next = revealedCount(elapsed, speed, text.length)
      setCount(next)
      if (next < text.length) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [text, speed])

  const skip = () => setCount(text.length)

  return {
    shown: text.slice(0, count),
    isDone: count >= text.length,
    skip,
  }
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/ui/useTypewriter.ts
git commit -m "feat: add useTypewriter hook"
```

---

### Task 10: `DialogBox` 元件 + gallery 區段

**Files:**
- Create: `src/ui/DialogBox.tsx`
- Modify: `src/ui/gallery/UIGallery.tsx`

**Interfaces:**
- Consumes: `NineSlice` (Task 4)、`useTypewriter` (Task 9)。
- Produces: `DialogBox(props: DialogBoxProps)`，
  `interface DialogBoxProps { text: string; speakerName?: string; speed?: number; onAdvance?: () => void }`，預設 `speed=30`。

- [ ] **Step 1: Implement DialogBox**

```tsx
// src/ui/DialogBox.tsx
/**
 * Typewriter dialogue box on a dialog_box nine-slice surface. Click while
 * typing → reveal all; click when done → onAdvance(). Optional speaker name.
 */
import { NineSlice } from './primitives/NineSlice'
import { useTypewriter } from './useTypewriter'

const ASSET = '/sprites/ui/dialog_box.png'
const SLICE = 16

export interface DialogBoxProps {
  text: string
  speakerName?: string
  speed?: number
  onAdvance?: () => void
}

export function DialogBox({ text, speakerName, speed = 30, onAdvance }: DialogBoxProps) {
  const { shown, isDone, skip } = useTypewriter(text, speed)

  const handleClick = () => {
    if (!isDone) {
      skip()
      return
    }
    onAdvance?.()
  }

  return (
    <NineSlice asset={ASSET} slice={SLICE} className="text-text" onClick={handleClick} as="button">
      <div className="p-4" style={{ minWidth: 280, textAlign: 'left' }}>
        {speakerName ? (
          <p className="font-decorative text-pixel-base text-accent" style={{ marginBottom: 8 }}>
            {speakerName}
          </p>
        ) : null}
        <p className="text-pixel-base" style={{ margin: 0 }}>
          {shown}
          {!isDone ? <span aria-hidden>▌</span> : null}
        </p>
      </div>
    </NineSlice>
  )
}
```

> 註：DialogBox 整塊用 `as="button"` 接收點擊以符合無障礙與鍵盤觸發；內部段落不再另綁事件。

- [ ] **Step 2: Add a DialogBox section to the gallery**

```tsx
import { DialogBox } from '../DialogBox'
```

```tsx
      <GallerySection title="DialogBox" note="typewriter · click to skip · click again to advance">
        <DialogBox
          speakerName="村長"
          text="歡迎來到 Sprout Lands！點一下可以跳到結尾，再點一下換下一句。"
          onAdvance={() => alert('advance')}
        />
      </GallerySection>
```

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit`
Expected: PASS

- [ ] **Step 4: Visual verify**

Run: `npm run dev`，到 `#ui`。
Expected: 文字逐字出現＋游標；打字中點一下秒顯全文；全文後再點跳出 `advance`。系統設定開「減少動態」時直接全顯。

- [ ] **Step 5: Commit**

```bash
git add src/ui/DialogBox.tsx src/ui/gallery/UIGallery.tsx
git commit -m "feat: add DialogBox with typewriter reveal"
```

---

### Task 11: `InventoryGrid` 元件 + gallery 區段

**Files:**
- Create: `src/ui/InventoryGrid.tsx`
- Modify: `src/ui/gallery/UIGallery.tsx`

**Interfaces:**
- Consumes: `spriteBackground` (Task 1)、`PixelIcon` (Task 5)、`catalog.inventory`。
- Produces: `InventoryGrid(props: InventoryGridProps)`，
  `interface InventoryItem { iconIndex: number; label?: string }` /
  `interface InventoryGridProps { items: ReadonlyArray<InventoryItem | null>; columns: number; selectedIndex?: number; onSelect?: (index: number) => void }`。展示型：只回呼，不持有選取狀態。

- [ ] **Step 1: Implement InventoryGrid**

```tsx
// src/ui/InventoryGrid.tsx
/**
 * Presentational inventory grid. Each cell uses an inventory_blocks slot tile
 * as background and overlays a PixelIcon for filled items. Selection state is
 * owned by the caller; the grid only reports onSelect(index).
 */
import type { CSSProperties } from 'react'
import { catalog } from '../game/sprites/catalog'
import { spriteBackground } from './spriteBackground'
import { PixelIcon } from './primitives/PixelIcon'

const SLOT_INDEX = 0 // inventory_blocks cell used as the slot background
const SCALE = 3

export interface InventoryItem {
  iconIndex: number
  label?: string
}

export interface InventoryGridProps {
  items: ReadonlyArray<InventoryItem | null>
  columns: number
  selectedIndex?: number
  onSelect?: (index: number) => void
}

export function InventoryGrid({ items, columns, selectedIndex, onSelect }: InventoryGridProps) {
  const slot = spriteBackground(catalog.inventory, SLOT_INDEX, SCALE)
  const cellStyle: CSSProperties = {
    width: slot.width,
    height: slot.height,
    backgroundImage: slot.backgroundImage,
    backgroundPosition: slot.backgroundPosition,
    backgroundSize: slot.backgroundSize,
    backgroundRepeat: 'no-repeat',
    imageRendering: 'pixelated',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${columns}, max-content)`, gap: 4 }}>
      {items.map((item, index) => (
        <button
          key={index}
          type="button"
          onClick={() => onSelect?.(index)}
          className={index === selectedIndex ? 'bg-accent' : ''}
          style={cellStyle}
          aria-label={item?.label ?? `空格 ${index}`}
          aria-pressed={index === selectedIndex}
        >
          {item ? <PixelIcon index={item.iconIndex} scale={2} /> : null}
        </button>
      ))}
    </div>
  )
}
```

> `bg-accent` 疊在格底之上以標示選取；格底素材座標 `SLOT_INDEX` 待 gallery 目視確認後可調整（inventory_blocks 為 9×9 拼貼）。

- [ ] **Step 2: Add an InventoryGrid section to the gallery**

```tsx
import { InventoryGrid } from '../InventoryGrid'
```

加在 `UIGallery` 內，並於檔案頂層（component 外）定義樣本資料：

```tsx
const inventorySample = [
  { iconIndex: 0, label: '斧頭' },
  { iconIndex: 1, label: '鋤頭' },
  null,
  { iconIndex: 2, label: '水壺' },
  null,
  { iconIndex: 3, label: '種子' },
]
```

```tsx
      <GallerySection title="InventoryGrid" note="presentational · filled / empty / selected (index 0)">
        <InventoryGrid items={inventorySample} columns={3} selectedIndex={0} onSelect={(i) => console.info('select', i)} />
      </GallerySection>
```

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit`
Expected: PASS

- [ ] **Step 4: Visual verify**

Run: `npm run dev`，到 `#ui`。
Expected: 3 欄格子，有圖示格／空格並存，第 0 格高亮；點任一格 console 印出 `select <index>`。

- [ ] **Step 5: Commit**

```bash
git add src/ui/InventoryGrid.tsx src/ui/gallery/UIGallery.tsx
git commit -m "feat: add presentational InventoryGrid"
```

---

### Task 12: `ProjectCard` 元件 + gallery 區段

**Files:**
- Create: `src/ui/ProjectCard.tsx`
- Modify: `src/ui/gallery/UIGallery.tsx`

**Interfaces:**
- Consumes: `Panel` (Task 6)。
- Produces: `ProjectCard(props: ProjectCardProps)`，
  `interface ProjectCardProps { title: string; description: string; tags?: ReadonlyArray<string>; thumbnailUrl?: string; href?: string }`。`href` 存在則整卡為外開連結。

- [ ] **Step 1: Implement ProjectCard**

```tsx
// src/ui/ProjectCard.tsx
/**
 * Project preview card composed on a Panel. When href is set the whole card is
 * an external link (new tab, rel=noopener). Content-only; data comes from M7.
 */
import { Panel } from './Panel'

export interface ProjectCardProps {
  title: string
  description: string
  tags?: ReadonlyArray<string>
  thumbnailUrl?: string
  href?: string
}

export function ProjectCard({ title, description, tags, thumbnailUrl, href }: ProjectCardProps) {
  const body = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 320 }}>
      {thumbnailUrl ? (
        <img src={thumbnailUrl} alt="" style={{ width: '100%', imageRendering: 'pixelated' }} />
      ) : null}
      <h3 className="font-decorative text-pixel-lg text-text" style={{ margin: 0 }}>{title}</h3>
      <p className="text-pixel-base text-text-muted" style={{ margin: 0 }}>{description}</p>
      {tags && tags.length > 0 ? (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {tags.map((t) => (
            <span key={t} className="bg-surface-inset text-text-invert text-pixel-sm" style={{ padding: '2px 8px' }}>
              {t}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  )

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener" style={{ textDecoration: 'none' }}>
        <Panel padding="md">{body}</Panel>
      </a>
    )
  }
  return <Panel padding="md">{body}</Panel>
}
```

- [ ] **Step 2: Add a ProjectCard section to the gallery**

```tsx
import { ProjectCard } from '../ProjectCard'
```

```tsx
      <GallerySection title="ProjectCard" note="with tags · linked / non-linked">
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-start' }}>
          <ProjectCard
            title="Sproutfolio"
            description="像素農場風格的可走動個人網站。"
            tags={['React', 'Pixi', 'Tailwind']}
            href="https://example.com"
          />
          <ProjectCard title="無連結卡" description="沒有 href 時整卡不可點。" tags={['demo']} />
        </div>
      </GallerySection>
```

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit`
Expected: PASS

- [ ] **Step 4: Visual verify**

Run: `npm run dev`，到 `#ui`。
Expected: 兩張木框卡片，標題／描述／標籤齊全；有 href 那張點擊外開新分頁。

- [ ] **Step 5: Commit**

```bash
git add src/ui/ProjectCard.tsx src/ui/gallery/UIGallery.tsx
git commit -m "feat: add ProjectCard component"
```

---

### Task 13: `ContactPanel` 元件 + gallery 區段

**Files:**
- Create: `src/ui/ContactPanel.tsx`
- Modify: `src/ui/gallery/UIGallery.tsx`

**Interfaces:**
- Consumes: `Panel` (Task 6)、`PixelIcon` (Task 5)。
- Produces: `ContactPanel(props: ContactPanelProps)`，
  `interface ContactLink { iconIndex: number; label: string; href: string }` /
  `interface ContactPanelProps { links: ReadonlyArray<ContactLink> }`。每個連結外開、`rel="noopener"`。

- [ ] **Step 1: Implement ContactPanel**

```tsx
// src/ui/ContactPanel.tsx
/**
 * Contact links list on a Panel. Each row is an external link with a leading
 * PixelIcon. Content-only; link data comes from M7 content.ts.
 */
import { Panel } from './Panel'
import { PixelIcon } from './primitives/PixelIcon'

export interface ContactLink {
  iconIndex: number
  label: string
  href: string
}

export interface ContactPanelProps {
  links: ReadonlyArray<ContactLink>
}

export function ContactPanel({ links }: ContactPanelProps) {
  return (
    <Panel padding="md">
      <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {links.map((link) => (
          <li key={link.href}>
            <a
              href={link.href}
              target="_blank"
              rel="noopener"
              className="text-link text-pixel-base"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}
            >
              <PixelIcon index={link.iconIndex} scale={2} />
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </Panel>
  )
}
```

- [ ] **Step 2: Add a ContactPanel section to the gallery**

```tsx
import { ContactPanel } from '../ContactPanel'
```

```tsx
      <GallerySection title="ContactPanel" note="external links with icons">
        <ContactPanel
          links={[
            { iconIndex: 4, label: 'GitHub', href: 'https://github.com/Warmlatte' },
            { iconIndex: 5, label: 'Email', href: 'mailto:w0975582420@gmail.com' },
          ]}
        />
      </GallerySection>
```

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit`
Expected: PASS

- [ ] **Step 4: Visual verify**

Run: `npm run dev`，到 `#ui`。
Expected: 木框面板內兩列帶圖示連結，色用 `--link`；點擊外開新分頁。

- [ ] **Step 5: Commit**

```bash
git add src/ui/ContactPanel.tsx src/ui/gallery/UIGallery.tsx
git commit -m "feat: add ContactPanel component"
```

---

### Task 14: `index.ts` barrel export + 驗收掃描

統一匯出 + 驗收 grep（無寫死 hex／`border-radius`）+ 全測試與型別把關。

**Files:**
- Create: `src/ui/index.ts`

**Interfaces:**
- Produces: re-export 所有元件與其 props 型別。

- [ ] **Step 1: Write the barrel export**

```ts
// src/ui/index.ts
/** Public surface of the Sprout Lands UI design system (M6). */
export { NineSlice } from './primitives/NineSlice'
export type { NineSliceProps } from './primitives/NineSlice'
export { PixelIcon } from './primitives/PixelIcon'
export type { PixelIconProps } from './primitives/PixelIcon'
export { Panel } from './Panel'
export type { PanelProps } from './Panel'
export { PixelButton } from './PixelButton'
export type { PixelButtonProps } from './PixelButton'
export { DialogBox } from './DialogBox'
export type { DialogBoxProps } from './DialogBox'
export { InventoryGrid } from './InventoryGrid'
export type { InventoryGridProps, InventoryItem } from './InventoryGrid'
export { ProjectCard } from './ProjectCard'
export type { ProjectCardProps } from './ProjectCard'
export { ContactPanel } from './ContactPanel'
export type { ContactPanelProps, ContactLink } from './ContactPanel'
export { useTypewriter } from './useTypewriter'
```

- [ ] **Step 2: Acceptance grep — no hardcoded hex / border-radius in src/ui**

Run:
```bash
grep -rnE "#[0-9A-Fa-f]{3,6}\b|border-radius|rounded" src/ui && echo "FOUND — fix before continuing" || echo "CLEAN"
```
Expected: `CLEAN`（src/ui 內無寫死 hex、無 `border-radius`、無 Tailwind `rounded*`）。若有命中，改用 semantic token / 移除圓角後重跑。

- [ ] **Step 3: Full unit test suite**

Run: `npm test`
Expected: PASS（含 spriteBackground / nineSliceStyle / typewriter 與既有 M1–M5 測試）。

- [ ] **Step 4: Full type-check + build**

Run: `npm run build`
Expected: PASS（`tsc --noEmit` 無錯 + vite build 成功；dev-only gallery 不進 production chunk）。

- [ ] **Step 5: Final gallery walkthrough**

Run: `npm run dev`，到 `#ui`，逐段確認 7 個元件各狀態皆正確、9-slice 不破圖、像素清晰。

- [ ] **Step 6: Commit**

```bash
git add src/ui/index.ts
git commit -m "feat: add ui barrel export and m6 acceptance pass"
```

---

## Self-Review

**Spec coverage（對照三份 spec）：**
- 7 個元件（PixelButton/DialogBox/Panel/InventoryGrid/ProjectCard/ContactPanel/PixelIcon）→ Task 4–7、10–13 ✅
- 共用 `<NineSlice>` 基元 → Task 4 ✅
- CSS `border-image` 9-slice → Task 2（純值）+ Task 4（元件）✅
- 只用 semantic token、無 hex / 無 `border-radius` → Global Constraints + Task 14 grep ✅
- DialogBox 逐字打字 + 點擊跳結尾 + reduced-motion → Task 8–10 ✅
- PixelIcon 由 icons_all 切圖（index）→ Task 1 + Task 5 ✅
- InventoryGrid 展示型 → Task 11 ✅
- ProjectCard / ContactPanel 欄位 → Task 12–13 ✅
- `#ui` 自製 gallery（沿用 #sprites 模式）→ Task 3 + 各 task 追加區段 ✅
- 純邏輯單元測試（typewriter 等）→ Task 1、2、8 ✅
- 與引擎解耦（純 React）→ 全 src/ui 不 import pixi/engine ✅
- 驗收標準（grep、build、gallery）→ Task 14 ✅
- `btn_square_26` 待核對風險 → Task 7 後備方案 + 註記 ✅

**Placeholder scan：** 無 TBD/TODO；每個 code step 皆含完整程式。✅

**Type consistency：** `spriteBackground`/`nineSliceStyle`/`revealedCount`/`useTypewriter` 簽名在定義 task 與消費 task 一致；`NineSliceProps`、各元件 props 介面與 barrel 匯出一致。✅
