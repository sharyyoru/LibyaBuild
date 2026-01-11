import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist-scanner',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'scanner.html')
      }
    }
  },
  server: {
    port: 3001,
    host: true
  }
})
