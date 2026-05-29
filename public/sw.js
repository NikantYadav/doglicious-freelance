/**
 * Doglicious Service Worker — asset caching only.
 *
 * Caches hashed /assets/* files (JS/CSS) cache-first forever — safe because
 * Vite content-hashes every filename, so a new deploy always means new filenames.
 * Everything else (index.html, API, images) passes straight through.
 *
 * Update detection is handled in the React app (version.json check on load),
 * not here — keeping the SW as simple as possible to avoid lifecycle loops.
 */

const ASSETS_CACHE = 'doglicious-assets-v1';

self.addEventListener('install', () => {
  // No skipWaiting — let the SW update naturally on next page load.
});

self.addEventListener('activate', (event) => {
  // Prune caches from old SW versions.
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== ASSETS_CACHE).map((k) => caches.delete(k)))
    )
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== 'GET' || url.origin !== self.location.origin) return;

  // Cache-first only for hashed assets — safe to cache forever.
  if (url.pathname.startsWith('/assets/')) {
    event.respondWith(cacheFirst(request));
  }
  // Everything else passes through to the network unchanged.
});

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  const response = await fetch(request);
  if (response.ok) {
    const cache = await caches.open(ASSETS_CACHE);
    cache.put(request, response.clone());
  }
  return response;
}
