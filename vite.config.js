import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dotenv from 'dotenv'
import { writeFileSync } from 'fs'
import { resolve } from 'path'

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

/**
 * Emit a /version.json file into the build output on every build.
 * The service worker fetches this tiny file (not index.html) to detect
 * new deploys — this is reliable even behind Cloudflare which modifies HTML.
 *
 * Format: { "v": "<timestamp>-<random>" }
 */
function emitVersionPlugin() {
  const version = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  return {
    name: 'vite-plugin-emit-version',
    apply: 'build',
    closeBundle() {
      const outDir = resolve(process.cwd(), 'dist');
      writeFileSync(
        resolve(outDir, 'version.json'),
        JSON.stringify({ v: version }),
        'utf-8'
      );
    },
  };
}

export default defineConfig(() => {
  // Explicitly load .env.frontend so Vite can see it
  dotenv.config({ path: '.env.frontend' });

  return {
    plugins: [
      react(),
      inlineEntryCSSPlugin(),
      emitVersionPlugin(),
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
