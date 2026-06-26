import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    // Le indicamos a Vite que ignore estos paquetes problemáticos al iniciar
    exclude: ['@mediapipe/pose', '@tensorflow-models/pose-detection']
  },
  build: {
    rollupOptions: {
      // Nos aseguramos de que también se ignoren al momento de compilar
      external: ['@mediapipe/pose']
    }
  }
})