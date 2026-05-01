import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/home/Navbar';
import Footer from '../components/home/Footer';
import { logoImg } from '../data/homeData';
import { useSEO } from '../hooks/useSEO';
import '../styles/CostCalculator.css';

const BRANDS = ['Pedigree', 'Royal Canin', 'Drools', 'Farmina', 'Acana', 'Other'];

const fmt = (n) => '₹' + Math.round(n).toLocaleString('en-IN');

export default function CostCalculator() {
  useSEO({
    title: 'Dog Food Cost Calculator | Free Tool',
    description: "Compare the real cost of fresh food vs kibble.",
    path: '/tools/cost-calculator'
  });

  const navigate = useNavigate();
  const [navScrolled, setNavScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // inputs
  const [dogWeight, setDogWeight] = useState('');
  const [ageGroup, setAgeGroup] = useState('');
  const [brand, setBrand] = useState('');
  const [bagSize, setBagSize] = useState('');
  const [bagPrice, setBagPrice] = useState('');
  const [dailyGrams, setDailyGrams] = useState('');
  const [freshPrice, setFreshPrice] = useState('499');

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
    const weight = parseFloat(dogWeight) || 0;
    const bagSizeKg = parseFloat(bagSize) || 0;
    const bagPriceNum = parseFloat(bagPrice) || 0;
    const dailyG = parseFloat(dailyGrams) || 0;
    const freshPerKg = parseFloat(freshPrice) || 499;

    if (!weight) { alert("Please enter your dog's weight."); return; }
    if (!bagSizeKg || !bagPriceNum || !dailyG) { alert('Please fill in all kibble details.'); return; }

    const kibblePricePerG = bagPriceNum / (bagSizeKg * 1000);
    const kibbleDaily = kibblePricePerG * dailyG;

    const freshDailyG = weight * 25;
    const freshDaily = (freshPerKg / 1000) * freshDailyG;

    const kibbleMonthly = kibbleDaily * 30;
    const freshMonthly = freshDaily * 30;
    const kibbleYearly = kibbleDaily * 365;
    const freshYearly = freshDaily * 365;
    const diff = kibbleYearly - freshYearly;

    let verdict;
    if (diff > 0) {
      verdict = { icon: '🟢', msg: `Fresh food saves you <strong>${fmt(diff)}/year</strong> vs kibble!`, cls: 'cheaper', savings: `${fmt(diff)} cheaper` };
    } else if (diff > -500) {
      verdict = { icon: '🟡', msg: 'Cost is about the same — but fresh delivers far more nutrition.', cls: 'parity', savings: 'About equal' };
    } else {
      verdict = { icon: '💡', msg: `Fresh costs ${fmt(Math.abs(diff))}/yr more — but saves ₹7K–21K in vet bills.`, cls: 'parity', savings: `${fmt(Math.abs(diff))} more/yr` };
    }

    setResult({
      weight, brand, kibbleDaily, freshDaily,
      kibbleMonthly, freshMonthly, kibbleYearly, freshYearly,
      diff, verdict,
    });
  };

  const reset = () => {
    setResult(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const bookSample = () => {
    const msg = encodeURIComponent(
      `🐾 Hi Doglicious!\n\nI used your cost calculator and want to try the ₹99 fresh food sample.\n\nMy dog: ${dogWeight || '?'} kg, currently on ${brand || 'kibble'}\n\nPlease help me get started!`
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

      {/* Header */}
      <div className="cc-header">
        <div className="cc-header-tag">💰 Cost Calculator</div>
        <h1>Kibble vs <em>Fresh Food</em><br />What are you really paying?</h1>
        <p>Enter your current dog food details and see the true daily, monthly and yearly comparison.</p>
      </div>

      <div className="cc-wrap">

        {/* Dog section */}
        <div className="cc-sec-label">Your Dog</div>
        <div className="cc-input-card">
          <div className="cc-input-row">
            <div className="cc-field">
              <label>Dog Weight (kg)</label>
              <input
                type="number" className="cc-input" placeholder="e.g. 15"
                min="1" max="90"
                value={dogWeight} onChange={e => setDogWeight(e.target.value)}
              />
            </div>
            <div className="cc-field">
              <label>Age Group</label>
              <select
                className="cc-select"
                value={ageGroup} onChange={e => setAgeGroup(e.target.value)}
              >
                <option value="">Select...</option>
                <option value="puppy">Puppy</option>
                <option value="adult">Adult</option>
                <option value="senior">Senior</option>
              </select>
            </div>
          </div>
        </div>

        {/* Kibble section */}
        <div className="cc-sec-label">Your Current Kibble</div>
        <div className="cc-input-card">
          <div className="cc-field">
            <label>Brand (optional)</label>
            <div className="cc-brand-grid">
              {BRANDS.map(b => (
                <button
                  key={b}
                  className={`cc-brand-pill${brand === b ? ' sel' : ''}`}
                  onClick={() => setBrand(b)}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>
          <div className="cc-input-row">
            <div className="cc-field">
              <label>Bag Size (kg)</label>
              <input
                type="number" className="cc-input" placeholder="e.g. 3"
                min="0.1" step="0.1"
                value={bagSize} onChange={e => setBagSize(e.target.value)}
              />
              <div className="cc-hint">Size of the bag you buy</div>
            </div>
            <div className="cc-field">
              <label>Bag Price (₹)</label>
              <input
                type="number" className="cc-input" placeholder="e.g. 899"
                min="1"
                value={bagPrice} onChange={e => setBagPrice(e.target.value)}
              />
            </div>
          </div>
          <div className="cc-field">
            <label>Daily Feeding (grams)</label>
            <input
              type="number" className="cc-input" placeholder="e.g. 250"
              value={dailyGrams} onChange={e => setDailyGrams(e.target.value)}
            />
            <div className="cc-hint">Check the back of your bag for feeding guidelines</div>
          </div>
        </div>

        {/* Fresh section */}
        <div className="cc-sec-label">Doglicious Fresh Food</div>
        <div className="cc-input-card">
          <div className="cc-field">
            <label>Price per kg (₹)</label>
            <input
              type="number" className="cc-input" placeholder="499"
              value={freshPrice} onChange={e => setFreshPrice(e.target.value)}
            />
            <div className="cc-hint">Doglicious fresh food — approx ₹499/kg (adjust if you have a quote)</div>
          </div>
        </div>

        <button className="cc-btn-calc" onClick={calculate}>Compare Costs →</button>

        {/* Results */}
        {result && (
          <div className="cc-result" ref={resultRef}>

            {/* Verdict banner */}
            <div className={`cc-verdict-banner ${result.verdict.cls}`}>
              <div className="cc-verdict-icon">{result.verdict.icon}</div>
              <div className="cc-verdict-text">
                <div className="cc-vt-label">Your result</div>
                <div
                  className="cc-vt-msg"
                  dangerouslySetInnerHTML={{ __html: result.verdict.msg }}
                />
              </div>
            </div>

            {/* Per-day visual */}
            <div className="cc-per-day">
              <div className="cc-pd-box kibble">
                <div className="cc-pd-type k">Kibble / Day</div>
                <div className="cc-pd-amount k">{fmt(result.kibbleDaily)}</div>
                <div className="cc-pd-unit">per day</div>
              </div>
              <div className="cc-pd-box fresh">
                <div className="cc-pd-type f">Fresh / Day</div>
                <div className="cc-pd-amount f">{fmt(result.freshDaily)}</div>
                <div className="cc-pd-unit">per day</div>
              </div>
            </div>

            {/* Comparison table */}
            <div className="cc-cmp-table">
              <div className="cc-cmp-head">
                <div>Period</div>
                <div>{result.brand || 'Kibble'}</div>
                <div>Fresh</div>
              </div>
              {[
                { label: 'Daily', kibble: result.kibbleDaily, fresh: result.freshDaily },
                { label: 'Monthly', kibble: result.kibbleMonthly, fresh: result.freshMonthly },
                { label: 'Yearly', kibble: result.kibbleYearly, fresh: result.freshYearly },
              ].map(({ label, kibble, fresh }) => (
                <div className="cc-cmp-row" key={label}>
                  <div className="cc-label-cell">{label}</div>
                  <div className="cc-kibble-val">{fmt(kibble)}</div>
                  <div className="cc-fresh-val">{fmt(fresh)}</div>
                </div>
              ))}
              <div className="cc-cmp-row cc-savings-row">
                <div className="cc-label-cell" style={{ fontWeight: 700, color: 'var(--cc-ink)' }}>Annual Diff.</div>
                <div />
                <div className="cc-savings-val">{result.verdict.savings}</div>
              </div>
            </div>

            {/* ROI card */}
            <div className="cc-roi-card">
              <div className="cc-roi-title">🩺 The hidden cost of kibble (annual estimates)</div>
              {[
                { label: 'Dental cleaning / scaling', sub: 'Kibble builds tartar 3× faster', badge: '₹3,000–8,000', pos: false },
                { label: 'Allergy vet visits', sub: 'Grain & preservative reactions common', badge: '₹2,000–6,000', pos: false },
                { label: 'Digestive medications', sub: 'IBD, loose stools, gas', badge: '₹1,500–4,000', pos: false },
                { label: 'Skin & coat supplements', sub: 'Omega-3 deficiency from ultra-processing', badge: '₹1,200–3,000', pos: false },
                { label: 'Fresh food hidden benefits', sub: 'Fewer vet visits, better digestion, longer life', badge: 'Save ₹7K–21K/yr', pos: true },
              ].map(({ label, sub, badge, pos }) => (
                <div className="cc-roi-row" key={label}>
                  <div className="cc-roi-left">
                    {label}
                    <span>{sub}</span>
                  </div>
                  <div className={`cc-roi-badge ${pos ? 'pos' : 'neg'}`}>{badge}</div>
                </div>
              ))}
            </div>

            {/* WA CTA */}
            <div className="cc-wa-cta">
              <div className="cc-wa-cta-text">
                <h3>Try fresh for ₹99</h3>
                <p>One sample meal delivered to your door. No subscription needed.</p>
              </div>
              <button className="cc-wa-cta-btn" onClick={bookSample}>📲 Book Now</button>
            </div>

            <button className="cc-btn-reset" onClick={reset}>↩ Recalculate</button>
          </div>
        )}
      </div>

      <Footer openModal={() => { }} openTool={openTool} />
    </>
  );
}
