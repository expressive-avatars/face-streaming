import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import fs from 'fs'

/** @type {import('vite').UserConfigExport} */
const commonConfig = ({ mode }) => {
  /** @type {import('vite').UserConfig} */
  const config = {
    plugins: [react()],
    base: './',
    resolve: {
      alias: {
        '@': path.resolve('./src'),
      },
    },
    server: {
      strictPort: true,
      hmr: {
        clientPort: 443,
      },
    },
  }
  if (mode === 'development') {
    try {
      const credentials = JSON.parse(fs.readFileSync('.ret.credentials'))
      config.define = {
        'import.meta.env.EMAIL': `"${credentials.email}"`,
        'import.meta.env.TOKEN': `"${credentials.token}"`,
      }
    } catch (e) {
      console.error('No .ret.credentials found')
    }
  }
  return config
}

// https://vitejs.dev/config/
export default defineConfig((configEnv) => {
  const { mode } = configEnv
  if (process.env.LIBRARY_MODE) {
    return {
      ...commonConfig(configEnv),
      publicDir: false,
      build: {
        outDir: mode === 'development' ? '_lib/lib' : 'dist/lib',
        lib: {
          entry: path.resolve('lib/index.js'),
          formats: ['iife'],
          fileName: () => `index.js`,
          name: 'AEL',
        },
      },
    }
  } else {
    return {
      ...commonConfig(configEnv),
      publicDir: 'public',
      build: {
        outDir: mode === 'development' ? '_site' : 'dist',
      },
    }
  }
})
