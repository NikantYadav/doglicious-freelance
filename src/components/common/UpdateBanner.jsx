import { useState, useEffect } from 'react';

/**
 * UpdateBanner
 *
 * Listens for SW_UPDATE_AVAILABLE messages from the service worker.
 * When a new deploy is detected, shows a small non-intrusive banner
 * at the top of the page. Clicking "Update" reloads the page — the
 * browser will then fetch the new index.html and all new hashed assets.
 */
export default function UpdateBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    const handler = (event) => {
      if (event.data?.type === 'SW_UPDATE_AVAILABLE') {
        setShow(true);
      }
    };

    navigator.serviceWorker.addEventListener('message', handler);
    return () => navigator.serviceWorker.removeEventListener('message', handler);
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
