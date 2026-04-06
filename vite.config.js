import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/latihan-soal-matematika/', // Menggunakan nama repository yang tepat untuk GitHub Pages
})
