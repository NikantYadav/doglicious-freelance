import { useState, useEffect } from 'react';

const VERSION_KEY = 'doglicious_version';

/**
 * On mount, fetches /version.json once and compares against the last-seen
 * version stored in localStorage. If the version changed since the user's
 * last visit, shows a non-intrusive "update available" banner.
 * No service-worker messaging — the SW is not involved.
 */
export default function UpdateBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch('/version.json', { cache: 'no-store' });
        if (!res.ok) return;
        const { v } = await res.json();
        if (!v) return;

        const stored = localStorage.getItem(VERSION_KEY);
        // Always update stored version so banner only appears once per deploy.
        localStorage.setItem(VERSION_KEY, v);
        // Only show banner if there was a previous version and it changed.
        if (stored && stored !== v) setShow(true);
      } catch {
        // Network unavailable — silently ignore.
      }
    };

    // Wait until the page has fully loaded before checking for updates,
    // so the version fetch doesn't compete with critical resources.
    if (document.readyState === 'complete') {
      check();
    } else {
      window.addEventListener('load', check, { once: true });
    }
  }, []);

  if (!show) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 99999,
      background: 'linear-gradient(90deg, #195C30, #2a7a44)',
      color: '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '14px',
      padding: '10px 20px',
      fontSize: '13px',
      fontWeight: 600,
      fontFamily: 'Poppins, sans-serif',
      boxShadow: '0 2px 12px rgba(0,0,0,0.2)',
    }}>
      <span>🐾 A new version of Doglicious is available!</span>
      <button
        onClick={() => window.location.reload()}
        style={{
          background: '#fff',
          color: '#195C30',
          border: 'none',
          borderRadius: '999px',
          padding: '5px 16px',
          fontSize: '12px',
          fontWeight: 700,
          cursor: 'pointer',
          fontFamily: 'Poppins, sans-serif',
          flexShrink: 0,
        }}
      >
        Update now
      </button>
      <button
        onClick={() => setShow(false)}
        style={{
          background: 'rgba(255,255,255,0.2)',
          color: '#fff',
          border: 'none',
          borderRadius: '50%',
          width: '24px',
          height: '24px',
          fontSize: '14px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
        aria-label="Dismiss"
      >
        ✕
      </button>
    </div>
  );
}
