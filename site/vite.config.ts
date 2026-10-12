import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // на GitHub Pages проект живёт в подпути /terms-watch/; локально — '/'
  base: process.env.VITE_BASE || '/',
  build: { outDir: 'dist' },
  server: {
    port: 5173,
    proxy: {
      '/data': { target: 'http://127.0.0.1:8765', changeOrigin: false },
    },
  },
})
