import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/home/Navbar';
import Footer from '../components/home/Footer';
import { logoImg } from '../data/homeData';
import { useSEO } from '../hooks/useSEO';
import '../styles/BmiCalculator.css';

// ── Data ──────────────────────────────────────────────────────
const IDEAL_RANGES = {
  small: { min: 3, max: 10 },
  medium: { min: 10, max: 25 },
  large: { min: 25, max: 45 },
  giant: { min: 45, max: 90 },
};

const BCS_HINTS = {
  1: 'Ribs, spine & hip bones very prominent. No body fat. Visible muscle loss.',
  2: 'Ribs easily felt, minimal fat. Pronounced waist. Some muscle loss.',
  3: 'Ribs easily felt. Obvious waist. Slight abdominal tuck.',
  4: 'Ribs easily felt without pressing. Visible waist behind ribs. Slight tuck.',
  5: '✅ Ideal! Ribs felt with slight fat covering. Visible waist, tuck present.',
  6: 'Ribs felt with slight excess fat. Waist discernible but not obvious.',
  7: 'Ribs difficult to feel. Waist absent or barely visible. Abdominal rounding.',
  8: 'Ribs not felt under heavy fat. Heavy waist and abdomen. Fat deposits on neck/limbs.',
  9: 'Massive fat deposits. No waist, distended abdomen. Difficulty moving.',
};

const VERDICT_DATA = {
  underweight: {
    emoji: '🔵', label: 'Underweight', color: '#1a4fa0', bg: '#EEF3FC',
    tips: [
      { icon: '🥩', text: '<strong>Increase caloric density</strong> — add healthy fats like coconut oil or sardines in water to boost calories without volume.' },
      { icon: '🍗', text: '<strong>High-protein fresh food</strong> supports lean muscle gain. Aim for 28%+ protein in diet.' },
      { icon: '🍽️', text: '<strong>Feed 3 times per day</strong> — smaller, more frequent meals are better absorbed than one large meal.' },
      { icon: '🩺', text: '<strong>Rule out illness</strong> — unexplained weight loss should be checked by a vet (worms, thyroid issues, or dental pain).' },
    ],
  },
  ideal: {
    emoji: '🟢', label: 'Ideal Weight', color: '#1A7A45', bg: '#EBF7F0',
    tips: [
      { icon: '⚖️', text: "<strong>Maintain this weight</strong> — you're doing great! Monitor BCS monthly and adjust portions seasonally." },
      { icon: '🥗', text: '<strong>Fresh food supports maintenance</strong> — less filler means exact calorie control without guesswork.' },
      { icon: '🏃', text: '<strong>Regular exercise</strong> keeps muscles toned. 30–60 min daily walk is ideal for most breeds.' },
      { icon: '📊', text: '<strong>Check BCS every 4 weeks</strong> — weight can creep up slowly. Prevention is easier than correction.' },
    ],
  },
  overweight: {
    emoji: '🟡', label: 'Overweight', color: '#C47A0A', bg: '#FEF5E4',
    tips: [
      { icon: '📉', text: '<strong>Reduce portions by 10–15%</strong> gradually. Sudden restriction causes muscle loss, not fat loss.' },
      { icon: '🥕', text: '<strong>Replace 20% of food with low-cal veg</strong> — boiled carrots, cucumber, and green beans add volume without calories.' },
      { icon: '🚶', text: '<strong>Increase activity slowly</strong> — add 10 min to daily walk every week. Avoid high-impact exercise initially.' },
      { icon: '🍗', text: '<strong>Switch to weight management fresh food</strong> — higher protein, lower fat maintains muscle while burning fat.' },
    ],
  },
  obese: {
    emoji: '🔴', label: 'Obese', color: '#A01A1A', bg: '#FCF0F0',
    tips: [
      { icon: '🩺', text: '<strong>Vet consultation recommended</strong> — obesity affects joints, heart, and lifespan. Get a formal weight loss plan.' },
      { icon: '📉', text: '<strong>Structured calorie reduction</strong> — reduce daily intake to 60–70% of maintenance under vet supervision.' },
      { icon: '🏊', text: '<strong>Low-impact exercise only</strong> — hydrotherapy or gentle walks. Avoid stairs and jumping until weight drops.' },
      { icon: '🥩', text: '<strong>High-protein, low-fat fresh food</strong> is clinically proven to support healthy weight loss in dogs.' },
    ],
  },
};

function getCategory(bcs) {
  if (bcs <= 3) return 'underweight';
  if (bcs <= 5) return 'ideal';
  if (bcs <= 7) return 'overweight';
  return 'obese';
}

// BCS button colour class
function bcsClass(val) {
  if (val <= 3) return 'bmi-bcs-blue';
  if (val <= 5) return 'bmi-bcs-green';
  if (val <= 7) return 'bmi-bcs-amber';
  return 'bmi-bcs-red';
}

// ── Component ─────────────────────────────────────────────────
export default function BmiCalculator() {
  useSEO({
    title: 'Dog BMI Calculator | Free Tool',
    description: "Calculate your dog's BMI and ideal weight.",
    path: '/tools/bmi-calculator'
  });

  const navigate = useNavigate();
  const [navScrolled, setNavScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // inputs
  const [currentWeight, setCurrentWeight] = useState('');
  const [dogAge, setDogAge] = useState('');
  const [size, setSize] = useState('');
  const [sex, setSex] = useState('');
  const [bcs, setBcs] = useState(0);

  // result
  const [result, setResult] = useState(null);
  const resultRef = useRef(null);

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

  const calculate = () => {
    const weight = parseFloat(currentWeight) || 0;
    if (!weight) { alert('Please enter current weight.'); return; }
    if (!size) { alert('Please select breed size.'); return; }
    if (!bcs) { alert('Please select a Body Condition Score.'); return; }

    const range = IDEAL_RANGES[size];
    const idealMid = (range.min + range.max) / 2;
    const idealTarget = Math.round(idealMid * 10) / 10;
    const diff = weight - idealTarget;
    const pctDiff = Math.round((diff / idealTarget) * 100);
    const absDiff = Math.abs(diff);
    const category = getCategory(bcs);
    const vd = VERDICT_DATA[category];

    const safeWeekly = Math.round(idealTarget * 0.015 * 10) / 10;
    const weeks = safeWeekly > 0 ? Math.ceil(absDiff / safeWeekly) : 0;

    const gaugePos = Math.min(Math.max((weight / range.max) * 100, 5), 95);

    setResult({
      weight, age: parseFloat(dogAge) || 0, size, sex, bcs,
      range, idealTarget, diff, pctDiff, absDiff,
      category, vd, safeWeekly, weeks, gaugePos,
    });
  };

  const reset = () => {
    setResult(null);
    setCurrentWeight('');
    setDogAge('');
    setSize('');
    setSex('');
    setBcs(0);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const bookSample = () => {
    if (!result) return;
    const msg = encodeURIComponent(
      `🐾 Hi Doglicious!\n\nI checked my dog's weight using your BMI tool.\n\nCurrent weight: ${result.weight}kg | BCS: ${result.bcs}/9 | Size: ${result.size}\n\nI'd like to book the ₹99 fresh food sample and get a weight-specific meal plan!`
    );
    window.open(`https://wa.me/919889887980?text=${msg}`, '_blank');
  };

  const openTool = (idx) => navigate('/', { state: { openTool: idx } });

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
      <div className="bmi-hero">
        <div className="bmi-hero-eyebrow">
          <span className="bmi-hero-dot" /> Live Checker
        </div>
        <h1>Is your dog at their<br /><em>ideal weight?</em></h1>
        <p className="bmi-hero-sub">
          Enter your dog's details and Body Condition Score to get an instant
          health verdict with a personalised nutrition plan.
        </p>
      </div>

      <div className="bmi-body">

        {/* BCS Guide */}
        <div className="bmi-bcs-info">
          <h3>📊 Body Condition Score (BCS) Guide</h3>
          <div className="bmi-bcs-scale">
            <div className="bmi-bcs-seg" style={{ background: '#1a4fa0', flex: 3 }}>1–3</div>
            <div className="bmi-bcs-seg" style={{ background: '#1A7A45', flex: 2 }}>4–5</div>
            <div className="bmi-bcs-seg" style={{ background: '#C47A0A', flex: 2 }}>6–7</div>
            <div className="bmi-bcs-seg" style={{ background: '#A01A1A', flex: 2 }}>8–9</div>
          </div>
          <div className="bmi-bcs-labels">
            <span>🔵 Underweight</span>
            <span>🟢 Ideal</span>
            <span>🟡 Overweight</span>
            <span>🔴 Obese</span>
          </div>
        </div>

        {/* Input card */}
        <div className="bmi-input-card">
          <div className="bmi-card-head">
            <div className="bmi-card-head-label">Dog Details</div>
            <div className="bmi-card-head-title">Check Your Dog's Weight</div>
          </div>
          <div className="bmi-card-body">

            {/* Weight + Age */}
            <div className="bmi-input-row">
              <div className="bmi-field">
                <label>Current Weight (kg)</label>
                <input
                  type="number" className="bmi-input" placeholder="e.g. 18"
                  min="0.5" max="90" step="0.1"
                  value={currentWeight}
                  onChange={e => setCurrentWeight(e.target.value)}
                />
              </div>
              <div className="bmi-field">
                <label>Age (years)</label>
                <input
                  type="number" className="bmi-input" placeholder="e.g. 3"
                  min="0" max="20" step="0.5"
                  value={dogAge}
                  onChange={e => setDogAge(e.target.value)}
                />
              </div>
            </div>

            {/* Size */}
            <div className="bmi-field">
              <label>Breed Size</label>
              <div className="bmi-pill-group">
                {[
                  { val: 'small', emoji: '🐩', label: 'Small', sub: '<10 kg' },
                  { val: 'medium', emoji: '🐕', label: 'Medium', sub: '10–25 kg' },
                  { val: 'large', emoji: '🦮', label: 'Large', sub: '25–45 kg' },
                  { val: 'giant', emoji: '🐻', label: 'Giant', sub: '>45 kg' },
                ].map(({ val, emoji, label, sub }) => (
                  <button
                    key={val}
                    className={`bmi-pill${size === val ? ' sel' : ''}`}
                    onClick={() => setSize(val)}
                  >
                    {emoji} {label}<span>{sub}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Sex */}
            <div className="bmi-field">
              <label>Sex</label>
              <div className="bmi-pill-group">
                {[
                  { val: 'male', label: '♂ Male' },
                  { val: 'female', label: '♀ Female' },
                  { val: 'neutered', label: '✂️ Neutered' },
                ].map(({ val, label }) => (
                  <button
                    key={val}
                    className={`bmi-pill bmi-pill-sm${sex === val ? ' sel' : ''}`}
                    onClick={() => setSex(val)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* BCS */}
            <div className="bmi-field">
              <label>Body Condition Score (BCS) — tap the score that best describes your dog</label>
              <div className="bmi-bcs-selector">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(v => (
                  <button
                    key={v}
                    className={`bmi-bcs-btn${bcs === v ? ` sel ${bcsClass(v)}` : ''}`}
                    onClick={() => setBcs(v)}
                  >
                    {v}
                  </button>
                ))}
              </div>
              <div className="bmi-bcs-hint">
                {bcs ? BCS_HINTS[bcs] : 'Select 1 (very thin) → 9 (severely obese). 4–5 is ideal.'}
              </div>
            </div>

            <button className="bmi-btn-calc" onClick={calculate}>
              Check My Dog's Weight →
            </button>
          </div>
        </div>

        {/* Result */}
        {result && (
          <div className="bmi-result" ref={resultRef}>

            {/* Verdict */}
            <div
              className="bmi-verdict-card"
              style={{ background: result.vd.bg, border: `1.5px solid ${result.vd.color}` }}
            >
              <div className="bmi-vc-top">
                <div className="bmi-vc-emoji">{result.vd.emoji}</div>
                <div className="bmi-vc-text">
                  <div className="bmi-vc-label">{result.category.toUpperCase()}</div>
                  <div className="bmi-vc-title">
                    {result.vd.label}
                    {result.diff > 0.5 ? ` — ${result.pctDiff}% over ideal` : ''}
                    {result.diff < -0.5 ? ` — ${Math.abs(result.pctDiff)}% under ideal` : ''}
                  </div>
                  <div className="bmi-vc-sub">
                    BCS {result.bcs}/9 · Current: {result.weight}kg · Ideal range: {result.range.min}–{result.range.max}kg
                  </div>
                </div>
              </div>

              {/* Gauge */}
              <div className="bmi-gauge-wrap">
                <div className="bmi-gauge-label">Weight vs ideal range</div>
                <div className="bmi-gauge-bar">
                  <div
                    className="bmi-gauge-fill"
                    style={{ width: `${result.gaugePos}%`, background: result.vd.color }}
                  />
                  <div className="bmi-gauge-pointer" style={{ left: `${result.gaugePos}%` }} />
                </div>
                <div className="bmi-gauge-range">
                  <span>Underweight</span><span>Ideal</span><span>Obese</span>
                </div>
              </div>
            </div>

            {/* Stats grid */}
            <div className="bmi-stats-grid">
              {[
                { label: 'Current Weight', val: result.weight, unit: 'kg' },
                { label: 'Ideal Weight', val: `${result.range.min}–${result.range.max}`, unit: 'kg range' },
                { label: 'Variance', val: `${result.diff > 0 ? '+' : ''}${Math.round(result.diff * 10) / 10} kg`, unit: 'from ideal' },
                { label: 'Goal Timeline', val: result.weeks > 0 ? result.weeks : '—', unit: 'weeks (safe pace)' },
              ].map(({ label, val, unit }) => (
                <div className="bmi-stat-box" key={label}>
                  <div className="bmi-sb-label">{label}</div>
                  <div className="bmi-sb-val">{val}</div>
                  <div className="bmi-sb-unit">{unit}</div>
                </div>
              ))}
            </div>

            {/* Goal plan */}
            <div className="bmi-goal-card">
              <div className="bmi-goal-title">🎯 Weight goal plan</div>
              {[
                { label: 'Target weight', val: `${result.idealTarget} kg` },
                { label: 'Safe loss/gain rate', val: '1–2% body weight/week' },
                { label: 'Weekly change needed', val: result.category === 'ideal' ? 'Maintain' : `${result.category === 'underweight' ? 'gain' : 'lose'} ~${result.safeWeekly} kg/week` },
                { label: 'Estimated timeline', val: result.weeks > 0 ? `${result.weeks} weeks` : 'Already at goal!' },
              ].map(({ label, val }) => (
                <div className="bmi-goal-row" key={label}>
                  <div className="bmi-gr-label">{label}</div>
                  <div className="bmi-gr-val">{val}</div>
                </div>
              ))}
            </div>

            {/* Tips */}
            <div className="bmi-tips-card">
              <div className="bmi-tips-title">🍽️ Nutrition recommendations</div>
              {result.vd.tips.map((tip, i) => (
                <div className="bmi-tip-row" key={i}>
                  <div className="bmi-tip-icon">{tip.icon}</div>
                  <div
                    className="bmi-tip-text"
                    dangerouslySetInnerHTML={{ __html: tip.text }}
                  />
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="bmi-cta-strip">
              <div className="bmi-cta-text">
                <h3>Get a weight-specific meal plan</h3>
                <p>Doglicious creates fresh meals calibrated to your dog's ideal weight. Try a sample for ₹99.</p>
              </div>
              <button className="bmi-cta-wa" onClick={bookSample}>📲 ₹99 Sample</button>
            </div>

            <button className="bmi-btn-reset" onClick={reset}>↩ Check another dog</button>
          </div>
        )}
      </div>

      <Footer openModal={() => { }} openTool={openTool} />
    </>
  );
}
