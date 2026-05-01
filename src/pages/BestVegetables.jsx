import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/home/Navbar';
import Footer from '../components/home/Footer';
import { logoImg } from '../data/homeData';
import { useSEO } from '../hooks/useSEO';
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
  const [navScrolled, setNavScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setNavScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { window.scrollTo(0, 0); }, []);

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
            <a href="/#booking" className="bv-cta-btn">
              Order Natural Dog Food Online — ₹99 Sample
            </a>
          </div>

          {/* Related */}
          <div className="bv-related">
            <h3>📚 Related Guides</h3>
            <div className="bv-related-grid">
              {[
                { emoji: '🍳', label: 'Cook AAFCO-Balanced Dog Food', tool: 6 },
                { emoji: '🌿', label: 'Heal Your Dog Naturally', tool: 5 },
                { emoji: '⚖️', label: 'Fresh Food vs Kibble', tool: null },
                { emoji: '🐶', label: 'Puppy Feeding Guide', tool: null },
              ].map(({ emoji, label, tool }) => (
                <button
                  key={label}
                  className="bv-related-card"
                  onClick={() => tool !== null ? openTool(tool) : navigate('/')}
                >
                  <span className="bv-rc-emoji">{emoji}</span>
                  <span className="bv-rc-text">{label}</span>
                </button>
              ))}
            </div>
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

      <Footer openModal={() => { }} openTool={openTool} />
    </>
  );
}
