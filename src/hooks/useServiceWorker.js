import { useEffect } from 'react';

/**
 * Registers the service worker on mount.
 * Called once at the app root — no deps, no re-registration.
 */
export function useServiceWorker() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    const register = async () => {
      try {
        const reg = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
          updateViaCache: 'none',
        });

        const trackInstalling = (worker) => {
          if (!worker) return;
          worker.addEventListener('statechange', () => {
            if (worker.state === 'redundant') {
              console.warn('[SW] Worker became redundant — check sw.js for errors');
            }
          });
        };

        if (reg.installing) trackInstalling(reg.installing);
        reg.addEventListener('updatefound', () => trackInstalling(reg.installing));
      } catch (err) {
        console.warn('[SW] Registration failed:', err);
      }
    };

    if (document.readyState === 'complete') {
      register();
    } else {
      window.addEventListener('load', register, { once: true });
    }
  }, []);
}
