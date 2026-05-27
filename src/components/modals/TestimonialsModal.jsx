import React, { useState, useEffect, useCallback, useRef } from 'react';

const TESTIMONIALS = [
  {
    id: 'badrish',
    dogName: 'Badrish',
    breed: 'Dog Parent',
    ownerName: 'Badrish',
    location: 'India',
    emoji: '🏅',
    bgColor: '#1a1410',
    video: '/testimonials/Badrish Horizontal.mp4',
    quote: 'Real results, real food. My dog has never been happier.',
    stars: 5,
  },
  {
    id: 'deepa',
    dogName: 'Deepa\'s Dog',
    breed: 'Dog Parent',
    ownerName: 'Deepa',
    location: 'India',
    emoji: '⭐',
    bgColor: '#1a1410',
    video: '/testimonials/Deepa Horizontal.mp4',
    quote: 'Switched to Doglicious and never looked back.',
    stars: 5,
  },
  {
    id: 'expert',
    dogName: 'Expert Review',
    breed: 'Vet / Expert',
    ownerName: 'Expert',
    location: 'India',
    emoji: '🔬',
    bgColor: '#1a1410',
    video: '/testimonials/Expert Horizontal.mp4',
    quote: 'Vet-approved, NABL certified — the gold standard in fresh dog food.',
    stars: 5,
  },
  {
    id: 'seerat',
    dogName: 'Seerat\'s Dog',
    breed: 'Dog Parent',
    ownerName: 'Seerat',
    location: 'India',
    emoji: '🌟',
    bgColor: '#1a1410',
    video: '/testimonials/Seerat Horizontal.mp4',
    quote: 'The difference in energy and coat quality was visible within days.',
    stars: 5,
  },
  {
    id: 'tarini-a',
    dogName: 'Tarini\'s Dog',
    breed: 'Dog Parent',
    ownerName: 'Tarini Jain',
    location: 'India',
    emoji: '🐾',
    bgColor: '#1a1410',
    video: '/testimonials/Tarini Jain (a) Horizontal.mp4',
    quote: 'Fresh food made all the difference for my dog.',
    stars: 5,
    partLabel: 'Part 1',
  },
  {
    id: 'tarini-b',
    dogName: 'Tarini\'s Dog',
    breed: 'Dog Parent',
    ownerName: 'Tarini Jain',
    location: 'India',
    emoji: '🐾',
    bgColor: '#1a1410',
    video: '/testimonials/Tarini Jain (b) Horizontal.mp4',
    quote: 'I recommend Doglicious to every dog parent I know.',
    stars: 5,
    partLabel: 'Part 2',
  },
  {
    id: 'vishwa-a',
    dogName: 'Vishwa\'s Dog',
    breed: 'Dog Parent',
    ownerName: 'Vishwa',
    location: 'India',
    emoji: '💫',
    bgColor: '#1a1410',
    video: '/testimonials/Vishwa (a) Horizontal.mp4',
    quote: 'My dog went from picky eater to bowl-licker in one meal.',
    stars: 5,
    partLabel: 'Part 1',
  },
  {
    id: 'vishwa-b',
    dogName: 'Vishwa\'s Dog',
    breed: 'Dog Parent',
    ownerName: 'Vishwa',
    location: 'India',
    emoji: '💫',
    bgColor: '#1a1410',
    video: '/testimonials/Vishwa (b) Horizontal.mp4',
    quote: 'The quality and freshness is unmatched. Highly recommend.',
    stars: 5,
    partLabel: 'Part 2',
  },
  {
    id: 'zenith',
    dogName: 'Zenith\'s Dog',
    breed: 'Dog Parent',
    ownerName: 'Zenith',
    location: 'India',
    emoji: '🏆',
    bgColor: '#1a1410',
    video: '/testimonials/Zenith Horizontal.mp4',
    quote: 'Best decision I made for my dog\'s health.',
    stars: 5,
  },
];

const STATS = [
  { value: '5L+',    label: 'Meals Served' },
  { value: '4.9★',  label: 'Avg. Rating' },
  { value: '2,400+', label: 'Happy Dogs' },
  { value: '98%',   label: 'Recommend' },
  { value: '0',     label: 'Lock-in' },
];

// Separate component so video remounts (and autoplays) on each slide change
function MainVideo({ src, bgColor }) {
  const ref = useRef(null);
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    v.load();
    v.play().catch(() => {});
  }, []);

  return (
    <video
      ref={ref}
      src={src}
      loop
      muted
      playsInline
      preload="metadata"
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'contain',
        display: 'block',
        background: bgColor,
      }}
    />
  );
}

export default function TestimonialsModal({ isOpen, onClose }) {
  const [active, setActive] = useState(0);
  const [slideDir, setSlideDir] = useState('next');
  const [animKey, setAnimKey] = useState(0);
  const autoRef = useRef(null);

  const goTo = useCallback((idx, dir = 'next') => {
    setSlideDir(dir);
    setAnimKey(k => k + 1);
    setActive(idx);
  }, []);

  const prev = useCallback(() => {
    goTo((active - 1 + TESTIMONIALS.length) % TESTIMONIALS.length, 'prev');
  }, [active, goTo]);

  const next = useCallback(() => {
    goTo((active + 1) % TESTIMONIALS.length, 'next');
  }, [active, goTo]);

  const resetAuto = useCallback(() => {
    clearInterval(autoRef.current);
    autoRef.current = setInterval(() => {
      setActive(a => {
        const n = (a + 1) % TESTIMONIALS.length;
        setSlideDir('next');
        setAnimKey(k => k + 1);
        return n;
      });
    }, 6000);
  }, []);

  useEffect(() => {
    if (!isOpen) { clearInterval(autoRef.current); return; }
    setActive(0);
    resetAuto();
    return () => clearInterval(autoRef.current);
  }, [isOpen, resetAuto]);

  useEffect(() => {
    if (!isOpen) return;
    const h = (e) => {
      if (e.key === 'ArrowLeft')  { prev(); resetAuto(); }
      if (e.key === 'ArrowRight') { next(); resetAuto(); }
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [isOpen, prev, next, onClose, resetAuto]);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  const t = TESTIMONIALS[active];

  return (
    <>
      <style>{`
        @keyframes tm-in-next {
          from { opacity: 0; transform: translateX(24px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes tm-in-prev {
          from { opacity: 0; transform: translateX(-24px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        .tm-slide-next { animation: tm-in-next .26s cubic-bezier(.25,1,.5,1) both; }
        .tm-slide-prev { animation: tm-in-prev .26s cubic-bezier(.25,1,.5,1) both; }

        .tm-overlay {
          position: fixed; inset: 0; z-index: 99999;
          background: rgba(20,16,12,.75);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          display: flex; align-items: center; justify-content: center;
          padding: 16px;
        }
        .tm-dialog {
          background: #FEFDF9;
          border-radius: 24px;
          width: 100%;
          max-width: 640px;
          max-height: 92svh;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          box-shadow: 0 40px 100px rgba(0,0,0,.5);
          position: relative;
        }

        /* ── HEADER ── */
        .tm-header {
          background: linear-gradient(135deg, #221C15 0%, #3A2700 100%);
          padding: 20px 22px 16px;
          flex-shrink: 0;
        }
        .tm-header-row {
          display: flex; align-items: flex-start;
          justify-content: space-between; gap: 12px;
          margin-bottom: 14px;
        }
        .tm-label {
          font-size: 10px; font-weight: 700; letter-spacing: .12em;
          text-transform: uppercase; color: rgba(254,253,249,.45);
          font-family: Poppins, sans-serif; margin-bottom: 4px;
        }
        .tm-title {
          font-size: 19px; font-weight: 800; color: #FEFDF9;
          font-family: Poppins, sans-serif; line-height: 1.2;
        }
        .tm-title em { color: #C8956A; font-style: italic; }
        .tm-subtitle {
          font-size: 11px; color: rgba(254,253,249,.45);
          font-family: Poppins, sans-serif; margin-top: 3px;
        }
        .tm-close-btn {
          background: rgba(254,253,249,.12); border: none; border-radius: 50%;
          width: 30px; height: 30px; min-width: 30px;
          color: rgba(254,253,249,.7); font-size: 14px;
          cursor: pointer; display: flex; align-items: center;
          justify-content: center; transition: background .15s;
          font-family: Poppins, sans-serif;
        }
        .tm-close-btn:hover { background: rgba(254,253,249,.24); color: #fff; }

        /* Stats bar */
        .tm-stats {
          display: flex;
          border-top: 1px solid rgba(254,253,249,.08);
          padding-top: 12px;
        }
        .tm-stat {
          flex: 1; text-align: center;
          border-right: 1px solid rgba(254,253,249,.08);
          padding: 0 2px;
        }
        .tm-stat:last-child { border-right: none; }
        .tm-stat-val {
          font-size: 13px; font-weight: 800; color: #FEFDF9;
          font-family: Poppins, sans-serif; line-height: 1;
        }
        .tm-stat-lbl {
          font-size: 8px; color: rgba(254,253,249,.38);
          font-family: Poppins, sans-serif; margin-top: 3px; font-weight: 500;
        }

        /* ── VIDEO AREA ── */
        .tm-video-wrap {
          position: relative;
          background: #1a1410;
          flex: 1;
          min-height: 0;
          overflow: hidden;
        }
        .tm-video-wrap video {
          width: 100%; height: 100%;
          object-fit: contain; display: block;
        }
        .tm-video-gradient {
          position: absolute; inset: 0;
          background: linear-gradient(
            to top,
            rgba(0,0,0,.65) 0%,
            rgba(0,0,0,.05) 40%,
            transparent 100%
          );
          pointer-events: none;
        }
        .tm-video-tag {
          position: absolute; top: 12px; left: 12px;
          background: rgba(255,255,255,.18);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          border: 1px solid rgba(255,255,255,.25);
          border-radius: 999px;
          padding: 5px 12px;
          display: flex; align-items: center; gap: 6px;
          font-size: 12px; font-weight: 700; color: #fff;
          font-family: Poppins, sans-serif;
        }
        .tm-part-badge {
          position: absolute; top: 12px; right: 12px;
          background: rgba(151,103,70,.85);
          backdrop-filter: blur(6px);
          border-radius: 999px;
          padding: 4px 10px;
          font-size: 10px; font-weight: 700; color: #fff;
          font-family: Poppins, sans-serif;
        }

        /* ── INFO STRIP ── */
        .tm-info {
          background: #fff;
          padding: 14px 18px 10px;
          border-top: 1px solid rgba(34,28,21,.06);
          flex-shrink: 0;
        }
        .tm-stars { display: flex; gap: 2px; margin-bottom: 7px; }
        .tm-quote {
          font-size: 13px; line-height: 1.65; color: #3A2700;
          font-family: Poppins, sans-serif; font-style: italic;
          margin-bottom: 10px;
        }
        .tm-author-row {
          display: flex; align-items: center;
          justify-content: space-between; gap: 8px;
        }
        .tm-author-name {
          font-size: 12px; font-weight: 700; color: #221C15;
          font-family: Poppins, sans-serif;
        }
        .tm-author-dog {
          font-size: 10px; color: rgba(34,28,21,.42);
          font-family: Poppins, sans-serif; margin-top: 1px;
        }
        .tm-counter {
          font-size: 10px; color: rgba(34,28,21,.32);
          font-family: Poppins, sans-serif; font-weight: 600;
          white-space: nowrap;
        }

        /* ── CONTROLS ── */
        .tm-controls {
          display: flex; align-items: center;
          justify-content: space-between;
          padding: 10px 18px 14px;
          background: #fff;
          border-top: 1px solid rgba(34,28,21,.06);
          flex-shrink: 0;
        }
        .tm-nav-btn {
          width: 34px; height: 34px; border-radius: 50%;
          border: 1.5px solid rgba(34,28,21,.15);
          background: transparent; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          font-size: 18px; color: #976746;
          transition: all .15s; font-family: Poppins, sans-serif;
          line-height: 1;
        }
        .tm-nav-btn:hover {
          background: #976746; color: #fff; border-color: #976746;
        }
        .tm-dots { display: flex; gap: 5px; align-items: center; flex-wrap: wrap; justify-content: center; }
        .tm-dot {
          height: 6px; border-radius: 999px;
          background: rgba(34,28,21,.18);
          border: none; cursor: pointer; padding: 0;
          transition: all .25s cubic-bezier(.25,1,.5,1);
        }
        .tm-dot.tm-dot-active {
          background: #976746;
          width: 18px !important;
        }

        /* ── MOBILE ── */
        @media (max-width: 540px) {
          .tm-dialog { border-radius: 18px; max-height: 96svh; }
          .tm-header { padding: 14px 14px 12px; }
          .tm-title { font-size: 16px; }
          .tm-stat-val { font-size: 11px; }
          .tm-stat-lbl { font-size: 7.5px; }
          .tm-info { padding: 12px 14px 8px; }
          .tm-controls { padding: 8px 14px 12px; }
          .tm-quote { font-size: 12px; }
          .tm-video-tag { font-size: 11px; padding: 4px 10px; }
        }
      `}</style>

      <div
        className="tm-overlay"
        onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      >
        <div className="tm-dialog" onClick={e => e.stopPropagation()}>

          {/* ── HEADER ── */}
          <div className="tm-header">
            <div className="tm-header-row">
              <div>
                <div className="tm-label">🐾 Real Dogs · Real Results</div>
                <div className="tm-title">Meet Our <em>Happy Customers</em></div>
                <div className="tm-subtitle">Over 5 lakh meals served. See what real dog parents across India are saying.</div>
              </div>
              <button className="tm-close-btn" onClick={onClose} aria-label="Close">✕</button>
            </div>
            <div className="tm-stats">
              {STATS.map(s => (
                <div key={s.label} className="tm-stat">
                  <div className="tm-stat-val">{s.value}</div>
                  <div className="tm-stat-lbl">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ── VIDEO ── */}
          <div className="tm-video-wrap">
            <MainVideo key={t.id} src={t.video} bgColor={t.bgColor} />
            <div className="tm-video-gradient" />
            <div className="tm-video-tag">
              <span>{t.emoji}</span>
              <span>{t.ownerName}</span>
            </div>
            {t.partLabel && (
              <div className="tm-part-badge">{t.partLabel}</div>
            )}
          </div>

          {/* ── INFO ── */}
          <div className={`tm-info tm-slide-${slideDir}`} key={`info-${animKey}`}>
            <div className="tm-stars">
              {[...Array(t.stars)].map((_, i) => (
                <svg key={i} width="13" height="13" viewBox="0 0 24 24" fill="#976746">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              ))}
            </div>
            <p className="tm-quote">"{t.quote}"</p>
            <div className="tm-author-row">
              <div>
                <div className="tm-author-name">{t.ownerName}{t.partLabel ? ` — ${t.partLabel}` : ''}</div>
                <div className="tm-author-dog">{t.breed} · {t.location}</div>
              </div>
              <div className="tm-counter">{active + 1} / {TESTIMONIALS.length}</div>
            </div>
          </div>

          {/* ── CONTROLS ── */}
          <div className="tm-controls">
            <button
              className="tm-nav-btn"
              onClick={() => { prev(); resetAuto(); }}
              aria-label="Previous"
            >‹</button>

            <div className="tm-dots">
              {TESTIMONIALS.map((_, i) => (
                <button
                  key={i}
                  className={`tm-dot${i === active ? ' tm-dot-active' : ''}`}
                  style={{ width: i === active ? '18px' : '6px' }}
                  onClick={() => { goTo(i, i > active ? 'next' : 'prev'); resetAuto(); }}
                  aria-label={`Go to ${i + 1}`}
                />
              ))}
            </div>

            <button
              className="tm-nav-btn"
              onClick={() => { next(); resetAuto(); }}
              aria-label="Next"
            >›</button>
          </div>

        </div>
      </div>
    </>
  );
}
