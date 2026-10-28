import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Static site: relative asset paths so it works under any sub-path (GitHub Pages).
export default defineConfig({
  base: './',
  plugins: [react()],
})
