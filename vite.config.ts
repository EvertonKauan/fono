import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  // No GitHub Pages o app mora em /<repositório>/; o workflow de deploy define BASE_PATH.
  base: process.env.BASE_PATH ?? '/',
  plugins: [react()],
  test: { environment: 'node', include: ['src/**/*.test.ts'] },
})
