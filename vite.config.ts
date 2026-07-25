import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

const base = process.env.VITE_BASE_PATH || '/'

export default defineConfig({
  base,
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['ball-mark.svg', 'clubs/*', 'creditos.html'],
      manifest: {
        name: 'Mi Carrera',
        short_name: 'Mi Carrera',
        description: 'Simulador narrativo de la vida completa de un futbolista.',
        theme_color: '#07150f',
        background_color: '#050806',
        display: 'standalone',
        start_url: base,
        scope: base,
        icons: [{ src: 'ball-mark.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' }],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,yaml}'],
        navigateFallback: 'index.html',
      },
    }),
  ],
  test: { environment: 'jsdom', globals: true, setupFiles: './src/test/setup.ts', exclude: ['tests/e2e/**', 'node_modules/**'] },
})
