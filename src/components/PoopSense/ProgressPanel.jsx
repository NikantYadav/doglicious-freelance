import React, { useState, useMemo, useEffect, useRef } from 'react';
import { WhatsAppIcon } from './Icons';

const PERIODS = [7, 14, 30, 60, 90];

// ── Trend canvas chart ────────────────────────────────────────────────
function TrendChart({ history, days }) {
  const canvasRef = useRef(null);

  const barData = useMemo(() => {
    const today = new Date();
    const map = {};
    history.forEach(e => { if (!map[e.date]) map[e.date] = []; map[e.date].push(e); });
    const bars = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today); d.setDate(today.getDate() - i);
      const ds = d.toISOString().slice(0, 10);
      const scans = map[ds] ?? [];
      const best = scans.length ? Math.max(...scans.map(e => e.score)) : null;
      const rk = best === null ? 'e' : best >= 75 ? 'g' : best >= 50 ? 'w' : 'c';
      bars.push({ ds, lbl: String(d.getDate()), score: best, rk });
    }
    return bars;
  }, [history, days]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.offsetWidth || 300;
    const H = 88;
    canvas.width = W;
    canvas.height = H;
    ctx.clearRect(0, 0, W, H);

    const colors = { g: '#195C30', w: '#C47808', c: '#AD2218', e: '#EAE0D0' };
    const bw = Math.max(2, (W / barData.length) - 2);

    barData.forEach(({ score, rk }, i) => {
      const h = score !== null ? Math.max(4, (score / 100) * (H - 8)) : 4;
      const x = i * (W / barData.length) + 1;
      const y = H - h;
      ctx.fillStyle = colors[rk];
      ctx.beginPath();
      ctx.roundRect(x, y, bw, h, [3, 3, 0, 0]);
      ctx.fill();
    });
  }, [barData]);

  const labels = useMemo(() => {
    if (days <= 14) return barData.map(b => b.lbl);
    // Show only first of each week
    return barData.map((b, i) => (i % 7 === 0 ? b.lbl : ''));
  }, [barData, days]);

  return (
    <div className="trend-chart">
      <div className="tc-head">
        <div className="tc-title">Health Score Trend</div>
      </div>
      <div id="trendLegend" style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
        {[['#195C30','75–100 Low Risk'],['#C47808','50–74 Monitor'],['#AD2218','0–49 Urgent']].map(([c,l]) => (
          <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 9, color: 'var(--t3)' }}>
            <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: '50%', background: c }} />{l}
          </div>
        ))}
      </div>
      <div className="chart-wrap">
        <canvas ref={canvasRef} id="trendCanvas" height="88" style={{ width: '100%', height: 88, display: 'block' }} />
      </div>
      <div className="chart-labels" style={{ display: 'flex', justifyContent: 'space-between', marginTop: 3 }}>
        {labels.map((l, i) => <span key={i} style={{ fontSize: 8, color: 'var(--t3)', flex: 1, textAlign: 'center' }}>{l}</span>)}
      </div>
      {/* Score guide */}
      <div style={{ background: 'var(--sf2)', borderRadius: 'var(--rs)', padding: '9px 12px', marginTop: 8, border: '1px solid var(--bd)' }}>
        <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6 }}>How to read your score</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
          {[
            { bg: '#E7F4EC', score: '75–100', lbl: 'Low Risk', color: '#195C30', desc: 'Healthy stool. Maintain diet & routine.' },
            { bg: '#FFF6E8', score: '50–74',  lbl: 'Monitor',  color: '#C47808', desc: 'Watch closely. May need diet adjustment.' },
            { bg: '#FCECEA', score: '0–49',   lbl: 'Urgent',   color: '#AD2218', desc: 'Consult your vet as soon as possible.' },
          ].map(({ bg, score, lbl, color, desc }) => (
            <div key={lbl} style={{ textAlign: 'center', background: bg, borderRadius: 6, padding: '6px 4px' }}>
              <div style={{ fontSize: 13, fontWeight: 800, color }}>{score}</div>
              <div style={{ fontSize: 8, fontWeight: 700, color, marginTop: 1 }}>{lbl}</div>
              <div style={{ fontSize: 7.5, color: '#666', marginTop: 2, lineHeight: 1.3 }}>{desc}</div>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 8, color: 'var(--t3)', marginTop: 7, lineHeight: 1.5, borderTop: '1px solid var(--bd)', paddingTop: 6 }}>
          📊 Score is calculated using <strong>Bristol scale</strong>, colour, consistency, and reported symptoms. Higher = healthier.
        </div>
      </div>
    </div>
  );
}

// ── Bristol trend canvas ──────────────────────────────────────────────
function BristolTrend({ history }) {
  const canvasRef = useRef(null);
  const [tooltip, setTooltip] = useState(null);

  const last14 = useMemo(() =>
    [...history].sort((a, b) => (b.ts || 0) - (a.ts || 0)).slice(0, 14).reverse(),
    [history]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !last14.length) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.offsetWidth || 300;
    const H = 160;
    canvas.width = W;
    canvas.height = H;
    ctx.clearRect(0, 0, W, H);

    const bw = Math.max(8, (W / last14.length) - 4);
    last14.forEach((e, i) => {
      const bs = e.bristolScore || 4;
      const h = (bs / 7) * (H - 20);
      const x = i * (W / last14.length) + 2;
      const y = H - h - 10;
      ctx.fillStyle = bs <= 4 ? '#195C30' : bs <= 6 ? '#C47808' : '#AD2218';
      ctx.beginPath();
      ctx.roundRect(x, y, bw, h, [3, 3, 0, 0]);
      ctx.fill();
      ctx.fillStyle = '#9C7D52';
      ctx.font = '8px Poppins, Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(String(bs), x + bw / 2, H - 2);
    });
  }, [last14]);

  return (
    <div className="card" style={{ padding: 14 }}>
      <p className="clbl" style={{ marginBottom: 2 }}>Bristol scale trend (last 14 scans)</p>
      <p style={{ fontSize: 10, color: 'var(--t3)', marginBottom: 12 }}>Tap any bar for details</p>
      <div style={{ position: 'relative', width: '100%', height: 160 }}>
        <canvas ref={canvasRef} style={{ width: '100%', height: 160, display: 'block' }} />
        {tooltip && (
          <div style={{ display: 'block', position: 'absolute', background: 'var(--brand)', color: '#fff', fontSize: 10, fontWeight: 700, padding: '5px 9px', borderRadius: 8, pointerEvents: 'none', whiteSpace: 'nowrap', boxShadow: '0 3px 10px rgba(0,0,0,.25)', top: tooltip.y, left: tooltip.x }}>
            {tooltip.text}
          </div>
        )}
      </div>
      <div style={{ display: 'flex', gap: 14, marginTop: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
        {[['var(--g)','Ideal (1–4)'],['var(--a)','Loose (5–6)'],['var(--r)','Liquid (7)']].map(([c,l]) => (
          <span key={l} style={{ fontSize: 10, color: 'var(--t3)', display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: c, display: 'inline-block' }} />{l}
          </span>
        ))}
      </div>
    </div>
  );
}

// ── Medical rings ─────────────────────────────────────────────────────
function MedRing({ id, color, value, label }) {
  const r = 23;
  const circ = 2 * Math.PI * r;
  const fill = (value / 100) * circ;
  return (
    <div className="med-ring-wrap">
      <div className="med-ring">
        <svg viewBox="0 0 58 58">
          <circle cx="29" cy="29" r={r} fill="none" stroke="var(--sf2)" strokeWidth="5"/>
          <circle cx="29" cy="29" r={r} fill="none" stroke={color} strokeWidth="5"
            strokeDasharray={`${fill} ${circ - fill}`} strokeLinecap="round"
            transform="rotate(-90 29 29)" style={{ transition: 'stroke-dasharray 1s ease' }}/>
        </svg>
        <div className="med-ring-val">{value > 0 ? value : '—'}</div>
      </div>
      <div className="med-ring-lbl">{label}</div>
    </div>
  );
}

// ── Color distribution ────────────────────────────────────────────────
function ColorDist({ history }) {
  const dist = useMemo(() => {
    const map = {};
    history.forEach(e => { if (e.color) map[e.color] = (map[e.color] || 0) + 1; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 6);
  }, [history]);

  if (!dist.length) return <div style={{ fontSize: 11, color: 'var(--t3)', padding: '8px 0' }}>No data yet</div>;
  const max = dist[0][1];

  return (
    <div className="cd-bars">
      {dist.map(([color, count]) => (
        <div key={color} style={{ marginBottom: 7 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, marginBottom: 3 }}>
            <span style={{ color: 'var(--t2)' }}>{color}</span>
            <span style={{ fontWeight: 700, color: 'var(--brand)' }}>{count}</span>
          </div>
          <div style={{ height: 6, background: 'var(--sf2)', borderRadius: 3, border: '1px solid var(--bd)' }}>
            <div style={{ height: '100%', borderRadius: 3, background: 'var(--a)', width: `${(count / max) * 100}%`, transition: 'width 0.6s ease' }} />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────
export const ProgressPanel = ({ history, dogName, vetName, onShareVet, onDownloadProgressPDF }) => {
  const [days, setDays] = useState(7);
  const [pdfDays, setPdfDays] = useState(7);

  const inPeriod = useMemo(() => {
    const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - days);
    const cutStr = cutoff.toISOString().slice(0, 10);
    return history.filter(e => e.date >= cutStr);
  }, [history, days]);

  const avg = inPeriod.length ? Math.round(inPeriod.reduce((s, e) => s + e.score, 0) / inPeriod.length) : 0;
  const streak = useMemo(() => {
    const map = {};
    history.forEach(e => { map[e.date] = true; });
    let s = 0; const d = new Date();
    while (map[d.toISOString().slice(0, 10)]) { s++; d.setDate(d.getDate() - 1); }
    return s;
  }, [history]);

  // Derive medical ring scores from scan data
  const rings = useMemo(() => {
    if (!inPeriod.length) return { gut: 0, hyd: 0, inf: 0, mic: 0 };
    const gut = Math.round(inPeriod.reduce((s, e) => s + (e.score || 0), 0) / inPeriod.length);
    const hyd = Math.round(inPeriod.filter(e => !e.symptoms?.water || e.symptoms.water === 'Normal').length / inPeriod.length * 100);
    const inf = Math.round(inPeriod.filter(e => e.risk === 'g').length / inPeriod.length * 100);
    const mic = Math.round(inPeriod.filter(e => (e.bristolScore || 4) >= 3 && (e.bristolScore || 4) <= 4).length / inPeriod.length * 100);
    return { gut, hyd, inf, mic };
  }, [inPeriod]);

  // AI insights derived from data
  const insights = useMemo(() => {
    if (!inPeriod.length) return [];
    const list = [];
    const avgScore = avg;
    if (avgScore >= 75) list.push('Gut health is in a healthy range. Keep up the current diet and routine.');
    else if (avgScore >= 50) list.push('Some digestive irregularity detected. Consider a bland diet for a few days.');
    else list.push('Multiple concerning scans detected. Consult your vet soon.');
    const urgentCount = inPeriod.filter(e => e.risk === 'c').length;
    if (urgentCount > 0) list.push(`${urgentCount} urgent scan${urgentCount > 1 ? 's' : ''} in this period — veterinary attention recommended.`);
    const looseCount = inPeriod.filter(e => (e.bristolScore || 4) >= 5).length;
    if (looseCount > inPeriod.length * 0.4) list.push('Frequent loose stools detected. Ensure adequate hydration and consider probiotic support.');
    return list;
  }, [inPeriod, avg]);

  // Gauge arc
  const gaugeR = 32;
  const gaugeCirc = 2 * Math.PI * gaugeR;
  const gaugeFill = (avg / 100) * gaugeCirc;

  return (
    <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflowY: 'auto', overflowX: 'hidden', WebkitOverflowScrolling: 'touch', paddingBottom: 'calc(var(--bnav) + env(safe-area-inset-bottom,8px))' }}>

      <div className="nhdr">
        <div className="nhdr-row">
          <div>
            <div className="ntitle">Progress</div>
            <div className="nsub">Comprehensive health analytics</div>
          </div>
        </div>
      </div>

      <div className="content">

        {/* Hero gauge */}
        <div className="prog-hero">
          <div className="ph-row">
            <div className="ph-gauge">
              <svg viewBox="0 0 80 80">
                <circle cx="40" cy="40" r={gaugeR} fill="none" stroke="rgba(255,255,255,.15)" strokeWidth="7"/>
                <circle cx="40" cy="40" r={gaugeR} fill="none" stroke="#FFD580" strokeWidth="7"
                  strokeDasharray={`${gaugeFill} ${gaugeCirc - gaugeFill}`} strokeLinecap="round"
                  transform="rotate(-90 40 40)" style={{ transition: 'stroke-dasharray 1s ease' }}/>
              </svg>
              <div className="ph-gauge-val">
                <div className="ph-gauge-num">{avg || '—'}</div>
                <div className="ph-gauge-lbl">avg score</div>
              </div>
            </div>
            <div className="ph-info">
              <div className="ph-title">{dogName || '—'}</div>
              <div className="ph-sub">Last {days} days · {inPeriod.length} scan{inPeriod.length !== 1 ? 's' : ''}</div>
              <div className="ph-streak">🔥 {streak} day streak</div>
            </div>
          </div>
        </div>

        {/* Period filter */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
          {PERIODS.map(p => (
            <button key={p} className={`hist-pdf-btn${days === p ? ' on' : ''}`} onClick={() => setDays(p)}>{p}d</button>
          ))}
        </div>

        {/* Medical rings */}
        <div className="med-rings">
          <MedRing color="var(--g)"  value={rings.gut} label="Gut" />
          <MedRing color="#2980B9"   value={rings.hyd} label="Hydration" />
          <MedRing color="#E74C3C"   value={rings.inf} label="Inflam." />
          <MedRing color="#8E44AD"   value={rings.mic} label="Microbiome" />
        </div>

        {/* Trend chart */}
        <TrendChart history={history} days={days} />

        {/* Bristol trend */}
        <BristolTrend history={history} />

        {/* Color distribution */}
        <div className="card">
          <p className="clbl">Stool colour distribution</p>
          <ColorDist history={inPeriod} />
        </div>

        {/* AI Insights */}
        <div className="insights-card">
          <p className="clbl">🤖 AI Medical Insights</p>
          <ul className="ins-list">
            {insights.length === 0
              ? <li style={{ fontSize: 11, color: 'var(--t3)' }}>Complete more scans to unlock AI insights.</li>
              : insights.map((ins, i) => <li key={i}>{ins}</li>)
            }
          </ul>
        </div>

        {/* Progress PDF Download */}
        <div className="card">
          <p className="clbl">📄 Download Progress Report</p>
          <p style={{ fontSize: 11, color: 'var(--t3)', marginBottom: 10 }}>Select a period and download your report as PDF</p>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
            {PERIODS.map(d => (
              <button key={d} className={`hist-pdf-btn${pdfDays === d ? ' on' : ''}`} onClick={() => setPdfDays(d)}>{d} days</button>
            ))}
          </div>
          <button className="btn btn-out" onClick={() => onDownloadProgressPDF?.(pdfDays)} style={{ fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Download {pdfDays}-day Report
          </button>
        </div>

        {/* Share with Vet */}
        <div className="svw-card">
          <div className="svw-row">
            <div className="svw-left">
              <div className="svw-icon">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.18h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.68 2.81a2 2 0 0 1-.45 2.11L8.09 8.91a16 16 0 0 0 5.61 5.61l.71-.72a2 2 0 0 1 2.11-.45c.91.32 1.85.55 2.81.68a2 2 0 0 1 1.72 2.07z"/>
                </svg>
              </div>
              <div>
                <div className="svw-title">Share Progress with Vet</div>
                <div className="svw-vet-name">{vetName || '—'}</div>
              </div>
            </div>
            <button className="svw-btn" onClick={() => onShareVet?.()}>
              <WhatsAppIcon size={12} />
              Send to Vet
            </button>
          </div>
          {!vetName && <div className="svw-hint">ℹ Add vet name in Settings to enable sharing</div>}
        </div>

        <div style={{ height: 14 }} />
      </div>
    </div>
  );
};
