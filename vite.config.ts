import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      {
        find: '@',
        replacement: '/src'
      },
      {
        find: '@components',
        replacement: '/src/components'
      },
      {
        find: '@hooks',
        replacement: '/src/hooks'
      },
      {
        find: '@store',
        replacement: '/src/store'
      },
      {
        find: '@utils',
        replacement: '/src/utils'
      },
      {
        find: '@types',
        replacement: '/src/types'
      },
      {
        find: '@services',
        replacement: '/src/services'
      }
    ]
  },
  build: {
    sourcemap: true,
    outDir: 'dist'
  },
  server: {
    port: 3000,
    open: true
  }
})
