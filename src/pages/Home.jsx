import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Home.css';

import {
  logoImg,
  foodImg,
  RECIPES,
  GRAM_OPTS,
  GRAM_PRICES,
} from '../data/homeData';

// Home Components
import Navbar from '../components/home/Navbar';
import AnnBar from '../components/home/AnnBar';
import GuaranteesBar from '../components/home/GuaranteesBar';
import Hero from '../components/home/Hero';
import TrustSection from '../components/home/TrustSection';
import WhySection from '../components/home/WhySection';
import WhatIsFreshSection from '../components/home/WhatIsFreshSection';
import IngredientsSection from '../components/home/IngredientsSection';
import VetRxHero from '../components/home/VetRxHero';
import HowItWorksSection from '../components/home/HowItWorksSection';
import RecipesSection from '../components/home/RecipesSection';
import VideoStories from '../components/home/VideoStories';
import TestimonialsCarousel from '../components/home/TestimonialsCarousel';
import CaseStudies from '../components/home/CaseStudies';
import FreeTools from '../components/home/FreeTools';
import LeadMagnet from '../components/home/LeadMagnet';
import BlogsSection from '../components/home/BlogsSection';
import FAQSection from '../components/home/FAQSection';
import CTASection from '../components/home/CTASection';
import Footer from '../components/home/Footer';

import { pushSampleToKylas, initiatePayU } from '../services/sampleBooking';
import VetRxModal from '../components/modals/VetRxModal';
import SampleModal from '../components/modals/SampleModal';
import PaymentModal from '../components/modals/PaymentModal';
import ConfirmModal from '../components/modals/ConfirmModal';
import ToolsModal from '../components/modals/ToolsModal';
import QuizModal from '../components/modals/QuizModal';
import BlogModal from '../components/modals/BlogModal';

// ─────────────────────────────────────────────────────────────
// Home Component
// ─────────────────────────────────────────────────────────────
export default function Home() {

  // ── Nav / Menu ──
  const navigate = useNavigate();
  const [navScrolled, setNavScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // ── Modals ──
  const [activeModal, setActiveModal] = useState(null);
  const [activeBlog, setActiveBlog] = useState(null);
  const openModal = (id) => {
    setActiveModal(id);
    document.body.style.overflow = 'hidden';
  };
  const closeModal = () => {
    setActiveModal(null);
    document.body.style.overflow = '';
  };

  // ── Sample flow ──
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

  // ── Confirm order details (PayU fallback) ──
  const [orderDetails, setOrderDetails] = useState({});

  // ── Tools ──
  const [activeTool, setActiveTool] = useState(0);

  // ── Quiz ──
  const [quizStep, setQuizStep] = useState(0);
  const [quizName, setQuizName] = useState('');
  const [quizAnswers, setQuizAnswers] = useState({});

  // ── FAQ ──
  const [openFaq, setOpenFaq] = useState(null);
  const toggleFaq = (id) => setOpenFaq(prev => prev === id ? null : id);

  // ── Blog filter ──
  const [blogFilter, setBlogFilter] = useState('all');

  // ── Carousel ──
  const [carouselIdx, setCarouselIdx] = useState(0);
  const carTrackRef = useRef(null);

  const CAR_DATA = [
    { n: "Ritu Sharma",   d: "Bruno · 4yr Labrador, Gurgaon",          q: "Bruno was on kibble 3 years. Within 2 weeks — shinier coat, more energy, and he gets excited at meal time now. The AI plan was spot-on for his breed.", v: "▶ Video" },
    { n: "Aditya Kapoor", d: "Max · 2yr Beagle, South Delhi",           q: "Max had terrible skin issues. Doglicious customised his plan to avoid chicken — he's allergic. The change in 3 weeks was incredible.", v: "▶ Video" },
    { n: "Priya Malhotra", d: "Zeus · 6yr German Shepherd, Noida",      q: "The ₹99 sample changed my mind instantly. Zeus ate it within seconds — he's never done that with any food ever!", v: "▶ Video" },
    { n: "Neha Gupta",    d: "Mia · 1yr Shih Tzu, DLF Cyber City",     q: "The NABL reports give me complete peace of mind about what my baby is eating. Mia is thriving!", v: "▶ Video" },
    { n: "Sandeep Verma", d: "Daisy · 5yr Golden Retriever, Dwarka",    q: "Daisy was overweight. Doglicious made a weight management plan — she's lost 1.2kg in 6 weeks while loving her food!", v: "▶ Video" },
  ];

  // ─────────────────────────────────────────────
  // Effects
  // ─────────────────────────────────────────────
  useEffect(() => {
    const onScroll = () => setNavScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') closeModal(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    const els = document.querySelectorAll('.rv, .sg');
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          obs.unobserve(entry.target);
        }
      }),
      { threshold: 0.08, rootMargin: '0px 0px -20px 0px' }
    );
    els.forEach((el) => obs.observe(el));
    setTimeout(() => {
      document.querySelectorAll('.hero .rv').forEach((el, i) => {
        setTimeout(() => {
          el.style.opacity = '1';
          el.style.transform = 'none';
        }, i * 90);
      });
    }, 60);
    return () => obs.disconnect();
  }, []);

  // Carousel position sync — matches HTML carMove logic
  useEffect(() => {
    if (!carTrackRef.current) return;
    const w = carTrackRef.current.children[0]?.offsetWidth || 0;
    carTrackRef.current.style.transform = `translateX(-${carouselIdx * (w + 14)}px)`;
  }, [carouselIdx]);

  // ─────────────────────────────────────────────
  // Handlers
  // ─────────────────────────────────────────────
  const handleMobileInput = (val) => {
    setMobile(val);
    setMobileValid(val.length === 10 && /^[0-9]+$/.test(val));
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
      alert('Please fill all fields.');
      return;
    }

    const recipe = RECIPES[selectedRecipe];
    const grams = GRAM_OPTS[selectedGramIdx];
    const price = GRAM_PRICES[selectedGramIdx];

    // 1. Push lead to Kylas CRM (silent — never blocks UX)
    pushSampleToKylas({
      dogName,
      phone: mobile,
      address: deliveryAddress,
      city: deliveryCity,
      pincode: deliveryPin,
      recipe,
      grams,
      price,
    });

    // 2. Initiate PayU payment — redirects to PayU hosted checkout
    try {
      closeModal();
      await initiatePayU({ dogName, phone: mobile, price, recipe, grams });
    } catch (err) {
      console.error('[PayU] initiation failed:', err);
      // Fallback: show confirm modal so order isn't lost
      setOrderDetails({
        dogName, mobile, recipe, grams, price,
        address: `${deliveryAddress}, ${deliveryCity} - ${deliveryPin}`,
      });
      openModal('confirm');
    }
  };

  const openTool = (idx) => {
    if (idx === 0) { navigate('/tools/bmi-calculator');      return; }
    if (idx === 1) { navigate('/tools/feeding-calculator');  return; }
    if (idx === 2) { navigate('/tools/cost-calculator');     return; }
    if (idx === 3) { navigate('/tools/age-calculator');      return; }
    if (idx === 4) { navigate('/tools/best-vegetables');     return; }
    if (idx === 5) { navigate('/tools/natural-healing');     return; }
    if (idx === 6) { navigate('/tools/aafco-planner');       return; }
    if (idx === 7) { navigate('/tools/health-quiz');         return; }
    setActiveTool(idx);
    openModal('tools');
  };

  const openBlog = (n) => {
    setActiveBlog(n);
    openModal('blog');
  };

  const carMove = (d) => {
    setCarouselIdx(prev => {
      const vis = window.innerWidth >= 960 ? 3 : window.innerWidth >= 640 ? 2 : 1;
      const max = CAR_DATA.length - vis;
      return Math.max(0, Math.min(prev + d, max));
    });
  };

  const playVid = (n) => {
    const cover = document.getElementById(`vcover${n}`);
    const vid = document.getElementById(`vid${n}`);
    if (cover && vid) {
      cover.style.display = 'none';
      vid.style.display = 'block';
      vid.play().catch(() => { });
    }
  };

  const submitLead = (e) => {
    e.preventDefault();
    const name = e.target.ln.value;
    const mob = e.target.lm.value;
    const email = e.target.le.value;
    const msg = encodeURIComponent(
      `Hi Doglicious! 🐾\n\nFree guide request:\nName: ${name}\nMobile: ${mob}\nEmail: ${email}\n\nPlease send the guide!`
    );
    window.open(`https://wa.me/919889887980?text=${msg}`, '_blank');
    e.target.innerHTML =
      '<div style="text-align:center;padding:20px;">' +
      '<div style="font-size:32px;margin-bottom:8px;">✅</div>' +
      '<div style="font-size:15px;font-weight:600;color:var(--green);">Guide sent!</div>' +
      '<div style="font-size:12px;color:var(--t3);margin-top:4px;">Check WhatsApp in 2 minutes 🐾</div>' +
      '</div>';
  };

  // ─────────────────────────────────────────────
  // Derived values
  // ─────────────────────────────────────────────
  const currentPrice = GRAM_PRICES[selectedGramIdx];
  const currentGrams = GRAM_OPTS[selectedGramIdx];

  // ─────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────
  return (
    <>
      <AnnBar />
      <Navbar
        navScrolled={navScrolled}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        openModal={openModal}
        openTool={openTool}
        logoImg={logoImg}
      />
      <Hero openModal={openModal} />
      <GuaranteesBar />
      <VetRxHero openModal={openModal} />
      <WhySection />
      <HowItWorksSection openModal={openModal} />
      <WhatIsFreshSection openModal={openModal} />
      <IngredientsSection />
      <RecipesSection openModal={openModal} />
      <TrustSection />
      <VideoStories playVid={playVid} />
      <TestimonialsCarousel
        carouselIdx={carouselIdx}
        CAR_DATA={CAR_DATA}
        carTrackRef={carTrackRef}
        carMove={carMove}
      />
      <CaseStudies />
      <FreeTools openTool={openTool} />
      <LeadMagnet foodImg={foodImg} submitLead={submitLead} />
      <BlogsSection
        blogFilter={blogFilter}
        setBlogFilter={setBlogFilter}
        openBlog={openBlog}
      />
      <FAQSection openFaq={openFaq} toggleFaq={toggleFaq} />
      <CTASection openModal={openModal} />
      <Footer openModal={openModal} openTool={openTool} />

      {/* Modals */}
      <VetRxModal isOpen={activeModal === 'vet'} onClose={closeModal} />
      <SampleModal
        isOpen={activeModal === 'sample'}
        onClose={closeModal}
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
      <ConfirmModal
        isOpen={activeModal === 'confirm'}
        onClose={closeModal}
        dogName={orderDetails.dogName}
        mobile={orderDetails.mobile}
        recipe={orderDetails.recipe}
        grams={orderDetails.grams}
        price={orderDetails.price}
        address={orderDetails.address}
      />
      <ToolsModal
        isOpen={activeModal === 'tools'}
        onClose={closeModal}
        activeTool={activeTool}
        setActiveTool={setActiveTool}
      />
      <QuizModal
        isOpen={activeModal === 'quiz'}
        onClose={closeModal}
        quizStep={quizStep}
        setQuizStep={setQuizStep}
        quizName={quizName}
        setQuizName={setQuizName}
        quizAnswers={quizAnswers}
        setQuizAnswers={setQuizAnswers}
        openModal={openModal}
      />
      <BlogModal isOpen={activeModal === 'blog'} onClose={closeModal} activeBlogId={activeBlog} />

      {/* WhatsApp Float — matches HTML exactly */}
      <div className="wa">
        <a href="https://wa.me/919889887980?text=Hi!%20I%20want%20to%20try%20Doglicious." target="_blank" rel="noreferrer">
          <div className="wa-d"></div>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" /></svg>
        </a>
      </div>

      {/* Mobile Sticky CTA — matches HTML exactly */}
      <div className="sm-cta">
        <div className="sm-t">
          <strong>Doglicious.in</strong>
          <span>AI-Powered Dog Nutrition</span>
        </div>
        <div style={{ display: "flex", gap: "6px" }}>
          <button className="btn btn-secondary btn-sm" onClick={() => openModal('vet')}>🔍 Scan</button>
          <button className="btn btn-primary btn-sm" onClick={() => openModal('sample')}>₹99</button>
        </div>
      </div>
    </>
  );
}
