# 設計文件：Sprout Lands 遊戲式個人網站

- 日期：2026-06-18
- 狀態：設計待使用者最終確認

## 一、目標與核心體驗

打造一個「可走動探索」的 2D 像素遊戲式個人網站，使用 Sprout Lands 農場素材。
訪客操控一個角色在農場地圖上走動，靠近不同建築物時觸發內容（自我介紹、專案、聯絡方式），
並可與場景物件互動（砍樹、摸雞、挑水等輕量彩蛋）以增強沉浸感。

**核心流程**：開場淡入並用鏡頭帶過農場 → 角色出現在出生點 → 玩家用方向鍵（手機虛擬搖桿）
走動，鏡頭跟隨 → 靠近可互動點時冒出「按空白鍵」提示 → 觸發對話框或面板 → 關閉後繼續探索。

## 二、關鍵決策（已與使用者確認）

| 項目 | 決定 |
|---|---|
| 互動模式 | 真正可走動的 2D 探索遊戲 |
| 內容地點 | 關於我、專案展示、聯絡方式（部落格暫不做） |
| 小遊戲 | 輕量互動彩蛋（無計分/關卡） |
| 技術棧 | **Vite + React + TypeScript**（外殼）＋ canvas 遊戲引擎（KAPLAY 或 Pixi.js）跑遊戲世界 |
| 架構 | **混合架構**：遊戲世界畫在 canvas，UI 面板用 React 元件疊在上層 |
| UI 設計系統 | React + Tailwind 的 Sprout Lands 風格 UI 元件庫，可 sync 到 Claude Design 預覽 |
| 手機支援 | 手機也能玩，虛擬搖桿 |
| 手機 RWD | 方案 A：鏡頭跟隨角色（不提醒翻轉，不做小地圖） |
| 部署 | GitHub Pages |
| 維護者 | 使用者本人會寫程式，能自行修改 |

## 三、素材與授權

素材：Sprout Lands Basic Pack（Sprites）+ UI Pack，作者 **Cup Nooble**。

**授權限制（必須遵守）**：
- 僅限非商業用途（個人作品集符合）。
- 必須標註出處：`Assets - From: Sprout Lands - By: Cup Nooble`，附 itch.io 連結
  （https://cupnooble.itch.io/sprout-lands-asset-pack）。
- 可開源，但 README 須註明素材來源與授權條款。
- 不可轉售或原樣重新散布素材包本身；不可用於 NFT/AI 訓練。

**做法**：
- 網站內建一個 credit 角落（小字或設定面板中）顯示出處。
- README.md 註明授權與出處。
- repo 的 `public/sprites/` 只放實際用到的圖，不整包原樣放入；原始 `素材/` 資料夾以 `.gitignore`
  排除，避免被視為「重新散布素材包」。

**素材規格**：
- 瓦片基準 16×16 px，畫面整體放大顯示（預設 3×；手機依寬度自動調整縮放係數）。
- 角色精靈圖（192×192）含四向走路動畫；工具動作圖（96×576）供互動動畫使用。
- 水 64×16＝4 格動畫；植物 96×32；房子 112×80。
- 對話框 48×48 為 9-slice（3×3 of 16px），可縮放成任意尺寸面板。
- 圖示表 288×48＝18×3 顆 16px 圖示，供按鈕/聯絡圖示使用。
- 像素字體 `pixelFont-7-8x14-sproutLands.ttf` 作為全站字型。

## 四、地圖與內容區域

緊湊的農場地圖，略大於手機螢幕，鏡頭跟隨角色。四個區域距離拉近，走幾步即達，不致空曠。

```
   🌳🌳        🏠 小屋           🌳🌳
              （關於我）
  🪧 告示牌                      📬 信箱
 （專案展示）                  （聯絡方式）
        🌾 田地 + 🐔 雞 + 🌊 池塘
        （互動彩蛋：砍樹/摸雞/挑水/搖晃植物）
              @ 角色出生點
```

| 地點 | 內容 | 呈現方式 |
|---|---|---|
| 🏠 小屋 | 關於我（背景/技能/興趣） | 對話框逐字打字 + 像素頭像，可多頁 |
| 🪧 告示牌 | 專案列表 | 物品欄格子面板，點格子看單一專案詳情（標題/截圖或圖示/說明/連結） |
| 📬 信箱 | Email / GitHub / 社群 | 小面板，像素圖示可點擊開啟連結 |
| 互動物件 | 樹/雞/池塘/植物 | 靠近互動觸發粒子或動畫，無計分；純沉浸 |

## 五、技術架構（React 混合架構）

### 技術棧
- **Vite + React + TypeScript**：應用外殼。React 負責整個網頁、UI 疊層、內容渲染。
- **canvas 遊戲引擎（KAPLAY 或 Pixi.js）**：在一個 `<GameCanvas>` React 元件內驅動遊戲世界
  （素材載入、精靈動畫、瓦片地圖、碰撞、輸入、鏡頭）。引擎跑在 canvas，不受 React 重繪影響。
  - 選型於實作初期決定：KAPLAY API 簡單、自帶遊戲框架；Pixi.js 純渲染、效能與彈性高。預設傾向 KAPLAY。
- **Tailwind CSS**：UI 元件樣式，以 Sprout Lands 配色與像素字體建立 design tokens。
  完整色號、語意 token、字體與排版規範見 **`docs/style-guide.md`**（所有 UI 任務的單一事實來源）。
  繁中主字採 **Cubic 11（俐方體11號，SIL OFL）**，英文裝飾用 Sprout Lands 像素字體。
- **GitHub Pages 部署**：`vite.config.ts` 設 `base` 子路徑。

### 為何是混合架構
即時走動的角色/地圖每秒重畫大量精靈圖，適合 canvas；React 的 DOM 響應式模型不適合每幀驅動。
因此遊戲世界跑在 canvas，而對話框/面板/按鈕等 UI 用 React 元件疊在 canvas 上層——
這層 React UI 同時就是可 sync 到 Claude Design 的設計系統（見第十節）。

### 遊戲與 React 的橋接
- `<GameCanvas>` 掛載時建立引擎實例、`unmount` 時銷毀，避免記憶體洩漏。
- 遊戲 → React：互動觸發時，引擎透過回呼/事件匯流排通知 React「開啟某面板（含 payload）」。
- React → 遊戲：面板開啟時通知引擎暫停角色移動；關閉後恢復。
- 兩側共用 `content.ts` 與 `constants.ts`，狀態邊界清楚。

### 檔案結構（多個小檔、高內聚、低耦合）
```
.
├── index.html
├── vite.config.ts            # base 路徑、build 設定
├── tailwind.config.ts        # Sprout Lands design tokens（色票、像素字體）
├── public/
│   ├── sprites/              # 實際用到的素材（處理後）
│   └── fonts/                # 像素字體
├── src/
│   ├── main.tsx              # React 入口
│   ├── App.tsx               # 組裝 GameCanvas + UI 疊層 + 全域狀態
│   ├── constants.ts          # 瓦片尺寸、縮放、地圖尺寸、速度等常數
│   ├── game/                 # 與 React 無關的純遊戲引擎程式
│   │   ├── engine.ts         # 初始化引擎、載入素材、啟動主場景
│   │   ├── loader.ts         # sprite/font/sprite-sheet 切片定義
│   │   ├── scenes/intro.ts   # 開場淡入 + 鏡頭帶景
│   │   ├── scenes/farm.ts    # 主場景：地圖、角色、互動點、鏡頭跟隨
│   │   ├── player.ts         # 角色：移動、四向動畫、碰撞
│   │   ├── interactables.ts  # 可互動點與彩蛋物件工廠
│   │   ├── input.ts          # 鍵盤 + 虛擬搖桿，統一方向向量
│   │   ├── interaction.ts    # 鄰近偵測、互動提示、觸發 → 發事件給 React
│   │   └── events.ts         # 遊戲 ↔ React 的事件匯流排型別
│   ├── react/
│   │   ├── GameCanvas.tsx    # 掛載/銷毀引擎的 React 容器
│   │   └── Joystick.tsx      # 手機虛擬搖桿與互動鈕（觸控，疊層）
│   ├── ui/                   # ★ Sprout Lands React UI 設計系統（可 sync 到 Claude Design）
│   │   ├── PixelButton.tsx
│   │   ├── DialogBox.tsx     # 9-slice 對話框 + 逐字打字
│   │   ├── Panel.tsx         # 9-slice 容器面板
│   │   ├── InventoryGrid.tsx # 物品欄格子
│   │   ├── ProjectCard.tsx   # 單一專案詳情
│   │   ├── ContactPanel.tsx  # 聯絡連結面板
│   │   └── PixelIcon.tsx     # 由圖示表切出的圖示
│   ├── overlays/             # 把 ui/ 元件組成各區域實際面板，接 content + 事件
│   │   ├── AboutDialog.tsx
│   │   ├── ProjectsPanel.tsx
│   │   └── ContactOverlay.tsx
│   └── data/
│       └── content.ts        # ★ 使用者日後唯一需要改的檔：自我介紹、專案陣列、聯絡連結
└── README.md                 # 含素材授權與出處
```

### 內容資料驅動
所有可變內容集中在 `src/data/content.ts`，以型別化結構描述：
- `about`：段落字串陣列（多頁對話）、頭像 sprite key。
- `projects`：`{ title, description, imageOrIcon, link }[]`，新增專案 = 在陣列加一筆。
- `contacts`：`{ label, icon, url }[]`。

`scenes/farm.ts` 與 UI 系統只讀 `content.ts`，不寫死任何文案，達到改內容不動邏輯。

### 輸入與 RWD（方案 A：鏡頭跟隨）
- 地圖以瓦片陣列定義，尺寸略大於常見手機視窗；引擎鏡頭跟隨角色，並夾在地圖邊界內。
- `game/input.ts` 將鍵盤方向鍵 / WASD 與虛擬搖桿輸出統一成方向向量，`farm.ts` 與 `player.ts` 不需區分來源；觸控搖桿由 React 的 `Joystick.tsx` 疊層採集後餵入。
- 觸控裝置自動顯示左下虛擬搖桿 + 右下互動鈕；非觸控裝置隱藏並顯示鍵盤提示。
- 縮放：依視窗寬度計算放大係數（手機較小、桌機較大），確保像素清晰（最近鄰取樣）且 UI 可讀。
- 不需提醒翻轉手機；直立、橫向皆自然成立。

### 互動偵測流程
1. 每幀計算角色與各互動點距離。
2. 進入互動範圍 → 顯示浮動「空白鍵 / 互動鈕」提示。
3. 按下互動鍵 → `game/interaction.ts` 依該點類型：彩蛋直接在 canvas 播粒子/動畫；
   內容點（小屋/告示牌/信箱）透過事件匯流排通知 React 開啟對應 overlay 面板。
4. React overlay 開啟時通知引擎暫停角色移動；關閉後恢復。

## 六、錯誤處理與邊界

- 素材載入失敗：顯示像素風錯誤提示，不靜默失敗。
- `content.ts` 缺欄位：以型別約束在編譯期擋下；執行期對選填欄位（如專案無圖）有預設圖示後援。
- 外部連結：`projects`/`contacts` 連結以新分頁開啟並加 `rel="noopener"`。
- 視窗 resize：重新計算縮放與搖桿位置。

## 七、測試與驗證

- 以 Vite dev server 在瀏覽器實際走動，逐一觸發四區域與彩蛋確認正確。
- 響應式：在窄視窗（模擬手機直立）測試鏡頭跟隨、虛擬搖桿可操作、面板可讀。
- 建置後（`vite build`）以正式 base 路徑本地預覽，確認素材路徑正確。
- 不導入重型測試框架（YAGNI）；以手動互動驗證為主，邏輯純函式（如方向向量、鄰近判定）可加輕量單元測試。

## 八、部署

- GitHub Pages：`vite.config.ts` 設 `base: '/<repo-name>/'`。
- 提供建置與發佈說明於 README（手動 `gh-pages` 分支或 GitHub Actions，實作時決定）。

## 九、UI 設計系統與 Claude Design 同步

`src/ui/` 是一套獨立、自包含的 Sprout Lands 風格 React + Tailwind UI 元件庫，
是網站 UI 疊層真正使用的元件，同時可同步到 Claude Design（claude.ai/design）供網頁預覽。

**元件清單**：`PixelButton`、`DialogBox`、`Panel`、`InventoryGrid`、`ProjectCard`、
`ContactPanel`、`PixelIcon`（各自有明確 props 介面、可獨立理解與預覽）。

**設計原則**：
- 樣式以 Tailwind 的 Sprout Lands design tokens（色票 + 像素字體 + 9-slice 邊框）表達，
  不依賴遊戲引擎，可在純 React 環境獨立渲染。
- 每個元件提供可組合的 props 與使用範例，作為 Claude Design 設計代理的 API 契約與用法參考。

**同步流程（第二階段，遊戲與 UI 元件可運作後）**：
1. 為 `src/ui/` 建立可編譯產物（package 形態：型別 + 編譯後 bundle）。
2. 以 `/design-sync` 將該元件庫轉換並上傳到一個新的 Claude Design 專案。
3. 之後在 Claude Design 即可瀏覽元件預覽，設計代理也能用這些真實元件產出設計。

> 註：Claude Design 僅渲染 React 元件，故 UI 層採 React（非 Vue）；canvas 遊戲世界本身不納入同步範圍（無法拆成元件卡片）。
> design-sync 需要「已可編譯的元件庫」，因此同步安排在元件實作完成後，而非設計階段。

## 十、明確排除（YAGNI）

- 部落格/文章系統。
- 音效（素材未附；預設靜音，日後可加）。
- 小地圖（方案 A 不含）。
- 計分、關卡、存檔等遊戲化系統。
- 後端/CMS；內容以 `content.ts` 靜態維護。
