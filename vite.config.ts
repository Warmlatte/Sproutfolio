import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// `base` is intentionally left at the default '/' until the GitHub Pages
// deploy milestone (M10), where the repo subpath will be configured.
export default defineConfig({
  plugins: [react(), tailwindcss()],
})
