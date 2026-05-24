import React, { useState, useMemo } from 'react';
import type { ScanEntry } from '../../types';
import { MONTHS, pad, fmtDateShort, todayStr } from '../../utils/helpers';

interface HistoryPanelProps {
  history: ScanEntry[];
  dogName: string;
  onEntryClick: (entry: ScanEntry) => void;
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({ history, dogName, onEntryClick }) => {
  const now = new Date();
  const [calYear, setCalYear] = useState(now.getFullYear());
  const [calMonth, setCalMonth] = useState(now.getMonth());

  const sorted = useMemo(() =>
    [...history].sort((a, b) => (b.ts || 0) - (a.ts || 0)),
    [history],
  );

  // Summary stats
  const total = sorted.length;
  const avg = total ? Math.round(sorted.reduce((s, e) => s + (e.score || 0), 0) / total) : 0;
  const good = sorted.filter((e) => e.score >= 75).length;
  const last = sorted[0], prev = sorted[1];
  let trend = '--', trendCls = 'neu';
  if (last && prev) {
    const diff = last.score - prev.score;
    trend = diff > 0 ? `↑ +${diff}` : diff < 0 ? `↓ -${Math.abs(diff)}` : '→ Same';
    trendCls = diff > 0 ? 'up' : diff < 0 ? 'dn' : 'neu';
  }

  // Calendar
  const dateMap = useMemo(() => {
    const m: Record<string, ScanEntry[]> = {};
    sorted.forEach((e) => { if (!m[e.date]) m[e.date] = []; m[e.date].push(e); });
    return m;
  }, [sorted]);

  const todayDateStr = todayStr();
  const firstDow = new Date(calYear, calMonth, 1).getDay();
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();

  const prevMonth = () => { if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1); } else setCalMonth(m => m - 1); };
  const nextMonth = () => { if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1); } else setCalMonth(m => m + 1); };

  // Streak (14 days)
  const streakDots = useMemo(() => {
    const eDateMap: Record<string, ScanEntry> = {};
    sorted.forEach((e) => { if (!eDateMap[e.date] || e.score > (eDateMap[e.date].score || 0)) eDateMap[e.date] = e; });
    const today2 = new Date();
    const dots = [];
    for (let di = 13; di >= 0; di--) {
      const dt = new Date(today2); dt.setDate(today2.getDate() - di);
      const ds = dt.toISOString().slice(0, 10);
      const entry = eDateMap[ds];
      const cls = entry ? (entry.score >= 75 ? 'g' : entry.score >= 50 ? 'w' : 'c') : 'e';
      dots.push({ ds, lbl: String(dt.getDate()), cls, entry });
    }
    // streak count
    let streak = 0;
    const sd2 = new Date(today2);
    while (eDateMap[sd2.toISOString().slice(0, 10)]) { streak++; sd2.setDate(sd2.getDate() - 1); }
    return { dots, streak };
  }, [sorted]);

  return (
    <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflowY: 'auto', overflowX: 'hidden', WebkitOverflowScrolling: 'touch', paddingBottom: 'calc(var(--bnav) + env(safe-area-inset-bottom,8px))' }}>

      <div className="nhdr">
        <div className="nhdr-row">
          <div style={{ flex: 1 }}>
            <div className="ntitle">History</div>
            <div className="nsub">{dogName}'s scan records</div>
          </div>
        </div>
      </div>

      <div className="content">

        {/* Summary stats */}
        <div className="hist-summary">
          <div className="hsum-cell"><div className="hsum-val">{total}</div><div className="hsum-lbl">Total scans</div></div>
          <div className="hsum-cell">
            <div className="hsum-val">{avg}</div>
            <div className="hsum-lbl">Avg score</div>
            <div className={`hsum-trend ${trendCls}`}>{trend}</div>
          </div>
          <div className="hsum-cell"><div className="hsum-val">{good}</div><div className="hsum-lbl">Good days</div></div>
        </div>

        {/* Streak */}
        <div className="card">
          <div className="clbl">14-Day Streak · {streakDots.streak} day{streakDots.streak !== 1 ? 's' : ''} 🔥</div>
          <div className="streak-wrap">
            {streakDots.dots.map(({ ds, lbl, cls, entry }) => (
              <div
                key={ds}
                className={`streak-dot ${cls}`}
                style={{ cursor: entry ? 'pointer' : 'default' }}
                onClick={() => entry && onEntryClick(entry)}
              >
                {lbl}
              </div>
            ))}
          </div>
        </div>

        {/* Calendar */}
        <div className="card">
          <div className="cal-nav">
            <button className="cal-btn" onClick={prevMonth} type="button">‹</button>
            <div className="cal-lbl">{MONTHS[calMonth]} {calYear}</div>
            <button className="cal-btn" onClick={nextMonth} type="button">›</button>
          </div>
          <div className="cal-grid" style={{ marginBottom: 4 }}>
            {['Su','Mo','Tu','We','Th','Fr','Sa'].map((d) => (
              <div key={d} className="caldow">{d}</div>
            ))}
          </div>
          <div className="cal-grid">
            {Array.from({ length: firstDow }, (_, i) => <div key={`e${i}`} className="calempty" />)}
            {Array.from({ length: daysInMonth }, (_, i) => {
              const day = i + 1;
              const ds = `${calYear}-${pad(calMonth + 1)}-${pad(day)}`;
              const dayScans = dateMap[ds];
              const isToday = ds === todayDateStr;
              const isPast = ds < todayDateStr;
              let cls = 'calday';
              if (isToday) cls += ' tod';
              if (dayScans?.length) {
                const best = Math.max(...dayScans.map(e => e.score || 0));
                const rk = best >= 75 ? 'g' : best >= 50 ? 'w' : 'c';
                cls += ` he ${rk}`;
                return (
                  <div key={day} className={cls} onClick={() => onEntryClick(dayScans[0])}>
                    <strong>{day}</strong>
                    {dayScans.length > 1 && <span className="cal-cnt">{dayScans.length}</span>}
                  </div>
                );
              }
              if (isPast) cls += ' no-data';
              else if (ds > todayDateStr) cls += ' future';
              return <div key={day} className={cls}>{day}</div>;
            })}
          </div>
        </div>

        {/* Recent list */}
        {sorted.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--t3)', fontSize: 13, padding: '30px 0' }}>
            No scans yet. Take your first scan! 💩
          </div>
        ) : (
          <>
            <div className="clbl" style={{ marginBottom: 8 }}>Recent Scans</div>
            {sorted.slice(0, 20).map((entry) => (
              <div key={entry.id} className="hist-item" onClick={() => onEntryClick(entry)}>
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
              </div>
            ))}
          </>
        )}

      </div>
    </div>
  );
};