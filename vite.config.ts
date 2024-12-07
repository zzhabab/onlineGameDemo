import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  publicDir: 'public',
  plugins: [vue()],
  resolve: {
    alias: {
      '@': '/src'
    },
  },
  build: {
    sourcemap: 'hidden',
    rollupOptions: {
      external: ['tracker']
    }
  },
  assetsInclude: ["**/*.hdr", "**/*.glb"],
})
