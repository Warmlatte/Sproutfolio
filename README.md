# Sproutfolio 🌱

可走動探索的 2D 像素遊戲式個人網站，使用 Sprout Lands 農場素材。訪客操控角色在農場地圖走動，
靠近建築物觸發內容（關於我 / 專案 / 聯絡方式），並可與場景互動（砍樹、摸雞、挑水等輕量彩蛋）。

## 技術棧

- **Vite + React + TypeScript** — 應用外殼
- **Tailwind CSS v4**（CSS-first `@theme`）— 由 style-guide 映射的 semantic token 與整數倍字級
- **canvas 遊戲引擎**（後續里程碑）— 遊戲世界畫在 `<GameCanvas>`，React UI 疊於上層
- 像素字體：**Cubic 11（俐方體11號）** 繁中主字、**Sprout Lands Pixel** 英文裝飾

## 開發

```bash
npm install
npm run dev      # 啟動開發伺服器
npm run build    # 型別檢查 + 產生 dist/
npm run preview  # 預覽 production build
```

## 授權

```
Assets - From: Sprout Lands - By: Cup Nooble — https://cupnooble.itch.io/sprout-lands-asset-pack (非商業)
Font: Cubic 11 (俐方體11號) by ACh-K — SIL OFL 1.1 — https://github.com/ACh-K/Cubic-11
```
