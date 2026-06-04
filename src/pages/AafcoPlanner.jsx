import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';


import { logoImg } from '../data/homeData';
import SiteHeader from '../components/shared/SiteHeader';
import SiteFooter from '../components/shared/SiteFooter';
import { useSEO } from '../hooks/useSEO';
import '../styles/Home.css';
import '../styles/AafcoPlanner.css';
import SampleModal from '../components/modals/SampleModal';
import { GRAM_OPTS, GRAM_PRICES, RECIPES } from '../data/homeData';
import { normalizePhone } from '../utils/phone';
import { initiatePayU } from '../services/sampleBooking';
import { useToast } from '../components/common/Toast';
import LoadingOverlay from '../components/common/LoadingOverlay';

export default function AafcoPlanner() {
  useSEO({
    title: 'AAFCO Dog Meal Planner | Free Tool',
    description: "Plan balanced homemade meals meeting AAFCO standards.",
    path: '/tools/aafco-planner'
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

  useEffect(() => {
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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
      <div className="aafco-breadcrumb">
        <div className="aafco-mx">
          <a href="/">Home</a>
          <span>›</span>
          <span>Tools</span>
          <span>›</span>
          <span>AAFCO Meal Planner</span>
        </div>
      </div>

      {/* Hero */}
      <div className="aafco-page-hero">
        <h1>
          How to Cook <em>AAFCO-Balanced</em> Dog Food at Home
        </h1>
        <p>
          Complete recipes that meet US nutrition standards — so you can prepare
          vet-approved, human-grade meals for your dog in your own kitchen.
        </p>
      </div>

      {/* Main Content */}
      <section className="aafco-content">
        <div className="aafco-mx">

          <p>
            If you want to prepare fresh dog food instead of kibble, the most important
            thing is nutritional balance. AAFCO (Association of American Feed Control
            Officials) sets the gold standard for pet nutrition worldwide — and every
            recipe here meets those requirements.
          </p>

          <h2>What Are AAFCO Standards?</h2>
          <p>
            AAFCO establishes minimum and maximum nutrient profiles for dogs at different
            life stages. A balanced homemade dog food must contain the right ratios of
            protein, fat, carbohydrates, vitamins, and minerals. Without proper balance,
            home-cooked meals can cause deficiencies over time.
          </p>
          <p>
            Understanding these standards is crucial whether you're feeding a dog with
            health issues that needs a healing diet or simply want to provide the freshest
            nutrition possible.
          </p>

          <div className="aafco-tip-card">
            <strong>💡 Pro Tip</strong>
            <p>
              Not sure how much food your dog needs? Use our free{' '}
              <button className="aafco-link-btn" onClick={() => openTool(1)}>
                dog feeding calculator
              </button>{' '}
              to find the right daily portion based on breed, age, and activity level.
            </p>
          </div>

          {/* Recipe 1 */}
          <h2>AAFCO-Balanced Chicken &amp; Brown Rice Recipe</h2>
          <h3>Ingredients (for a 20kg adult dog, daily portion)</h3>
          <ul>
            <li>250g boneless chicken breast (human-grade protein source)</li>
            <li>120g cooked brown rice</li>
            <li>80g mixed vegetables safe for dogs (carrots, green beans, peas)</li>
            <li>1 tbsp sunflower oil (essential fatty acids)</li>
            <li>¼ tsp calcium carbonate supplement</li>
            <li>Dog-specific multivitamin (as per vet recommendation)</li>
          </ul>
          <h3>Instructions</h3>
          <ol>
            <li>Boil chicken breast until fully cooked (no pink inside). Shred into small pieces.</li>
            <li>Cook brown rice according to package instructions until soft.</li>
            <li>Steam vegetables until tender but not mushy — retains more nutrients.</li>
            <li>Combine all ingredients in a bowl. Add sunflower oil and supplements.</li>
            <li>Mix thoroughly. Let cool before serving.</li>
            <li>Store unused portions in the refrigerator for up to 3 days.</li>
          </ol>

          {/* Recipe 2 */}
          <h2>AAFCO-Balanced Fish &amp; Sweet Potato Recipe</h2>
          <p>
            This omega-rich recipe is especially beneficial for dogs with skin issues or
            senior dogs needing joint support.
          </p>
          <ul>
            <li>200g boneless fish (salmon or sardines)</li>
            <li>150g mashed sweet potato</li>
            <li>60g steamed broccoli and spinach</li>
            <li>1 tbsp coconut oil</li>
            <li>Calcium and vitamin supplements as directed</li>
          </ul>

          {/* Recipe 3 */}
          <h2>AAFCO-Balanced Egg &amp; Paneer Bowl (Vegetarian)</h2>
          <p>
            A vegetarian option that still meets protein requirements. Many Indian dog
            parents ask <strong>can dogs eat paneer</strong> — and yes, in moderate
            amounts, paneer is an excellent protein source for dogs.
          </p>
          <ul>
            <li>2 whole eggs (scrambled, no oil)</li>
            <li>100g crumbled paneer</li>
            <li>100g cooked white rice</li>
            <li>80g mixed vegetables</li>
            <li>Supplements as directed by your vet</li>
          </ul>

          {/* CTA Box */}
          <div className="aafco-cta-box">
            <h3>Too Busy to Cook? Let Us Do It!</h3>
            <p>
              Doglicious prepares fresh, AAFCO-inspired meals daily and delivers them
              chilled across India.
            </p>
            <button className="aafco-cta-btn" onClick={() => setSampleModalOpen(true)}>
              Order Fresh Dog Food Online — ₹99 Sample
            </button>
          </div>

          {/* Key Nutrients */}
          <h2>Key Nutrients Every Homemade Meal Needs</h2>
          <div className="aafco-ingredient-grid">
            {[
              { emoji: '🥩', name: 'Protein', desc: 'Min 18% for adults' },
              { emoji: '🧈', name: 'Fat', desc: 'Min 5.5% for adults' },
              { emoji: '🦴', name: 'Calcium', desc: '0.5–1.8% range' },
              { emoji: '🔬', name: 'Phosphorus', desc: '0.4–1.6% range' },
              { emoji: '🧬', name: 'Vitamins A, D, E', desc: 'Essential daily' },
              { emoji: '🐟', name: 'Omega-3 & 6', desc: 'Skin & coat health' },
              { emoji: '💊', name: 'Zinc & Iron', desc: 'Immune support' },
              { emoji: '🥕', name: 'Fiber', desc: 'Digestive health' },
            ].map(({ emoji, name, desc }) => (
              <div className="aafco-ing-card" key={name}>
                <div className="aafco-ing-emoji">{emoji}</div>
                <h4>{name}</h4>
                <p>{desc}</p>
              </div>
            ))}
          </div>

          {/* Common Mistakes */}
          <h2>Common Mistakes to Avoid</h2>
          <ul>
            <li>
              <strong>No supplements:</strong> Home-cooked food without supplements will
              always be deficient. Always add a vet-recommended multivitamin.
            </li>
            <li>
              <strong>Too much liver:</strong> Liver is nutritious but excessive amounts
              cause Vitamin A toxicity.
            </li>
            <li>
              <strong>Garlic &amp; onion:</strong> These are toxic to dogs. Check our
              complete guide to safe vegetables for dogs.
            </li>
            <li>
              <strong>Incorrect calcium:</strong> Without added calcium, homemade diets
              are almost always calcium-deficient.
            </li>
          </ul>

          <p>
            If your dog has specific health concerns, our{' '}
            <button className="aafco-link-btn" onClick={() => openTool(7)}>
              free dog health quiz
            </button>{' '}
            can help identify issues that nutrition can address.
          </p>


        </div>
      </section>

      {/* Tools Section */}
      <section className="aafco-tools-section">
        <h2>🛠️ Essential Tools &amp; Guides</h2>
        <p className="aafco-ts-sub">Free tools to help your dog live a healthier, happier life</p>
        <div className="aafco-tools-grid">
          {[
            { emoji: '🍳', title: 'AAFCO Meal Planner', desc: 'Complete recipes meeting US nutrition standards', tool: 6 },
            { emoji: '🍽️', title: 'How Much Should I Feed My Dog?', desc: 'Personalised portions by breed, age & weight', tool: 1 },
            { emoji: '🐾', title: "Check Your Dog's Health Score", desc: "Quick quiz to assess your dog's wellness", tool: 7 },
            { emoji: '🌿', title: 'Heal Your Dog Naturally', desc: 'Holistic remedies & nutrition-based healing', tool: 5 },
          ].map(({ emoji, title, desc, tool }) => (
            <button
              key={title}
              className="aafco-tool-card"
              onClick={() => openTool(tool)}
            >
              <div className="aafco-tc-emoji">{emoji}</div>
              <div className="aafco-tc-info">
                <h4>{title}</h4>
                <p>{desc}</p>
              </div>
              <span className="aafco-tc-arrow">→</span>
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
