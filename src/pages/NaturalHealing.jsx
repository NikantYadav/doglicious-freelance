import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/home/Navbar';
import Footer from '../components/home/Footer';
import { logoImg } from '../data/homeData';
import '../styles/NaturalHealing.css';

export default function NaturalHealing() {
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
        openModal={() => {}}
        openTool={openTool}
        logoImg={logoImg}
      />

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
            <a href="/#booking" className="nh-cta-btn">
              Order Fresh Dog Food Delivered — ₹99 Sample
            </a>
          </div>

          {/* Related */}
          <div className="nh-related">
            <h3>📚 Related Guides</h3>
            <div className="nh-related-grid">
              {[
                { emoji: '🐾', label: "Check Your Dog's Health Score",  tool: 7 },
                { emoji: '🥦', label: 'Best Vegetables for Dogs',        tool: 4 },
                { emoji: '🍳', label: 'Cook AAFCO Dog Food at Home',     tool: 6 },
                { emoji: '⚖️', label: 'Fresh Food vs Kibble Comparison', tool: null },
              ].map(({ emoji, label, tool }) => (
                <button
                  key={label}
                  className="nh-related-card"
                  onClick={() => tool !== null ? openTool(tool) : navigate('/')}
                >
                  <span className="nh-rc-emoji">{emoji}</span>
                  <span className="nh-rc-text">{label}</span>
                </button>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* Tools Section */}
      <section className="nh-tools-section">
        <h2>🛠️ Essential Tools &amp; Guides</h2>
        <p className="nh-ts-sub">Free tools to help your dog live a healthier, happier life</p>
        <div className="nh-tools-grid">
          {[
            { emoji: '🍳', title: 'AAFCO Meal Planner',             desc: 'Complete recipes meeting US nutrition standards',  tool: 6 },
            { emoji: '🍽️', title: 'How Much Should I Feed My Dog?', desc: 'Personalised portions by breed, age & weight',     tool: 1 },
            { emoji: '🐾', title: "Check Your Dog's Health Score",  desc: "Quick quiz to assess your dog's wellness",         tool: 7 },
            { emoji: '🌿', title: 'Heal Your Dog Naturally',        desc: 'Holistic remedies & nutrition-based healing',      tool: 5 },
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

      <Footer openModal={() => {}} openTool={openTool} />
    </>
  );
}