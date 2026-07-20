import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Keep framework vendors separate — do NOT force /src/themes into a
          // chunk (that pulls shared deps into a 400KB preload on every page).
          if (id.includes('node_modules')) {
            if (id.includes('framer-motion')) return 'framer-motion'
            if (id.includes('lucide-react')) return 'lucide'
            if (id.includes('react-dom') || id.includes('/react/') || id.endsWith('/react')) {
              return 'react-vendor'
            }
            if (id.includes('react-router')) return 'router'
            if (id.includes('@radix-ui') || id.includes('sonner')) return 'ui-vendor'
          }
        },
      },
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:4000',
      '/uploads': 'http://localhost:4000',
    },
  },
})
