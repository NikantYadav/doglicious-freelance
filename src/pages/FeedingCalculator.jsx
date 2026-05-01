import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/home/Navbar';
import Footer from '../components/home/Footer';
import { logoImg } from '../data/homeData';
import { useSEO } from '../hooks/useSEO';
import '../styles/FeedingCalculator.css';

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
  const [navScrolled, setNavScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
  const [ctaName, setCtaName] = useState('');
  const [ctaPhone, setCtaPhone] = useState('');
  const [ctaEmail, setCtaEmail] = useState('');

  const resultRef = useRef(null);
  const weightRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setNavScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
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
    const msg = encodeURIComponent(
      `🐾 Hi Doglicious!\n\nI used your feeding calculator.\n\nDog: ${result.w}kg ${result.age} ${result.breedName}\nDaily: ${result.dailyG}g / ${result.dailyCal} kcal\n\nName: ${ctaName}\nPhone: ${ctaPhone}\n\nI'd like to book the ₹99 sample!`
    );
    window.open(`https://wa.me/919889887980?text=${msg}`, '_blank');
  };

  const doEmail = () => {
    if (!result) return;
    const sub = encodeURIComponent('₹99 Fresh Food Sample — Doglicious');
    const body = encodeURIComponent(`Name: ${ctaName}\nPhone: ${ctaPhone}\nDog: ${result.w}kg ${result.age} ${result.breedName}\nDaily: ${result.dailyG}g`);
    window.location.href = `mailto:hello@doglicious.in?subject=${sub}&body=${body}`;
  };

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

  const openTool = (idx) => navigate('/', { state: { openTool: idx } });

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
      <Navbar
        navScrolled={navScrolled}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        openModal={() => { }}
        openTool={openTool}
        logoImg={logoImg}
      />

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
              <div className="fc-cta-price">₹99</div>
              <div className="fc-cta-title">Book a Fresh Food Sample</div>
              <div className="fc-cta-sub">Try Doglicious fresh meals for your dog.<br />Talk to our pet nutrition expert.</div>
              <div className="fc-cta-form">
                <input className="fc-cta-input" type="text" placeholder="Your name" value={ctaName} onChange={e => setCtaName(e.target.value)} />
                <input className="fc-cta-input" type="tel" placeholder="WhatsApp number" value={ctaPhone} onChange={e => setCtaPhone(e.target.value)} />
                <input className="fc-cta-input" type="email" placeholder="Email (optional)" value={ctaEmail} onChange={e => setCtaEmail(e.target.value)} />
              </div>
              <div className="fc-cta-btns">
                <button className="fc-cta-btn fc-cta-wa" onClick={doWhatsApp}>💬 WhatsApp</button>
                <button className="fc-cta-btn fc-cta-book" onClick={doEmail}>📧 Book Now</button>
              </div>
            </div>

            <button className="fc-recalc-btn" onClick={resetCalc}>🔄 Recalculate</button>
          </div>
        </section>
      )}

      <Footer openModal={() => { }} openTool={openTool} />
    </>
  );
}
