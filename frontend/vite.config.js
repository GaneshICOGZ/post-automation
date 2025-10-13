import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/auth': 'http://localhost:8000',
      '/posts': 'http://localhost:8000',
      '/trends': 'http://localhost:8000'
    }
  },
  build: {
    outDir: 'dist'
  }
})
