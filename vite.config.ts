import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/quote': {
        target: 'https://zenquotes.io',
        changeOrigin: true,
        rewrite: () => '/api/random',
      },
    },
  },
})
