import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    lib: process.env.LIBRARY_MODE && {
      entry: path.resolve(__dirname, 'lib/room.js'),
      formats: ['es'],
      fileName: () => `room.js`,
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    strictPort: true,
    hmr: {
      clientPort: 443,
    },
  },
})
