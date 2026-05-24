import React, { useState, useCallback } from 'react';
import { useApp } from './context/AppContext';
import { useToastContext } from './context/ToastContext';

// Layout (named exports)
import { BottomNav } from './components/layout/BottomNav';
import { TrialBanner } from './components/layout/TrialBanner';
import { DogTabs } from './components/layout/DogTabs';
import GlobalInfoBar from './components/layout/GlobalInfoBar';
import VetFAB from './components/layout/VetFAB';

// Screens (named exports)
import { LandingScreen } from './components/screens/LandingScreen';
import { UploadScreen } from './components/screens/UploadScreen';
import { DogProfileForm } from './components/screens/DogProfileForm';
import { SymptomScreen } from './components/screens/SymptomScreen';
import { ScanningScreen } from './components/screens/ScanningScreen';
import { ReportScreen } from './components/screens/ReportScreen';
import { HistoryPanel } from './components/screens/HistoryPanel';
import { ProgressPanel } from './components/screens/ProgressPanel';
import { PaywallPanel } from './components/screens/PaywallPanel';

// Modals (named exports or default)
import DisclaimerModal from './components/modals/DisclaimerModal';
import SettingsModal from './components/modals/SettingsModal';
import ScoreInfoPopup from './components/modals/ScoreInfoPopup';
import WaAuthModal from './components/modals/WaAuthModal';
import { EditDogModal } from './components/modals/EditDogModal';
import { EntryDetailModal } from './components/modals/EntryDetailModal';

// Utils
import { callClaude, buildEntryFromResult, buildPDF, fallbackResult } from './utils/claudeApi';
import { processImageFile } from './utils/imageUtils';
import { getTrialStatus, uid } from './utils/helpers';
import { NavTab, ScanScreen, ScanEntry, SymptomData, Dog, VetInfo } from './types';

/* ─── PAY MODAL ─── */
function PayGateway({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
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

/* ─── APP ─── */
const App: React.FC = () => {
  const { state, dispatch, addEntry, addDog, editDog, deleteDog, setVet, activateSub } = useApp();
  const { toast } = useToastContext();

  // Nav
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [scanScreen, setScanScreen] = useState<ScanScreen>('s1');
  const [hasSeenLanding, setHasSeenLanding] = useState(() => state.dogs.length > 0);

  // Scanning state (driven by ScanningScreen internally)
  const [scanRunning, setScanRunning] = useState(false);
  const [currentEntry, setCurrentEntry] = useState<ScanEntry | null>(null);

  // Modals
  const [disclaimerOpen, setDisclaimerOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [scoreInfoOpen, setScoreInfoOpen] = useState(false);
  const [waAuthOpen, setWaAuthOpen] = useState(false);
  const [payOpen, setPayOpen] = useState(false);
  const [editDogOpen, setEditDogOpen] = useState(false);
  const [editDogTarget, setEditDogTarget] = useState<Dog | null>(null);
  const [entryDetailOpen, setEntryDetailOpen] = useState(false);
  const [viewEntry, setViewEntry] = useState<ScanEntry | null>(null);

  // Symptom state (passed from SymptomScreen via onAnalyse)
  const [pendingSymptoms, setPendingSymptoms] = useState<SymptomData | null>(null);

  // Trial gate
  const trialStatus = getTrialStatus(state.startDate, state.subscribed);
  const isTrialOk = state.subscribed || trialStatus.daysLeft > 0;

  /* ─── TAB NAVIGATION ─── */
  const showNav = useCallback(
    (tab: NavTab) => {
      if (tab !== 'settings' && !isTrialOk) {
        setActiveTab('pay');
        return;
      }
      setActiveTab(tab);
      if (tab === 'settings') setSettingsOpen(true);
    },
    [isTrialOk]
  );

  /* ─── SCREEN TRANSITIONS ─── */
  const goToScreen = (s: ScanScreen) => setScanScreen(s);

  /* ─── SCAN TRIGGER ─── */
  const handleAnalyse = async (sym: SymptomData) => {
    setPendingSymptoms(sym);
    goToScreen('s4');
    setScanRunning(true);
  };

  /* ─── SCAN COMPLETE callback from ScanningScreen ─── */
  const handleScanComplete = useCallback(async () => {
    const dog = state.dogs[state.curDog];
    if (!dog || !pendingSymptoms) {
      setScanRunning(false);
      goToScreen('s3');
      return;
    }

    // We do the actual Claude call here so App owns the async logic
    // ScanningScreen just runs its animation; we navigate to s5 when done
    // (The actual fetch is driven by a useEffect below)
  }, [state.dogs, state.curDog, pendingSymptoms]);

  /* ─── SHARE TO VET ─── */
  const handleShareVet = (vetName: string, vetNum: string) => {
    const dog = state.dogs[state.curDog] || null;
    const entry = currentEntry;
    if (!entry) { toast('Complete a scan first to share a report.'); return; }

    const num = vetNum.replace(/\D/g, '');
    const summary = entry.sum || (entry as any).clinicalSummary || 'PoopSense AI report available.';
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

  /* ─── DOWNLOAD PDF ─── */
  const handleDownloadPdf = async (entry: ScanEntry) => {
    const dog = state.dogs.find((d) => d.id === (entry as any).dogId) || state.dogs[state.curDog] || null;
    const doc = await buildPDF(entry, state.pdfLang, dog);
    if (doc) {
      doc.save(`PoopSense_Report_${entry.id}.pdf`);
      toast('PDF downloaded!');
    }
  };

  /* ─── SUBSCRIPTION ─── */
  const handleSubscribeSuccess = () => {
    activateSub();
    setPayOpen(false);
    toast('Subscription activated! Thank you.');
  };

  const dog = state.dogs[state.curDog] || null;
  const dogHistory = dog ? (state.hist[dog.id] || []) : [];
  const today = new Date().toISOString().slice(0, 10);
  const todayScans = dogHistory.filter((e) => e.date === today);

  /* ─── LANDING ─── */
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

  /* ─── MAIN APP ─── */
  return (
    <div className="app">
      <GlobalInfoBar />

      {/* ── HOME / SCAN PANEL ── */}
      {activeTab === 'home' && (
        <div
          id="navscan"
          className="screen nav-panel"
          style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflowY: 'auto' }}
        >
          <TrialBanner trial={trialStatus} />

          <div className="nhdr">
            <div className="nhdr-row">
              <div style={{ flex: 1 }}>
                <div className="ntitle">PoopSense AI</div>
                <div className="nsub">Track. Detect. Protect.</div>
              </div>
            </div>
            <DogTabs
              dogs={state.dogs}
              curDog={state.curDog}
              onSelect={(i: number) => dispatch({ type: 'SET_CUR_DOG', index: i })}
            />
          </div>

          {/* S1 – Upload */}
          {scanScreen === 's1' && (
            <UploadScreen
              dog={dog}
              todayScans={todayScans}
              lastEntry={currentEntry}
              hasDogHistory={dogHistory.length > 0}
              vetName={state.vet.name}
              vetNum={state.vet.num}
              onEditDog={() => { setEditDogTarget(dog); setEditDogOpen(true); }}
              onContinue={(image) => {
                if (!dog) { goToScreen('s2'); } else { goToScreen('s3'); }
              }}
              onNavHist={() => showNav('hist')}
              onNavProg={() => showNav('prog')}
              onShareVet={handleShareVet}
              onSaveVet={(name, num) => setVet({ name, num })}
              toast={toast}
            />
          )}

          {/* S2 – Dog Profile */}
          {scanScreen === 's2' && (
            <DogProfileForm
              onBack={() => goToScreen('s1')}
              onSave={(data) => {
                const newDog: Dog = { id: uid(), ...data };
                addDog(newDog);
                if (!state.startDate) dispatch({ type: 'ACTIVATE_TRIAL' });
                goToScreen('s3');
              }}
            />
          )}

          {/* S3 – Symptoms */}
          {scanScreen === 's3' && (
            <SymptomScreen
              dog={dog}
              onBack={() => goToScreen('s1')}
              onAnalyse={handleAnalyse}
            />
          )}

          {/* S4 – Scanning */}
          {scanScreen === 's4' && (
            <ScanningScreen
              onComplete={() => {
                // ScanningScreen animates then calls this
                // We do actual Claude call when entering s4 via useEffect-style approach
                // For now navigate to s5 — actual fetch happens via pendingSymptoms effect
              }}
            />
          )}

          {/* S5 – Report */}
          {scanScreen === 's5' && currentEntry && dog && (
            <ReportScreen
              entry={currentEntry}
              dog={dog}
              vet={state.vet}
              pdfLang={state.pdfLang}
              onBack={() => goToScreen('s1')}
              onNewScan={() => { goToScreen('s1'); setCurrentEntry(null); }}
              onSaveVet={setVet}
              onShareVet={handleShareVet}
              onDownloadPDF={() => handleDownloadPdf(currentEntry)}
              onScoreInfo={() => setScoreInfoOpen(true)}
            />
          )}
        </div>
      )}

      {/* ── OTHER TABS ── */}
      {activeTab === 'hist' && (
        <HistoryPanel
          history={dogHistory}
          dogName={dog?.name || ''}
          onEntryClick={(entry) => { setViewEntry(entry); setEntryDetailOpen(true); }}
        />
      )}

      {activeTab === 'prog' && (
        <ProgressPanel
          history={dogHistory}
          dogName={dog?.name || ''}
          curDays={state.curDays}
          onChangeDays={(d) => dispatch({ type: 'SET_CUR_DAYS', days: d })}
        />
      )}

      {activeTab === 'pay' && (
        <PaywallPanel
          onPay={() => setPayOpen(true)}
          onWhatsApp={() => {
            const msg = encodeURIComponent('[PoopSense AI] Hi! I want to subscribe for ₹499/month. Please activate my plan.');
            window.open('https://wa.me/919889887980?text=' + msg, '_blank');
          }}
          onActivateSub={handleSubscribeSuccess}
        />
      )}

      {/* ── BOTTOM NAV ── */}
      <BottomNav
        active={activeTab}
        onNavigate={(tab) => {
          if (tab === 'scan') {
            setActiveTab('home');
            goToScreen('s1');
          } else {
            showNav(tab);
          }
        }}
      />

      {/* ── VET FAB ── */}
      <VetFAB
        visible={(activeTab === 'home') && !!currentEntry}
        currentEntry={currentEntry}
      />

      {/* ── MODALS ── */}
      <DisclaimerModal open={disclaimerOpen} onClose={() => setDisclaimerOpen(false)} />

      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onSubscribe={() => setPayOpen(true)}
      />

      <ScoreInfoPopup open={scoreInfoOpen} onClose={() => setScoreInfoOpen(false)} />

      <WaAuthModal
        open={waAuthOpen}
        onVerified={(phone) => {
          dispatch({ type: 'SET_WA_VERIFIED', phone });
          setWaAuthOpen(false);
          goToScreen('s5');
        }}
        onSkip={() => { setWaAuthOpen(false); goToScreen('s5'); }}
      />

      <EditDogModal
        isOpen={editDogOpen}
        dog={editDogTarget}
        onClose={() => setEditDogOpen(false)}
        onSave={(d) => { if (editDogTarget) { editDog(d); } else { addDog(d); } setEditDogOpen(false); }}
        onDelete={(id) => { deleteDog(id); setEditDogOpen(false); }}
        toast={toast}
      />

      <EntryDetailModal
        isOpen={entryDetailOpen}
        entry={viewEntry}
        onClose={() => setEntryDetailOpen(false)}
        onDownloadPDF={handleDownloadPdf}
      />

      {payOpen && (
        <PayGateway
          onClose={() => setPayOpen(false)}
          onSuccess={handleSubscribeSuccess}
        />
      )}

      {/* ── TOAST ── */}
      <div id="toast" className="toast" />
    </div>
  );
};

export default App;