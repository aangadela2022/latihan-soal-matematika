import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // Menambahkan base relative path agar file JS dan CSS tidak 404/Kosong saat dihosting 
})
