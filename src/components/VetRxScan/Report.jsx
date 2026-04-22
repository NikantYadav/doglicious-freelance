import React from 'react';
import { LOGO_PLACEHOLDER } from './constants';

const ReportScreen = ({ report, dogProfile, photoUrl, onComplete, onReset }) => {
    if (!report) return null;
    const r = report;
    const dog = dogProfile || {};

    const sevEmoji = { mild: '🟢', moderate: '🟡', severe: '🔴' };
    const urgColor = { routine: '#2D6A2D', urgent: '#D97706', emergency: '#B33A3A' };
    const scoreColor = r.healthScore < 50 ? '#B33A3A' : r.healthScore < 70 ? '#D97706' : '#2D6A2D';

    const waMsg = encodeURIComponent(
        `Hi Doglicious! 🐾\n\nMy dog *${dog.name || 'my dog'}* (${dog.breed || ''}, ${dog.ageYears || ''}yr, ${dog.weight || ''}kg) was just diagnosed with *${r.diagnosis}* using VetRx Scan.\n\nSeverity: ${r.severity}\nCurrent food: ${dog.foodType || ''}\n\nVetAI diet advice: "${r.diet}"\n\nI'd like to try the ₹99 customised meal sample. Please help! 🙏`
    );
    const waUrl = 'https://wa.me/919889887980?text=' + waMsg;

    return (
        <div id="screen-report" className="screen active pb-40">

            {/* Report header */}
            <div style={{ background: '#3D2B00', padding: '20px 16px 28px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div className="logo-wrap" style={{ padding: '4px 8px' }}>
                            <img src={LOGO_PLACEHOLDER} alt="Doglicious" className="logo-img" style={{ width: '48px' }} />
                        </div>
                        <div>
                            <div style={{ color: '#FBF6EC', fontSize: '15px', fontWeight: 800 }}>VetRx Scan</div>
                            <div style={{ color: 'rgba(251,246,236,0.6)', fontSize: '12px' }}>AI Diagnosis Report</div>
                        </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ color: scoreColor, fontSize: '34px', fontWeight: 900, lineHeight: 1 }}>{r.healthScore}</div>
                        <div style={{ color: 'rgba(251,246,236,0.5)', fontSize: '11px' }}>/100</div>
                    </div>
                </div>

                <div style={{ marginBottom: '10px' }}>
                    <span style={{ color: '#FBF6EC', fontSize: '17px', fontWeight: 800 }}>
                        {sevEmoji[r.severity] || '🟡'} {r.diagnosis}
                    </span>
                </div>

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <span className="urgency-badge" style={{ background: urgColor[r.urgency] || '#2D6A2D' }}>
                        {r.urgency || 'routine'}
                    </span>
                    <span style={{ background: 'rgba(251,246,236,0.15)', color: '#FBF6EC', fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: '99px' }}>
                        {r.confidence}% {r.confidenceLabel} Confidence
                    </span>
                </div>
            </div>

            {/* Report body */}
            <div className="p-16" style={{ paddingTop: '0' }}>
                <div style={{ marginTop: '-10px' }}>

                    {/* Health Score */}
                    <div className="card">
                        <h3 style={{ color: '#3D2B00', fontSize: '13px', fontWeight: 800, marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            📊 Health Score
                        </h3>
                        <div className="health-bar-wrap">
                            <div className="health-bar-top">
                                <span>Current Health</span>
                                <span>{r.healthScore}/100</span>
                            </div>
                            <div className="health-bar-bg">
                                <div className="health-bar-fill" style={{ width: r.healthScore + '%', background: scoreColor }} />
                            </div>
                        </div>
                        <div className="health-bar-wrap">
                            <div className="health-bar-top">
                                <span>After {r.daysToImprove || 10}-day treatment</span>
                                <span>{r.healthTarget || 85}/100</span>
                            </div>
                            <div className="health-bar-bg">
                                <div className="health-bar-fill" style={{ width: (r.healthTarget || 85) + '%', background: '#2D6A2D' }} />
                            </div>
                        </div>
                    </div>

                    {/* AI Findings */}
                    <div className="card">
                        <h3 style={{ color: '#3D2B00', fontSize: '13px', fontWeight: 800, marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            🔍 AI Findings
                        </h3>
                        <p style={{ color: '#5C4215', fontSize: '14px', lineHeight: 1.6, margin: '0 0 12px', fontStyle: 'italic' }}>{r.imageFindings}</p>
                        <p style={{ color: '#2A1E00', fontSize: '14px', lineHeight: 1.6, margin: 0 }}>{r.summary}</p>
                    </div>

                    {/* Treatment Steps */}
                    <div className="card">
                        <h3 style={{ color: '#3D2B00', fontSize: '13px', fontWeight: 800, marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            ✅ Treatment Steps
                        </h3>
                        {(r.steps || []).map((s, i) => (
                            <div key={i} style={{ display: 'flex', gap: '12px', marginBottom: '10px', alignItems: 'flex-start' }}>
                                <div className="step-num">{i + 1}</div>
                                <p style={{ color: '#2A1E00', fontSize: '14px', lineHeight: 1.5, margin: 0 }}>{s}</p>
                            </div>
                        ))}
                    </div>

                    {/* Natural Remedies */}
                    {r.natural && r.natural.length > 0 && (
                        <div style={{ background: '#F0F7F0', borderRadius: '20px', padding: '18px 16px', marginBottom: '14px', border: '1.5px solid #C8DFC8' }}>
                            <h3 style={{ color: '#2D6A2D', fontSize: '13px', fontWeight: 800, marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                🌿 Natural Remedies
                            </h3>
                            {r.natural.map((n, i) => (
                                <p key={i} style={{ color: '#1A4A1A', fontSize: '14px', lineHeight: 1.5, margin: '0 0 8px' }}>• {n}</p>
                            ))}
                        </div>
                    )}

                    {/* Diet */}
                    <div style={{ background: '#FFF8ED', borderRadius: '20px', padding: '18px 16px', marginBottom: '14px', border: '1.5px solid #E8C97A' }}>
                        <h3 style={{ color: '#7A4A00', fontSize: '13px', fontWeight: 800, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            🍗 Diet Recommendation
                        </h3>
                        <p style={{ color: '#5C3800', fontSize: '14px', lineHeight: 1.5, margin: '0 0 8px' }}>{r.diet}</p>
                        <p style={{ color: '#9B6E28', fontSize: '13px', lineHeight: 1.4, margin: 0, fontStyle: 'italic' }}>
                            Current: {r.currentDietAssessment}
                        </p>
                    </div>

                    {/* Red Flags */}
                    {r.redFlags && r.redFlags.length > 0 && (
                        <div style={{ background: '#FFF0F0', borderRadius: '20px', padding: '18px 16px', marginBottom: '14px', border: '1.5px solid #E8A8A8' }}>
                            <h3 style={{ color: '#B33A3A', fontSize: '13px', fontWeight: 800, marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                ⚠️ See Vet If You Notice
                            </h3>
                            {r.redFlags.map((f, i) => (
                                <p key={i} style={{ color: '#7A1A1A', fontSize: '14px', lineHeight: 1.5, margin: '0 0 8px' }}>🔴 {f}</p>
                            ))}
                        </div>
                    )}

                    {/* Doglicious CTA */}
                    <div style={{ background: 'linear-gradient(135deg,#3D2B00 0%,#6B4A0E 100%)', borderRadius: '24px', padding: '20px 16px', marginBottom: '14px', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', background: 'rgba(251,246,236,0.05)', borderRadius: '50%' }} />
                        <div className="logo-wrap" style={{ marginBottom: '12px', display: 'inline-flex' }}>
                            <img src={LOGO_PLACEHOLDER} alt="Doglicious" className="logo-img" style={{ width: '64px' }} />
                        </div>
                        <h3 style={{ color: '#FBF6EC', fontSize: '17px', fontWeight: 900, margin: '0 0 6px' }}>
                            Customised Meal Sample 🍗
                        </h3>
                        <p style={{ color: 'rgba(251,246,236,0.7)', fontSize: '13px', margin: '0 0 12px' }}>
                            Formulated for {r.diagnosis ? r.diagnosis.split('(')[0].trim() : ''} · {dog.breed || ''}
                        </p>
                        <div style={{ marginBottom: '14px' }}>
                            {['Home cooked, vet-aligned formula', 'Breed & age calibrated portions', '7-day supply · Free delivery', '100% money-back guarantee'].map((f, i) => (
                                <p key={i} style={{ color: 'rgba(251,246,236,0.82)', fontSize: '13px', margin: '0 0 5px' }}>✓ {f}</p>
                            ))}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px', flexWrap: 'wrap' }}>
                            <span style={{ color: 'rgba(251,246,236,0.4)', fontSize: '15px', textDecoration: 'line-through' }}>₹499</span>
                            <span style={{ color: '#FFD700', fontSize: '28px', fontWeight: 900 }}>₹99</span>
                            <span style={{ background: 'rgba(255,215,0,0.2)', color: '#FFD700', fontSize: '11px', padding: '3px 8px', borderRadius: '99px' }}>TRIAL OFFER</span>
                        </div>
                        <a href={waUrl} target="_blank" rel="noreferrer" className="btn-whatsapp">
                            🟢 Order on WhatsApp — ₹99
                        </a>
                        <p style={{ color: 'rgba(251,246,236,0.4)', fontSize: '11px', textAlign: 'center', margin: '8px 0 0' }}>
                            48hr dispatch · Cash on delivery available
                        </p>
                    </div>

                    {/* Action buttons */}
                    <button className="btn btn-secondary mb-12" onClick={onComplete}>
                        📅 2-Day Follow-Up Check-In
                    </button>
                    <button className="btn btn-ghost" onClick={onReset}>
                        + Start New Diagnosis
                    </button>
                    <p style={{ color: '#9B7E4A', fontSize: '11px', textAlign: 'center', margin: '20px 0 0', lineHeight: 1.5 }}>
                        ⚠️ VetRx Scan is an AI assistance tool. Consult a licensed veterinarian for medical decisions.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ReportScreen;
