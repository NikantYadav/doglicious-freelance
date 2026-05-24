import React from 'react';

export const BottomNav = ({ active, onNavigate }) => (
  <nav className="bnav">

    {/* Home */}
    <button className={`bni${active === 'home' ? ' on' : ''}`} onClick={() => onNavigate('home')} type="button" aria-label="Home">
      <svg className="bni-svg" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
      <span className="bl">Home</span>
    </button>

    {/* History */}
    <button className={`bni${active === 'hist' ? ' on' : ''}`} onClick={() => onNavigate('hist')} type="button" aria-label="History">
      <svg className="bni-svg" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2"/>
        <line x1="16" y1="2" x2="16" y2="6"/>
        <line x1="8" y1="2" x2="8" y2="6"/>
        <line x1="3" y1="10" x2="21" y2="10"/>
        <line x1="8" y1="14" x2="14" y2="14"/>
        <line x1="8" y1="18" x2="14" y2="18"/>
      </svg>
      <span className="bl">History</span>
    </button>

    {/* Scan — centre pill */}
    <button className={`bni bni-scan${active === 'home' && active === 'scan' ? ' on' : ''}`} onClick={() => onNavigate('scan')} type="button" aria-label="Scan">
      <div className="bni-scan-pill">
        <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
          <circle cx="12" cy="12" r="9"/>
          <line x1="12" y1="8" x2="12" y2="16"/>
          <line x1="8" y1="12" x2="16" y2="12"/>
        </svg>
      </div>
      <span className="bl" style={{ color: 'var(--brand)', fontWeight: 700, marginTop: 0 }}>Scan</span>
    </button>

    {/* Progress */}
    <button className={`bni${active === 'prog' ? ' on' : ''}`} onClick={() => onNavigate('prog')} type="button" aria-label="Progress">
      <svg className="bni-svg" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10"/>
        <line x1="12" y1="20" x2="12" y2="4"/>
        <line x1="6" y1="20" x2="6" y2="14"/>
        <polyline points="2 20 22 20"/>
      </svg>
      <span className="bl">Progress</span>
    </button>

    {/* Settings */}
    <button className={`bni${active === 'settings' ? ' on' : ''}`} onClick={() => onNavigate('settings')} type="button" aria-label="Settings">
      <svg className="bni-svg" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"/>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
      </svg>
      <span className="bl">Settings</span>
    </button>

  </nav>
);
