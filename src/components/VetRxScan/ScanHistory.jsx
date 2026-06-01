import React, { useState, useEffect } from 'react';
import { getScanHistory } from '../../services/auth';
import { generateReportPDF } from '../../utils/generateReportPDF';

// ── Helpers ───────────────────────────────────────────────────────────
const SEVERITY_COLORS = {
    low:      { bg: '#D1FAE5', text: '#065F46' },
    mild:     { bg: '#D1FAE5', text: '#065F46' },
    moderate: { bg: '#FEF3C7', text: '#92400E' },
    high:     { bg: '#FEE2E2', text: '#991B1B' },
    severe:   { bg: '#FEE2E2', text: '#991B1B' },
    critical: { bg: '#FEE2E2', text: '#991B1B' },
};

function severityStyle(severity) {
    const key = (severity || '').toLowerCase();
    return SEVERITY_COLORS[key] || { bg: '#F3F4F6', text: '#374151' };
}

function formatDate(iso) {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

const scoreColor = (s) => s < 50 ? '#B33A3A' : s < 70 ? '#D97706' : '#2D6A2D';

// ── Section label ─────────────────────────────────────────────────────
function Label({ children }) {
    return (
        <div style={{
            fontSize: '10px', fontWeight: 700, color: '#9B7E4A',
            textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px',
        }}>
            {children}
        </div>
    );
}

// ── Single scan card ──────────────────────────────────────────────────
function ScanCard({ scan, index, ownerName }) {
    const [expanded, setExpanded] = useState(false);
    const [pdfLoading, setPdfLoading] = useState(false);
    const sev = severityStyle(scan.severity);

    // Use report_json if available (new scans), otherwise reconstruct from flat columns (old scans)
    const reportJsonRaw = scan.report_json;
    console.log('[ScanCard] scan.report_json type:', typeof reportJsonRaw, 'hasKeys:', reportJsonRaw && Object.keys(reportJsonRaw).length);
    
    const report = reportJsonRaw && Object.keys(reportJsonRaw).length > 0
        ? reportJsonRaw
        : {
            diagnosis:              scan.diagnosis,
            severity:               scan.severity,
            urgency:                scan.urgency,
            healthScore:            scan.health_score,
            healthTarget:           scan.health_target,
            daysToImprove:          scan.days_to_improve,
            confidence:             scan.confidence,
            confidenceLabel:        scan.confidence_label,
            diet:                   scan.diet_advice,       // flat col → report key
            imageFindings:          scan.image_findings,
            summary:                scan.summary,
            steps:                  Array.isArray(scan.steps)            ? scan.steps            : [],
            natural:                Array.isArray(scan.natural_remedies) ? scan.natural_remedies : [],
            redFlags:               Array.isArray(scan.red_flags)        ? scan.red_flags        : [],
            currentDietAssessment:  scan.current_diet_assessment,
            vetNow:                 scan.vet_now,
        };
    
    console.log('[ScanCard] Final report:', {
        source: reportJsonRaw && Object.keys(reportJsonRaw).length > 0 ? 'report_json' : 'flat_columns',
        hasSteps: !!report.steps,
        stepsLength: Array.isArray(report.steps) ? report.steps.length : 0,
        hasNatural: !!report.natural,
        naturalLength: Array.isArray(report.natural) ? report.natural.length : 0,
        hasRedFlags: !!report.redFlags,
        redFlagsLength: Array.isArray(report.redFlags) ? report.redFlags.length : 0,
    });

    const dogProfile = {
        name: scan.dog_name,
        breed: scan.breed,
        ageYears: scan.age_years,
        ageMonths: scan.age_months,
        weight: scan.weight ? scan.weight.replace('kg', '') : '',
        foodType: scan.food_type,
        foodGrams: scan.food_grams ? scan.food_grams.replace('g', '') : '',
        foodTimes: scan.food_times,
        notes: scan.notes,
        selectedPart: scan.body_part,
    };

    const handleDownloadPDF = async (e) => {
        e.stopPropagation();
        setPdfLoading(true);
        try {
            console.log('[ScanHistory] Generating PDF with report:', {
                hasSteps: !!report.steps,
                stepsLength: Array.isArray(report.steps) ? report.steps.length : 0,
                hasNatural: !!report.natural,
                naturalLength: Array.isArray(report.natural) ? report.natural.length : 0,
                hasRedFlags: !!report.redFlags,
                redFlagsLength: Array.isArray(report.redFlags) ? report.redFlags.length : 0,
                reportKeys: Object.keys(report),
            });
            await generateReportPDF(report, dogProfile, ownerName || '', scan.created_at);
        } catch (err) {
            console.error('[ScanHistory] PDF failed:', err);
            alert('PDF generation failed. Please try again.');
        } finally {
            setPdfLoading(false);
        }
    };

    return (
        <div style={{
            background: '#fff',
            borderRadius: '16px',
            border: '1px solid #EDE8DC',
            marginBottom: '12px',
            overflow: 'hidden',
            boxShadow: '0 2px 8px rgba(61,43,0,0.06)',
        }}>
            {/* ── Header row (always visible) ── */}
            <button
                onClick={() => setExpanded(e => !e)}
                style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '14px 16px', background: 'none', border: 'none',
                    cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
                }}
                aria-expanded={expanded}
            >
                {/* Scan number */}
                <div style={{
                    width: '36px', height: '36px', borderRadius: '50%',
                    background: '#FBF6EC', border: '2px solid #E8D9B8',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '12px', fontWeight: 800, color: '#7C5230', flexShrink: 0,
                }}>
                    #{index + 1}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 700, fontSize: '14px', color: '#3D2B00' }}>
                            {scan.dog_name || 'Unnamed dog'}
                        </span>
                        {scan.breed && <span style={{ fontSize: '12px', color: '#9B7E4A' }}>· {scan.breed}</span>}
                        {scan.severity && (
                            <span style={{
                                fontSize: '10px', fontWeight: 700, padding: '2px 7px',
                                borderRadius: '20px', background: sev.bg, color: sev.text,
                            }}>
                                {scan.severity}
                            </span>
                        )}
                    </div>
                    <div style={{ fontSize: '12px', color: '#9B7E4A', marginTop: '2px' }}>
                        {scan.body_part && <span>{scan.body_part} · </span>}
                        {formatDate(scan.created_at)}
                    </div>
                    {scan.diagnosis && (
                        <div style={{
                            fontSize: '12px', color: '#5C4215', marginTop: '2px', fontStyle: 'italic',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                        }}>
                            {scan.diagnosis}
                        </div>
                    )}
                </div>

                {/* Health score */}
                {scan.health_score != null && (
                    <div style={{
                        textAlign: 'center', flexShrink: 0,
                        background: '#FBF6EC', borderRadius: '10px', padding: '6px 10px',
                    }}>
                        <div style={{ fontSize: '18px', fontWeight: 900, color: scoreColor(scan.health_score), lineHeight: 1 }}>
                            {scan.health_score}
                        </div>
                        <div style={{ fontSize: '10px', color: '#9B7E4A', marginTop: '2px' }}>score</div>
                    </div>
                )}

                <span style={{ color: '#9B7E4A', fontSize: '16px', flexShrink: 0 }}>
                    {expanded ? '▲' : '▼'}
                </span>
            </button>

            {/* ── Expanded full detail ── */}
            {expanded && (
                <div style={{ borderTop: '1px solid #EDE8DC' }}>

                    {/* Health score bars */}
                    {scan.health_score != null && (
                        <div style={{ padding: '14px 16px 0' }}>
                            <Label>📊 Health Score</Label>
                            <div style={{ marginBottom: '6px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#3D2B00', marginBottom: '3px' }}>
                                    <span>Current</span><span>{scan.health_score}/100</span>
                                </div>
                                <div style={{ height: '6px', background: '#EDE8DC', borderRadius: '3px', overflow: 'hidden' }}>
                                    <div style={{ height: '100%', width: `${scan.health_score}%`, background: scoreColor(scan.health_score), borderRadius: '3px' }} />
                                </div>
                            </div>
                            {scan.health_target && (
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#3D2B00', marginBottom: '3px' }}>
                                        <span>After {scan.days_to_improve || 10}-day treatment</span><span>{scan.health_target}/100</span>
                                    </div>
                                    <div style={{ height: '6px', background: '#EDE8DC', borderRadius: '3px', overflow: 'hidden' }}>
                                        <div style={{ height: '100%', width: `${scan.health_target}%`, background: '#2D6A2D', borderRadius: '3px' }} />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* AI Findings */}
                    {(report.imageFindings || report.summary) && (
                        <div style={{ padding: '14px 16px 0' }}>
                            <Label>🔍 AI Findings</Label>
                            {report.imageFindings && (
                                <p style={{ fontSize: '13px', color: '#9B7E4A', fontStyle: 'italic', margin: '0 0 6px', lineHeight: 1.5 }}>
                                    {report.imageFindings}
                                </p>
                            )}
                            {report.summary && (
                                <p style={{ fontSize: '13px', color: '#3D2B00', margin: 0, lineHeight: 1.5 }}>
                                    {report.summary}
                                </p>
                            )}
                        </div>
                    )}

                    {/* Symptoms */}
                    {scan.symptoms && (
                        <div style={{ padding: '14px 16px 0' }}>
                            <Label>Symptoms</Label>
                            <p style={{ fontSize: '13px', color: '#3D2B00', margin: 0 }}>{scan.symptoms}</p>
                        </div>
                    )}

                    {/* Treatment steps */}
                    {report.steps && report.steps.length > 0 && (
                        <div style={{ padding: '14px 16px 0' }}>
                            <Label>✅ Treatment Steps</Label>
                            {report.steps.map((s, i) => (
                                <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '6px', alignItems: 'flex-start' }}>
                                    <div style={{
                                        width: '20px', height: '20px', borderRadius: '50%',
                                        background: '#3D2B00', color: '#FBF6EC',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '10px', fontWeight: 800, flexShrink: 0, marginTop: '1px',
                                    }}>{i + 1}</div>
                                    <p style={{ fontSize: '13px', color: '#2A1E00', margin: 0, lineHeight: 1.5 }}>{s}</p>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Natural remedies */}
                    {report.natural && report.natural.length > 0 && (
                        <div style={{ padding: '14px 16px 0' }}>
                            <div style={{ background: '#F0F7F0', borderRadius: '12px', padding: '12px' }}>
                                <Label>🌿 Natural Remedies</Label>
                                {report.natural.map((n, i) => (
                                    <p key={i} style={{ fontSize: '13px', color: '#1A4A1A', margin: '0 0 4px', lineHeight: 1.5 }}>• {n}</p>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Diet */}
                    {(report.diet || scan.diet_advice) && (
                        <div style={{ padding: '14px 16px 0' }}>
                            <div style={{ background: '#FFF8ED', border: '1px solid #E8C97A', borderRadius: '12px', padding: '12px' }}>
                                <Label>🍗 Diet Recommendation</Label>
                                <p style={{ fontSize: '13px', color: '#5C3800', margin: '0 0 4px', lineHeight: 1.5 }}>
                                    {report.diet || scan.diet_advice}
                                </p>
                                {report.currentDietAssessment && (
                                    <p style={{ fontSize: '12px', color: '#9B6E28', margin: 0, fontStyle: 'italic' }}>
                                        Current: {report.currentDietAssessment}
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Red flags */}
                    {report.redFlags && report.redFlags.length > 0 && (
                        <div style={{ padding: '14px 16px 0' }}>
                            <div style={{ background: '#FFF0F0', border: '1px solid #E8A8A8', borderRadius: '12px', padding: '12px' }}>
                                <Label>⚠️ See Vet If You Notice</Label>
                                {report.redFlags.map((f, i) => (
                                    <p key={i} style={{ fontSize: '13px', color: '#7A1A1A', margin: '0 0 4px', lineHeight: 1.5 }}>🔴 {f}</p>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Urgency + confidence chips */}
                    <div style={{ padding: '12px 16px 0', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {scan.urgency && (
                            <span style={{ fontSize: '11px', background: '#F3F4F6', color: '#374151', padding: '3px 10px', borderRadius: '20px' }}>
                                Urgency: {scan.urgency}
                            </span>
                        )}
                        {scan.confidence != null && (
                            <span style={{ fontSize: '11px', background: '#F3F4F6', color: '#374151', padding: '3px 10px', borderRadius: '20px' }}>
                                {scan.confidence}% {scan.confidence_label || ''} Confidence
                            </span>
                        )}
                        {scan.vet_now && (
                            <span style={{ fontSize: '11px', background: '#FEE2E2', color: '#991B1B', padding: '3px 10px', borderRadius: '20px', fontWeight: 700 }}>
                                See Vet Now
                            </span>
                        )}
                        {scan.is_paid_scan && (
                            <span style={{ fontSize: '11px', background: '#EDE9FE', color: '#5B21B6', padding: '3px 10px', borderRadius: '20px' }}>
                                Paid scan
                            </span>
                        )}
                    </div>

                    {/* PDF download */}
                    <div style={{ padding: '14px 16px' }}>
                        <button
                            onClick={handleDownloadPDF}
                            disabled={pdfLoading}
                            style={{
                                width: '100%', padding: '10px',
                                background: '#3D2B00', border: 'none', borderRadius: '10px',
                                color: '#FBF6EC', fontSize: '13px', fontWeight: 700,
                                cursor: pdfLoading ? 'default' : 'pointer', fontFamily: 'inherit',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                                opacity: pdfLoading ? 0.7 : 1,
                            }}
                        >
                            {pdfLoading ? '⏳ Generating…' : '📄 Download Report PDF'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

// ── Main ScanHistory panel ────────────────────────────────────────────
const ScanHistory = ({ phone, name, onClose }) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [data, setData] = useState(null);

    useEffect(() => {
        if (!phone) return;
        setLoading(true);
        setError(null);
        getScanHistory(phone)
            .then(d => setData(d))
            .catch(err => setError(err.message || 'Failed to load history'))
            .finally(() => setLoading(false));
    }, [phone]);

    const displayName = name || data?.user?.name;

    return (
        <div
            style={{
                position: 'fixed', inset: 0, zIndex: 9998,
                background: 'rgba(0,0,0,0.5)',
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'flex-end',
            }}
            onClick={e => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div style={{
                background: '#FBF6EC',
                borderRadius: '24px 24px 0 0',
                width: '100%', maxWidth: '520px',
                maxHeight: '92vh',
                display: 'flex', flexDirection: 'column',
                boxShadow: '0 -8px 40px rgba(0,0,0,0.2)',
            }}>
                {/* Header */}
                <div style={{
                    padding: '20px 20px 16px',
                    borderBottom: '1px solid #EDE8DC',
                    display: 'flex', alignItems: 'center', gap: '12px',
                    flexShrink: 0,
                }}>
                    <div style={{ flex: 1 }}>
                        <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 900, color: '#3D2B00' }}>
                            My Scan History
                        </h2>
                        {displayName && (
                            <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#9B7E4A' }}>
                                {displayName} · {phone}
                            </p>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        aria-label="Close history"
                        style={{
                            background: '#EDE8DC', border: 'none', borderRadius: '50%',
                            width: '36px', height: '36px', cursor: 'pointer',
                            fontSize: '18px', color: '#7C5230',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                    >
                        ✕
                    </button>
                </div>

                {/* Stats bar */}
                {data?.user && (
                    <div style={{
                        display: 'flex', gap: '1px', background: '#EDE8DC',
                        borderBottom: '1px solid #EDE8DC', flexShrink: 0,
                    }}>
                        {[
                            { label: 'Total Scans', value: data.user.scanCount },
                            { label: 'Paid Scans Left', value: data.user.paidScans },
                            { label: 'Member Since', value: new Date(data.user.memberSince).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) },
                        ].map(stat => (
                            <div key={stat.label} style={{
                                flex: 1, background: '#FBF6EC', padding: '12px 8px', textAlign: 'center',
                            }}>
                                <div style={{ fontSize: '18px', fontWeight: 900, color: '#3D2B00' }}>{stat.value}</div>
                                <div style={{ fontSize: '10px', color: '#9B7E4A', marginTop: '2px' }}>{stat.label}</div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Scan list */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
                    {loading && (
                        <div style={{ textAlign: 'center', padding: '40px 0', color: '#9B7E4A' }}>
                            <div style={{ fontSize: '32px', marginBottom: '12px' }}>🔍</div>
                            Loading your scans…
                        </div>
                    )}
                    {error && (
                        <div style={{ textAlign: 'center', padding: '40px 0', color: '#B33A3A' }}>
                            <div style={{ fontSize: '32px', marginBottom: '12px' }}>⚠️</div>
                            {error}
                        </div>
                    )}
                    {!loading && !error && data?.scans?.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '40px 0', color: '#9B7E4A' }}>
                            <div style={{ fontSize: '48px', marginBottom: '12px' }}>🐾</div>
                            <div style={{ fontWeight: 700, fontSize: '16px', color: '#3D2B00', marginBottom: '6px' }}>No scans yet</div>
                            <div style={{ fontSize: '13px', lineHeight: 1.5 }}>Complete your first scan and it'll appear here.</div>
                        </div>
                    )}
                    {!loading && !error && data?.scans?.map((scan, i) => (
                        <ScanCard key={scan.id} scan={scan} index={i} ownerName={displayName} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ScanHistory;
