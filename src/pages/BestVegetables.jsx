import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';


import { RECIPES, GRAM_OPTS, GRAM_PRICES } from '../data/homeData';
import SiteHeader from '../components/shared/SiteHeader';
import SiteFooter from '../components/shared/SiteFooter';
import SampleModal from '../components/modals/SampleModal';
import LoadingOverlay from '../components/common/LoadingOverlay';
import { useToast } from '../components/common/Toast';
import { normalizePhone } from '../utils/phone';
import { initiatePayU } from '../services/sampleBooking';
import { useSEO } from '../hooks/useSEO';
import '../styles/Home.css';
import '../styles/BestVegetables.css';

const VEGETABLES = [
  { emoji: '🥕', name: 'Carrots', desc: 'Beta-carotene, fiber, low calorie' },
  { emoji: '🍠', name: 'Sweet Potato', desc: 'Vitamin A, fiber, antioxidants' },
  { emoji: '🥦', name: 'Broccoli', desc: 'Vitamin C & K, anti-inflammatory' },
  { emoji: '🫛', name: 'Green Beans', desc: 'Low cal, high fiber, iron' },
  { emoji: '🎃', name: 'Pumpkin', desc: 'Digestive aid, prebiotic fiber' },
  { emoji: '🥒', name: 'Cucumber', desc: 'Hydrating, low calorie' },
  { emoji: '🥬', name: 'Spinach', desc: 'Iron, antioxidants (in moderation)' },
  { emoji: '🫑', name: 'Bell Peppers', desc: 'Vitamin C, beta-carotene' },
];

export default function BestVegetables() {
  useSEO({
    title: 'Safe Vegetables for Dogs Guide | Free Tool',
    description: 'Which safe vegetables can you feed your dog? Check our guide.',
    path: '/tools/best-vegetables'
  });

  const navigate = useNavigate();
  const { toast } = useToast();

  const [isProcessing, setIsProcessing] = useState(false);
  const [isSampleModalOpen, setIsSampleModalOpen] = useState(false);
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

  useEffect(() => {
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
  const openTool = (idx) => {
    if (TOOL_ROUTES[idx]) navigate(TOOL_ROUTES[idx]);
  };
  const openSampleModal = () => {
    setSampleStep(1);
    setIsSampleModalOpen(true);
  };
  const closeSampleModal = () => setIsSampleModalOpen(false);

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
      closeSampleModal();
      await initiatePayU({
        dogName,
        phone: normalizePhone(mobile),
        price,
        recipe,
        grams,
        address: deliveryAddress,
        city: deliveryCity,
        pincode: deliveryPin,
      });
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
      {isProcessing && <LoadingOverlay />}
      <SiteHeader />

      {/* Breadcrumb */}
      <div className="bv-breadcrumb">
        <div className="bv-mx">
          <a href="/">Home</a><span>›</span>
          <span>Blog</span><span>›</span>
          <span>Best Vegetables for Dogs</span>
        </div>
      </div>

      {/* Hero */}
      <div className="bv-page-hero">
        <h1>Best <em>Vegetables</em> for Dogs: Safe &amp; Nutritious Picks</h1>
        <p>
          A complete guide to which vegetables are safe, nutritious, and beneficial
          for your dog — and which ones to avoid.
        </p>
      </div>

      {/* Content */}
      <section className="bv-content">
        <div className="bv-mx">

          <p>
            Whether you're preparing AAFCO-balanced homemade meals or topping your
            dog's fresh food delivery, vegetables are essential for balanced canine
            nutrition. Here's everything you need to know.
          </p>

          <h2>Top 10 Vegetables Safe for Dogs</h2>

          <div className="bv-ingredient-grid">
            {VEGETABLES.map(({ emoji, name, desc }) => (
              <div className="bv-ing-card" key={name}>
                <div className="bv-ing-emoji">{emoji}</div>
                <h4>{name}</h4>
                <p>{desc}</p>
              </div>
            ))}
          </div>

          <div className="bv-tip-card">
            <strong>🍽️ Portions Matter</strong>
            <p>
              Vegetables should make up 10–20% of your dog's total daily food. Use our{' '}
              <button className="bv-link-btn" onClick={() => openTool(1)}>
                feeding calculator
              </button>{' '}
              to determine the right total portion, then calculate the veggie portion from there.
            </p>
          </div>

          <h2>Vegetables to AVOID ⚠️</h2>
          <ul>
            <li><strong>Onions &amp; Garlic:</strong> Toxic — can cause anemia</li>
            <li><strong>Raw Potatoes:</strong> Contain solanine, which is toxic to dogs</li>
            <li><strong>Mushrooms (wild):</strong> Many varieties are poisonous</li>
            <li><strong>Rhubarb:</strong> Toxic to dogs</li>
            <li><strong>Corn on the cob:</strong> Cob is a choking hazard and can cause intestinal blockage</li>
          </ul>

          <h2>How to Prepare Vegetables for Dogs</h2>
          <p>
            Most vegetables should be <strong>steamed or lightly boiled</strong> to break
            down cell walls and improve digestibility. Cut into small, manageable pieces
            appropriate for your dog's size. Raw carrots and cucumber are exceptions —
            they make great crunchy treats!
          </p>

          <h2>Anti-Inflammatory Vegetables for Dogs with Health Issues</h2>
          <p>
            If your dog has skin problems, joint pain, or digestive issues, these
            vegetables have natural anti-inflammatory properties: sweet potato, broccoli,
            and pumpkin. For a complete approach to nutrition-based healing, check our{' '}
            <button className="bv-link-btn" onClick={() => openTool(5)}>
              natural healing guide for dogs
            </button>.
          </p>
          <p>
            Not sure if your dog has underlying health issues? Take our{' '}
            <button className="bv-link-btn" onClick={() => openTool(7)}>
              free dog health quiz
            </button>{' '}
            to get a baseline assessment.
          </p>

          {/* CTA Box */}
          <div className="bv-cta-box">
            <h3>Get Perfectly Balanced Fresh Meals</h3>
            <p>
              Every Doglicious meal includes the right mix of vegetables, protein, and
              nutrients — no guesswork needed.
            </p>
            <button type="button" className="bv-cta-btn" onClick={openSampleModal}>
              Order Natural Dog Food Online — ₹99 Sample
            </button>
          </div>

        </div>
      </section>

      {/* Tools Section */}
      <section className="bv-tools-section">
        <h2>🛠️ Essential Tools &amp; Guides</h2>
        <p className="bv-ts-sub">Free tools to help your dog live a healthier, happier life</p>
        <div className="bv-tools-grid">
          {[
            { emoji: '🍳', title: 'AAFCO Meal Planner', desc: 'Complete recipes meeting US nutrition standards', tool: 6 },
            { emoji: '🍽️', title: 'How Much Should I Feed My Dog?', desc: 'Personalised portions by breed, age & weight', tool: 1 },
            { emoji: '🐾', title: "Check Your Dog's Health Score", desc: "Quick quiz to assess your dog's wellness", tool: 7 },
            { emoji: '🌿', title: 'Heal Your Dog Naturally', desc: 'Holistic remedies & nutrition-based healing', tool: 5 },
          ].map(({ emoji, title, desc, tool }) => (
            <button
              key={title}
              className="bv-tool-card"
              onClick={() => openTool(tool)}
            >
              <div className="bv-tc-emoji">{emoji}</div>
              <div className="bv-tc-info">
                <h4>{title}</h4>
                <p>{desc}</p>
              </div>
              <span className="bv-tc-arrow">→</span>
            </button>
          ))}
        </div>
      </section>

      <SampleModal
        isOpen={isSampleModalOpen}
        onClose={closeSampleModal}
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

      <SiteFooter />
    </>
  );
}
