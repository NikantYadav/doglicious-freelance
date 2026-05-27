import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
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
