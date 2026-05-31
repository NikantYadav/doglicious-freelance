import { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSEO } from '../hooks/useSEO';
import '../styles/Home.css';

import { logoImg, RECIPES, GRAM_OPTS, GRAM_PRICES } from '../data/homeData';
import { normalizePhone } from '../utils/phone';
import { initiatePayU } from '../services/sampleBooking';
import { getScrollLockDebugState, lockScroll, unlockScroll } from '../utils/scrollLock';

const HomeBlogSection = lazy(() => import('../components/HomeBlogSection'));
const VetRxModal = lazy(() => import('../components/modals/VetRxModal'));
const SampleModal = lazy(() => import('../components/modals/SampleModal'));
const PaymentModal = lazy(() => import('../components/modals/PaymentModal'));
const ConfirmModal = lazy(() => import('../components/modals/ConfirmModal'));
const ToolsModal = lazy(() => import('../components/modals/ToolsModal'));
const QuizModal = lazy(() => import('../components/modals/QuizModal'));
import { useToast } from '../components/common/Toast';
import LoadingOverlay from '../components/common/LoadingOverlay';
const TestimonialsModal = lazy(() => import('../components/modals/TestimonialsModal'));

export default function Home() {
  const navigate = useNavigate();
  const [navScrolled, setNavScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeModal, setActiveModal] = useState(null);
  const [faqOpen, setFaqOpen] = useState(null);
  const [testimonialsOpen, setTestimonialsOpen] = useState(false);

  // Sample flow
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
  const [orderDetails, setOrderDetails] = useState({});
  const [activeTool, setActiveTool] = useState(0);
  const [quizStep, setQuizStep] = useState(0);
  const [quizName, setQuizName] = useState('');
  const [quizAnswers, setQuizAnswers] = useState({});
  const [paymentConfirm, setPaymentConfirm] = useState(null); // { status, txnid, amount }
  const [isProcessing, setIsProcessing] = useState(false);
  const [debugInfo, setDebugInfo] = useState(null);
  const { toast } = useToast();
  const debugScrollEnabled = new URLSearchParams(window.location.search).has('debugScroll');

  useSEO({
    title: 'Doglicious.in — Fresh Food & AI Analysis for Dogs',
    description: "Vet-approved, internationally acclaimed fresh dog food. Book a sample for ₹99. AI Dog Analysis — Vet Rx Scan + Poop Analyser. Free. Gurugram & Delhi NCR.",
    canonical: 'https://doglicious.in/'
  });

  const openModal = (id) => { setActiveModal(id); lockScroll(); };
  const closeModal = () => { setActiveModal(null); unlockScroll(); };

  useEffect(() => {
    const onScroll = () => setNavScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!debugScrollEnabled) return;

    const describeElement = (el) => {
      if (!el) return 'none';
      const tag = el.tagName?.toLowerCase?.() || 'unknown';
      const className = typeof el.className === 'string' ? el.className.trim().replace(/\s+/g, ' ') : '';
      return className ? `${tag}.${className}` : tag;
    };

    const updateDebugInfo = () => {
      const bodyStyle = document.body.style;
      const computedBody = window.getComputedStyle(document.body);
      const computedHtml = window.getComputedStyle(document.documentElement);
      const scrollLockState = getScrollLockDebugState();
      const centerX = Math.max(0, Math.round(window.innerWidth / 2));
      const centerY = Math.max(0, Math.round(window.innerHeight / 2));
      const lowerY = Math.max(0, Math.round(window.innerHeight * 0.78));

      setDebugInfo({
        bodyCssText: bodyStyle.cssText || '(empty)',
        bodyPosition: computedBody.position,
        bodyTop: computedBody.top,
        bodyOverflowY: computedBody.overflowY,
        htmlOverflowY: computedHtml.overflowY,
        scrollY: String(window.scrollY),
        innerHeight: String(window.innerHeight),
        visualViewportHeight: String(window.visualViewport?.height || ''),
        mobileMenuOpen: String(mobileMenuOpen),
        activeModal: String(activeModal),
        testimonialsOpen: String(testimonialsOpen),
        lockCount: String(scrollLockState.lockCount),
        savedScrollY: String(scrollLockState.savedScrollY),
        centerProbe: describeElement(document.elementFromPoint(centerX, centerY)),
        lowerProbe: describeElement(document.elementFromPoint(centerX, lowerY)),
      });
    };

    updateDebugInfo();
    const timer = window.setInterval(updateDebugInfo, 500);
    window.addEventListener('scroll', updateDebugInfo, { passive: true });
    window.addEventListener('resize', updateDebugInfo);
    window.visualViewport?.addEventListener('resize', updateDebugInfo);

    return () => {
      window.clearInterval(timer);
      window.removeEventListener('scroll', updateDebugInfo);
      window.removeEventListener('resize', updateDebugInfo);
      window.visualViewport?.removeEventListener('resize', updateDebugInfo);
    };
  }, [debugScrollEnabled, mobileMenuOpen, activeModal, testimonialsOpen]);

  // Detect PayU redirect back to homepage
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
    const onKey = (e) => { if (e.key === 'Escape') closeModal(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    return () => unlockScroll();
  }, []);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    lockScroll();
    return () => unlockScroll();
  }, [mobileMenuOpen]);

  useEffect(() => {
    const els = document.querySelectorAll('.rv, .sg');
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((entry) => {
        if (entry.isIntersecting) { entry.target.classList.add('in'); obs.unobserve(entry.target); }
      }),
      { threshold: 0.08, rootMargin: '0px 0px -20px 0px' }
    );
    els.forEach((el) => obs.observe(el));
    const outerTimer = setTimeout(() => {
      const heroEls = document.querySelectorAll('.hero .rv');
      heroEls.forEach((el, i) => {
        setTimeout(() => { el.style.opacity = '1'; el.style.transform = 'none'; }, i * 90);
      });
    }, 60);
    return () => { obs.disconnect(); clearTimeout(outerTimer); };
  }, []);

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
      closeModal();

      // Initiate PayU (which also creates the PENDING record in db)
      await initiatePayU({ dogName, phone: normalizePhone(mobile), price, recipe, grams, address: deliveryAddress, city: deliveryCity, pincode: deliveryPin });

      // Note: Page will navigate away due to form.submit() in initiatePayU
    } catch (err) {
      setIsProcessing(false);
      console.error('[PayU] initiation failed:', err);
      toast('Payment could not be initiated. Please try again.', 'error');
    }
  };

  const openTool = (idx) => {
    if (idx === 0) { navigate('/tools/bmi-calculator'); return; }
    if (idx === 1) { navigate('/tools/feeding-calculator'); return; }
    if (idx === 2) { navigate('/tools/cost-calculator'); return; }
    if (idx === 3) { navigate('/tools/age-calculator'); return; }
    if (idx === 4) { navigate('/tools/best-vegetables'); return; }
    if (idx === 5) { navigate('/tools/natural-healing'); return; }
    if (idx === 6) { navigate('/tools/aafco-planner'); return; }
    if (idx === 7) { navigate('/tools/health-quiz'); return; }
    setActiveTool(idx); openModal('tools');
  };

  const toggleFaq = (i) => setFaqOpen(faqOpen === i ? null : i);

  const currentPrice = GRAM_PRICES[selectedGramIdx];
  const currentGrams = GRAM_OPTS[selectedGramIdx];

  return (
    <>
      {isProcessing && <LoadingOverlay />}
      {/* ── STICKY HEADER ── */}
      <div className="site-header">
        {/* TICKER */}
        <div className="ticker">
          <span className="ticker-t">
            🐾 Vet Approved &amp; Internationally Acclaimed &nbsp;·&nbsp; Free same-day delivery · Gurugram &amp; Delhi NCR &nbsp;·&nbsp; Freshly cooked every morning &nbsp;·&nbsp; NABL certified every batch &nbsp;·&nbsp; Book a sample for ₹99 — no subscription &nbsp;·&nbsp; 5,00,000 meals served since 2020 &nbsp;·&nbsp; Zero preservatives · Zero fillers &nbsp;·&nbsp; AI-Powered Dog Analysis — Free &nbsp;·&nbsp;&nbsp; 🐾 Vet Approved &amp; Internationally Acclaimed
          </span>
        </div>
        {/* NAV */}
        <nav className={`nav${navScrolled ? ' s' : ''}`} id="nav">
          <div className="nav-in">
            <Link to="/" className="nav-logo">
              <img src={logoImg} alt="Doglicious.in" style={{ height: '44px', width: 'auto', mixBlendMode: 'multiply', display: 'block' }} />
            </Link>
            <ul className="nav-links">
              <li><a href="#book">Book Sample</a></li>
              <li><a href="#recipes">Recipes</a></li>
              <li>
                <button>AI Analysis <span className="nav-caret">▾</span></button>
                <div className="dd-menu">
                  <div className="dd-item" onClick={() => openModal('vet')}>
                    <div className="dd-icon">🔬</div>
                    <div><div style={{ fontWeight: 700 }}>Vet Rx Scan</div><div className="dd-sub">Upload photo · describe symptoms — Free</div></div>
                  </div>
                  <div className="dd-item" onClick={() => { navigate('/poopsense'); }}>
                    <div className="dd-icon">💩</div>
                    <div><div style={{ fontWeight: 700 }}>PoopSense AI</div><div className="dd-sub">Stool health AI analysis — Free</div></div>
                  </div>
                </div>
              </li>
              <li>
                <button>Free Tools <span className="nav-caret">▾</span></button>
                <div className="dd-menu" style={{ minWidth: '260px', right: 0, left: 'auto' }}>
                  {[['⚖️', 'Dog BMI Calculator', 'Is your dog at a healthy weight?', 0], ['🍽️', 'Feeding Calculator', 'How much should your dog eat?', 1], ['💰', 'Cost Calculator', 'Fresh vs kibble — real comparison', 2], ['📅', 'Age Calculator', 'Dog age in human years', 3]].map(([ic, n, s, idx]) => (
                    <div key={n} className="dd-item" onClick={() => openTool(idx)}><div className="dd-icon">{ic}</div><div><div>{n}</div><div className="dd-sub">{s}</div></div></div>
                  ))}
                  <div className="dd-sep" />
                  {[['🥦', 'Safe Vegetables Guide', 'What\'s safe for your dog?', 4], ['💊', 'Natural Healing Guide', 'Vet-reviewed remedies', 5], ['📋', 'AAFCO Meal Planner', 'Build a balanced meal plan', 6], ['🧠', 'Dog Health Quiz', 'Get your dog\'s health score', 7]].map(([ic, n, s, idx]) => (
                    <div key={n} className="dd-item" onClick={() => openTool(idx)}><div className="dd-icon">{ic}</div><div><div>{n}</div><div className="dd-sub">{s}</div></div></div>
                  ))}
                </div>
              </li>
              <li><a href="#faq">FAQs</a></li>
              <li><button onClick={() => setTestimonialsOpen(true)}>WHY CUSTOMERS CHOOSE US?</button></li>
            </ul>
            <div className="nav-r">
              <button className="btn-nav-cta" onClick={() => openModal('sample')}>
                <span style={{ fontSize: '13px', fontWeight: 800, letterSpacing: '.01em' }}>Upgrade Now! 🚀</span>
                <span style={{ fontSize: '10px', fontWeight: 600, opacity: .80, marginTop: '1px' }}>Book a Sample for ₹99</span>
              </button>
              <button className={`hbg${mobileMenuOpen ? ' o' : ''}`} onClick={() => setMobileMenuOpen(p => !p)}>
                <span /><span /><span />
              </button>
            </div>
          </div>
        </nav>
      </div>

      {/* MOBILE DRAWER */}
      <div className={`mob-drawer${mobileMenuOpen ? ' o' : ''}`}>
        <a href="#book" onClick={() => setMobileMenuOpen(false)}>Book ₹99 Sample</a>
        <a href="#recipes" onClick={() => setMobileMenuOpen(false)}>Recipes</a>
        <span className="mob-section">AI Analysis</span>
        <button onClick={() => { setMobileMenuOpen(false); openModal('vet'); }}>🔬 Vet Rx Scan — Free</button>
        <button onClick={() => { setMobileMenuOpen(false); navigate('/poopsense'); }}>💩 PoopSense AI — Free</button>
        <span className="mob-section">Free Tools</span>
        <button onClick={() => { setMobileMenuOpen(false); openTool(0); }}>⚖️ BMI · 🍽️ Feeding · 💰 Cost</button>
        <button onClick={() => { setMobileMenuOpen(false); openTool(3); }}>📅 Age · 🥦 Vegetables · 🧠 Quiz</button>
        <span className="mob-section">Questions &amp; Answers</span>
        <a href="#faq" onClick={() => setMobileMenuOpen(false)}>See all FAQs →</a>
        <button onClick={() => { setMobileMenuOpen(false); setTestimonialsOpen(true); }}>WHY CUSTOMERS CHOOSE US?</button>
        <button onClick={() => { setMobileMenuOpen(false); openModal('sample'); }}>Book a Sample for ₹99 →</button>
      </div>

      {/* ── HERO ── */}
      <section className="hero" id="home" style={{ padding: 0 }}>
        <div className="w" style={{ paddingTop: 0, paddingBottom: 0 }}>
          <div className="hero-grid">
            <div className="hero-content rv">
              <div className="hero-label"><span className="hero-dot" />&nbsp;India's First AI Dog Nutrition &amp; Analysis Platform · Estd. 2020</div>
              <h1 className="hero-h1">Fresh food &amp;<br />AI care for your<br /><em>dog. 🐾</em></h1>
              <p className="hero-tagline">Different Dog. <span>Different Food.</span></p>
              <p className="hero-sub"><strong>Vet-approved &amp; internationally acclaimed.</strong> Freshly cooked every morning, delivered same day. Free AI health analysis for every dog.</p>
              <div className="hero-cards">
                <button className="hcard hcard-a" onClick={() => openModal('sample')}>
                  <div className="hcard-glow" />
                  <span className="hcard-icon">🍗</span>
                  <div className="hcard-over">AI-Driven</div>
                  <div className="hcard-title">Personalised Nutrition, Cooked Fresh.</div>
                  <div className="hcard-desc">Vet-approved · Internationally acclaimed · Fresh food cooked daily &amp; delivered</div>
                  <div className="hcard-badge">Try a sample · <strong>₹99</strong></div>
                  <span className="hcard-arr">→</span>
                </button>
                <button className="hcard hcard-b" onClick={() => navigate('/poopsense')}>
                  <div className="hcard-glow" />
                  <span className="hcard-icon">🔍</span>
                  <div className="hcard-over">AI-Driven</div>
                  <div className="hcard-title">Scan → Diagnose → Feed Right.</div>
                  <div className="hcard-desc">AI-powered health &amp; nutrition analysis for your dog</div>
                  <div className="hcard-badge">Free · First scan complimentary</div>
                  <span className="hcard-arr">→</span>
                </button>
              </div>
              <div className="trust-chips">
                {['Vet Approved', 'Internationally Acclaimed', 'NABL Certified', 'AAFCO Aligned', 'Zero Preservatives', '5L+ Meals Served'].map(c => <span key={c} className="chip">{c}</span>)}
              </div>
            </div>
            <div className="hero-image">
              <img src="/happy-dog.webp" srcSet="/happy-dog-720.webp 720w, /happy-dog.webp 900w" sizes="(max-width:768px) 720px, 900px" alt="Happy dog with fresh food" width="900" height="600" fetchpriority="high" />
              <div className="hero-pill">
                <div className="pill-dot" />
                <div>
                  <div className="pill-t">Freshly cooked today</div>
                  <div className="pill-s">Delivered same day · Free</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PROOF BAR ── */}
      <div className="proof">
        <div className="w">
          <div className="proof-inner">
            {['Vet Approved & Internationally Acclaimed', 'NABL Certified every batch', 'Free same-day delivery', '100% Money Back Guarantee. No question asked.'].map(t => (
              <div key={t} className="proof-i">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                {t}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── PATHS / HOW TO START ── */}
      <section id="book" style={{ background: 'var(--c3)', paddingTop: '96px', paddingBottom: '96px' }}>
        <div className="w">
          <div className="center rv" style={{ marginBottom: '56px' }}>
            <span className="sec-label">✦ Two products · One platform</span>
            <h2 className="sec-h">How would you like to start?</h2>
          </div>
          <div className="paths-grid">
            {/* Card A — Fresh Food */}
            <div className="path-card-a rv">
              <div className="pc-pill">AI-POWERED</div>
              <span className="pc-icon">🍗</span>
              <h3 className="pc-h">Personalised Nutrition, Cooked Fresh.</h3>
              <p className="pc-sub">Vet-approved · Internationally acclaimed · Fresh food cooked daily &amp; delivered</p>
              <div className="pc-items">
                <div className="pc-item" onClick={() => openModal('sample')}>
                  <span className="pc-item-em">🥩</span>
                  <div className="pc-item-body">
                    <div className="pc-item-name">6 Vet-Approved Recipes</div>
                    <span className="pc-item-badge badge-brown">FROM ₹99 PER 100G</span>
                    <div className="pc-item-desc">Chicken · Lamb · Bone Broth · Quinoa · Paneer · Liver — freshly cooked every morning.</div>
                  </div>
                </div>
                <div className="pc-item" onClick={() => openModal('sample')}>
                  <span className="pc-item-em">🚚</span>
                  <div className="pc-item-body">
                    <div className="pc-item-name">Free Same-Day Delivery</div>
                    <span className="pc-item-badge badge-brown">Gurugram &amp; DELHI NCR</span>
                    <div className="pc-item-desc">NABL certified · AAFCO aligned · 100% Money Back Guarantee. No question asked.</div>
                  </div>
                </div>
              </div>
              <button className="pc-btn-primary" onClick={() => openModal('sample')}>🛒 Upgrade Your Dog's Food – ₹99</button>
              <p className="pc-note">No lock-in · Free delivery · Fresh today</p>
            </div>
            {/* Card B — AI Analysis */}
            <div className="path-card-b rv">
              <div className="pc-pill">AI-DRIVEN <span className="pc-live-dot" /></div>
              <span className="pc-icon">🔍</span>
              <h3 className="pc-h">Scan → Diagnose → Feed Right.</h3>
              <p className="pc-sub">AI-powered health &amp; nutrition analysis for your dog</p>
              <div className="pc-free-pill">⚡ First 2 scans free · ₹99/mo after</div>
              <div className="pc-items">
                <div className="pc-item" onClick={() => openModal('vet')}>
                  <span className="pc-item-em">🔬</span>
                  <div className="pc-item-body">
                    <div className="pc-item-name">Vet Rx Scan</div>
                    <span className="pc-item-badge badge-teal">BE YOUR OWN VET</span>
                    <div className="pc-item-desc">Upload a photo, describe symptoms — get AI-powered health insights &amp; a customised meal plan.</div>
                    <div className="pc-item-cta cta-filled" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '1px', padding: '5px 12px' }}>
                      <span>Free · Launch now →</span><span style={{ fontSize: '9px', opacity: .75, fontWeight: 500 }}>First 2 scans free · ₹99/mo after</span>
                    </div>
                  </div>
                </div>
                <div className="pc-item" onClick={() => navigate('/poopsense')}>
                  <span className="pc-item-em">💩</span>
                  <div className="pc-item-body">
                    <div className="pc-item-name">PoopSense AI</div>
                    <span className="pc-item-badge badge-yellow">FREE</span>
                    <div className="pc-item-desc">Upload a stool photo — AI analyses gut health &amp; recommends the right dietary adjustments.</div>
                    <div className="pc-item-cta cta-outline">Launch PoopSense AI →</div>
                  </div>
                </div>
              </div>
              <button className="pc-btn-secondary" onClick={() => openModal('vet')}>🔍 Launch Vet Rx Scan — Free</button>
              <p className="pc-note">First 2 scans free · ₹99/month after · No sign-up</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── RECIPES ── */}
      <section id="recipes" style={{ background: 'var(--c1-05)', borderTop: '1px solid var(--sep)' }}>
        <div className="w">
          <div className="rv" style={{ marginBottom: '40px' }}>
            <span className="sec-label">All ₹99 to try</span>
            <h2 className="sec-h">6 vet-approved recipes. 🍽️</h2>
            <p className="sec-p" style={{ maxWidth: '480px' }}>Freshly cooked to order every morning. Click any to book your sample.</p>
          </div>
          <div className="recipes-grid sg">
            {[
              { badge: 'Bestseller', em: '🍗', name: 'Chicken & Pumpkin', desc: 'Gut-soothing pumpkin with lean chicken and brown rice. Perfect for sensitive tummies.' },
              { badge: 'Fan Favorite', em: '🍖', name: 'Tender Lamb in Gravy', desc: 'Slow-cooked lamb with organic carrots and millets. Rich, hearty, iron-packed.' },
              { badge: 'Joint Health', em: '🦴', name: 'Bone Broth Pour-Over', desc: 'Mineral-rich broth over chicken and sweet potato. Joint support in every bite.' },
              { badge: 'High Energy', em: '🥗', name: 'Chicken Quinoa Bowl', desc: 'High-protein wellness bowl with farm chicken and seasonal greens.' },
              { badge: 'Vegetarian', em: '🧀', name: 'Paneer & Farm Feast', desc: 'Fresh paneer with seasonal farm vegetables and brown rice. Calcium-rich.' },
              { badge: 'Superfood', em: '🫀', name: 'Healthy Liver Delite', desc: 'Chicken liver, pumpkin and millets. Naturally high in iron and Vitamin A.' },
            ].map((r, i) => (
              <div key={r.name} className="rc" onClick={() => { setSelectedRecipe(i); setSampleStep(1); openModal('sample'); }}>
                <div className="rc-badge">{r.badge}</div>
                <div className="rc-em">{r.em}</div>
                <div className="rc-n">{r.name}</div>
                <div className="rc-d">{r.desc}</div>
                <div className="rc-arrow">Book this recipe →</div>
              </div>
            ))}
          </div>
          <div className="center mt-32 rv">
            <button className="btn-primary" onClick={() => openModal('sample')}>Try any recipe — ₹99</button>
          </div>
        </div>
      </section>

      {/* ── FRESH FOOD SECTION ── */}
      <section style={{ background: 'var(--c3)' }}>
        <div className="w">
          <div className="fresh-grid">
            <div className="rv">
              <div className="fstats">
                {[['100%', 'Fresh whole-food ingredients'], ['0', 'Preservatives, ever'], ['3h', 'Kitchen to bowl'], ['5L+', 'Meals served since 2020']].map(([n, l]) => (
                  <div key={l} className="fstat"><div className="fstat-n">{n}</div><div className="fstat-l">{l}</div></div>
                ))}
              </div>
            </div>
            <div className="rv">
              <span className="sec-label">What is fresh dog food?</span>
              <h2 className="sec-h">Cooked daily.<br />Served daily. 🍳</h2>
              <p className="sec-p" style={{ marginBottom: '6px' }}>Real food, real ingredients — not kibble, not processed packs.</p>
              <div className="fresh-pts">
                {[
                  { ic: '🚫', t: 'Not kibble', d: 'Ultra-processed at 120°C+, destroying nutrients. Ours is gently cooked to preserve every vitamin.' },
                  { ic: '🚫', t: 'Not processed packs', d: 'No mystery shelf-life. Fresh food expires like real food — because it IS real food.' },
                  { ic: '✅', t: 'Real food, traceable ingredients', d: 'Whole proteins, organic vegetables, complex carbs. Every ingredient visible on the label.' },
                  { ic: '🏆', t: 'Vet Approved & Internationally Acclaimed', d: 'NABL lab-certified every batch. Recipes by internationally acclaimed veterinary nutritionists.' },
                ].map(fp => (
                  <div key={fp.t} className="fp">
                    <div className="fp-ic">{fp.ic}</div>
                    <div><div className="fp-t">{fp.t}</div><div className="fp-d">{fp.d}</div></div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: '24px' }}>
                <button className="btn-primary" onClick={() => openModal('sample')}>Try it for ₹99</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section style={{ background: 'var(--c1-05)', borderTop: '1px solid var(--sep)' }}>
        <div className="w">
          <div className="center rv" style={{ marginBottom: '52px' }}>
            <span className="sec-label">✦ Real stories</span>
            <h2 className="sec-h">Loved by dogs.<br />Trusted by parents.</h2>
          </div>
          <div className="testi-grid sg">
            <div className="tc">
              <div className="tc-stars">{[...Array(5)].map((_, i) => <div key={i} className="star" />)}</div>
              <p className="tc-q">"Bruno was on kibble for 3 years. Within 2 weeks — shinier coat, more energy, and he gets <strong>excited at meal time</strong>. Never happened before."</p>
              <div className="tc-by"><div className="tc-av">R</div><div><div className="tc-n">Ritu Sharma</div><div className="tc-d">Bruno · 4yr Labrador, Gurugram</div></div></div>
            </div>
            <div className="tc" style={{ marginTop: '28px' }}>
              <div className="tc-stars">{[...Array(5)].map((_, i) => <div key={i} className="star" />)}</div>
              <p className="tc-q">"Max had terrible skin issues. Doglicious customised his plan via the Vet Rx Scan. <strong>The change in 3 weeks was incredible.</strong>"</p>
              <div className="tc-by"><div className="tc-av tc-av-2">A</div><div><div className="tc-n">Aditya Kapoor</div><div className="tc-d">Max · 2yr Beagle, South Delhi</div></div></div>
            </div>
            <div className="tc">
              <div className="tc-stars">{[...Array(5)].map((_, i) => <div key={i} className="star" />)}</div>
              <p className="tc-q">"The ₹99 sample changed my mind instantly. Zeus ate it in seconds. <strong>He has never done that with any food.</strong>"</p>
              <div className="tc-by"><div className="tc-av tc-av-3">P</div><div><div className="tc-n">Priya Malhotra</div><div className="tc-d">Zeus · 6yr German Shepherd, Noida</div></div></div>
            </div>
          </div>
        </div>
      </section>

      {/* ── BLOG ── */}
      <Suspense fallback={<div style={{ padding: '40px', textAlign: 'center' }}>Loading articles...</div>}>
        <HomeBlogSection />
      </Suspense>

      {/* ── FAQ ── */}
      <section id="faq" style={{ background: 'var(--c1-05)', borderTop: '1px solid var(--sep)' }}>
        <div className="w-sm">
          <div className="rv" style={{ marginBottom: '36px' }}>
            <span className="sec-label">FAQ</span>
            <h2 className="sec-h">Questions &amp; answers. 🤔</h2>
            <p className="sec-p mt-8" style={{ maxWidth: '480px' }}>Everything you need to know. Click any question to expand.</p>
          </div>
          <div className="rv">
            {[
              { q: 'How does the ₹99 sample work?', a: 'Pick a recipe, select a quantity (100g–500g), enter your address, and pay. We cook fresh the same morning and deliver same day. No subscription, no commitment. Just ₹99 to try.' },
              { q: 'What does "Vet Approved & Internationally Acclaimed" mean?', a: 'All our recipes are curated by internationally acclaimed veterinary nutritionists and are AAFCO-aligned. Every batch is NABL lab-certified. You receive the lab report with your order.' },
              { q: 'What is Vet Rx Scan?', a: "India's first AI dog health scanner. Upload a photo, describe symptoms, get an AI-powered first assessment with personalised nutrition recommendations — free for everyone." },
              { q: 'What is PoopSense AI?', a: 'Upload a photo of your dog\'s stool and our AI analyses colour, consistency, and form to flag potential gut health concerns and recommend dietary adjustments. Free to try.' },
              { q: 'Where do you deliver?', a: 'We currently deliver across Gurugram and selected areas of Delhi NCR. WhatsApp us at 988 988 7980 to check your specific pin code.' },
              { q: "What if my dog doesn't like it?", a: '5-day full money-back guarantee — no questions asked. Contact us at woof@doglicious.in within 5 days and we\'ll refund you completely.' },
            ].map((faq, i) => (
              <div key={i} className={`fq${faqOpen === i ? ' op' : ''}`}>
                <button className="fq-btn" onClick={() => toggleFaq(i)}>
                  {faq.q}
                  <span className="fq-ico">+</span>
                </button>
                <div className="fq-ans"><div className="fq-body">{faq.a}</div></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="cta-sec">
        <div className="cta-paws">
          {[{ t: '8%', l: '6%', fs: '42px', d: '0s' }, { t: '20%', r: '8%', fs: '24px', d: '2s' }, { b: '15%', l: '12%', fs: '32px', d: '4s' }, { b: '25%', r: '14%', fs: '20px', d: '1s' }, { t: '50%', l: '3%', fs: '18px', d: '6s' }, { t: '40%', r: '4%', fs: '36px', d: '3s' }].map((p, i) => (
            <span key={i} className="cta-paw" style={{ top: p.t, bottom: p.b, left: p.l, right: p.r, fontSize: p.fs, animationDelay: p.d }}>🐾</span>
          ))}
        </div>
        <div className="w" style={{ position: 'relative', zIndex: 2 }}>
          <div className="rv center">
            <div style={{ marginBottom: '32px' }}>
              <img loading="lazy" src={logoImg} style={{ maxWidth: '150px', height: 'auto', mixBlendMode: 'screen', opacity: .9, display: 'inline-block' }} alt="Doglicious" />
            </div>
            <div style={{ width: '56px', height: '2px', background: 'var(--c2)', borderRadius: '2px', margin: '0 auto 28px', opacity: .7 }} />
            <span className="sec-label">✦ &nbsp;Ready to begin?&nbsp; ✦</span>
            <h2 className="sec-h" style={{ marginTop: '14px' }}>Give your dog the food<br />they <em>deserve.</em></h2>
            <p className="sec-p">Freshly cooked every morning. Delivered same day.<br />Vet-approved. Start with a ₹99 sample — no commitment, no subscription.</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px', marginBottom: '40px' }}>
              {[['🏆', 'NABL Certified'], ['🧬', 'Vet Approved'], ['🚚', 'Free Same-Day Delivery'], ['💯', '100% Money Back']].map(([ic, l]) => (
                <span key={l} style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(254,253,249,.55)', background: 'rgba(254,253,249,.07)', border: '1px solid rgba(254,253,249,.10)', padding: '5px 14px', borderRadius: '999px' }}>{ic} {l}</span>
              ))}
            </div>
            <div className="cta-btns">
              <button className="btn-primary" onClick={() => openModal('sample')} style={{ fontSize: '16px', padding: '17px 36px', boxShadow: '0 8px 32px rgba(151,103,70,.45)', letterSpacing: '.01em' }}>🛒 Book ₹99 Sample</button>
              <a className="btn-outline" href="https://wa.me/919889887980" target="_blank" rel="noreferrer">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" /></svg>
                Chat on WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer>
        <div className="w">
          <div className="footer-top">
            <div>
              <div className="f-logo">
                <img loading="lazy" src={logoImg} style={{ maxWidth: '140px', height: 'auto', display: 'block', borderRadius: 8 }} alt="Doglicious.in" />
              </div>
              <p className="f-tagline">Fresh food for dogs. Personalised by AI. Vet approved &amp; internationally acclaimed. Cooked fresh daily.</p>
              <div className="f-contact">
                <a href="tel:+919889887980">📞 988 988 7980</a>
                <a href="mailto:woof@doglicious.in">✉️ woof@doglicious.in</a>
                <span>Gurugram &amp; Delhi NCR · 10AM–6PM daily</span>
              </div>
            </div>
            <div>
              <div className="f-hl">Products</div>
              <ul className="fl">
                <li><a href="#" onClick={e => { e.preventDefault(); openModal('sample'); }}>Book ₹99 Sample</a></li>
                <li><a href="#recipes">All Recipes</a></li>
                <li><a href="#" onClick={e => { e.preventDefault(); openModal('vet'); }}>Vet Rx Scan (Free · First 2 scans / ₹99/mo)</a></li>
                <li><a href="#" onClick={e => { e.preventDefault(); navigate('/poopsense'); }}>PoopSense AI (Free)</a></li>
              </ul>
            </div>
            <div>
              <div className="f-hl">Company</div>
              <ul className="fl">
                <li><a href="#faq">FAQ</a></li>
                <li><a href="#blog">Blog</a></li>
                <li><a href="mailto:woof@doglicious.in">Contact Us</a></li>
                <li><Link to="/privacy-policy">Privacy Policy</Link></li>
                <li><Link to="/terms-of-service">Terms</Link></li>
                <li><Link to="/refund-policy">Refund Policy</Link></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <div className="w">
            <div className="fbb-inner">
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                <img loading="lazy" src={logoImg} style={{ maxWidth: '90px', height: 'auto', mixBlendMode: 'screen', opacity: .9 }} alt="Doglicious" />
                <span className="f-cp">© 2025 Doglicious.in &nbsp;·&nbsp; Petlicious Superfoods India Private Limited</span>
              </div>
              <div className="f-leg">
                <Link to="/privacy-policy">Privacy</Link>
                <Link to="/terms-of-service">Terms</Link>
                <Link to="/refund-policy">Refund Policy</Link>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* ── WHATSAPP FLOAT ── */}
      <div className="wa-float">
        <a href="https://wa.me/919889887980" target="_blank" rel="noopener noreferrer" aria-label="Chat on WhatsApp">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 175.216 175.552" width="58" height="58">
            <defs><linearGradient id="waGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style={{ stopColor: '#25CF43' }} /><stop offset="100%" style={{ stopColor: '#20B038' }} /></linearGradient></defs>
            <rect width="175.216" height="175.552" rx="36" fill="url(#waGrad)" />
            <path fill="#fff" d="M87.65 21.1C51.6 21.1 22.3 50.4 22.3 86.5c0 11.5 3.1 22.3 8.5 31.6L21.1 154l37.4-9.8c9 4.9 19.3 7.7 30.2 7.7 36.1 0 65.4-29.3 65.4-65.4-.1-36-29.4-65.4-66.45-65.4zm.35 120.1c-10.1 0-20-2.7-28.6-7.8l-2-.1-20.9 5.5 5.6-20.3-.2-2.1c-5.5-8.9-8.5-19.2-8.5-29.9 0-31 25.2-56.2 56.2-56.2 30 0 56.1 25.3 56.1 56.2 0 30.9-25.2 56.6-57.7 56.6zm30.8-42c-1.7-.8-9.9-4.9-11.4-5.4-1.5-.6-2.6-.8-3.7.9-1.1 1.7-4.3 5.4-5.3 6.5-1 1.1-1.9 1.2-3.6.4-1.7-.8-7.1-2.6-13.5-8.3-5-4.5-8.4-10-9.4-11.7-1-1.7-.1-2.6.7-3.4.7-.7 1.7-1.9 2.5-2.9.8-1 1.1-1.7 1.7-2.8.6-1.1.3-2.1-.1-2.9-.4-.8-3.8-9.1-5.2-12.5-1.3-3.3-2.7-2.8-3.8-2.9-1 0-2.1 0-3.2 0-1.1 0-2.9.4-4.4 2.1-1.5 1.7-5.9 5.7-5.9 14s6 16.3 6.9 17.4c.8 1.1 11.9 18.1 28.7 25.4 4 1.7 7.1 2.8 9.5 3.5 4 1.3 7.6 1.1 10.5.7 3.2-.5 9.9-4 11.3-7.9 1.4-3.8 1.4-7.1.9-7.8-.4-.7-1.5-1.1-3.2-1.9z" />
          </svg>
          <div className="wa-dot" />
        </a>
      </div>

      {/* ── MOBILE STICKY BAR ── */}
      <div className="msb">
        <div className="msb-t"><strong>Fresh food · AI analysis</strong><span>From ₹99 · Free delivery</span></div>
        <div className="msb-btns">
          <button className="msb-scan" onClick={() => navigate('/poopsense')}>🔍 AI Scan</button>
          <button className="msb-book" onClick={() => openModal('sample')}>Book ₹99</button>
        </div>
      </div>

      {/* ── MODALS ── */}
      <Suspense fallback={null}>
        <VetRxModal isOpen={activeModal === 'vet'} onClose={closeModal} />
        <SampleModal
          isOpen={activeModal === 'sample'} onClose={closeModal}
          sampleStep={sampleStep} setSampleStep={setSampleStep}
          selectedRecipe={selectedRecipe} setSelectedRecipe={setSelectedRecipe}
          selectedGramIdx={selectedGramIdx} setSelectedGramIdx={setSelectedGramIdx}
          dogName={dogName} setDogName={setDogName}
          mobile={mobile} mobileValid={mobileValid} handleMobileInput={handleMobileInput}
          deliveryAddress={deliveryAddress} setDeliveryAddress={setDeliveryAddress}
          deliveryCity={deliveryCity} setDeliveryCity={setDeliveryCity}
          deliveryPin={deliveryPin} handlePincodeInput={handlePincodeInput}
          mapSrc={mapSrc} openMapVerify={openMapVerify}
          proceedToPayment={proceedToPayment}
          currentPrice={currentPrice} currentGrams={currentGrams}
        />
        <ConfirmModal
          isOpen={activeModal === 'confirm'} onClose={closeModal}
          dogName={orderDetails.dogName} mobile={orderDetails.mobile}
          recipe={orderDetails.recipe} grams={orderDetails.grams}
          price={orderDetails.price} address={orderDetails.address}
        />
        <ToolsModal isOpen={activeModal === 'tools'} onClose={closeModal} activeTool={activeTool} setActiveTool={setActiveTool} />
        <QuizModal
          isOpen={activeModal === 'quiz'} onClose={closeModal}
          quizStep={quizStep} setQuizStep={setQuizStep}
          quizName={quizName} setQuizName={setQuizName}
          quizAnswers={quizAnswers} setQuizAnswers={setQuizAnswers}
          openModal={openModal}
        />
        <TestimonialsModal isOpen={testimonialsOpen} onClose={() => setTestimonialsOpen(false)} />
      </Suspense>

      {debugScrollEnabled && debugInfo && (
        <div
          style={{
            position: 'fixed',
            left: '12px',
            right: '12px',
            bottom: '12px',
            zIndex: 999999,
            maxHeight: '42vh',
            overflow: 'auto',
            background: 'rgba(17, 13, 10, 0.92)',
            color: '#fff',
            border: '1px solid rgba(255,255,255,.18)',
            borderRadius: '14px',
            padding: '12px 14px',
            fontSize: '11px',
            lineHeight: 1.45,
            fontFamily: 'monospace',
            boxShadow: '0 18px 40px rgba(0,0,0,.35)',
            pointerEvents: 'none',
          }}
        >
          <div style={{ fontWeight: 700, marginBottom: '8px', fontFamily: 'Poppins, sans-serif' }}>
            Scroll debug active
          </div>
          <div>scrollY: {debugInfo.scrollY}</div>
          <div>innerHeight: {debugInfo.innerHeight}</div>
          <div>visualViewport.height: {debugInfo.visualViewportHeight || 'n/a'}</div>
          <div>html overflowY: {debugInfo.htmlOverflowY}</div>
          <div>body position: {debugInfo.bodyPosition}</div>
          <div>body top: {debugInfo.bodyTop}</div>
          <div>body overflowY: {debugInfo.bodyOverflowY}</div>
          <div>lockCount: {debugInfo.lockCount}</div>
          <div>savedScrollY: {debugInfo.savedScrollY}</div>
          <div>mobileMenuOpen: {debugInfo.mobileMenuOpen}</div>
          <div>activeModal: {debugInfo.activeModal}</div>
          <div>testimonialsOpen: {debugInfo.testimonialsOpen}</div>
          <div>center probe: {debugInfo.centerProbe}</div>
          <div>lower probe: {debugInfo.lowerProbe}</div>
          <div style={{ marginTop: '8px', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
            body css: {debugInfo.bodyCssText}
          </div>
        </div>
      )}

      {/* Analysis Modal (inline — no lazy needed, it's tiny) */}
      <div className={`mbk${activeModal === 'analysis' ? ' o' : ''}`} onClick={e => { if (e.target === e.currentTarget) closeModal(); }}>
        <div className="mbox" style={{ maxWidth: '480px' }}>
          <div className="mh">
            <div className="mh-t">🔍 AI-Driven Dog Analysis</div>
            <button className="mcl" onClick={closeModal}>✕</button>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--c1-70)', marginBottom: '18px', lineHeight: 1.65, fontStyle: 'italic' }}>Super AI Analysis for Dogs — Analyse health · Analyse poop · Get customised food.</p>
          <div className="am-tool am-a" onClick={() => { closeModal(); setTimeout(() => openModal('vet'), 50); }}>
            <div className="am-icon">🔬</div>
            <div>
              <div className="am-label">Vet Rx Scan</div>
              <div className="am-name">Health &amp; Nutrition Scan</div>
              <div className="am-desc">Upload a photo, describe symptoms — AI-powered health assessment and customised meal recommendation for your ailing dog.</div>
              <div className="am-cta">Launch Vet Rx Scan — Free →</div>
            </div>
          </div>
          <div className="am-tool am-a" onClick={() => { closeModal(); navigate('/poopsense'); }}>
            <div className="am-icon">💩</div>
            <div>
              <div className="am-label">PoopSense AI</div>
              <div className="am-name">Stool Health Analysis</div>
              <div className="am-desc">Upload a photo of your dog's stool — AI analyses colour, consistency, and form to flag gut health concerns and recommend dietary adjustments.</div>
              <div className="am-cta">Launch PoopSense AI — Free →</div>
            </div>
          </div>
          <p style={{ fontSize: '11px', color: 'var(--c1-50)', textAlign: 'center', marginTop: '12px' }}>Free for everyone · First scan complimentary · No sign-up needed</p>
        </div>
      </div>

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
                      onClick={() => { setPaymentConfirm(null); openModal('sample'); }}
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
    </>
  );
}
