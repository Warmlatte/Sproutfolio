# 風格指南與 Design Tokens — Sprout Lands 遊戲式個人網站

> 本文件是**所有 UI 任務的單一事實來源**。拆分子任務前先固定於此，避免各任務各自詮釋造成風格不一致。
> 色號取自 Sprout Lands 官方色票（97 色）與實際 UI 素材取樣，非臆測。

## 1. 風格說明（Art Direction）

- **主題**：溫暖、療癒的像素農場（cozy farming pixel）。圓潤、手作感、低飽和暖調。
- **像素規範**：所有圖像 16×16 px 為基準瓦片；畫面整體以**整數倍**放大（世界 3×、UI 2–3×）。
  - CSS：`image-rendering: pixelated`；禁止非整數縮放造成模糊。
- **邊角**：UI 不使用 CSS `border-radius`；圓角與邊框一律來自 9-slice 素材（對話框/面板/按鈕）。
- **字體渲染**：像素字體須關閉抗鋸齒 → `-webkit-font-smoothing: none; font-smooth: never;`，字級用原生整數倍。
- **質感**：暖木色面板 + 冷灰氣泡為兩大 UI 表面；世界以草綠、水藍、陽光金點綴。

## 2. 色彩系統（Color Tokens）

### 2.1 木色階 — 主要 UI 表面（對話框/面板/按鈕，取自實際素材）
| Token | Hex | 用途 |
|---|---|---|
| `--wood-100` | `#F3E5C2` | 內側高光 |
| `--wood-200` | `#E8CFA6` | 面板淺色填充 |
| `--wood-300` | `#DCB98A` | 面板主填充 |
| `--wood-400` | `#C49A6C` | 內凹/格子底 |
| `--wood-500` | `#B68962` | 按鈕面 |
| `--wood-600` | `#AA7959` | 邊框 |
| `--wood-700` | `#90625D` | 外框線 |
| `--wood-800` | `#6B4B5B` | 深輪廓 / 面板上文字（ink） |

### 2.2 灰色階 — 次要表面（氣泡/提示，取自 speech_bubble）
| Token | Hex | 用途 |
|---|---|---|
| `--stone-100` | `#F3F4E7` | 高光 |
| `--stone-200` | `#DCE0D2` | 氣泡填充 |
| `--stone-300` | `#C1C8B9` | 內凹 |
| `--stone-400` | `#9DA89A` | 邊框 |
| `--stone-600` | `#6B7470` | 外框線 / 次要文字 |
| `--stone-800` | `#353738` | 深輪廓 |

### 2.3 世界與強調色（取自官方色票）
| Token | Hex | 用途 |
|---|---|---|
| `--grass-700` | `#67835C` | 草地暗 |
| `--grass-500` | `#78A158` | 草地主色 |
| `--grass-300` | `#A4C263` | 草地亮 |
| `--water-500` | `#7BA6B4` | 水/池塘 |
| `--water-300` | `#9BD4C3` | 水亮 |
| `--sky-300` | `#92B2D4` | 天空/背景 |
| `--gold-500` | `#EEBA77` | 主要強調 / CTA / 錢幣 |
| `--gold-300` | `#F2CF8C` | 強調亮（hover） |
| `--berry-500` | `#BD757E` | 愛心 / 警示 |
| `--plum-500` | `#867FB8` | 連結 / 魔法感點綴 |

### 2.4 語意對應（semantic — 元件一律使用這層，不直接寫死上面的 raw token）
| 語意 Token | 對應 | 說明 |
|---|---|---|
| `--surface` | `--wood-200` | 面板背景 |
| `--surface-inset` | `--wood-400` | 物品欄格子底、輸入框 |
| `--border` | `--wood-600` | 主邊框 |
| `--outline` | `--wood-800` | 像素外框線 |
| `--text` | `--wood-800` | 面板上主文字 |
| `--text-muted` | `--wood-700` | 次要文字 |
| `--text-invert` | `--stone-100` | 深底上文字 |
| `--accent` | `--gold-500` | 主要動作/強調 |
| `--accent-hover` | `--gold-300` | 強調 hover |
| `--link` | `--plum-500` | 連結 |
| `--success` | `--grass-500` | 成功/正向 |
| `--danger` | `--berry-500` | 危險/愛心 |
| `--scene-sky` | `--sky-300` | 場景天空 |
| `--scene-ground` | `--grass-500` | 場景地面 |
| `--scene-water` | `--water-500` | 場景水域 |

> 完整 97 色官方色票（12 條 ramp）保留於 `精選素材/`（`Sprout Lands defautlt palette.png`）；
> 如需更多中間色，從同一條 ramp 取值以維持一致。

## 3. 字體系統（Typography）

### 3.1 字型
| 角色 | 字型 | 來源 / 授權 | 用途 |
|---|---|---|---|
| 繁中主字 | **Cubic 11（俐方體11號）** | ACh-K/Cubic-11 · SIL OFL 1.1 · 11px 點陣 · 台灣字形 | 全站繁體中文（對話、面板、內文） |
| 英文裝飾 | **Sprout Lands Pixel（pixelFont-7-8x14）** | Sprout Lands UI Pack · Cup Nooble | 英文標題/標籤，呼應素材原生風格 |

- 檔案：`精選素材/fonts/Cubic_11.woff2`（web 首選）/ `.woff` / `.ttf`；OFL 授權 `Cubic-11-OFL.txt`。
- **字型堆疊**：`font-family: 'Cubic 11', 'SproutLands', system-ui, monospace;`
  - Cubic 11 同時涵蓋拉丁字母，繁中與英數可統一用它，確保一致；`SproutLands` 僅用於刻意的英文裝飾標題。

### 3.2 字級（Cubic 11 原生 11px，採整數倍以維持像素清晰）
| Token | px | 用途 |
|---|---|---|
| `--text-sm` | 11 | 註解、credit、小標籤 |
| `--text-base` | 22 | 對話框/面板內文（2×） |
| `--text-lg` | 33 | 區域標題（3×） |
| `--text-xl` | 44 | 開場/主標（4×，視情況） |

- 避免非整數倍縮放；行高建議 `line-height: 1.4`，CJK 字距 `letter-spacing: 0`。

## 4. 間距與尺寸（Spacing / Sizing）

- **基準單位 = 8px（半瓦片）**；間距階：`4 / 8 / 16 / 24 / 32 / 48`。
- 元件內距、元素間隙一律取自此階，對齊像素網格。
- 9-slice 切片：對話框 `dialog_box.png` 48×48 → 16px 角切片；按鈕、面板同理（切片值寫在元件內並註解）。

## 5. 動態（Motion）

- 像素風偏好**乾脆、分段**的動態：UI 過場 100–150ms；可用 `steps()` 取代平滑曲線。
- 角色行走動畫約 8 fps；互動彩蛋粒子短促。
- 尊重 `prefers-reduced-motion`：關閉非必要動畫。

## 6. 元件如何取用（給後續 UI 子任務）

- Tailwind 於 `tailwind.config.ts` 將上述 semantic token 映射為 utility（如 `bg-surface`、`text-ink`、`border-border`）。
- `src/ui/` 元件**只使用 semantic token 與 9-slice 素材**，不得寫死 hex、不得用 `border-radius`、不得用未列於本文件的顏色。
- 新增顏色需求 → 先更新本文件（從官方 ramp 取色），再於 config 映射，最後元件才使用。

## 7. 授權標註（必附）

```
Assets - From: Sprout Lands - By: Cup Nooble — https://cupnooble.itch.io/sprout-lands-asset-pack (非商業)
Font: Cubic 11 (俐方體11號) by ACh-K — SIL OFL 1.1 — https://github.com/ACh-K/Cubic-11
```

## 來源

- [Cubic 11 俐方體11號 — GitHub (ACh-K/Cubic-11)](https://github.com/ACh-K/Cubic-11)
- [Cubic 11 — ZeoSeven Fonts](https://fonts.zeoseven.com/items/101/)
