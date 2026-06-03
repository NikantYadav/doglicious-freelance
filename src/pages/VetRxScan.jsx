import React, { useState, useEffect } from "react";
import "../styles/VetRxScan.css";

import DisclaimerScreen from "../components/VetRxScan/Disclaimer";
import WelcomeScreen from "../components/VetRxScan/Welcome";
import SymptomScreen from "../components/VetRxScan/Symptom";
import ProfileScreen from "../components/VetRxScan/Profile";
import LoadingScreen from "../components/VetRxScan/Loading";
import QuestionsScreen from "../components/VetRxScan/Questions";
import ReportScreen from "../components/VetRxScan/Report";
import FollowUpScreen from "../components/VetRxScan/FollowUp";
import AuthGate from "../components/VetRxScan/AuthGate";
import PaywallScreen from "../components/VetRxScan/PaywallScreen";

import {
  getSession,
  updateSessionScanCount,
  updateSessionPaidScans,
  updateSessionName,
  clearSession,
  getConfig,
  getScanHistory,
} from "../services/auth";
import { pushReport } from "../services/wylto";
import { useSEO } from "../hooks/useSEO";

const API = import.meta.env.VITE_API_URL ?? "";
const SCAN_DRAFT_KEY = "vetrx_scan_draft";
const EMPTY_DOG_PROFILE = {
  name: "",
  breed: "",
  ageYears: "",
  ageMonths: "",
  weight: "",
  foodType: "",
  foodGrams: "",
  foodTimes: "",
  mobile: "",
  notes: "",
};

const clearScanDraft = () => {
  try {
    sessionStorage.removeItem(SCAN_DRAFT_KEY);
  } catch {
    // ignore storage failures
  }
};

const loadScanDraft = () => {
  try {
    const raw = sessionStorage.getItem(SCAN_DRAFT_KEY);
    if (!raw) return null;
    const draft = JSON.parse(raw);
    return draft && typeof draft === "object" ? draft : null;
  } catch {
    return null;
  }
};

const saveScanDraft = (draft) => {
  try {
    sessionStorage.setItem(SCAN_DRAFT_KEY, JSON.stringify(draft));
  } catch {
    // ignore storage failures
  }
};

const getResumeScreen = (draft) => {
  const requestedScreen = draft?.currentScreen;

  if (requestedScreen === "followup" && draft?.report) return "followup";
  if (requestedScreen === "report" && draft?.report) return "report";
  if (requestedScreen === "questions" && draft?.initialAnalysis)
    return "questions";
  if (requestedScreen === "profile" && draft?.photo) return "profile";
  if (requestedScreen === "symptoms" && draft?.photo) return "symptoms";
  if (requestedScreen === "welcome" || requestedScreen === "disclaimer")
    return requestedScreen;

  return draft?.photo ? "welcome" : "disclaimer";
};

const VetRxScan = () => {
  useSEO({
    title: "VetRx Scan | Free AI Health Diagnosis for Dogs",
    description:
      "Upload a clear photo of your dog's skin or body issue and get an instant AI-powered health diagnosis. VetRx Scan provides detailed nutritional advice.",
    path: "/vetrxscan",
  });

  // ── Auth state ──────────────────────────────────────────────────────
  const [authUser, setAuthUser] = useState(null); // { phone, contactId, name, scanCount, paidScans, config }
  const [authReady, setAuthReady] = useState(false); // true once localStorage checked
  const [configReady, setConfigReady] = useState(false); // true once backend config has loaded
  const [payuMessage, setPayuMessage] = useState(null); // feedback after PayU redirect
  const [config, setConfig] = useState({
    numFreeScans: 1,
    numPaidScansPerPack: 5,
  });

  useEffect(() => {
    // Proactively fetch global config from backend
    getConfig()
      .then((data) => {
        if (data) {
          setConfig(data);
        }
      })
      .catch((err) => console.error("[VetRxScan] Failed to fetch config:", err))
      .finally(() => setConfigReady(true));

    // Handle PayU callback params BEFORE restoring session so paidScans is already correct
    const urlParams = new URLSearchParams(window.location.search);
    const payuStatus = urlParams.get("payu_status");
    let payuPaidScans = 0;

    if (payuStatus) {
      if (payuStatus === "payment_success") {
        payuPaidScans = parseInt(urlParams.get("paidScans") || "0", 10);
        if (payuPaidScans > 0) {
          updateSessionPaidScans(payuPaidScans);
        }
        setPayuMessage({
          type: "success",
          text: "🎉 Payment successful! Your new scans are now available.",
        });
      } else {
        setPayuMessage({
          type: "error",
          text: "❌ Payment was not completed. Please try again.",
        });
      }
      // Clean URL without reload
      window.history.replaceState({}, "", window.location.pathname);
    }

    // Restore session — if we just updated paidScans in localStorage, getSession() will return the fresh value
    const session = getSession();
    if (session) {
      // Restore auth session (but ignore any stored config - backend is source of truth)
      setAuthUser(session);

      const draft = loadScanDraft();
      if (draft) {
        setCurrentScreen(getResumeScreen(draft));
        setPhoto(draft.photo || null);
        setSelectedPart(draft.selectedPart || "");
        setSelectedSymptoms(
          Array.isArray(draft.selectedSymptoms) ? draft.selectedSymptoms : [],
        );
        setDogProfile({ ...EMPTY_DOG_PROFILE, ...(draft.dogProfile || {}) });
        setInitialAnalysis(draft.initialAnalysis || null);
        setQIndex(Number.isInteger(draft.qIndex) ? draft.qIndex : 0);
        setAnswers(Array.isArray(draft.answers) ? draft.answers : []);
        setReport(draft.report || null);
      }

      // Sync scan counts from backend so cross-device usage is reflected correctly
      getScanHistory(session.phone)
        .then(({ user }) => {
          if (user) {
            const freshScanCount = user.scanCount ?? session.scanCount;
            const freshPaidScans = user.paidScans ?? session.paidScans ?? 0;
            updateSessionScanCount(freshScanCount);
            updateSessionPaidScans(freshPaidScans);
            setAuthUser((prev) =>
              prev
                ? {
                    ...prev,
                    scanCount: freshScanCount,
                    paidScans: freshPaidScans,
                  }
                : prev,
            );
          }
        })
        .catch((err) =>
          console.warn(
            "[VetRxScan] Failed to sync scan counts from backend:",
            err,
          ),
        );
    } else {
      clearScanDraft();
    }

    setAuthReady(true);
  }, []);

  const handleAuthenticated = (user) => {
    setAuthUser(user);
  };

  const handleLogout = () => {
    clearScanDraft();
    clearSession();
    setAuthUser(null);
  };

  // ── App state ───────────────────────────────────────────────────────
  const [currentScreen, setCurrentScreen] = useState("disclaimer");
  const [photo, setPhoto] = useState(null);
  const [selectedPart, setSelectedPart] = useState("");
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [dogProfile, setDogProfile] = useState(EMPTY_DOG_PROFILE);
  const [loading, setLoading] = useState({
    active: false,
    msg: "",
    sub: "",
    progress: 0,
  });
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
    if (currentScreen === "symptoms") goTo("welcome");
    else if (currentScreen === "profile") goTo("symptoms");
    else if (currentScreen === "questions") goTo("profile");
    else if (currentScreen === "report") goTo("questions");
    else if (currentScreen === "followup") goTo("report");
  };

  const resetAll = () => {
    clearScanDraft();
    setPhoto(null);
    setSelectedPart("");
    setSelectedSymptoms([]);
    setDogProfile(EMPTY_DOG_PROFILE);
    setInitialAnalysis(null);
    setQIndex(0);
    setAnswers([]);
    setReport(null);
    goTo("welcome");
  };

  // ── Backend AI helper ──
  const callAI = async (params) => {
    const baseUrl = import.meta.env.VITE_API_URL || "";
    const res = await fetch(`${baseUrl}/api/ai`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      const error = new Error(err.error || "AI request failed");
      error.code = err.code;
      error.status = res.status;
      throw error;
    }
    return res.json();
  };

  const getAnalysisErrorMessage = (err, fallbackPrefix) => {
    if (
      err?.code === "claude_unavailable" ||
      /temporarily unavailable/i.test(err?.message || "")
    ) {
      return "The AI service is temporarily unavailable. Please try again in a moment.";
    }

    return `${fallbackPrefix}: ${err?.message || "AI request failed"}`;
  };

  // ── Initial analysis (after profile) ──
  const startAnalysis = async () => {
    setAnswers([]);
    setQIndex(0);
    setInitialAnalysis(null);
    setReport(null);
    setLoading({
      active: true,
      msg: "Analysing photo",
      sub: "Examining visual symptoms + dog profile…",
      progress: 30,
    });
    goTo("loading");

    try {
      const result = await callAI({
        type: "initial",
        photo,
        dogProfile,
        selectedPart,
        selectedSymptoms,
      });
      setInitialAnalysis(result);
      setLoading({ active: false, msg: "", sub: "", progress: 0 });
      setQIndex(0);
      goTo("questions");
    } catch (e) {
      setLoading({ active: false, msg: "", sub: "", progress: 0 });
      setError(getAnalysisErrorMessage(e, "Analysis failed"));
      goTo("profile");
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
    setLoading({
      active: true,
      msg: "Refining diagnosis",
      sub: "Combining all data for precise assessment…",
      progress: 50,
    });
    goTo("loading");

    let result = null;
    try {
      result = await callAI({
        type: "refined",
        photo,
        dogProfile,
        selectedPart,
        selectedSymptoms,
        initialAnalysis,
        answers: allAnswers,
      });
      setReport(result);
      setLoading({ active: false, msg: "", sub: "", progress: 0 });
      goTo("report");
    } catch (e) {
      setLoading({ active: false, msg: "", sub: "", progress: 0 });
      setError(getAnalysisErrorMessage(e, "Diagnosis failed"));
      goTo("questions");
    }

    // ── Push to Wylto CRM after report is ready (outside try/catch so it never breaks the user flow) ──
    if (result && authUser?.contactId) {
      try {
        const wyltoResult = await pushReport({
          contactId: authUser.contactId,
          dogProfile,
          report: result,
          selectedPart,
          selectedSymptoms,
          scanCount: authUser.scanCount ?? 0,
          paidScans: authUser.paidScans ?? 0,
        });
        if (wyltoResult?.scanCount != null) {
          updateSessionScanCount(wyltoResult.scanCount);
          const newPaid = wyltoResult.paidScans ?? authUser.paidScans ?? 0;
          updateSessionPaidScans(newPaid);
          setAuthUser((prev) =>
            prev
              ? {
                  ...prev,
                  scanCount: wyltoResult.scanCount,
                  paidScans: newPaid,
                }
              : prev,
          );
        }
      } catch (crmErr) {
        console.error("[VetRxScan] Wylto CRM push failed (non-fatal):", crmErr);
      }
    }
  };

  const updateProfile = (field, value) => {
    setDogProfile((prev) => ({ ...prev, [field]: value }));
  };

  const toggleSymptom = (s) => {
    setSelectedSymptoms((prev) =>
      prev.includes(s) ? prev.filter((item) => item !== s) : [...prev, s],
    );
  };

  useEffect(() => {
    if (!authReady || !authUser) return;

    const draftScreen =
      currentScreen === "loading"
        ? report
          ? "report"
          : initialAnalysis
            ? "questions"
            : photo
              ? "profile"
              : "welcome"
        : currentScreen;

    saveScanDraft({
      currentScreen: draftScreen,
      photo,
      selectedPart,
      selectedSymptoms,
      dogProfile,
      initialAnalysis,
      qIndex,
      answers,
      report,
    });
  }, [
    authReady,
    authUser,
    currentScreen,
    photo,
    selectedPart,
    selectedSymptoms,
    dogProfile,
    initialAnalysis,
    qIndex,
    answers,
    report,
  ]);

  const handleSelectBodyPart = (part) => {
    if (selectedPart !== part) setSelectedSymptoms([]);
    setSelectedPart(part);
  };

  // ── Render guards ────────────────────────────────────────────────────

  // Wait for localStorage check before rendering anything
  if (!authReady || !configReady) {
    return (
      <LoadingScreen
        status="Loading VetRx Scan"
        sub="Checking your scan access…"
      />
    );
  }

  // Not logged in → show auth gate
  if (!authUser) {
    return <AuthGate onAuthenticated={handleAuthenticated} />;
  }

  // Quota logic:
  // - Number of free scans allowed (scanCount < numFreeScans means free is still available)
  // - After free scans used, user needs paidScans > 0 to continue
  const numFree = config?.numFreeScans || 1;
  const numPaidPerPack = config?.numPaidScansPerPack || 5;
  const scansLeft =
    Math.max(0, numFree - (authUser.scanCount || 0)) +
    (authUser.paidScans || 0);

  const usedFreeScan = authUser.scanCount >= numFree;
  const paidRemaining = authUser.paidScans ?? 0;
  const isAtStart = ["disclaimer", "welcome"].includes(currentScreen);

  if (usedFreeScan && paidRemaining <= 0 && isAtStart) {
    return (
      <PaywallScreen
        phone={authUser.phone || ""}
        contactId={authUser.contactId}
        firstname={authUser.name || authUser.firstname || authUser.phone || ""}
        numScans={numPaidPerPack}
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
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              zIndex: 9999,
              padding: "12px 20px",
              textAlign: "center",
              fontWeight: 600,
              fontSize: "14px",
              background:
                payuMessage.type === "success" ? "#166534" : "#991b1b",
              color: "#fff",
            }}
          >
            {payuMessage.text}
            <button
              onClick={() => setPayuMessage(null)}
              style={{
                marginLeft: 12,
                background: "none",
                border: "none",
                color: "#fff",
                cursor: "pointer",
                fontSize: 16,
              }}
            >
              ✕
            </button>
          </div>
        )}

        {/* Error Banner */}
        {error && (
          <div className="error-banner" id="errorBanner">
            <span id="errorMsg" style={{ flex: 1 }}>
              {error}
            </span>
            <button
              onClick={() => setError(null)}
              style={{
                background: "transparent",
                border: "none",
                color: "#fff",
                fontWeight: 700,
                cursor: "pointer",
                fontSize: "16px",
              }}
            >
              ✕
            </button>
          </div>
        )}

        {loading.active ? (
          <LoadingScreen status={loading.msg} sub={loading.sub} />
        ) : (
          <>
            {currentScreen === "disclaimer" && (
              <DisclaimerScreen onNext={() => goTo("welcome")} />
            )}

            {currentScreen === "welcome" && (
              <WelcomeScreen
                photo={photo}
                scansLeft={scansLeft}
                userName={authUser?.name || null}
                phone={authUser?.phone || null}
                onPhotoUploaded={(p) => {
                  setPhoto(p);
                  setSelectedPart("");
                  setSelectedSymptoms([]);
                }}
                onClearPhoto={() => setPhoto(null)}
                onNext={() => goTo("symptoms")}
                onLogout={handleLogout}
              />
            )}

            {currentScreen === "symptoms" && (
              <SymptomScreen
                bodyPart={selectedPart}
                selectedSymptoms={selectedSymptoms}
                onSelectBodyPart={handleSelectBodyPart}
                onToggleSymptom={toggleSymptom}
                onNext={() => goTo("profile")}
                onBack={handleBack}
              />
            )}

            {currentScreen === "profile" && (
              <ProfileScreen
                profile={dogProfile}
                onChange={updateProfile}
                onNext={startAnalysis}
                onBack={handleBack}
              />
            )}

            {currentScreen === "questions" && initialAnalysis && (
              <QuestionsScreen
                questions={initialAnalysis.questions}
                currentIndex={qIndex}
                onAnswer={handleAnswer}
                onBack={handleBack}
              />
            )}

            {currentScreen === "report" && report && (
              <ReportScreen
                report={report}
                dogProfile={dogProfile}
                photoUrl={photo?.url}
                onComplete={() => goTo("followup")}
                onReset={resetAll}
              />
            )}

            {currentScreen === "followup" && (
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
