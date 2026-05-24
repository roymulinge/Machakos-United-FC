// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

  server: {
    proxy: {
      // ALL backend requests start with /api — one rule covers everything
      // Vite intercepts /api/... and forwards to Django on 8000
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,  // rewrites Host header to localhost:8000
      },
    }
  }
})