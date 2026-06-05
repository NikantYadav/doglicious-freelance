import { useState, useCallback, useEffect } from 'react';
import 'lite-youtube-embed/src/lite-yt-embed.css';
import 'lite-youtube-embed/src/lite-yt-embed.js';

const TESTIMONIALS = [
  {
    id: 'expert',
    ownerName: 'Experts',
    breed: 'expert',
    location: 'India',
    emoji: '🐶',
    youtubeId: 's4rNnTDmyHY',
    quote: 'Best decision for my dog\'s health. The results speak for themselves.',
    stars: 5,
  },
  {
    id: 'badrish',
    ownerName: 'Badrish',
    breed: 'Dog Parent',
    location: 'India',
    emoji: '🏅',
    youtubeId: 'DdTnjhxcwbQ',
    quote: 'Real results, real food. My dog has never been happier.',
    stars: 5,
  },
  {
    id: 'tarini',
    ownerName: 'Tarini Jain',
    breed: 'Dog Parent',
    location: 'India',
    emoji: '🐾',
    youtubeId: 'Fl3GUIPngPs',
    quote: 'Fresh food made all the difference for my dog.',
    stars: 5,
  },
  {
    id: 'seerat',
    ownerName: 'Seerat Kour',
    breed: 'Dog Parent',
    location: 'India',
    emoji: '🌟',
    youtubeId: 'oA3bEcC4u6A',
    quote: 'The difference in energy and coat quality was visible within days.',
    stars: 5,
  },
  {
    id: 'viswa',
    ownerName: 'Viswa',
    breed: 'Dog Parent',
    location: 'India',
    emoji: '💫',
    youtubeId: 'fIUSbTxdjVg',
    quote: 'My dog went from picky eater to bowl-licker in one meal.',
    stars: 5,
  },
  {
    id: 'zenith',
    ownerName: 'Zenith',
    breed: 'Dog Parent',
    location: 'India',
    emoji: '🏆',
    youtubeId: '95OT7VbOaLo',
    quote: "Best decision I made for my dog's health.",
    stars: 5,
  },
  {
    id: 'deepa',
    ownerName: 'Deepa & Zia',
    breed: 'Dog Parent',
    location: 'India',
    emoji: '⭐',
    youtubeId: 'yKvI_DMfNPU',
    quote: 'Switched to Doglicious and never looked back.',
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

function YoutubeEmbed({ youtubeId }) {
  // lite-youtube is a custom element — use key to force remount on slide change
  return (
    <lite-youtube
      key={youtubeId}
      videoid={youtubeId}
      style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}
      params="rel=0&playsinline=1"
    />
  );
}

export default function TestimonialsModal({ isOpen, onClose }) {
  const [active, setActive] = useState(0);
  const [slideDir, setSlideDir] = useState('next');
  const [animKey, setAnimKey] = useState(0);

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

  useEffect(() => {
    if (!isOpen) return;
    setActive(0);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const h = (e) => {
      if (e.key === 'ArrowLeft')  prev();
      if (e.key === 'ArrowRight') next();
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [isOpen, prev, next, onClose]);

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
          overscroll-behavior: contain;
          display: flex;
          flex-direction: column;
          box-shadow: 0 40px 100px rgba(0,0,0,.5);
          position: relative;
        }

        /* scrollable middle section */
        .tm-body {
          flex: 1;
          overflow-y: auto;
          overscroll-behavior: contain;
          min-height: 0;
        }

        /* ── HEADER ── */
        .tm-header {
          background: linear-gradient(135deg, #221C15 0%, #3A2700 100%);
          padding: 14px 18px 12px;
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
          width: 100%;
          aspect-ratio: 9 / 16;
          max-height: 52svh;
          overflow: hidden;
          flex-shrink: 0;
        }
        .tm-video-wrap iframe {
          position: absolute;
          top: 0; left: 0;
          width: 100%; height: 100%;
          display: block; border: none;
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
          pointer-events: none;
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
          .tm-video-wrap { max-height: 44svh; }
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
          <div className="tm-body">
          <div className="tm-video-wrap">
            <YoutubeEmbed youtubeId={t.youtubeId} />
            <div className="tm-video-tag">
              <span>{t.emoji}</span>
              <span>{t.ownerName}</span>
            </div>
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
                <div className="tm-author-name">{t.ownerName}</div>
                <div className="tm-author-dog">{t.breed} · {t.location}</div>
              </div>
              <div className="tm-counter">{active + 1} / {TESTIMONIALS.length}</div>
            </div>
          </div>
          </div>

          {/* ── CONTROLS ── */}
          <div className="tm-controls">
            <button className="tm-nav-btn" onClick={prev} aria-label="Previous">‹</button>

            <div className="tm-dots">
              {TESTIMONIALS.map((_, i) => (
                <button
                  key={i}
                  className={`tm-dot${i === active ? ' tm-dot-active' : ''}`}
                  style={{ width: i === active ? '18px' : '6px' }}
                  onClick={() => goTo(i, i > active ? 'next' : 'prev')}
                  aria-label={`Go to ${i + 1}`}
                />
              ))}
            </div>

            <button className="tm-nav-btn" onClick={next} aria-label="Next">›</button>
          </div>

        </div>
      </div>
    </>
  );
}
