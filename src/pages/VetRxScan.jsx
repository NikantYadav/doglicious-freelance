import React, { useState, useEffect } from 'react';
import '../styles/VetRxScan.css';

import DisclaimerScreen from '../components/VetRxScan/Disclaimer';
import WelcomeScreen from '../components/VetRxScan/Welcome';
import SymptomScreen from '../components/VetRxScan/Symptom';
import ProfileScreen from '../components/VetRxScan/Profile';
import LoadingScreen from '../components/VetRxScan/Loading';
import QuestionsScreen from '../components/VetRxScan/Questions';
import ReportScreen from '../components/VetRxScan/Report';
import FollowUpScreen from '../components/VetRxScan/FollowUp';
import AuthGate from '../components/VetRxScan/AuthGate';
import PaywallScreen from '../components/VetRxScan/PaywallScreen';

import { getSession, updateSessionScanCount, updateSessionPaidScans } from '../services/auth';
import { pushReport } from '../services/hubspot';

// How many paid scans does one payment unlock? Mirrors NUM_SCAN env on the backend.
// VITE_NUM_SCAN is optional — defaults to 5 matching the backend.
const NUM_SCAN = parseInt(import.meta.env.VITE_NUM_SCAN || '5', 10);
const API = import.meta.env.VITE_API_URL ?? '';

const VetRxScan = () => {
  // ── Auth state ──────────────────────────────────────────────────────
  const [authUser, setAuthUser] = useState(null);   // { email, contactId, scanCount, paidScans }
  const [authReady, setAuthReady] = useState(false); // true once localStorage checked
  const [payuMessage, setPayuMessage] = useState(null); // feedback after PayU redirect

  useEffect(() => {
    // Handle PayU callback params BEFORE restoring session so paidScans is already correct
    const urlParams = new URLSearchParams(window.location.search);
    const payuStatus = urlParams.get('payu_status');
    let payuPaidScans = 0;

    if (payuStatus) {
      if (payuStatus === 'payment_success') {
        payuPaidScans = parseInt(urlParams.get('paidScans') || '0', 10);
        if (payuPaidScans > 0) {
          updateSessionPaidScans(payuPaidScans);
        }
        setPayuMessage({ type: 'success', text: `🎉 Payment successful! You now have ${NUM_SCAN} new scans.` });
      } else {
        setPayuMessage({ type: 'error', text: '❌ Payment was not completed. Please try again.' });
      }
      // Clean URL without reload
      window.history.replaceState({}, '', window.location.pathname);
    }

    // Restore session — if we just updated paidScans in localStorage, getSession() will return the fresh value
    const session = getSession();
    if (session) setAuthUser(session);

    setAuthReady(true);
  }, []);

  const handleAuthenticated = (user) => {
    setAuthUser(user);
  };

  const handleLogout = () => {
    setAuthUser(null);
  };

  // ── App state ───────────────────────────────────────────────────────
  const [currentScreen, setCurrentScreen] = useState('disclaimer');
  const [photo, setPhoto] = useState(null);
  const [selectedPart, setSelectedPart] = useState('');
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [dogProfile, setDogProfile] = useState({
    name: '', breed: '', ageYears: '', ageMonths: '', weight: '',
    foodType: '', foodGrams: '', foodTimes: '', mobile: '', notes: ''
  });
  const [loading, setLoading] = useState({ active: false, msg: '', sub: '', progress: 0 });
  const [initialAnalysis, setInitialAnalysis] = useState(null);
  const [qIndex, setQIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [report, setReport] = useState(null);
  const [error, setError] = useState(null);

  const goTo = (screen) => {
    window.scrollTo(0, 0);
    setCurrentScreen(screen);
  };

  const handleBack = () => {
    if (currentScreen === 'symptoms') goTo('welcome');
    else if (currentScreen === 'profile') goTo('symptoms');
    else if (currentScreen === 'questions') goTo('profile');
    else if (currentScreen === 'report') goTo('questions');
    else if (currentScreen === 'followup') goTo('report');
  };

  const resetAll = () => {
    setPhoto(null);
    setSelectedPart('');
    setSelectedSymptoms([]);
    setDogProfile({ name: '', breed: '', ageYears: '', ageMonths: '', weight: '', foodType: '', foodGrams: '', foodTimes: '', mobile: '', notes: '' });
    setInitialAnalysis(null);
    setQIndex(0);
    setAnswers([]);
    setReport(null);
    goTo('welcome');
  };

  // ── Backend AI helper ──
  const callAI = async (params) => {
    const baseUrl = import.meta.env.VITE_API_URL || '';
    const res = await fetch(`${baseUrl}/api/ai`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'AI request failed');
    }
    return res.json();
  };

  // ── Initial analysis (after profile) ──
  const startAnalysis = async () => {
    setAnswers([]); setQIndex(0); setInitialAnalysis(null); setReport(null);
    setLoading({ active: true, msg: 'Analysing photo', sub: 'Examining visual symptoms + dog profile…', progress: 30 });
    goTo('loading');

    try {
      const result = await callAI({
        type: 'initial',
        photo,
        dogProfile,
        selectedPart,
        selectedSymptoms
      });
      setInitialAnalysis(result);
      setLoading({ active: false, msg: '', sub: '', progress: 0 });
      setQIndex(0);
      goTo('questions');
    } catch (e) {
      setLoading({ active: false, msg: '', sub: '', progress: 0 });
      setError('Analysis failed: ' + e.message);
      goTo('profile');
    }
  };

  // ── Answer a question ──
  const handleAnswer = async (ans) => {
    const newAnswers = [...answers, ans];
    setAnswers(newAnswers);
    const qs = initialAnalysis?.questions || [];
    if (qIndex + 1 < qs.length) {
      setQIndex(qIndex + 1);
    } else {
      await doRefinedDiagnosis(newAnswers);
    }
  };

  // ── Refined diagnosis ──
  const doRefinedDiagnosis = async (allAnswers) => {
    setLoading({ active: true, msg: 'Refining diagnosis', sub: 'Combining all data for precise assessment…', progress: 50 });
    goTo('loading');

    try {
      const result = await callAI({
        type: 'refined',
        photo,
        dogProfile,
        selectedPart,
        selectedSymptoms,
        initialAnalysis,
        answers: allAnswers
      });
      setReport(result);
      setLoading({ active: false, msg: '', sub: '', progress: 0 });
      goTo('report');

      // ── Push to HubSpot after report is ready ──
      if (authUser?.contactId) {
        const hsResult = await pushReport({
          contactId: authUser.contactId,
          dogProfile,
          report: result,
          selectedPart,
          selectedSymptoms,
        });
        if (hsResult?.scanCount != null) {
          updateSessionScanCount(hsResult.scanCount);
          const newPaid = hsResult.paidScans ?? authUser.paidScans ?? 0;
          updateSessionPaidScans(newPaid);
          setAuthUser(prev => prev ? { ...prev, scanCount: hsResult.scanCount, paidScans: newPaid } : prev);
        }
      }
    } catch (e) {
      setLoading({ active: false, msg: '', sub: '', progress: 0 });
      setError('Diagnosis failed: ' + e.message);
      goTo('questions');
    }
  };

  const updateProfile = (field, value) => {
    setDogProfile(prev => ({ ...prev, [field]: value }));
  };

  const toggleSymptom = (s) => {
    setSelectedSymptoms(prev =>
      prev.includes(s) ? prev.filter(item => item !== s) : [...prev, s]
    );
  };

  const handleSelectBodyPart = (part) => {
    if (selectedPart !== part) setSelectedSymptoms([]);
    setSelectedPart(part);
  };

  // ── Render guards ────────────────────────────────────────────────────

  // Wait for localStorage check before rendering anything
  if (!authReady) return null;

  // Not logged in → show auth gate
  if (!authUser) {
    return <AuthGate onAuthenticated={handleAuthenticated} />;
  }

  // Quota logic:
  // - 1 free scan always available (scanCount === 0 means not used yet)
  // - After first free scan, user needs paid_scans > 0 to continue
  // scanCount tracks total scans ever done; paidScans tracks remaining purchased quota
  const usedFreeScan = authUser.scanCount >= 1;
  const paidRemaining = authUser.paidScans ?? 0;
  const isAtStart = ['disclaimer', 'welcome'].includes(currentScreen);

  if (usedFreeScan && paidRemaining <= 0 && isAtStart) {
    return (
      <PaywallScreen
        email={authUser.email}
        contactId={authUser.contactId}
        phone={authUser.phone || ''}
        firstname={authUser.firstname || authUser.email?.split('@')[0] || ''}
        numScans={NUM_SCAN}
        onLogout={handleLogout}
        payuMessage={payuMessage}
      />
    );
  }

  // ── Main app ─────────────────────────────────────────────────────────
  return (
    <div className="vetrx-container">
      <div className="vetrx-app" id="app">

        {/* PayU Payment Feedback Banner */}
        {payuMessage && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999,
            padding: '12px 20px', textAlign: 'center', fontWeight: 600, fontSize: '14px',
            background: payuMessage.type === 'success' ? '#166534' : '#991b1b',
            color: '#fff',
          }}>
            {payuMessage.text}
            <button onClick={() => setPayuMessage(null)} style={{ marginLeft: 12, background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 16 }}>✕</button>
          </div>
        )}

        {/* Error Banner */}
        {error && (
          <div className="error-banner" id="errorBanner">
            <span id="errorMsg" style={{ flex: 1 }}>{error}</span>
            <button onClick={() => setError(null)} style={{ background: 'transparent', border: 'none', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '16px' }}>✕</button>
          </div>
        )}

        {loading.active ? (
          <LoadingScreen status={loading.msg} sub={loading.sub} />
        ) : (
          <>
            {currentScreen === 'disclaimer' && (
              <DisclaimerScreen onNext={() => goTo('welcome')} />
            )}

            {currentScreen === 'welcome' && (
              <WelcomeScreen
                photo={photo}
                onPhotoUploaded={(p) => { setPhoto(p); setSelectedPart(''); setSelectedSymptoms([]); }}
                onClearPhoto={() => setPhoto(null)}
                onNext={() => goTo('symptoms')}
              />
            )}

            {currentScreen === 'symptoms' && (
              <SymptomScreen
                bodyPart={selectedPart}
                selectedSymptoms={selectedSymptoms}
                onSelectBodyPart={handleSelectBodyPart}
                onToggleSymptom={toggleSymptom}
                onNext={() => goTo('profile')}
                onBack={handleBack}
              />
            )}

            {currentScreen === 'profile' && (
              <ProfileScreen
                profile={dogProfile}
                onChange={updateProfile}
                onNext={startAnalysis}
                onBack={handleBack}
              />
            )}

            {currentScreen === 'questions' && initialAnalysis && (
              <QuestionsScreen
                questions={initialAnalysis.questions}
                currentIndex={qIndex}
                onAnswer={handleAnswer}
                onBack={handleBack}
              />
            )}

            {currentScreen === 'report' && report && (
              <ReportScreen
                report={report}
                dogProfile={dogProfile}
                photoUrl={photo?.url}
                onComplete={() => goTo('followup')}
                onReset={resetAll}
              />
            )}

            {currentScreen === 'followup' && (
              <FollowUpScreen
                report={report}
                dogProfile={dogProfile}
                onReset={resetAll}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default VetRxScan;
