import React, { useState, useCallback, useEffect } from 'react';
import { useApp } from './AppContext';
import { useToastContext } from './ToastContext';

import { BottomNav } from './BottomNav';
import { TrialBanner } from './TrialBanner';
import { DogTabs } from './DogTabs';
import GlobalInfoBar from './GlobalInfoBar';
import VetFAB from './VetFAB';

import { LandingScreen } from './LandingScreen';
import { UploadScreen } from './UploadScreen';
import { DogProfileForm } from './DogProfileForm';
import { SymptomScreen } from './SymptomScreen';
import { ScanningScreen } from './ScanningScreen';
import { ReportScreen } from './ReportScreen';
import { HistoryPanel } from './HistoryPanel';
import { ProgressPanel } from './ProgressPanel';

import DisclaimerModal from './DisclaimerModal';
import SettingsModal from './SettingsModal';
import ScoreInfoPopup from './ScoreInfoPopup';
import WaAuthModal from './WaAuthModal';
import { EditDogModal } from './EditDogModal';
import { EntryDetailModal } from './EntryDetailModal';
import PsAuthGate from './PsAuthGate';

import { getTrialStatus, uid, todayStr } from './helpers';
import { getPsSession, savePsSession } from './psSession';
import { psLoad, psRunAI } from './psService';
import { downloadPoopSensePDF } from './psPdf';

/* ─── PAY MODAL ─── */
function PayGateway({ onClose, onSuccess }) {
  const [name, setName] = useState('');
  const [card, setCard] = useState('');
  const [exp, setExp] = useState('');
  const [cvv, setCvv] = useState('');
  const [processing, setProcessing] = useState(false);

  const pay = () => {
    if (!name || !card) { alert('Please fill in your payment details'); return; }
    setProcessing(true);
    setTimeout(() => { onSuccess(); }, 1800);
  };

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', fontFamily: 'Poppins, sans-serif', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ background: '#FFF', borderRadius: '20px', width: '100%', maxWidth: '360px', overflow: 'hidden', boxShadow: '0 24px 64px rgba(0,0,0,.35)', position: 'relative' }}>
        <div style={{ background: 'linear-gradient(135deg,#3A2700,#6B4100)', padding: '18px 20px', textAlign: 'center' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,.55)', marginBottom: '4px' }}>PoopSense AI</div>
          <div style={{ fontSize: '26px', fontWeight: 900, color: '#FFD580' }}>₹499<span style={{ fontSize: '14px', fontWeight: 500, color: 'rgba(255,213,128,.6)' }}>/month</span></div>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,.6)', marginTop: '4px' }}>Renews automatically · Cancel anytime</div>
        </div>
        <div style={{ padding: '20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
            <input type="text" placeholder="Cardholder / Account name" value={name} onChange={e => setName(e.target.value)} style={{ width: '100%', padding: '11px 13px', border: '1.5px solid #DDD', borderRadius: '10px', fontSize: '13px', fontFamily: 'Poppins,sans-serif', boxSizing: 'border-box', outline: 'none' }} />
            <input type="tel" placeholder="Card number or UPI ID" value={card} onChange={e => setCard(e.target.value)} style={{ width: '100%', padding: '11px 13px', border: '1.5px solid #DDD', borderRadius: '10px', fontSize: '13px', fontFamily: 'Poppins,sans-serif', boxSizing: 'border-box', outline: 'none' }} />
            <div style={{ display: 'flex', gap: '10px' }}>
              <input type="text" placeholder="MM/YY" maxLength={5} value={exp} onChange={e => setExp(e.target.value)} style={{ flex: 1, padding: '11px 13px', border: '1.5px solid #DDD', borderRadius: '10px', fontSize: '13px', fontFamily: 'Poppins,sans-serif', boxSizing: 'border-box', outline: 'none' }} />
              <input type="tel" placeholder="CVV" maxLength={4} value={cvv} onChange={e => setCvv(e.target.value)} style={{ flex: 1, padding: '11px 13px', border: '1.5px solid #DDD', borderRadius: '10px', fontSize: '13px', fontFamily: 'Poppins,sans-serif', boxSizing: 'border-box', outline: 'none' }} />
            </div>
          </div>
          <div style={{ background: '#F7F5F0', borderRadius: '10px', padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <span style={{ fontSize: '12px', color: '#666', fontWeight: 600 }}>Total due today</span>
            <span style={{ fontSize: '16px', fontWeight: 800, color: '#3A2700' }}>₹499</span>
          </div>
          <button onClick={pay} disabled={processing} style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg,#3A2700,#6B4100)', color: '#FFF', border: 'none', borderRadius: '12px', fontFamily: 'Poppins,sans-serif', fontSize: '15px', fontWeight: 700, cursor: processing ? 'wait' : 'pointer', boxShadow: '0 4px 16px rgba(58,39,0,.3)' }}>
            {processing ? 'Processing…' : 'Pay ₹499 Securely'}
          </button>
          <div style={{ textAlign: 'center', marginTop: '10px', fontSize: '10px', color: '#AAA' }}>🔒 256-bit SSL encrypted · Cancel anytime</div>
        </div>
        <button onClick={onClose} style={{ position: 'absolute', top: '14px', right: '14px', background: 'rgba(255,255,255,.15)', border: 'none', borderRadius: '50%', width: '30px', height: '30px', color: '#FFF', fontSize: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
      </div>
    </div>
  );
}

/* ─── MAIN APP ─── */
const PoopSenseApp = () => {
  const { state, dispatch, addEntry, addDog, editDog, deleteDog, setVet, activateSub } = useApp();
  const { toast } = useToastContext();

  // ── Auth ──────────────────────────────────────────────────────────
  const [authReady, setAuthReady] = useState(false);
  const [phone, setPhone] = useState(null);

  useEffect(() => {
    const session = getPsSession();
    if (session?.phone) {
      setPhone(session.phone);
      dispatch({ type: 'SET_PHONE', phone: session.phone });
    }
    setAuthReady(true);
  }, []);

  // Load from Supabase after auth
  useEffect(() => {
    if (!phone) return;
    psLoad(phone)
      .then(({ user, dogs, hist }) => {
        const payload = {
          phone,
          dogs: dogs.length > 0 ? dogs : undefined,
          hist: Object.keys(hist).length > 0 ? hist : undefined,
          vet: user.vet_name ? { name: user.vet_name, num: user.vet_num || '' } : undefined,
          pdfLang: user.pdf_lang || 'en',
          lang: user.pdf_lang || 'en',
          subscribed: user.subscribed || false,
          subDate: user.sub_date || undefined,
          startDate: user.start_date || undefined,
        };
        // Only override fields that came back from DB
        Object.keys(payload).forEach(k => payload[k] === undefined && delete payload[k]);
        dispatch({ type: 'INIT', payload });
      })
      .catch(e => console.warn('[PoopSenseApp] psLoad failed (non-fatal):', e.message));
  }, [phone]);

  const handleAuthenticated = (p) => {
    savePsSession(p);
    setPhone(p);
    dispatch({ type: 'SET_PHONE', phone: p });
  };

  const [activeTab, setActiveTab] = useState('home');
  const [scanScreen, setScanScreen] = useState('s1');
  const [hasSeenLanding, setHasSeenLanding] = useState(() => state.dogs.length > 0);

  const [scanRunning, setScanRunning] = useState(false);
  const [currentEntry, setCurrentEntry] = useState(null);

  const [disclaimerOpen, setDisclaimerOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [scoreInfoOpen, setScoreInfoOpen] = useState(false);
  const [waAuthOpen, setWaAuthOpen] = useState(false);
  const [payOpen, setPayOpen] = useState(false);
  const [editDogOpen, setEditDogOpen] = useState(false);
  const [editDogTarget, setEditDogTarget] = useState(null);
  const [entryDetailOpen, setEntryDetailOpen] = useState(false);
  const [viewEntry, setViewEntry] = useState(null);

  const [pendingSymptoms, setPendingSymptoms] = useState(null);
  const [pendingImage, setPendingImage] = useState(null);

  const trialStatus = getTrialStatus(state.startDate, state.subscribed);
  const isTrialOk = state.subscribed || trialStatus.daysLeft > 0;

  // Settings opens as modal (not a nav panel), trial gate redirects to paywall modal
  const showNav = useCallback((tab) => {
    if (tab === 'settings') { setSettingsOpen(true); return; }
    if (!isTrialOk) { setPayOpen(true); return; }
    setActiveTab(tab);
  }, [isTrialOk]);

  const handleShareVetFromHistory = () => {
    const num = state.vet.num?.replace(/\D/g, '') || '';
    const dogName = dog?.name || 'my dog';
    const msg = encodeURIComponent(
      `[PoopSense AI] Hello Dr. ${state.vet.name || 'Doctor'},\n\n` +
      `Dog: ${dogName}${dog?.breed ? ` (${dog.breed})` : ''}\n\n` +
      `Please find the attached scan history report.\n\n` +
      `-- PoopSense AI by Doglicious.in`
    );
    const fullNum = num.length === 10 ? '91' + num : num || '919889887980';
    window.open(`https://wa.me/${fullNum}?text=${msg}`, '_blank');
  };

  const goToScreen = (s) => setScanScreen(s);

  const handleAnalyse = async (sym) => {
    setPendingSymptoms(sym);
    goToScreen('s4');
    setScanRunning(true);
  };

  // Perform the actual AI scan when we enter scanning screen
  useEffect(() => {
    if (!scanRunning || !pendingSymptoms || !pendingImage) return;

    const dog = state.dogs[state.curDog];
    if (!dog) { setScanRunning(false); goToScreen('s3'); return; }

    const doScan = async () => {
      try {
        const result = await psRunAI(pendingImage.b64, dog, pendingSymptoms);

        const now = new Date();
        const entry = {
          id: uid(),
          date: now.toISOString().slice(0, 10),
          time: `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`,
          ts: now.getTime(),
          dstr: now.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
          score: result.score ?? 70,
          risk: result.risk ?? 'w',
          stoolType: result.stoolType ?? 'Unknown',
          bristolScore: result.bristolScore ?? 4,
          color: result.color ?? 'Brown',
          consistency: result.consistency ?? 'Normal',
          sum: result.sum ?? '',
          simpleEn: result.simpleEn ?? '',
          simpleHi: result.simpleHi ?? '',
          params: result.params ?? null,
          possibleConditions: result.possibleConditions ?? [],
          recommendations: result.recommendations ?? [],
          symptoms: pendingSymptoms,
          imgB64: pendingImage.b64,
          dogId: dog.id,
          dogName: dog.name,
          dogAv: dog.av,
        };

        addEntry(entry); // also syncs to Supabase via AppContext
        setCurrentEntry(entry);
        setScanRunning(false);
        goToScreen('s5');
      } catch (e) {
        setScanRunning(false);
        toast('Scan failed: ' + (e.message || 'Unknown error'));
        goToScreen('s3');
      }
    };

    const timer = setTimeout(doScan, 2000);
    return () => clearTimeout(timer);
  }, [scanRunning, pendingSymptoms, pendingImage, state.dogs, state.curDog]);

  const handleShareVet = (vetName, vetNum) => {
    const dog = state.dogs[state.curDog] || null;
    const entry = currentEntry;
    if (!entry) { toast('Complete a scan first to share a report.'); return; }

    const num = vetNum.replace(/\D/g, '');
    const summary = entry.sum || entry.clinicalSummary || 'PoopSense AI report available.';
    const dogName = dog?.name || 'my dog';
    const score = entry.score || '?';

    const msg = encodeURIComponent(
      `[PoopSense AI] Hello Dr. ${vetName || 'Doctor'},\n\n` +
      `Dog: ${dogName}${dog?.breed ? ` (${dog.breed})` : ''}\n\n` +
      `Health Score: ${score}/100\n\n` +
      `Summary: ${summary}\n\n` +
      `Note: AI only - please verify clinically.\n-- PoopSense AI by Doglicious.in`
    );
    const fullNum = num.length === 10 ? '91' + num : num || '919889887980';
    window.open(`https://wa.me/${fullNum}?text=${msg}`, '_blank');
  };

  const handleSubscribeSuccess = () => {
    activateSub();
    setPayOpen(false);
    toast('Subscription activated! Thank you.');
  };

  const handleDownloadPDF = async (entry) => {
    const entryDog = state.dogs.find(d => d.id === entry.dogId) || dog;
    try {
      await downloadPoopSensePDF(entry, entryDog);
    } catch (e) {
      toast('PDF generation failed: ' + (e.message || 'Unknown error'));
    }
  };

  const dog = state.dogs[state.curDog] || null;
  const dogHistory = dog ? (state.hist[dog.id] || []) : [];
  const today = todayStr();
  const todayScans = dogHistory.filter((e) => e.date === today);

  /* WAIT for session check */
  if (!authReady) return null;

  /* NOT LOGGED IN → auth gate */
  if (!phone) {
    return <PsAuthGate onAuthenticated={handleAuthenticated} />;
  }

  /* LANDING */
  if (!hasSeenLanding) {
    return (
      <>
        <LandingScreen
          onGetStarted={() => setHasSeenLanding(true)}
          onShowDisclaimer={() => setDisclaimerOpen(true)}
        />
        <DisclaimerModal open={disclaimerOpen} onClose={() => setDisclaimerOpen(false)} />
      </>
    );
  }

  /* MAIN APP */
  return (
    <div className="app">
      <GlobalInfoBar />

      {/* ── HOME / SCAN ── */}
      {activeTab === 'home' && (
        <div id="navscan" style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflowY: 'auto' }}>
          <TrialBanner trial={trialStatus} />
          <div className="nhdr">
            <div className="nhdr-row">
              <div style={{ flex: 1 }}>
                <div className="ntitle">PoopSense AI</div>
                <div className="nsub">Track. Detect. Protect.</div>
              </div>
            </div>
            <DogTabs dogs={state.dogs} curDog={state.curDog} onSelect={(i) => dispatch({ type: 'SET_CUR_DOG', index: i })} />
          </div>

          {scanScreen === 's1' && (
            <UploadScreen
              dog={dog} todayScans={todayScans} lastEntry={currentEntry}
              hasDogHistory={dogHistory.length > 0}
              vetName={state.vet.name} vetNum={state.vet.num}
              onEditDog={() => { setEditDogTarget(dog); setEditDogOpen(true); }}
              onContinue={(image) => { setPendingImage(image); if (!dog) goToScreen('s2'); else goToScreen('s3'); }}
              onNavHist={() => showNav('hist')}
              onNavProg={() => showNav('prog')}
              onShareVet={handleShareVet}
              onSaveVet={(name, num) => setVet({ name, num })}
              toast={toast}
            />
          )}
          {scanScreen === 's2' && (
            <DogProfileForm
              onBack={() => goToScreen('s1')}
              onSave={(data) => { addDog(data); if (!state.startDate) dispatch({ type: 'ACTIVATE_TRIAL' }); goToScreen('s3'); }}
            />
          )}
          {scanScreen === 's3' && (
            <SymptomScreen dog={dog} onBack={() => goToScreen('s1')} onAnalyse={handleAnalyse} />
          )}
          {scanScreen === 's4' && <ScanningScreen onComplete={() => {}} />}
          {scanScreen === 's5' && currentEntry && dog && (
            <ReportScreen
              entry={currentEntry} dog={dog} vet={state.vet} pdfLang={state.pdfLang}
              onBack={() => goToScreen('s1')}
              onNewScan={() => { goToScreen('s1'); setCurrentEntry(null); }}
              onSaveVet={setVet} onShareVet={handleShareVet}
              onDownloadPDF={() => handleDownloadPDF(currentEntry)}
              onScoreInfo={() => setScoreInfoOpen(true)}
            />
          )}
        </div>
      )}

      {/* ── HISTORY ── */}
      {activeTab === 'hist' && (
        <HistoryPanel
          history={dogHistory}
          dogName={dog?.name || ''}
          vetName={state.vet.name}
          vetNum={state.vet.num}
          onEntryClick={(entry) => { setViewEntry(entry); setEntryDetailOpen(true); }}
          onShareVet={handleShareVetFromHistory}
          onDownloadHistoryPDF={(days) => toast(`History PDF for ${days} days — coming soon!`)}
        />
      )}

      {/* ── PROGRESS ── */}
      {activeTab === 'prog' && (
        <ProgressPanel
          history={dogHistory}
          dogName={dog?.name || ''}
          vetName={state.vet.name}
          onShareVet={handleShareVetFromHistory}
          onDownloadProgressPDF={(days) => toast(`Progress PDF for ${days} days — coming soon!`)}
        />
      )}

      {/* ── BOTTOM NAV ── */}
      <BottomNav
        active={activeTab}
        onNavigate={(tab) => {
          if (tab === 'scan') { setActiveTab('home'); goToScreen('s1'); }
          else if (tab === 'home') { setActiveTab('home'); }
          else showNav(tab);
        }}
      />

      <VetFAB visible={activeTab === 'home' && !!currentEntry} currentEntry={currentEntry} />

      {/* ── MODALS ── */}
      <DisclaimerModal open={disclaimerOpen} onClose={() => setDisclaimerOpen(false)} />

      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onSubscribe={() => { setSettingsOpen(false); setPayOpen(true); }}
      />

      <ScoreInfoPopup open={scoreInfoOpen} onClose={() => setScoreInfoOpen(false)} />

      <WaAuthModal
        open={waAuthOpen}
        onVerified={(p) => { dispatch({ type: 'SET_WA_VERIFIED', phone: p }); setWaAuthOpen(false); goToScreen('s5'); }}
        onSkip={() => { setWaAuthOpen(false); goToScreen('s5'); }}
      />

      <EditDogModal
        isOpen={editDogOpen} dog={editDogTarget}
        onClose={() => setEditDogOpen(false)}
        onSave={(d) => { if (editDogTarget) editDog(d); else addDog(d); setEditDogOpen(false); }}
        onDelete={(id) => { deleteDog(id); setEditDogOpen(false); }}
        toast={toast}
      />

      <EntryDetailModal
        isOpen={entryDetailOpen} entry={viewEntry}
        onClose={() => setEntryDetailOpen(false)}
        onDownloadPDF={handleDownloadPDF}
      />

      {payOpen && (
        <PayGateway onClose={() => setPayOpen(false)} onSuccess={handleSubscribeSuccess} />
      )}
    </div>
  );
};

export default PoopSenseApp;
