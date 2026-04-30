import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import dotenv from 'dotenv'

export default defineConfig(() => {
  // Explicitly load .env.frontend so Vite can see it
  dotenv.config({ path: '.env.frontend' });

  return {
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        workbox: {
          clientsClaim: true,
          skipWaiting: true,
          cleanupOutdatedCaches: true,
          navigateFallbackDenylist: [/^\/api/],
          // Cache busting: service worker will detect new asset hashes and update automatically
          runtimeCaching: []
        },
        includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
        manifest: {
          name: 'VetRx Scan',
          short_name: 'VetRxScan',
          description: 'AI-Powered Dog Health Diagnosis',
          theme_color: '#3D2B00',
          background_color: '#FBF6EC',
          display: 'standalone',
          icons: [
            { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
            { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' }
          ]
        }
      })
    ],

    build: {
      // Content-hash every output file so nginx can cache them forever
      // and users automatically get new files on deploy
      cssCodeSplit: true, // Route-level CSS chunks — only loads CSS for current page
      rollupOptions: {
        output: {
          entryFileNames: 'assets/[name]-[hash].js',
          chunkFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash][extname]',
          // Separate vendor (React/router) from app code for better caching
          manualChunks(id) {
            if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
              return 'vendor-react';
            }
            if (id.includes('node_modules/react-router')) {
              return 'vendor-router';
            }
          }
        }
      }
    },

    // Dev server: proxy /api to local backend
    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:5000',
          changeOrigin: true,
        }
      }
    }
  }
})
