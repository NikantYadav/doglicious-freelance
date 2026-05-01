import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/home/Navbar';
import Footer from '../components/home/Footer';
import { logoImg } from '../data/homeData';
import { useSEO } from '../hooks/useSEO';
import '../styles/AafcoPlanner.css';

export default function AafcoPlanner() {
  useSEO({
    title: 'AAFCO Dog Meal Planner | Free Tool',
    description: "Plan balanced homemade meals meeting AAFCO standards.",
    path: '/tools/aafco-planner'
  });

  const navigate = useNavigate();
  const [navScrolled, setNavScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setNavScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const openTool = (idx) => {
    // Navigate back to home and open the tool modal
    navigate('/', { state: { openTool: idx } });
  };

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
            <a href="/#booking" className="aafco-cta-btn">
              Order Fresh Dog Food Online — ₹99 Sample
            </a>
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

          {/* Related Guides */}
          <div className="aafco-related">
            <h3>📚 Related Guides</h3>
            <div className="aafco-related-grid">
              {[
                { emoji: '🥦', label: 'Best Vegetables for Dogs', tool: 4 },
                { emoji: '🍽️', label: 'How Much Should I Feed My Dog?', tool: 1 },
                { emoji: '🐶', label: 'Puppy Feeding Guide: First Year', tool: null },
                { emoji: '⚖️', label: 'Fresh Dog Food vs Kibble', tool: null },
              ].map(({ emoji, label, tool }) => (
                <button
                  key={label}
                  className="aafco-related-card"
                  onClick={() => tool !== null ? openTool(tool) : navigate('/')}
                >
                  <span className="aafco-rc-emoji">{emoji}</span>
                  <span className="aafco-rc-text">{label}</span>
                </button>
              ))}
            </div>
          </div>

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

      <Footer openModal={() => { }} openTool={openTool} />
    </>
  );
}
