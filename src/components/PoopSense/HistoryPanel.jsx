import React, { useState, useMemo } from 'react';
import { MONTHS, pad, fmtDateShort, todayStr } from './helpers';
import { WhatsAppIcon } from './Icons';

// ── Streak bar (14 days) ──────────────────────────────────────────────
function StreakBar({ history, onEntryClick }) {
  const { dots, streak } = useMemo(() => {
    const map = {};
    history.forEach(e => { if (!map[e.date] || e.score > map[e.date].score) map[e.date] = e; });
    const today = new Date();
    const dots = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date(today); d.setDate(today.getDate() - i);
      const ds = d.toISOString().slice(0, 10);
      const entry = map[ds];
      const cls = entry ? (entry.score >= 75 ? 'g' : entry.score >= 50 ? 'w' : 'c') : 'e';
      dots.push({ ds, lbl: String(d.getDate()), cls, entry });
    }
    let streak = 0;
    const sd = new Date(today);
    while (map[sd.toISOString().slice(0, 10)]) { streak++; sd.setDate(sd.getDate() - 1); }
    return { dots, streak };
  }, [history]);

  return (
    <div className="streak-bar">
      <div className="streak-h">
        <div>
          <div className="streak-title">14-day tracking</div>
          <div className="streak-sub">Tap a coloured dot to view that day's scan</div>
        </div>
        <div className="streak-val">{streak} day{streak !== 1 ? 's' : ''}</div>
      </div>
      <div className="streak-dots">
        {dots.map(({ ds, lbl, cls, entry }) => (
          <div
            key={ds}
            className={`streak-dot ${cls}`}
            style={{ cursor: entry ? 'pointer' : 'default' }}
            onClick={() => entry && onEntryClick(entry)}
          >{lbl}</div>
        ))}
      </div>
    </div>
  );
}

// ── Calendar ──────────────────────────────────────────────────────────
function ScanCalendar({ history }) {
  const now = new Date();
  const [calYear, setCalYear] = useState(now.getFullYear());
  const [calMonth, setCalMonth] = useState(now.getMonth());

  const dateMap = useMemo(() => {
    const m = {};
    history.forEach(e => { if (!m[e.date]) m[e.date] = []; m[e.date].push(e); });
    return m;
  }, [history]);

  const todayStr2 = todayStr();
  const firstDow = new Date(calYear, calMonth, 1).getDay();
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();

  const prev = () => calMonth === 0 ? (setCalMonth(11), setCalYear(y => y - 1)) : setCalMonth(m => m - 1);
  const next = () => calMonth === 11 ? (setCalMonth(0), setCalYear(y => y + 1)) : setCalMonth(m => m + 1);

  return (
    <div className="card">
      <div className="calhdr">
        <button className="calnav" onClick={prev}>‹</button>
        <span className="calmth">{MONTHS[calMonth]} {calYear}</span>
        <button className="calnav" onClick={next}>›</button>
      </div>
      <div className="calmesh">
        {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => <div key={d} className="caldow">{d}</div>)}
      </div>
      <div className="calmesh">
        {Array.from({ length: firstDow }, (_, i) => <div key={`e${i}`} className="calempty" />)}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1;
          const ds = `${calYear}-${pad(calMonth + 1)}-${pad(day)}`;
          const dayScans = dateMap[ds];
          const isToday = ds === todayStr2;
          let cls = 'calday';
          if (isToday) cls += ' tod';
          if (dayScans?.length) {
            const best = Math.max(...dayScans.map(e => e.score || 0));
            cls += ` he ${best >= 75 ? 'g' : best >= 50 ? 'w' : 'c'}`;
            return <div key={day} className={cls}><strong>{day}</strong>{dayScans.length > 1 && <span className="cal-cnt">{dayScans.length}</span>}</div>;
          }
          if (ds < todayStr2) cls += ' no-data';
          else if (ds > todayStr2) cls += ' future';
          return <div key={day} className={cls}>{day}</div>;
        })}
      </div>
      <div className="cal-legend">
        <span><i style={{ background: 'var(--g)' }} />Good scan</span>
        <span><i style={{ background: 'var(--a)' }} />Monitor</span>
        <span><i style={{ background: 'var(--r)' }} />Risk</span>
        <span><i style={{ background: 'rgba(180,180,180,.4)', borderRadius: 2 }} />No scan that day</span>
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────
export const HistoryPanel = ({ history, dogName, vetName, vetNum, onEntryClick, onShareVet, onDownloadHistoryPDF }) => {
  const [pdfDays, setPdfDays] = useState(7);

  const sorted = useMemo(() =>
    [...history].sort((a, b) => (b.ts || 0) - (a.ts || 0)), [history]);

  const total = sorted.length;
  const avg = total ? Math.round(sorted.reduce((s, e) => s + (e.score || 0), 0) / total) : 0;
  const good = sorted.filter(e => e.score >= 75).length;
  const last = sorted[0], prev = sorted[1];
  let trend = '--', trendCls = 'neu';
  if (last && prev) {
    const diff = last.score - prev.score;
    trend = diff > 0 ? `↑ +${diff}` : diff < 0 ? `↓ ${diff}` : '→ Same';
    trendCls = diff > 0 ? 'up' : diff < 0 ? 'dn' : 'neu';
  }

  return (
    <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflowY: 'auto', overflowX: 'hidden', WebkitOverflowScrolling: 'touch', paddingBottom: 'calc(var(--bnav) + env(safe-area-inset-bottom,8px))' }}>

      <div className="nhdr">
        <div className="nhdr-row">
          <div>
            <div className="ntitle">History</div>
            <div className="nsub">Scan records &amp; downloads</div>
          </div>
        </div>
      </div>

      <div className="content">

        {/* Summary */}
        {total === 0 ? (
          <div className="hist-summary">
            <div style={{ textAlign: 'center', padding: '16px 14px 8px', gridColumn: '1/-1' }}>
              <div style={{ fontSize: 30, marginBottom: 8 }}>📊</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--brand)', marginBottom: 5 }}>No scans yet</div>
              <div style={{ fontSize: 11, color: 'var(--t3)', lineHeight: 1.6 }}>Complete your first scan to<br />start tracking gut health</div>
            </div>
          </div>
        ) : (
          <div className="hist-summary">
            <div className="hsum-cell"><div className="hsum-val">{total}</div><div className="hsum-lbl">Total scans</div></div>
            <div className="hsum-cell">
              <div className="hsum-val">{avg}</div>
              <div className="hsum-lbl">Avg score</div>
              <div className={`hsum-trend ${trendCls}`}>{trend}</div>
            </div>
            <div className="hsum-cell"><div className="hsum-val">{good}</div><div className="hsum-lbl">Good days</div></div>
          </div>
        )}

        {/* Streak */}
        <StreakBar history={sorted} onEntryClick={onEntryClick} />

        {/* Calendar */}
        <ScanCalendar history={sorted} />

        {/* Recent scans */}
        <div className="card">
          <p className="clbl">Recent scans</p>
          {sorted.length === 0 ? (
            <p style={{ fontSize: 12, color: 'var(--t3)', padding: '6px 0' }}>No scans yet for this dog. Do your first scan now!</p>
          ) : (
            <ul className="recent-list">
              {sorted.slice(0, 20).map(entry => (
                <li key={entry.id} className="hist-item" onClick={() => onEntryClick(entry)}>
                  <div className="hi-top">
                    <div className={`hi-score ${entry.risk}`}>{entry.score}</div>
                    <div style={{ flex: 1 }}>
                      <div className="hi-type">{entry.stoolType}</div>
                      <div className="hi-date">{fmtDateShort(entry.date)} · {entry.time}</div>
                    </div>
                    <div style={{ fontSize: 10, color: entry.risk === 'g' ? 'var(--g)' : entry.risk === 'w' ? 'var(--a)' : 'var(--r)', fontWeight: 700 }}>
                      {entry.risk === 'g' ? 'Good' : entry.risk === 'w' ? 'Monitor' : 'Urgent'}
                    </div>
                  </div>
                  <div className="hi-sum">{entry.sum?.slice(0, 120)}{entry.sum?.length > 120 ? '…' : ''}</div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* PDF Download */}
        <div className="card">
          <p className="clbl">📄 Download History Report</p>
          <p style={{ fontSize: 11, color: 'var(--t3)', marginBottom: 10 }}>Download PDF reports for any time period</p>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
            {[7, 14, 30, 60, 90].map(d => (
              <button key={d} className={`hist-pdf-btn${pdfDays === d ? ' on' : ''}`} onClick={() => setPdfDays(d)}>{d} days</button>
            ))}
          </div>
          <button className="btn btn-out" onClick={() => onDownloadHistoryPDF?.(pdfDays)} style={{ fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Download {pdfDays}-day PDF Report
          </button>

          {/* Share with Vet */}
          <div className="svw-card" style={{ marginTop: 14 }}>
            <div className="svw-row">
              <div className="svw-left">
                <div className="svw-icon">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.18h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.68 2.81a2 2 0 0 1-.45 2.11L8.09 8.91a16 16 0 0 0 5.61 5.61l.71-.72a2 2 0 0 1 2.11-.45c.91.32 1.85.55 2.81.68a2 2 0 0 1 1.72 2.07z"/>
                  </svg>
                </div>
                <div>
                  <div className="svw-title">Share with Vet</div>
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
        </div>

      </div>
    </div>
  );
};
