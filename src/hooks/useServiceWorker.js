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
    const register = () => {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .catch((err) => {
          // Non-fatal — site works fine without SW
          console.warn('[SW] Registration failed:', err);
        });
    };

    if (document.readyState === 'complete') {
      register();
    } else {
      window.addEventListener('load', register, { once: true });
    }
  }, []);
}
