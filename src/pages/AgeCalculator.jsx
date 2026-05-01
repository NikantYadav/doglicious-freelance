import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/home/Navbar';
import Footer from '../components/home/Footer';
import { logoImg } from '../data/homeData';
import { useSEO } from '../hooks/useSEO';
import '../styles/AgeCalculator.css';

// ── Data ──────────────────────────────────────────────────────
const STAGE_DATA = {
  puppy: {
    label: '🐶 Puppy', color: '#4CAF50',
    tips: [
      { icon: '🥩', text: '<strong>High protein diet</strong> essential — supports rapid muscle & bone development. Aim for 28–32% protein in diet.' },
      { icon: '🦴', text: '<strong>Calcium & Phosphorus balance</strong> is critical now. Too much can cause skeletal problems in large breeds.' },
      { icon: '🐟', text: '<strong>DHA (Omega-3)</strong> from fish oil supports brain development — especially important in first 12 months.' },
      { icon: '🍽️', text: '<strong>Feed 3 times/day</strong> until 6 months, then twice. Puppies cannot digest large single meals.' },
    ],
  },
  adolescent: {
    label: '🐕 Adolescent', color: '#FF9800',
    tips: [
      { icon: '⚡', text: '<strong>High energy needs</strong> — adolescent dogs are like teenagers, burning calories fast with play & growth.' },
      { icon: '🥗', text: '<strong>Transition to adult portions</strong> around 12–18 months depending on breed size.' },
      { icon: '🏃', text: '<strong>Joint support</strong> with glucosamine is recommended as growth plates close in larger breeds.' },
      { icon: '💧', text: '<strong>Stay hydrated</strong> — active adolescents need fresh water available at all times.' },
    ],
  },
  adult: {
    label: '🐾 Adult', color: '#2196F3',
    tips: [
      { icon: '⚖️', text: '<strong>Maintain ideal body weight</strong> — adult dogs are most susceptible to obesity. Monitor BCS monthly.' },
      { icon: '🥩', text: '<strong>Moderate protein (22–26%)</strong> supports muscle maintenance without excess calorie load.' },
      { icon: '🌿', text: '<strong>Antioxidants</strong> from fresh vegetables protect cells and support immune health.' },
      { icon: '🦷', text: '<strong>Dental health</strong> — raw carrots and dental chews reduce tartar. Fresh food naturally reduces plaque.' },
    ],
  },
  senior: {
    label: '🌟 Senior', color: '#9C27B0',
    tips: [
      { icon: '🧡', text: '<strong>Lower calories, higher quality</strong> — senior dogs move less but need more digestible protein to preserve muscle.' },
      { icon: '🐟', text: '<strong>Omega-3 fatty acids</strong> reduce joint inflammation. Fish oil is essential for senior dogs.' },
      { icon: '🫀', text: '<strong>Heart & kidney support</strong> — moderate phosphorus and sodium. Avoid high-salt processed foods.' },
      { icon: '🌡️', text: '<strong>Digestive enzymes</strong> decline with age — fresh, lightly cooked food is easier to digest than kibble.' },
    ],
  },
  geriatric: {
    label: '👴 Geriatric', color: '#E91E63',
    tips: [
      { icon: '❤️', text: '<strong>Easily digestible meals</strong> are critical — smaller, more frequent meals reduce digestive burden.' },
      { icon: '🩺', text: '<strong>Regular vet checks</strong> every 6 months. Blood work helps catch kidney or liver issues early.' },
      { icon: '🌿', text: '<strong>Antioxidant-rich diet</strong> — blueberries, spinach, sweet potato support cognitive function.' },
      { icon: '💊', text: "<strong>Supplements matter</strong> — glucosamine, fish oil, and probiotics are the geriatric dog's best friends." },
    ],
  },
};

const SIZE_LABELS = {
  small: 'Small (<10 kg)',
  medium: 'Medium (10–25 kg)',
  large: 'Large (25–45 kg)',
  giant: 'Giant (>45 kg)',
};

function calcHumanAge(years, months, size) {
  const totalYears = years + months / 12;
  const mults = { small: 1, medium: 1.05, large: 1.1, giant: 1.15 };
  const m = mults[size] || 1;
  let human = 0;
  if (totalYears <= 1) human = 15 * totalYears * m;
  else if (totalYears <= 2) human = (15 + (totalYears - 1) * 9) * m;
  else human = (15 + 9 + (totalYears - 2) * 5) * m;
  return Math.round(human);
}

function getStage(years, size) {
  const thresholds = {
    small: { puppy: 0.75, adolescent: 1.5, adult: 7, senior: 11, geriatric: 14 },
    medium: { puppy: 1, adolescent: 2, adult: 7, senior: 10, geriatric: 13 },
    large: { puppy: 1, adolescent: 2, adult: 6, senior: 9, geriatric: 12 },
    giant: { puppy: 1.5, adolescent: 2, adult: 5, senior: 8, geriatric: 11 },
  };
  const t = thresholds[size] || thresholds.medium;
  if (years < t.puppy) return 'puppy';
  if (years < t.adolescent) return 'adolescent';
  if (years < t.adult) return 'adult';
  if (years < t.senior) return 'senior';
  return 'geriatric';
}

// ── Component ─────────────────────────────────────────────────
export default function AgeCalculator() {
  useSEO({
    title: 'Dog Age to Human Years Calculator | Free Tool',
    description: "Find out your dog's true age in human years.",
    path: '/tools/age-calculator'
  });

  const navigate = useNavigate();
  const [navScrolled, setNavScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // form state
  const [dogName, setDogName] = useState('');
  const [size, setSize] = useState('');
  const [ageYears, setAgeYears] = useState('');
  const [ageMonths, setAgeMonths] = useState('');

  // result state
  const [result, setResult] = useState(null); // null = not calculated
  const [displayed, setDisplayed] = useState(0);    // animated counter

  const resultRef = useRef(null);
  const ringRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setNavScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  // Animate counter when result changes
  useEffect(() => {
    if (!result) return;
    let c = 0;
    const target = result.humanAge;
    const iv = setInterval(() => {
      c += Math.ceil(target / 30);
      if (c >= target) { c = target; clearInterval(iv); }
      setDisplayed(c);
    }, 30);
    return () => clearInterval(iv);
  }, [result]);

  // Scroll to result
  useEffect(() => {
    if (result && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [result]);

  const calculate = () => {
    if (!size) { alert('Please select a breed size.'); return; }
    const y = parseInt(ageYears) || 0;
    const mo = parseInt(ageMonths) || 0;
    if (y === 0 && mo === 0) { alert("Please enter your dog's age."); return; }

    const humanAge = calcHumanAge(y, mo, size);
    const stage = getStage(y + mo / 12, size);
    const sd = STAGE_DATA[stage];

    setResult({
      name: dogName.trim() || 'Your dog',
      years: y, months: mo, size, humanAge, stage, sd,
    });
  };

  const reset = () => {
    setResult(null);
    setDisplayed(0);
    setDogName('');
    setSize('');
    setAgeYears('');
    setAgeMonths('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const shareWA = () => {
    if (!result) return;
    const { name, humanAge, years, months, size: sz, stage, sd } = result;
    const msg = encodeURIComponent(
      `🎂 *Dog Age Calculator — Doglicious*\n\n${name} is ${humanAge} in human years!\n\n🐾 Dog age: ${years}y ${months > 0 ? months + 'm' : ''}\n📏 Breed size: ${SIZE_LABELS[sz]}\n💛 Life stage: ${sd.label}\n\nCalculate your dog's age 👇\nhttps://doglicious.in/tools/age-calculator`
    );
    window.open(`https://wa.me/?text=${msg}`, '_blank');
  };

  // Ring geometry
  const CIRC = 2 * Math.PI * 70;
  const maxAge = result
    ? (result.size === 'small' ? 120 : result.size === 'giant' ? 90 : 105)
    : 105;
  const ringOffset = result
    ? CIRC * (1 - Math.min(result.humanAge / maxAge, 1))
    : CIRC;

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
      <div className="ac-hero">
        <div className="ac-hero-tag">🎂 Free Tool</div>
        <h1>How old is your dog<br />in <em>human years?</em></h1>
        <p className="ac-hero-sub">Science-backed formula adjusted for breed size. Instant results.</p>
      </div>

      {/* Ticker */}
      <div className="ac-ticker">
        <div className="ac-ticker-inner">
          🐾 1 dog year ≠ 7 human years &nbsp;·&nbsp; 🧬 Age varies by breed size &nbsp;·&nbsp;
          🎂 Year 1 = ~15 human years &nbsp;·&nbsp; 🐕 Senior dogs need special nutrition &nbsp;·&nbsp;
          🐾 1 dog year ≠ 7 human years &nbsp;·&nbsp; 🧬 Age varies by breed size &nbsp;·&nbsp;
          🎂 Year 1 = ~15 human years &nbsp;·&nbsp; 🐕 Senior dogs need special nutrition &nbsp;·&nbsp;
        </div>
      </div>

      <div className="ac-main">

        {/* ── Input Card ── */}
        {!result && (
          <div className="ac-card">
            <div className="ac-card-head">
              <span className="ac-ch-icon">🐾</span>
              <div>
                <div className="ac-ch-label">Step 1 of 2</div>
                <div className="ac-ch-title">Tell us about your dog</div>
              </div>
            </div>

            <div className="ac-card-body">
              {/* Name */}
              <div className="ac-field">
                <label>🐕 Dog's Name</label>
                <input
                  type="text"
                  className="ac-input"
                  placeholder="e.g. Bruno"
                  value={dogName}
                  onChange={e => setDogName(e.target.value)}
                />
              </div>

              {/* Size */}
              <div className="ac-field">
                <label>⚖️ Breed Size</label>
                <div className="ac-pill-group">
                  {[
                    { val: 'small', emoji: '🐩', label: 'Small', sub: '<10 kg' },
                    { val: 'medium', emoji: '🐕', label: 'Medium', sub: '10–25 kg' },
                    { val: 'large', emoji: '🦮', label: 'Large', sub: '25–45 kg' },
                    { val: 'giant', emoji: '🐻', label: 'Giant', sub: '>45 kg' },
                  ].map(({ val, emoji, label, sub }) => (
                    <button
                      key={val}
                      className={`ac-pill${size === val ? ' sel' : ''}`}
                      onClick={() => setSize(val)}
                    >
                      {emoji} {label}<br />
                      <span className="ac-pill-sub">{sub}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Age */}
              <div className="ac-field">
                <label>🎂 Dog's Age</label>
                <div className="ac-age-row">
                  <div>
                    <input
                      type="number"
                      className="ac-input ac-input-lg"
                      placeholder="Years"
                      min="0" max="25"
                      value={ageYears}
                      onChange={e => setAgeYears(e.target.value)}
                    />
                    <div className="ac-input-hint">YEARS</div>
                  </div>
                  <div>
                    <input
                      type="number"
                      className="ac-input ac-input-lg"
                      placeholder="Months"
                      min="0" max="11"
                      value={ageMonths}
                      onChange={e => setAgeMonths(e.target.value)}
                    />
                    <div className="ac-input-hint">MONTHS (optional)</div>
                  </div>
                </div>
              </div>

              <button className="ac-btn-calc" onClick={calculate}>
                Calculate Human Age →
              </button>
            </div>
          </div>
        )}

        {/* ── Result Card ── */}
        {result && (
          <div className="ac-result" ref={resultRef}>
            {/* Ring */}
            <div className="ac-ring-wrap">
              <div className="ac-ring-label">in human years</div>
              <div className="ac-ring">
                <svg viewBox="0 0 160 160">
                  <circle className="ac-ring-bg" cx="80" cy="80" r="70" />
                  <circle
                    className="ac-ring-fg"
                    cx="80" cy="80" r="70"
                    style={{ strokeDashoffset: ringOffset }}
                  />
                </svg>
                <div className="ac-ring-num">
                  <div className="ac-rn-val">{displayed}</div>
                  <div className="ac-rn-unit">human yrs</div>
                </div>
              </div>
              <div className="ac-ring-stage">
                {result.sd.label}{' '}
                <span style={{ color: result.sd.color }}>●</span>
              </div>
            </div>

            {/* Info grid */}
            <div className="ac-info-grid">
              {[
                { icon: '🐾', label: 'Dog Age', val: `${result.years}y${result.months > 0 ? ' ' + result.months + 'm' : ''}` },
                { icon: '📏', label: 'Breed Size', val: SIZE_LABELS[result.size] },
                { icon: '🎂', label: 'Equivalent', val: `${result.humanAge} yrs` },
                { icon: '💛', label: 'Life Stage', val: result.sd.label },
              ].map(({ icon, label, val }) => (
                <div className="ac-info-box" key={label}>
                  <div className="ac-ib-icon">{icon}</div>
                  <div className="ac-ib-label">{label}</div>
                  <div className="ac-ib-val">{val}</div>
                </div>
              ))}
            </div>

            {/* Tips */}
            <div className="ac-tips-card">
              <h3>🩺 Nutrition for this life stage</h3>
              {result.sd.tips.map((tip, i) => (
                <div className="ac-tip-row" key={i}>
                  <div className="ac-tip-icon">{tip.icon}</div>
                  <div
                    className="ac-tip-text"
                    dangerouslySetInnerHTML={{ __html: tip.text }}
                  />
                </div>
              ))}
            </div>

            {/* Share */}
            <div className="ac-share-card">
              <div className="ac-share-msg">
                🎂 <span>{result.name}</span> is {result.humanAge} in human years — a {result.sd.label}!
              </div>
              <div className="ac-share-btns">
                <button className="ac-share-btn ac-share-wa" onClick={shareWA}>
                  📲 Share on WhatsApp
                </button>
                <button className="ac-share-btn ac-share-reset" onClick={reset}>
                  ↩ Recalculate
                </button>
              </div>
            </div>

            {/* CTA */}
            <div className="ac-cta-card">
              <h3>Feed <span>{result.name}</span> right for their age</h3>
              <p>Every life stage needs different nutrition. Get a personalised fresh meal plan for just ₹99.</p>
              <a
                href="https://wa.me/919889887980"
                target="_blank"
                rel="noreferrer"
                className="ac-cta-btn"
              >
                🐾 Book ₹99 Sample
              </a>
            </div>
          </div>
        )}
      </div>

      <Footer openModal={() => { }} openTool={openTool} />
    </>
  );
}
