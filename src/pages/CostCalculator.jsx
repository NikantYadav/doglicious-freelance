import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';


import { logoImg, GRAM_OPTS, GRAM_PRICES, RECIPES } from '../data/homeData';
import SiteHeader from '../components/shared/SiteHeader';
import SiteFooter from '../components/shared/SiteFooter';
import { useSEO } from '../hooks/useSEO';
import { normalizePhone } from '../utils/phone';
import { pushLead } from '../services/wylto';
import '../styles/Home.css';
import '../styles/CostCalculator.css';
import { downloadCostPdf } from '../utils/toolsPdfGenerator';
import SampleModal from '../components/modals/SampleModal';
import { initiatePayU } from '../services/sampleBooking';
import { useToast } from '../components/common/Toast';
import LoadingOverlay from '../components/common/LoadingOverlay';

const BRANDS = ['Pedigree', 'Royal Canin', 'Drools', 'Farmina', 'Acana', 'Other'];

const fmt = (n) => '₹' + Math.round(n).toLocaleString('en-IN');

export default function CostCalculator() {
  useSEO({
    title: 'Dog Food Cost Calculator | Free Tool',
    description: "Compare the real cost of fresh food vs kibble.",
    path: '/tools/cost-calculator'
  });

  const navigate = useNavigate();

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

  // Detect PayU redirect back to this page
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const status = params.get('payu_status');
    if (!status) return;
    window.history.replaceState({}, '', window.location.pathname);
    if (status === 'payment_success') {
      setPaymentConfirm({ success: true, txnid: params.get('txnid') || '', amount: params.get('amount') || '99' });
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

  const bookSample = () => setSampleModalOpen(true);

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

  return (
    <>
      <SiteHeader />

      {/* Header */}
      <div className="cc-header">
        <div className="cc-header-tag">💰 Cost Calculator</div>
        <h1>Kibble vs <em>Fresh Food</em><br />What are you really paying?</h1>
        <p>Enter your current dog food details and see the true daily, monthly and yearly comparison.</p>
      </div>

      <div className="cc-wrap">

        {/* ── DISCLAIMER BEFORE TOOL ── */}
        {!result && (
          <div style={{ background: '#FEF5E4', border: '1px solid #E5D4B0', borderRadius: '12px', padding: '16px 20px', marginBottom: '24px' }}>
            <p style={{ fontSize: '13px', color: '#5C3F18', lineHeight: 1.6, margin: 0 }}>
              <strong>⚠️ Disclaimer:</strong> Please consult your veterinarian before starting any treatment, supplement, or medication, or making changes to your pet's diet, exercise, or lifestyle. Individual health needs may vary.
            </p>
          </div>
        )}

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

            {/* Book Sample CTA */}
            <div className="cc-wa-cta">
              <div className="cc-wa-cta-text">
                <h3>Try fresh for ₹99</h3>
                <p>One sample meal delivered to your door. No subscription needed.</p>
              </div>
              <button className="cc-wa-cta-btn" onClick={bookSample}>🛒 Book Now</button>
            </div>

            <button className="cc-btn-reset" onClick={reset}>↩ Recalculate</button>
            <button
              className="cc-btn-reset"
              style={{ background: '#1A7A45', color: '#fff', borderColor: '#1A7A45', marginTop: '8px' }}
              onClick={() => downloadCostPdf(result)}
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
        )}
      </div>

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
