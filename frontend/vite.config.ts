import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          animations: ['gsap', 'framer-motion', 'lenis'],
        }
      }
    }
  },
  server: {
    proxy: {
      '/uploads': {
        target: 'http://127.0.0.1:5005',
        changeOrigin: true
      }
    }
  }
})
