import { useEffect } from 'react';

/**
 * Registers the service worker on mount.
 * Called once at the app root — no deps, no re-registration.
 */
export function useServiceWorker() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    // Register after the page has loaded so it doesn't compete with
    // critical resources during the initial paint.
    const register = async () => {
      try {
        // Ensure the SW script exists before attempting registration. If
        // the file is missing (404) or Cloudflare blocks it, skip register.
        const res = await fetch('/sw.js', { method: 'GET', cache: 'no-store' });
        if (!res.ok) {
          console.warn('[SW] /sw.js not available (status=' + res.status + '), skipping registration');
          return;
        }

        navigator.serviceWorker
          .register('/sw.js', { scope: '/', updateViaCache: 'none' })
          .then((reg) => {
          console.log('[SW] Registered:', reg);

          // Track installing worker state to get clearer errors
          const trackInstalling = (worker) => {
            if (!worker) return;
            console.log('[SW] Worker state:', worker.state);
            worker.addEventListener('statechange', () => {
              console.log('[SW] statechange ->', worker.state);
              if (worker.state === 'redundant') {
                console.warn('[SW] Worker became redundant — check sw.js for errors');
              }
            });
          };

          if (reg.installing) trackInstalling(reg.installing);
          reg.addEventListener('updatefound', () => trackInstalling(reg.installing));
        })
          .catch((err) => {
            // Non-fatal — site works fine without SW, but log more detail
            console.warn('[SW] Registration failed:', err);
          });
      } catch (err) {
        console.warn('[SW] Error checking /sw.js before register:', err);
      }
    };

    if (document.readyState === 'complete') {
      register();
    } else {
      window.addEventListener('load', register, { once: true });
    }
  }, []);
}
