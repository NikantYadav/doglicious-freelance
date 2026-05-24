import React, { useState, useRef } from 'react';
import type { ScanEntry, Dog, VetInfo, ReportTab } from '../../types';
import { WhatsAppIcon } from '../shared/Icons';

const RISK_COLOR = { g: 'var(--g)', w: 'var(--a)', c: 'var(--r)' } as const;
const RISK_BG    = { g: 'var(--glt)', w: 'var(--alt)', c: 'var(--rlt)' } as const;
const RISK_LABEL = { g: '✅ Low Risk', w: '⚠️ Monitor', c: '🚫 Urgent' } as const;

interface ReportHeaderProps {
  entry: ScanEntry;
  dog: Dog;
  onScoreInfo: () => void;
}

const ReportHeader: React.FC<ReportHeaderProps> = ({ entry, dog, onScoreInfo }) => {
  const rk = entry.risk;
  const maxScore = 100;
  const radius = 26;
  const circumference = 2 * Math.PI * radius;
  const fill = (entry.score / maxScore) * circumference;

  return (
    <div className="rhdr">
      <div className="rht">
        <div style={{ fontSize: 20, marginRight: 2 }}>💩</div>
        <div className="rappn">PoopSense AI</div>
        <span className="rtag">by Doglicious</span>
        <div className="rrid">#{entry.id}</div>
      </div>
      <div className="rdog">{dog.name} · {dog.breed} · {dog.age}yr · {dog.wt}kg</div>
      <div className="rsrow">
        <div className="rgauge" onClick={onScoreInfo} style={{ cursor: 'pointer' }}>
          <svg viewBox="0 0 70 70">
            <circle cx="35" cy="35" r={radius} fill="none" stroke="rgba(255,255,255,.12)" strokeWidth="5"/>
            <circle
              cx="35" cy="35" r={radius}
              fill="none"
              stroke={rk === 'g' ? '#4CD964' : rk === 'w' ? '#FFD580' : '#FF6B5B'}
              strokeWidth="5"
              strokeDasharray={`${fill} ${circumference - fill}`}
              strokeLinecap="round"
              transform="rotate(-90 35 35)"
              style={{ transition: 'stroke-dasharray 1s ease' }}
            />
          </svg>
          <div className="rsval">
            <div className="rv">{entry.score}</div>
            <div className="sdn">/100</div>
          </div>
        </div>

        <div className="rsi">
          <div className="rpill" style={{
            background: rk === 'g' ? 'rgba(76,217,100,.2)' : rk === 'w' ? 'rgba(255,213,128,.2)' : 'rgba(255,107,91,.2)',
            color: rk === 'g' ? '#4CD964' : rk === 'w' ? '#FFD580' : '#FF6B5B',
          }}>
            {RISK_LABEL[rk]}
          </div>
          <div className="rsub">{entry.stoolType}</div>
          <div className="rparams">
            {entry.params && Object.entries(entry.params).map(([key, val]) => {
              const labels: Record<string, string> = {
                color: 'Colour', consistency: 'Consistency', shape: 'Shape',
                contents: 'Contents', riskPattern: 'Risk Pattern',
              };
              const maxes: Record<string, number> = { color: 20, consistency: 25, shape: 15, contents: 20, riskPattern: 20 };
              const max = maxes[key] ?? 20;
              const pct = ((val as number) / max) * 100;
              return (
                <div key={key} className="rprow">
                  <div className="rplbl">{labels[key]}</div>
                  <div className="rptrk">
                    <div className="rpfill" style={{ width: `${pct}%`, background: rk === 'g' ? '#4CD964' : rk === 'w' ? '#FFD580' : '#FF6B5B' }} />
                  </div>
                  <div className="rpval">{val}/{max}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

interface AnalysisTabProps { entry: ScanEntry; }

const AnalysisTab: React.FC<AnalysisTabProps> = ({ entry }) => {
  const rk = entry.risk;
  return (
    <div>
      <div className="api-chain">
        <div className="ach">📷 Photo</div>
        <div className="achr">→</div>
        <div className="ach">🤖 Claude Vision</div>
        <div className="achr">→</div>
        <div className="ach">📋 Analysis</div>
      </div>

      <div className="tpanel on">
        {/* Stool characteristics */}
        <div className="stc">
          <div className="stc-h">
            <div className="stc-ic">🔬</div>
            <div>
              <div className="stc-title">Stool Characteristics</div>
              <div className="stc-sub">Analysed by Claude Vision AI</div>
            </div>
          </div>
          <div className="stc-grid">
            {[
              { l: 'Type', v: entry.stoolType, m: 'AI classified' },
              { l: 'Bristol Scale', v: `Type ${entry.bristolScore}/7`, m: 'Ideal: 3–4' },
              { l: 'Colour', v: entry.color, m: '' },
              { l: 'Consistency', v: entry.consistency, m: '' },
            ].map(({ l, v, m }) => (
              <div key={l} className="stc-cell">
                <div className="sl">{l}</div>
                <div className="sv2">{v}</div>
                {m && <div className="sm">{m}</div>}
              </div>
            ))}
          </div>
        </div>

        {/* Risk card */}
        <div className={`risk-card ${rk}`}>
          <div className="rc-h">
            <div className="rc-dot" style={{ background: RISK_COLOR[rk] }} />
            <div className={`rc-lbl ${rk}`}>{RISK_LABEL[rk]}</div>
            <div className={`rc-score ${rk}`}>{entry.score}<span style={{ fontSize: 11 }}>/100</span></div>
          </div>
          <div className="rc-body">{entry.sum}</div>
        </div>

        {/* Simple terms */}
        {entry.simpleEn && (
          <div className="simple-terms-box">
            <div className="st-head">💡 In simple terms…</div>
            <div className="st-body">{entry.simpleEn}</div>
            {entry.simpleHi && (
              <div style={{ marginTop: 8, paddingTop: 7, borderTop: '1px dashed rgba(52,152,219,.3)', fontSize: 11, color: '#2C3E50', lineHeight: 1.65 }}>
                <span style={{ color: 'var(--a)', fontWeight: 700 }}>🫀 कृपया ध्यान दें — </span>
                {entry.simpleHi}
              </div>
            )}
          </div>
        )}

        {/* Clinical summary */}
        <div className="card">
          <div className="clbl">Claude AI Clinical Summary</div>
          <div className="ibox">{entry.sum}</div>
        </div>
      </div>
    </div>
  );
};

interface ActionTabProps { entry: ScanEntry; }

const ActionTab: React.FC<ActionTabProps> = ({ entry }) => {
  const VET_ALERT_SIGNS = [
    'Blood or black tarry stool',
    'Symptoms persist beyond 48 hours',
    'Dog stops eating/drinking or becomes very inactive',
    'Vomiting alongside loose stool continues',
  ];
  const GIVE = ['Boiled chicken + rice', 'Boiled pumpkin', 'Curd (small qty)', 'Coconut water'];
  const AVOID = ['Milk / dairy', 'Packaged treats', 'Dal / lentils', 'Sudden diet switch'];

  return (
    <div className="tpanel on">
      {entry.recommendations && entry.recommendations.length > 0 && (
        <div className="rec-card">
          <div className="rec-h">🩺 AI Action Plan</div>
          <ul className="rec-list">
            {entry.recommendations.map((rec, i) => (
              <li key={i}>
                <div className="rec-n">{i + 1}</div>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {entry.possibleConditions && entry.possibleConditions.length > 0 && (
        <div className="card">
          <div className="clbl">Possible conditions (non-diagnostic)</div>
          <ul className="clist">
            {entry.possibleConditions.map((c, i) => (
              <li key={i}><div className="qb">?</div><span>{c}</span></li>
            ))}
          </ul>
        </div>
      )}

      {/* Diet guide */}
      <div className="card">
        <div className="clbl">Diet Guide (Indian)</div>
        <div className="dcols">
          <div className="dcol yes">
            <div className="dh">✓ Give</div>
            {GIVE.map((g) => <div key={g} className="di">{g}</div>)}
          </div>
          <div className="dcol no">
            <div className="dh">✗ Avoid</div>
            {AVOID.map((a) => <div key={a} className="di">{a}</div>)}
          </div>
        </div>
      </div>

      {/* Vet alert */}
      <div className="valert">
        <div className="vh">🚨 See Vet Immediately If…</div>
        <ul>
          {VET_ALERT_SIGNS.map((s) => <li key={s}>{s}</li>)}
        </ul>
      </div>
    </div>
  );
};

interface ShareTabProps {
  entry: ScanEntry;
  dog: Dog;
  vet: VetInfo;
  pdfLang: 'en' | 'hi';
  onSaveVet: (vet: VetInfo) => void;
  onShareVet: (vetName: string, vetNum: string) => void;
  onDownloadPDF: () => void;
}

const ShareTab: React.FC<ShareTabProps> = ({ entry, dog, vet, pdfLang, onSaveVet, onShareVet, onDownloadPDF }) => {
  const [vetName, setVetName] = useState(vet.name);
  const [vetNum, setVetNum] = useState(vet.num);

  return (
    <div className="tpanel on">
      {/* Score card */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <div>
            <div className="clbl">Health Score</div>
            <div className="cnum">{entry.score}/100</div>
            <div style={{ marginTop: 4 }}>
              <span className="qbg">{entry.risk === 'g' ? 'Healthy' : entry.risk === 'w' ? 'Monitor' : 'Urgent'}</span>
            </div>
          </div>
        </div>
        <div className="ctrk"><div className="cfill" style={{ width: `${entry.score}%` }} /></div>
        <div className="ridrow" style={{ marginTop: 8 }}>
          <span>Report ID</span><span style={{ fontFamily: 'monospace', fontWeight: 700 }}>#{entry.id}</span>
        </div>
        <div className="sbox">{entry.sum}</div>
      </div>

      {/* Vet share */}
      <div className="vshare">
        <div className="vsh">
          <div className="vsi">🩺</div>
          <div>
            <div className="vst">Share with Vet</div>
            <div className="vss">Send PDF + WhatsApp summary</div>
          </div>
        </div>
        <div className="fg" style={{ marginBottom: 8 }}>
          <label className="fl">Vet Name</label>
          <input className="fi" type="text" placeholder="e.g. Dr. Sharma" value={vetName} onChange={(e) => setVetName(e.target.value)} />
        </div>
        <div className="fg" style={{ marginBottom: 10 }}>
          <label className="fl">Vet Mobile</label>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 12, fontWeight: 600, color: 'var(--t2)' }}>+91</span>
            <input className="fi" type="tel" placeholder="10-digit mobile" maxLength={10} style={{ paddingLeft: 34 }} value={vetNum} onChange={(e) => setVetNum(e.target.value.replace(/\D/g, ''))} />
          </div>
        </div>
        <button className="btn-vet" onClick={() => { if (vetName || vetNum) onSaveVet({ name: vetName, num: vetNum }); onShareVet(vetName, vetNum); }} type="button">
          <WhatsAppIcon size={15} fill="white" /> Share via WhatsApp
        </button>
        <button className="btn-pdf-dl" onClick={onDownloadPDF} type="button">
          📄 Download PDF Report
        </button>
        <p className="pnote">PDF + WhatsApp message sent to vet · AI analysis only · please verify clinically</p>
      </div>
    </div>
  );
};

interface ReportScreenProps {
  entry: ScanEntry;
  dog: Dog;
  vet: VetInfo;
  pdfLang: 'en' | 'hi';
  onBack: () => void;
  onNewScan: () => void;
  onSaveVet: (vet: VetInfo) => void;
  onShareVet: (vetName: string, vetNum: string) => void;
  onDownloadPDF: () => void;
  onScoreInfo: () => void;
}

export const ReportScreen: React.FC<ReportScreenProps> = ({
  entry, dog, vet, pdfLang, onBack, onNewScan,
  onSaveVet, onShareVet, onDownloadPDF, onScoreInfo,
}) => {
  const [tab, setTab] = useState<ReportTab>('analysis');

  return (
    <>
      <div className="nhdr">
        <div className="nhdr-row">
          <button className="nbk" onClick={onBack} type="button">← Back</button>
        </div>
      </div>

      <ReportHeader entry={entry} dog={dog} onScoreInfo={onScoreInfo} />

      <div className="rtabs">
        {(['analysis', 'action', 'share'] as ReportTab[]).map((t) => (
          <button key={t} className={`rtab${tab === t ? ' on' : ''}`} onClick={() => setTab(t)} type="button">
            {t === 'analysis' ? '🔬 Analysis' : t === 'action' ? '🩺 Action Plan' : '📤 Share'}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 16 }}>
        {tab === 'analysis' && <AnalysisTab entry={entry} />}
        {tab === 'action' && <ActionTab entry={entry} />}
        {tab === 'share' && (
          <ShareTab
            entry={entry} dog={dog} vet={vet} pdfLang={pdfLang}
            onSaveVet={onSaveVet} onShareVet={onShareVet} onDownloadPDF={onDownloadPDF}
          />
        )}

        <div style={{ padding: '0 14px' }}>
          <button className="btn btn-out" onClick={onNewScan} style={{ marginTop: 12 }} type="button">
            🔄 New Scan
          </button>
        </div>
      </div>
    </>
  );
};