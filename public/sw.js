/**
 * Doglicious Service Worker — Auto-update on deploy
 *
 * How it works:
 *  - On install: just activate immediately, no pre-caching of HTML.
 *  - On fetch: cache-first for hashed /assets/* (safe forever).
 *              Pass-through for everything else (no HTML caching).
 *  - Update detection: every 60s, fetch /version.json (a tiny file
 *    generated fresh on every build). Compare against the version
 *    stored in the SW's own scope. If different → notify all tabs.
 *
 * Why version.json instead of comparing index.html:
 *  Cloudflare modifies index.html in transit (injects beacon.min.js),
 *  so comparing raw HTML strings produces false positives on every request.
 *  version.json is a plain JSON file Cloudflare does not touch.
 */

const ASSETS_CACHE = 'doglicious-assets-v1';

// The version this SW instance knows about (set on first fetch of version.json)
let knownVersion = null;

// ── Install: activate immediately, no pre-caching ────────────────────────────
self.addEventListener('install', (event) => {
  self.skipWaiting();
  // Nothing to pre-cache — assets are fetched and cached on demand.
  // index.html is intentionally NOT cached here (Cloudflare modifies it).
});

// ── Activate: claim clients, prune old asset caches ──────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      // Remove any old cache versions from previous SW releases
      caches.keys().then((keys) =>
        Promise.all(
          keys
            .filter((k) => k !== ASSETS_CACHE)
            .map((k) => caches.delete(k))
        )
      ),
    ])
  );
});

// ── Fetch: only intercept hashed assets ──────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle same-origin GET requests
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;

  // Hashed assets (/assets/*.js, /assets/*.css) — cache-first, safe forever
  // because Vite content-hashes every filename. New deploy = new filename.
  if (url.pathname.startsWith('/assets/')) {
    event.respondWith(cacheFirstForAssets(request));
    return;
  }

  // Everything else (index.html, images, API) — pass straight through.
  // We do NOT cache index.html because Cloudflare modifies it in transit.
});

// ── Cache-first for hashed assets ────────────────────────────────────────────
async function cacheFirstForAssets(request) {
  const cached = await caches.match(request, { cacheName: ASSETS_CACHE });
  if (cached) return cached;

  const response = await fetch(request);
  if (response.ok) {
    const cache = await caches.open(ASSETS_CACHE);
    // Clone before consuming — cache the clone, return the original
    cache.put(request, response.clone());
  }
  return response;
}

// ── Version polling — check /version.json every 60 seconds ───────────────────
async function checkForUpdate() {
  try {
    // Always bypass HTTP cache so Cloudflare edge doesn't serve a stale copy
    const res = await fetch('/version.json', {
      cache: 'no-store',
      headers: { 'Accept': 'application/json' },
    });
    if (!res.ok) return;

    const { v } = await res.json();
    if (!v) return;

    if (knownVersion === null) {
      // First check — just record the current version, don't notify
      knownVersion = v;
      return;
    }

    if (v !== knownVersion) {
      // New deploy detected
      knownVersion = v;
      notifyClientsOfUpdate();
    }
  } catch {
    // Network unavailable — silently ignore
  }
}

// ── Notify all open tabs ──────────────────────────────────────────────────────
async function notifyClientsOfUpdate() {
  const clients = await self.clients.matchAll({ type: 'window' });
  clients.forEach((client) => client.postMessage({ type: 'SW_UPDATE_AVAILABLE' }));
}

// Start polling after a short delay (let the page finish loading first)
setTimeout(() => {
  checkForUpdate();
  setInterval(checkForUpdate, 60_000); // check every 60 seconds
}, 5_000);

// Surface runtime errors inside the SW so they appear in devtools and logs.
self.addEventListener('error', (e) => {
  try {
    console.error('[SW] error:', e.message || e);
  } catch (_) {}
});

self.addEventListener('unhandledrejection', (ev) => {
  try {
    console.error('[SW] unhandledrejection:', ev.reason);
  } catch (_) {}
});
