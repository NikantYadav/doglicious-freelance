import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';


import { logoImg, GRAM_OPTS, GRAM_PRICES, RECIPES } from '../data/homeData';
import SiteHeader from '../components/shared/SiteHeader';
import SiteFooter from '../components/shared/SiteFooter';
import { useSEO } from '../hooks/useSEO';
import { normalizePhone } from '../utils/phone';
import { pushLead } from '../services/wylto';
import '../styles/Home.css';
import '../styles/FeedingCalculator.css';
import { downloadFeedingPdf } from '../utils/toolsPdfGenerator';
import SampleModal from '../components/modals/SampleModal';
import { initiatePayU } from '../services/sampleBooking';
import { useToast } from '../components/common/Toast';
import LoadingOverlay from '../components/common/LoadingOverlay';

// ── Data ──────────────────────────────────────────────────────
const BREEDS = [
  { n: 'Indian Pariah', e: '🐕', m: 1.00 },
  { n: 'Labrador', e: '🦮', m: 1.05 },
  { n: 'Golden Retriever', e: '🐕', m: 1.05 },
  { n: 'German Shepherd', e: '🐺', m: 1.08 },
  { n: 'Beagle', e: '🐶', m: 0.98 },
  { n: 'Pug', e: '🐾', m: 0.88 },
  { n: 'Shih Tzu', e: '🐩', m: 0.85 },
  { n: 'Rajapalayam', e: '👑', m: 1.10 },
  { n: 'Mudhol Hound', e: '💨', m: 1.12 },
  { n: 'Chippiparai', e: '⚡', m: 1.10 },
  { n: 'Kombai', e: '🦁', m: 1.08 },
  { n: 'Kanni', e: '🏃', m: 1.05 },
  { n: 'Bakharwal', e: '🏔️', m: 1.12 },
  { n: 'Rampur Greyhound', e: '🌪️', m: 1.10 },
  { n: 'Himalayan Sheepdog', e: '❄️', m: 1.08 },
  { n: 'Dachshund', e: '🌭', m: 0.90 },
  { n: 'Rottweiler', e: '💪', m: 1.10 },
  { n: 'Indie (Mixed)', e: '🐕', m: 1.00 },
];

const HOME_OPTS = [
  { val: 'studio', icon: '🏢', label: 'Studio / 1BHK', detail: '< 500 sq ft', bonus: 0 },
  { val: '2bhk', icon: '🏠', label: '2BHK', detail: '500–900 sq ft', bonus: 0.02 },
  { val: '3bhk', icon: '🏡', label: '3BHK+', detail: '900–1500 sq ft', bonus: 0.04 },
  { val: 'house', icon: '🏘️', label: 'Ind. House', detail: '1500+ / Yard', bonus: 0.06 },
];

const AGE_MULT = { puppy: 2.0, adult: 1.4, senior: 1.0, nursing: 2.5 };
const ACT_LABELS = ['Sedentary', 'Low', 'Moderate', 'Active', 'Very Active'];
const HOME_LABELS = { studio: 'Studio/1BHK', '2bhk': '2BHK', '3bhk': '3BHK+', house: 'Ind. House' };

// ── Component ─────────────────────────────────────────────────
export default function FeedingCalculator() {
  useSEO({
    title: 'Dog Feeding Calculator | Free Tool',
    description: "Calculate exact daily feeding portions for your dog.",
    path: '/tools/feeding-calculator'
  });

  const navigate = useNavigate();

  // wizard state
  const [step, setStep] = useState(1);
  const [weight, setWeight] = useState('');
  const [age, setAge] = useState('');
  const [food, setFood] = useState('kibble');
  const [breed, setBreed] = useState(null);   // index into BREEDS
  const [breedQuery, setBreedQuery] = useState('');
  const [home, setHome] = useState('');
  const [walkKm, setWalkKm] = useState('');
  const [walkFreq, setWalkFreq] = useState(0);

  // result
  const [result, setResult] = useState(null);
  const [aiTip, setAiTip] = useState(null);   // null=loading, string=done

  // Sample booking state
  const [sampleModalOpen, setSampleModalOpen] = useState(false);
  const [sampleStep, setSampleStep] = useState(1);
  const [selectedRecipe, setSelectedRecipe] = useState(0);
  const [selectedGramIdx, setSelectedGramIdx] = useState(0);
  const [dogNameSample, setDogNameSample] = useState('');
  const [mobile, setMobile] = useState('');
  const [mobileValid, setMobileValid] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryCity, setDeliveryCity] = useState('');
  const [deliveryPin, setDeliveryPin] = useState('');
  const [mapSrc, setMapSrc] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentConfirm, setPaymentConfirm] = useState(null);

  const { toast } = useToast();

  const resultRef = useRef(null);
  const weightRef = useRef(null);

  // Detect PayU redirect back to this page
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const status = params.get('payu_status');
    if (!status) return;
    window.history.replaceState({}, '', window.location.pathname);
    if (status === 'payment_success') {
      setPaymentConfirm({
        success: true,
        txnid: params.get('txnid') || '',
        amount: params.get('amount') || '99',
      });
    } else {
      setPaymentConfirm({ success: false });
    }
  }, []);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  useEffect(() => {
    if (result && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [result]);

  // ── Navigation ──
  const goStep = (n) => {
    if (n > step) {
      if (step === 1) {
        const w = parseFloat(weight) || 0;
        if (!w) { shake(weightRef); return; }
      }
      if (step === 2 && !age) { alert('Please select an age group.'); return; }
      if (step === 3 && breed === null) { alert('Please select a breed.'); return; }
    }
    setStep(n);
  };

  const shake = (ref) => {
    if (!ref.current) return;
    ref.current.style.transition = 'transform 0.08s';
    const frames = ['-6px', '6px', '-3px', '0px'];
    frames.forEach((v, i) => setTimeout(() => { ref.current.style.transform = `translateX(${v})`; }, i * 80));
    ref.current.focus();
  };

  // ── Calculation ──
  const calculate = () => {
    if (!home) { alert('Please select your home type.'); return; }
    if (!walkFreq) { alert('Please select walk frequency.'); return; }

    const w = parseFloat(weight) || 0;
    const breedData = BREEDS[breed];
    const rer = 70 * Math.pow(w, 0.75);
    const ageMult = AGE_MULT[age] || 1.4;
    const totalWalk = (parseFloat(walkKm) || 0) * walkFreq;

    let actMult = 1.0;
    if (totalWalk >= 10) actMult = 1.30;
    else if (totalWalk >= 6) actMult = 1.20;
    else if (totalWalk >= 3) actMult = 1.10;
    else if (totalWalk >= 1) actMult = 1.05;

    const homeBonus = HOME_OPTS.find(h => h.val === home)?.bonus || 0;
    actMult += homeBonus;

    const dailyCal = Math.round(rer * ageMult * breedData.m * actMult);
    const calPerG = food === 'kibble' ? 3.5 : 1.2;
    const dailyG = Math.round(dailyCal / calPerG);
    const meals = age === 'puppy' ? 3 : 2;
    const perMeal = Math.round(dailyG / meals);

    let actLevel = 0;
    if (totalWalk >= 10) actLevel = 4;
    else if (totalWalk >= 6) actLevel = 3;
    else if (totalWalk >= 3) actLevel = 2;
    else if (totalWalk >= 1) actLevel = 1;

    setResult({ w, age, food, breedName: breedData.n, dailyCal, dailyG, meals, perMeal, totalWalk, actLevel, home });
    setAiTip(null);
    fetchAITip(dailyG, dailyCal, meals, breedData.n, age, w);
  };

  const fetchAITip = async (grams, cal, meals, breedName, ageGroup, weight) => {
    try {
      const prompt = `You are a canine nutritionist in India. Give a warm, personalised 2-sentence feeding tip for a ${ageGroup} ${breedName} weighing ${weight}kg needing ${grams}g (${cal} kcal) per day split across ${meals} meals. Include one India-specific tip (local ingredient or seasonal advice). No bullet points or markdown.`;
      const res = await fetch('/api/ai-tip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      setAiTip(data.tip || feedingFallback(breedName, ageGroup));
    } catch {
      setAiTip(feedingFallback(breedName, ageGroup));
    }
  };

  const feedingFallback = (breedName, ageGroup) =>
    `For a ${ageGroup} ${breedName}, split meals evenly and add a teaspoon of ghee or coconut oil for healthy fats. In Indian summers, mix a little curd (dahi) into meals for natural probiotics and cooling benefits.`;

  const doWhatsApp = () => {
    if (!result) return;
    const normPhone = normalizePhone(ctaPhone);

    // Push to Wylto CRM
    pushLead({
      name: ctaName,
      phone: normPhone,
      email: ctaEmail,
      source: 'feeding-calculator',
      dogWeight: result.w,
      dogAge: result.age,
      breed: result.breedName,
      dailyGrams: result.dailyG,
      dailyKcal: result.dailyCal
    });

    const msg = encodeURIComponent(
      `🐾 Hi Doglicious!\n\nI used your feeding calculator.\n\nDog: ${result.w}kg ${result.age} ${result.breedName}\nDaily: ${result.dailyG}g / ${result.dailyCal} kcal\n\nName: ${ctaName}\nPhone: ${normPhone}\n\nI'd like to book the ₹99 sample!`
    );
    window.open(`https://wa.me/+919889887980?text=${msg}`, '_blank');
  };

  const bookSample = () => {
    setSampleModalOpen(true);
  };

  const handleMobileInput = (val) => {
    setMobile(val);
    const digits = val.replace(/\D/g, '');
    setMobileValid(digits.length === 10 || (digits.length === 12 && digits.startsWith('91')) || (val.startsWith('+') && digits.length >= 7));
  };

  const handlePincodeInput = (val) => {
    setDeliveryPin(val);
    if (val.length === 6) {
      const q = encodeURIComponent(`${deliveryAddress} ${deliveryCity} ${val}`);
      setMapSrc(`https://maps.google.com/maps?q=${q}&output=embed&z=15`);
    }
  };

  const openMapVerify = () => {
    const q = encodeURIComponent(`${deliveryAddress} ${deliveryCity} ${deliveryPin}`);
    setMapSrc(`https://maps.google.com/maps?q=${q}&output=embed&z=15`);
  };

  const proceedToPayment = async () => {
    if (!mobile || !dogNameSample || !deliveryAddress || !deliveryCity || !deliveryPin) {
      toast('Please fill all fields before proceeding.', 'error');
      return;
    }

    const recipe = RECIPES[selectedRecipe];
    const grams = GRAM_OPTS[selectedGramIdx];
    const price = GRAM_PRICES[selectedGramIdx];

    try {
      setIsProcessing(true);
      setSampleModalOpen(false);
      await initiatePayU({ dogName: dogNameSample, phone: normalizePhone(mobile), price, recipe, grams, address: deliveryAddress, city: deliveryCity, pincode: deliveryPin });
    } catch (err) {
      setIsProcessing(false);
      console.error('[PayU] initiation failed:', err);
      toast('Payment could not be initiated. Please try again.', 'error');
    }
  };

  const currentPrice = GRAM_PRICES[selectedGramIdx];
  const currentGrams = GRAM_OPTS[selectedGramIdx];

  const resetCalc = () => {
    setResult(null);
    setAiTip(null);
    setStep(1);
    setWeight('');
    setAge('');
    setFood('kibble');
    setBreed(null);
    setBreedQuery('');
    setHome('');
    setWalkKm('');
    setWalkFreq(0);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const TOOL_ROUTES = [
    '/tools/bmi-calculator',
    '/tools/feeding-calculator',
    '/tools/cost-calculator',
    '/tools/age-calculator',
    '/tools/best-vegetables',
    '/tools/natural-healing',
    '/tools/aafco-planner',
    '/tools/health-quiz',
  ];
  const openTool = (idx) => { if (TOOL_ROUTES[idx]) navigate(TOOL_ROUTES[idx]); };

  const filteredBreeds = BREEDS.filter(b =>
    !breedQuery || b.n.toLowerCase().includes(breedQuery.toLowerCase())
  );

  // Stepper dot state
  const dotState = (i) => {
    if (i < step) return 'done';
    if (i === step) return 'active';
    return '';
  };

  return (
    <>
      <SiteHeader />

      {/* Hero */}
      <section className="fc-hero">
        <div className="fc-hero-badge">🧮 Free Tool — No Sign-Up Needed</div>
        <h1>How Much Should You <span>Feed Your Dog?</span></h1>
        <p>Personalised daily feeding plan based on your dog's weight, age, breed &amp; lifestyle — built for Indian pet parents.</p>
        <div className="fc-stats">
          <div className="fc-stat"><div className="fc-stat-num">50K+</div><div className="fc-stat-label">Dogs fed right</div></div>
          <div className="fc-stat"><div className="fc-stat-num">18</div><div className="fc-stat-label">Indian breeds</div></div>
          <div className="fc-stat"><div className="fc-stat-num">4.9★</div><div className="fc-stat-label">Parent rating</div></div>
        </div>
      </section>

      {/* Trust bar */}
      <div className="fc-trust">
        <div className="fc-trust-item"><div className="fc-trust-icon">🩺</div><div className="fc-trust-text">Vet-Approved Formulas</div></div>
        <div className="fc-trust-item"><div className="fc-trust-icon">🇮🇳</div><div className="fc-trust-text">Made for Indian Breeds</div></div>
        <div className="fc-trust-item"><div className="fc-trust-icon">🥦</div><div className="fc-trust-text">Fresh &amp; Natural Only</div></div>
      </div>

      {/* ── DISCLAIMER BEFORE TOOL ── */}
      {!result && (
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 20px', marginBottom: '24px' }}>
          <div style={{ background: '#FEF5E4', border: '1px solid #E5D4B0', borderRadius: '12px', padding: '16px 20px' }}>
            <p style={{ fontSize: '13px', color: '#5C3F18', lineHeight: 1.6, margin: 0 }}>
              <strong>⚠️ Disclaimer:</strong> Please consult your veterinarian before starting any treatment, supplement, or medication, or making changes to your pet's diet, exercise, or lifestyle. Individual health needs may vary.
            </p>
          </div>
        </div>
      )}

      {/* Calculator */}
      {!result && (
        <section className="fc-calc-section">
          <div className="fc-calc-title">
            <h2>Dog Feeding Calculator</h2>
            <p>4 quick steps to your dog's perfect meal plan</p>
          </div>

          {/* Stepper */}
          <div className="fc-stepper">
            {[1, 2, 3, 4].map((i) => (
              <React.Fragment key={i}>
                <div className={`fc-step-dot ${dotState(i)}`}>
                  {i < step ? '✓' : i}
                </div>
                {i < 4 && <div className={`fc-step-line${i < step ? ' done' : ''}`} />}
              </React.Fragment>
            ))}
          </div>

          <div className="fc-calc-card">

            {/* Step 1 — Weight */}
            {step === 1 && (
              <div>
                <div className="fc-step-label">Step 1 of 4</div>
                <div className="fc-step-question">What does your dog weigh?</div>
                <div className="fc-weight-wrap" ref={weightRef}>
                  <input
                    type="number" className="fc-weight-input"
                    placeholder="0" min="1" max="100"
                    value={weight} onChange={e => setWeight(e.target.value)}
                  />
                  <span className="fc-weight-unit">kg</span>
                </div>
                <div className="fc-weight-presets">
                  {[5, 10, 20, 30, 45].map(v => (
                    <button
                      key={v}
                      className={`fc-weight-preset${parseFloat(weight) === v ? ' sel' : ''}`}
                      onClick={() => setWeight(String(v))}
                    >
                      {v} kg
                    </button>
                  ))}
                </div>
                <button className="fc-btn-next fc-btn-primary" onClick={() => goStep(2)}>
                  Next — Age &amp; Food →
                </button>
              </div>
            )}

            {/* Step 2 — Age & Food */}
            {step === 2 && (
              <div>
                <div className="fc-step-label">Step 2 of 4</div>
                <div className="fc-step-question">How old &amp; what food?</div>
                <div className="fc-pills">
                  {[
                    { val: 'puppy', icon: '🐶', label: 'Puppy', sub: '0 – 12 months' },
                    { val: 'adult', icon: '🐕', label: 'Adult', sub: '1 – 7 years' },
                    { val: 'senior', icon: '🧓', label: 'Senior', sub: '7+ years' },
                    { val: 'nursing', icon: '🤱', label: 'Nursing', sub: 'Pregnant / Lactating' },
                  ].map(({ val, icon, label, sub }) => (
                    <div
                      key={val}
                      className={`fc-pill${age === val ? ' sel' : ''}`}
                      onClick={() => setAge(val)}
                    >
                      <div className="fc-pill-icon">{icon}</div>
                      <div className="fc-pill-main">{label}</div>
                      <div className="fc-pill-sub">{sub}</div>
                    </div>
                  ))}
                </div>
                <div className="fc-food-toggle-wrap">
                  <div className="fc-food-toggle-label">CURRENT FOOD TYPE</div>
                  <div className="fc-food-toggle">
                    <button className={`fc-food-btn${food === 'kibble' ? ' sel' : ''}`} onClick={() => setFood('kibble')}>🥣 Dry Kibble</button>
                    <button className={`fc-food-btn${food === 'fresh' ? ' sel' : ''}`} onClick={() => setFood('fresh')}>🥗 Fresh / Home</button>
                  </div>
                </div>
                <button className="fc-btn-next fc-btn-primary" onClick={() => goStep(3)}>Next — Breed →</button>
                <button className="fc-btn-back" onClick={() => goStep(1)}>← Back</button>
              </div>
            )}

            {/* Step 3 — Breed */}
            {step === 3 && (
              <div>
                <div className="fc-step-label">Step 3 of 4</div>
                <div className="fc-step-question">What breed is your dog?</div>
                <div className="fc-search-wrap">
                  <input
                    type="text" className="fc-breed-search"
                    placeholder="Search breeds..."
                    value={breedQuery} onChange={e => setBreedQuery(e.target.value)}
                  />
                </div>
                <div className="fc-breed-grid">
                  {filteredBreeds.map((b) => {
                    const idx = BREEDS.indexOf(b);
                    return (
                      <div
                        key={b.n}
                        className={`fc-breed-card${breed === idx ? ' sel' : ''}`}
                        onClick={() => setBreed(idx)}
                      >
                        <div className="fc-breed-emoji">{b.e}</div>
                        <div className="fc-breed-name">{b.n}</div>
                      </div>
                    );
                  })}
                </div>
                <button className="fc-btn-next fc-btn-primary" onClick={() => goStep(4)}>Next — Lifestyle →</button>
                <button className="fc-btn-back" onClick={() => goStep(2)}>← Back</button>
              </div>
            )}

            {/* Step 4 — Lifestyle */}
            {step === 4 && (
              <div>
                <div className="fc-step-label">Step 4 of 4</div>
                <div className="fc-step-question">Your dog's lifestyle</div>
                <div className="fc-sub-label">🏠 Carpet area of your house</div>
                <div className="fc-home-grid">
                  {HOME_OPTS.map(({ val, icon, label, detail }) => (
                    <div
                      key={val}
                      className={`fc-home-tile${home === val ? ' sel' : ''}`}
                      onClick={() => setHome(val)}
                    >
                      <div className="fc-home-icon">{icon}</div>
                      <div className="fc-home-label">{label}</div>
                      <div className="fc-home-detail">{detail}</div>
                    </div>
                  ))}
                </div>
                <div className="fc-walk-row">
                  <div className="fc-walk-field">
                    <label>🚶 Daily walk (km)</label>
                    <input
                      type="number" className="fc-walk-input"
                      placeholder="e.g. 3" min="0" max="30"
                      value={walkKm} onChange={e => setWalkKm(e.target.value)}
                    />
                  </div>
                </div>
                <div className="fc-sub-label" style={{ marginTop: 14 }}>🕰 Walk frequency</div>
                <div className="fc-freq-pills">
                  {[{ v: 1, l: 'Once' }, { v: 2, l: 'Twice' }, { v: 3, l: '3+ times' }].map(({ v, l }) => (
                    <button
                      key={v}
                      className={`fc-freq-pill${walkFreq === v ? ' sel' : ''}`}
                      onClick={() => setWalkFreq(v)}
                    >
                      {l}
                    </button>
                  ))}
                </div>
                <button className="fc-btn-next fc-btn-amber" onClick={calculate}>🐾 Get My Dog's Feeding Plan</button>
                <button className="fc-btn-back" onClick={() => goStep(3)}>← Back</button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Results */}
      {result && (
        <section className="fc-result-section" ref={resultRef}>
          <div className="fc-result-hero">
            <div className="fc-result-label">Daily Feeding Plan</div>
            <div className="fc-result-nums">
              <div className="fc-result-num">
                <div className="fc-big">{result.dailyG}</div>
                <div className="fc-unit">grams</div>
                <div className="fc-desc">per day</div>
              </div>
              <div className="fc-result-num">
                <div className="fc-big">{result.dailyCal}</div>
                <div className="fc-unit">kcal</div>
                <div className="fc-desc">per day</div>
              </div>
            </div>
          </div>

          <div className="fc-result-meal">
            {result.meals}× daily → {result.perMeal}g per meal
          </div>

          <div className="fc-result-activity">
            <span className="fc-act-icon">🏃</span>
            <span>
              {ACT_LABELS[result.actLevel]} · {result.totalWalk} km/day ({result.walkFreq}× walks) · {HOME_LABELS[result.home]}
            </span>
          </div>

          <div className="fc-result-cards">
            <div className="fc-fresh-card">
              <div className="fc-f-icon">🥬</div>
              <div>
                <div className="fc-f-title">Switch to fresh food → improves digestion</div>
                <div className="fc-f-text">Dogs on fresh, home-style food absorb up to 40% more nutrients. Less bloating, shinier coat, and more energy — naturally.</div>
              </div>
            </div>

            <div className="fc-ai-card">
              <div className="fc-ai-header">
                <span className="fc-ai-badge">✨ AI</span>
                <span className="fc-ai-title">Nutritionist Tip</span>
              </div>
              <div className={`fc-ai-body${aiTip === null ? ' loading' : ''}`}>
                {aiTip === null ? (
                  <>
                    <div className="fc-ai-shimmer" style={{ width: '100%' }} />
                    <div className="fc-ai-shimmer" style={{ width: '82%' }} />
                    <div className="fc-ai-shimmer" style={{ width: '60%' }} />
                  </>
                ) : aiTip}
              </div>
            </div>

            <div className="fc-cta-section">
              <button
                className="fc-recalc-btn"
                style={{ background: '#1A7A45', color: '#fff', borderColor: '#1A7A45', width: '100%', marginTop: '16px' }}
                onClick={bookSample}
              >
                🛒 Book Rs. 99 Sample
              </button>
            </div>

            <button className="fc-recalc-btn" onClick={resetCalc}>🔄 Recalculate</button>
            <button
              className="fc-recalc-btn"
              style={{ background: '#1A7A45', color: '#fff', borderColor: '#1A7A45', marginTop: '8px' }}
              onClick={() => downloadFeedingPdf(result, aiTip)}
            >
              ⬇️ Download PDF Report
            </button>

            {/* ── DISCLAIMER AFTER TOOL ── */}
            <div style={{ background: '#FEF5E4', border: '1px solid #E5D4B0', borderRadius: '12px', padding: '16px 20px', marginTop: '24px' }}>
              <p style={{ fontSize: '13px', color: '#5C3F18', lineHeight: 1.6, margin: 0 }}>
                <strong>⚠️ Disclaimer:</strong> Please consult your veterinarian before starting any treatment, supplement, or medication, or making changes to your pet's diet, exercise, or lifestyle. Individual health needs may vary.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Sample Booking Modal */}
      <SampleModal
        isOpen={sampleModalOpen}
        onClose={() => setSampleModalOpen(false)}
        sampleStep={sampleStep}
        setSampleStep={setSampleStep}
        selectedRecipe={selectedRecipe}
        setSelectedRecipe={setSelectedRecipe}
        selectedGramIdx={selectedGramIdx}
        setSelectedGramIdx={setSelectedGramIdx}
        dogName={dogNameSample}
        setDogName={setDogNameSample}
        mobile={mobile}
        mobileValid={mobileValid}
        handleMobileInput={handleMobileInput}
        deliveryAddress={deliveryAddress}
        setDeliveryAddress={setDeliveryAddress}
        deliveryCity={deliveryCity}
        setDeliveryCity={setDeliveryCity}
        deliveryPin={deliveryPin}
        handlePincodeInput={handlePincodeInput}
        mapSrc={mapSrc}
        openMapVerify={openMapVerify}
        proceedToPayment={proceedToPayment}
        currentPrice={currentPrice}
        currentGrams={currentGrams}
      />

      {isProcessing && <LoadingOverlay />}

      {/* ── PAYMENT CONFIRMATION MODAL ── */}
      {paymentConfirm && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', backdropFilter: 'blur(4px)' }}
          onClick={() => setPaymentConfirm(null)}
        >
          <div
            style={{ background: '#fff', borderRadius: '20px', width: '100%', maxWidth: '400px', overflow: 'hidden', boxShadow: '0 24px 64px rgba(0,0,0,.3)', position: 'relative' }}
            onClick={e => e.stopPropagation()}
          >
            {paymentConfirm.success ? (
              <>
                <div style={{ background: 'linear-gradient(135deg,#195C30,#2a7a44)', padding: '32px 24px', textAlign: 'center' }}>
                  <div style={{ fontSize: '52px', marginBottom: '12px' }}>🎉</div>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: '#fff', marginBottom: '4px' }}>Payment Successful!</div>
                  <div style={{ fontSize: '12px', color: 'rgba(255,255,255,.7)' }}>Your sample order has been confirmed</div>
                </div>
                <div style={{ padding: '24px' }}>
                  <div style={{ background: '#F0FBF4', border: '1px solid rgba(25,92,48,.15)', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontSize: '12px', color: '#5C3F18', fontWeight: 600 }}>Order Status</span>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: '#195C30' }}>✓ Confirmed</span>
                    </div>
                    {paymentConfirm.txnid && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontSize: '12px', color: '#5C3F18', fontWeight: 600 }}>Transaction ID</span>
                        <span style={{ fontSize: '11px', fontFamily: 'monospace', color: '#3A2700' }}>{paymentConfirm.txnid}</span>
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '12px', color: '#5C3F18', fontWeight: 600 }}>Amount Paid</span>
                      <span style={{ fontSize: '13px', fontWeight: 800, color: '#3A2700' }}>₹{paymentConfirm.amount}</span>
                    </div>
                  </div>
                  <div style={{ fontSize: '12px', color: '#8B6B3D', lineHeight: 1.7, marginBottom: '20px', textAlign: 'center' }}>
                    We'll WhatsApp you the delivery update.
                  </div>
                  <button
                    onClick={() => setPaymentConfirm(null)}
                    style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg,#195C30,#2a7a44)', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: 700, cursor: 'pointer', fontFamily: 'Poppins, sans-serif' }}
                  >
                    Got it, thanks! 🐾
                  </button>
                </div>
              </>
            ) : (
              <>
                <div style={{ background: 'linear-gradient(135deg,#AD2218,#c8382c)', padding: '28px 24px', textAlign: 'center' }}>
                  <div style={{ fontSize: '48px', marginBottom: '10px' }}>❌</div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: '#fff', marginBottom: '4px' }}>Payment Not Completed</div>
                  <div style={{ fontSize: '12px', color: 'rgba(255,255,255,.7)' }}>Your order was not placed</div>
                </div>
                <div style={{ padding: '24px' }}>
                  <p style={{ fontSize: '13px', color: '#5C3F18', lineHeight: 1.7, marginBottom: '20px', textAlign: 'center' }}>
                    No amount was charged. You can try again or contact us on WhatsApp if you need help.
                  </p>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      onClick={() => { setPaymentConfirm(null); setSampleModalOpen(true); }}
                      style={{ flex: 1, padding: '13px', background: 'linear-gradient(135deg,#3A2700,#6B4100)', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', fontFamily: 'Poppins, sans-serif' }}
                    >
                      Try Again
                    </button>
                    <a
                      href="https://wa.me/919889887980"
                      target="_blank"
                      rel="noreferrer"
                      style={{ flex: 1, padding: '13px', background: '#25D366', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', fontFamily: 'Poppins, sans-serif', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      WhatsApp Us
                    </a>
                  </div>
                </div>
              </>
            )}
            <button
              onClick={() => setPaymentConfirm(null)}
              style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(255,255,255,.2)', border: 'none', borderRadius: '50%', width: '28px', height: '28px', color: '#fff', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >✕</button>
          </div>
        </div>
      )}

      <SiteFooter />
    </>
  );
}
