import React, { useState, useMemo } from 'react';
import type { ScanEntry } from '../../types';
import { todayStr } from '../../utils/helpers';

interface ProgressPanelProps {
  history: ScanEntry[];
  dogName: string;
  curDays: number;
  onChangeDays: (days: number) => void;
}

export const ProgressPanel: React.FC<ProgressPanelProps> = ({ history, dogName, curDays, onChangeDays }) => {
  const PERIODS = [7, 14, 30];

  const sorted = useMemo(() =>
    [...history].sort((a, b) => (b.ts || 0) - (a.ts || 0)),
    [history],
  );

  const inPeriod = useMemo(() => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - curDays);
    const cutStr = cutoff.toISOString().slice(0, 10);
    return sorted.filter((e) => e.date >= cutStr);
  }, [sorted, curDays]);

  // Group by date for bar chart (last N days)
  const barData = useMemo(() => {
    const today = new Date();
    const dateMap: Record<string, ScanEntry[]> = {};
    inPeriod.forEach((e) => { if (!dateMap[e.date]) dateMap[e.date] = []; dateMap[e.date].push(e); });

    const bars = [];
    for (let i = curDays - 1; i >= 0; i--) {
      const d = new Date(today); d.setDate(today.getDate() - i);
      const ds = d.toISOString().slice(0, 10);
      const scans = dateMap[ds] ?? [];
      const best = scans.length ? Math.max(...scans.map(e => e.score)) : null;
      const rk = best === null ? 'e' : best >= 75 ? 'g' : best >= 50 ? 'w' : 'c';
      bars.push({ ds, lbl: String(d.getDate()), score: best, rk, count: scans.length });
    }
    return bars;
  }, [inPeriod, curDays]);

  const avg = inPeriod.length ? Math.round(inPeriod.reduce((s, e) => s + e.score, 0) / inPeriod.length) : 0;
  const good = inPeriod.filter(e => e.score >= 75).length;
  const mon = inPeriod.filter(e => e.score >= 50 && e.score < 75).length;
  const urg = inPeriod.filter(e => e.score < 50).length;

  const maxScore = barData.length ? Math.max(100, ...barData.map(b => b.score ?? 0)) : 100;

  return (
    <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflowY: 'auto', overflowX: 'hidden', WebkitOverflowScrolling: 'touch', paddingBottom: 'calc(var(--bnav) + env(safe-area-inset-bottom,8px))' }}>

      <div className="nhdr">
        <div className="nhdr-row">
          <div style={{ flex: 1 }}>
            <div className="ntitle">Progress</div>
            <div className="nsub">{dogName}'s health trends</div>
          </div>
        </div>
      </div>

      <div className="content">

        {/* Period selector */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
          {PERIODS.map((p) => (
            <button
              key={p}
              type="button"
              className={`hist-pdf-btn${curDays === p ? ' on' : ''}`}
              onClick={() => onChangeDays(p)}
            >
              {p} days
            </button>
          ))}
        </div>

        {/* Stats row */}
        <div className="hist-summary" style={{ marginBottom: 12 }}>
          <div className="hsum-cell"><div className="hsum-val">{avg}</div><div className="hsum-lbl">Avg score</div></div>
          <div className="hsum-cell"><div className="hsum-val" style={{ color: 'var(--g)' }}>{good}</div><div className="hsum-lbl">Healthy</div></div>
          <div className="hsum-cell"><div className="hsum-val" style={{ color: 'var(--r)' }}>{urg}</div><div className="hsum-lbl">Urgent</div></div>
        </div>

        {/* Bar chart */}
        <div className="prog-chart-wrap">
          <div className="clbl" style={{ marginBottom: 10 }}>Score Trend — Last {curDays} Days</div>
          <div className="prog-bars">
            {barData.map(({ ds, lbl, score, rk }) => {
              const h = score !== null ? Math.max(4, (score / maxScore) * 72) : 4;
              return (
                <div key={ds} className="prog-bar-col">
                  <div
                    className={`prog-bar ${rk}`}
                    style={{ height: h }}
                    title={score !== null ? `Score: ${score}` : 'No scan'}
                  />
                  {curDays <= 14 && <div className="prog-bar-lbl">{lbl}</div>}
                </div>
              );
            })}
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', fontSize: 9, color: 'var(--t3)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><span style={{ width: 8, height: 8, borderRadius: 2, background: 'var(--g)', display: 'inline-block' }} />Healthy</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><span style={{ width: 8, height: 8, borderRadius: 2, background: 'var(--a)', display: 'inline-block' }} />Monitor</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><span style={{ width: 8, height: 8, borderRadius: 2, background: 'var(--r)', display: 'inline-block' }} />Urgent</span>
          </div>
        </div>

        {/* Score breakdown */}
        {inPeriod.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--t3)', fontSize: 13, padding: '20px 0' }}>
            No scans in the last {curDays} days.
          </div>
        ) : (
          <div className="card">
            <div className="clbl">Score Distribution</div>
            {[
              { label: 'Healthy (75–100)', count: good, total: inPeriod.length, color: 'var(--g)' },
              { label: 'Monitor (50–74)', count: mon, total: inPeriod.length, color: 'var(--a)' },
              { label: 'Urgent (0–49)', count: urg, total: inPeriod.length, color: 'var(--r)' },
            ].map(({ label, count, color }) => (
              <div key={label} style={{ marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 3 }}>
                  <span style={{ color: 'var(--t2)' }}>{label}</span>
                  <span style={{ fontWeight: 700, color }}>{count}</span>
                </div>
                <div style={{ height: 5, background: 'var(--sf2)', borderRadius: 3, border: '1px solid var(--bd)' }}>
                  <div style={{ height: '100%', borderRadius: 3, background: color, width: `${inPeriod.length ? (count / inPeriod.length) * 100 : 0}%`, transition: 'width 0.6s ease' }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Recent scores list */}
        {inPeriod.length > 0 && (
          <div className="card">
            <div className="clbl">Recent Scans</div>
            {inPeriod.slice(0, 10).map((e) => (
              <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 0', borderBottom: '1px solid var(--bd)' }}>
                <div className={`hi-score ${e.risk}`} style={{ width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, flexShrink: 0 }}>{e.score}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--t1)' }}>{e.stoolType}</div>
                  <div style={{ fontSize: 10, color: 'var(--t3)' }}>{e.date} · {e.time}</div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};