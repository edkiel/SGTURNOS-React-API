import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Proxy SOLO para desarrollo local (cuando VITE_API_BASE_URL no está configurado)
    proxy: process.env.VITE_API_BASE_URL ? {} : {
      '/api': {
        target: 'http://localhost:8085',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '/api')
      }
    }
  }
})
