import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3001,
    open: true
  },
  resolve: {
    alias: {
      // Point directly to source for development
      '@xstate/builders': path.resolve(__dirname, '../src/lib/index.ts')
    }
  }
})