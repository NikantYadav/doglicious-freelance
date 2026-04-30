import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import dotenv from 'dotenv'

/**
 * Inline the main entry CSS into the HTML at build time.
 * This eliminates the render-blocking <link rel="stylesheet"> for the home page CSS,
 * replacing it with an inline <style> block that the browser can parse instantly.
 * Route-level CSS chunks (from cssCodeSplit) remain as lazy-loaded files.
 */
function inlineEntryCSSPlugin() {
  return {
    name: 'vite-plugin-inline-entry-css',
    apply: 'build',
    enforce: 'post',
    transformIndexHtml: {
      order: 'post',
      handler(html, { bundle }) {
        if (!bundle) return html;
        for (const [fileName, chunk] of Object.entries(bundle)) {
          // Only inline the main entry CSS (assets/index-*.css), not route chunks
          if (chunk.type === 'asset' && /^assets\/index-[^/]+\.css$/.test(fileName)) {
            const css = chunk.source;
            const linkTag = `<link rel="stylesheet" crossorigin href="/${fileName}">`;
            if (html.includes(linkTag)) {
              html = html.replace(linkTag, `<style>${css}</style>`);
              // Remove the CSS file from bundle so nginx doesn't serve a dead file
              delete bundle[fileName];
            }
          }
        }
        return html;
      }
    }
  };
}

export default defineConfig(() => {
  // Explicitly load .env.frontend so Vite can see it
  dotenv.config({ path: '.env.frontend' });

  return {
    plugins: [
      react(),
      inlineEntryCSSPlugin(),
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
