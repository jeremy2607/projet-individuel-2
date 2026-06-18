import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base : '/' en local/Docker, '/<repo>/' pour GitHub Pages (via VITE_BASE)
// https://vite.dev/config/
export default defineConfig({
  base: process.env.VITE_BASE || '/',
  plugins: [react()],
})
