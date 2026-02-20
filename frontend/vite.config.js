import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 3000,
    host: true,
    allowedHosts: ['ramadan.aleppocity.store'],
    hmr: {
      host: 'ramadan.aleppocity.store',
      protocol: 'wss'
    },
    proxy: {
      '/api': {
        target: 'http://backend:5000',
        changeOrigin: true
      }
    }
  }
})
