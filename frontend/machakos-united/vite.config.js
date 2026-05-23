import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Tailwind is now handled by PostCSS, not a Vite plugin
export default defineConfig({
  plugins: [react()],
})