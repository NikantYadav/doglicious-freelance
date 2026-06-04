import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';


import { logoImg } from '../data/homeData';
import SiteHeader from '../components/shared/SiteHeader';
import SiteFooter from '../components/shared/SiteFooter';
import { useSEO } from '../hooks/useSEO';
import '../styles/Home.css';
import '../styles/NaturalHealing.css';
import SampleModal from '../components/modals/SampleModal';
import { GRAM_OPTS, GRAM_PRICES, RECIPES } from '../data/homeData';
import { normalizePhone } from '../utils/phone';
import { initiatePayU } from '../services/sampleBooking';
import { useToast } from '../components/common/Toast';
import LoadingOverlay from '../components/common/LoadingOverlay';

export default function NaturalHealing() {
  useSEO({
    title: 'Natural Healing for Dogs | Free Tool',
    description: "Evidence-based natural remedies for common dog health issues.",
    path: '/tools/natural-healing'
  });

  const navigate = useNavigate();
  const { toast } = useToast();

  // Sample booking state
  const [sampleModalOpen, setSampleModalOpen] = useState(false);
  const [sampleStep, setSampleStep] = useState(1);
  const [selectedRecipe, setSelectedRecipe] = useState(0);
  const [selectedGramIdx, setSelectedGramIdx] = useState(0);
  const [dogName, setDogName] = useState('');
  const [mobile, setMobile] = useState('');
  const [mobileValid, setMobileValid] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryCity, setDeliveryCity] = useState('');
  const [deliveryPin, setDeliveryPin] = useState('');
  const [mapSrc, setMapSrc] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentConfirm, setPaymentConfirm] = useState(null); // { success, txnid, amount }

  // Detect PayU redirect back to this page
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const status = params.get('payu_status');
    if (!status) return;
    // Clean URL immediately
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
    if (!mobile || !dogName || !deliveryAddress || !deliveryCity || !deliveryPin) {
      toast('Please fill all fields before proceeding.', 'error');
      return;
    }

    const recipe = RECIPES[selectedRecipe];
    const grams = GRAM_OPTS[selectedGramIdx];
    const price = GRAM_PRICES[selectedGramIdx];

    try {
      setIsProcessing(true);
      setSampleModalOpen(false);

      // Initiate PayU (which also creates the PENDING record in db)
      await initiatePayU({ dogName, phone: normalizePhone(mobile), price, recipe, grams, address: deliveryAddress, city: deliveryCity, pincode: deliveryPin });

      // Note: Page will navigate away due to form.submit() in initiatePayU
    } catch (err) {
      setIsProcessing(false);
      console.error('[PayU] initiation failed:', err);
      toast('Payment could not be initiated. Please try again.', 'error');
    }
  };

  const currentPrice = GRAM_PRICES[selectedGramIdx];
  const currentGrams = GRAM_OPTS[selectedGramIdx];

  return (
    <>
      <SiteHeader />

      {/* Breadcrumb */}
      <div className="nh-breadcrumb">
        <div className="nh-mx">
          <a href="/">Home</a><span>›</span>
          <span>Tools</span><span>›</span>
          <span>Natural Healing Guide</span>
        </div>
      </div>

      {/* Hero */}
      <div className="nh-page-hero">
        <h1>Heal Your Dog <em>Naturally</em></h1>
        <p>
          Holistic, nutrition-based remedies for common dog health issues. From skin
          problems to digestive issues — food is medicine.
        </p>
      </div>

      {/* Content */}
      <section className="nh-content">
        <div className="nh-mx">

          <p>
            Many common dog health issues — itching, poor digestion, low energy, dull
            coat — can be dramatically improved through nutrition. Before reaching for
            medications, consider these <strong>natural remedies for dogs</strong> that
            start in the food bowl. Not sure if your dog has a health issue?{' '}
            <button className="nh-link-btn" onClick={() => openTool(7)}>
              Take our free dog health quiz
            </button>{' '}
            first.
          </p>

          <h2>🌿 Turmeric for Dogs: Nature's Anti-Inflammatory</h2>
          <p>
            Turmeric contains curcumin, a powerful natural anti-inflammatory. It helps
            with joint pain, arthritis, and can reduce swelling. Add 1/4 tsp per 10kg
            of body weight to your dog's meal. Always pair with black pepper and a fat
            source (like coconut oil) for absorption.
          </p>
          <p>
            Turmeric works best in{' '}
            <button className="nh-link-btn" onClick={() => openTool(6)}>
              balanced homemade meals
            </button>{' '}
            where you control every ingredient.
          </p>

          <h2>🥥 Coconut Oil for Skin &amp; Coat</h2>
          <p>
            Virgin coconut oil is a powerful holistic remedy for dogs with dry skin,
            dandruff, or dull coats. Start with 1/4 tsp per 5kg of body weight and
            gradually increase. It can also be applied topically to dry patches.
          </p>

          <h2>🦠 Gut Health &amp; Probiotics</h2>
          <p>
            A healthy gut is the foundation of overall dog wellness. Signs of poor gut
            health include gas, loose stools, and bad breath. Natural probiotics for
            dogs include plain curd/yogurt (no sugar), fermented vegetables, and pumpkin
            (a natural prebiotic).
          </p>
          <p>
            Check how much probiotic-rich food to include using our{' '}
            <button className="nh-link-btn" onClick={() => openTool(1)}>
              dog feeding calculator
            </button>{' '}
            — portions matter even with supplements.
          </p>

          <h2>🐾 Natural Remedies by Condition</h2>

          <h3>Itchy Skin &amp; Allergies</h3>
          <ul>
            <li>Omega-3 rich fish oil (anti-inflammatory)</li>
            <li>Oatmeal baths for immediate relief</li>
            <li>Eliminate common allergens (wheat, corn, soy) — try gluten-free fresh dog food</li>
            <li>
              Add{' '}
              <button className="nh-link-btn" onClick={() => openTool(4)}>
                anti-inflammatory vegetables
              </button>{' '}
              like sweet potato and broccoli
            </li>
          </ul>

          <h3>Digestive Issues</h3>
          <ul>
            <li>Pumpkin puree (2 tbsp per meal) — soothes stomach</li>
            <li>Bone broth — heals gut lining</li>
            <li>Small, frequent meals instead of large portions</li>
            <li>Switch from kibble to fresh food — easier to digest</li>
          </ul>

          <h3>Low Energy &amp; Lethargy</h3>
          <ul>
            <li>Iron-rich proteins (beef liver in small amounts)</li>
            <li>B-vitamin supplementation</li>
            <li>
              Ensure adequate calorie intake —{' '}
              <button className="nh-link-btn" onClick={() => openTool(1)}>
                check with our calculator
              </button>
            </li>
            <li>Rule out underlying conditions with your vet</li>
          </ul>

          <h3>Joint Pain &amp; Arthritis</h3>
          <ul>
            <li>Turmeric + black pepper daily</li>
            <li>Glucosamine-rich bone broth</li>
            <li>Omega-3 fatty acids from fish</li>
            <li>Weight management — extra weight worsens joint pain</li>
          </ul>

          <div className="nh-tip-card">
            <strong>⚠️ When to See a Vet</strong>
            <p>
              Natural remedies complement — never replace — veterinary care. If symptoms
              persist beyond 2 weeks, or if your dog shows sudden weight loss, blood in
              stool, or severe lethargy, consult your vet immediately.
            </p>
          </div>

          {/* CTA Box */}
          <div className="nh-cta-box">
            <h3>Fresh Food Is the Best Natural Medicine</h3>
            <p>
              Dogs fed fresh, whole-ingredient meals show improvement in skin, energy,
              and digestion within weeks.
            </p>
            <button className="nh-cta-btn" onClick={() => setSampleModalOpen(true)}>
              Order Fresh Dog Food Delivered — ₹99 Sample
            </button>
          </div>

        </div>
      </section>

      {/* Tools Section */}
      <section className="nh-tools-section">
        <h2>🛠️ Essential Tools &amp; Guides</h2>
        <p className="nh-ts-sub">Free tools to help your dog live a healthier, happier life</p>
        <div className="nh-tools-grid">
          {[
            { emoji: '🍳', title: 'AAFCO Meal Planner', desc: 'Complete recipes meeting US nutrition standards', tool: 6 },
            { emoji: '🍽️', title: 'How Much Should I Feed My Dog?', desc: 'Personalised portions by breed, age & weight', tool: 1 },
            { emoji: '🐾', title: "Check Your Dog's Health Score", desc: "Quick quiz to assess your dog's wellness", tool: 7 },
            { emoji: '🌿', title: 'Heal Your Dog Naturally', desc: 'Holistic remedies & nutrition-based healing', tool: 5 },
          ].map(({ emoji, title, desc, tool }) => (
            <button
              key={title}
              className="nh-tool-card"
              onClick={() => openTool(tool)}
            >
              <div className="nh-tc-emoji">{emoji}</div>
              <div className="nh-tc-info">
                <h4>{title}</h4>
                <p>{desc}</p>
              </div>
              <span className="nh-tc-arrow">→</span>
            </button>
          ))}
        </div>
      </section>

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
        dogName={dogName}
        setDogName={setDogName}
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
                {/* Success header */}
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
                      <span style={{ fontSize: '13px', fontWeight: 800, color: '#3A2700' }}>₹99</span>
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
                {/* Failure header */}
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