import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { logoImg } from '../../data/homeData';

/**
 * Shared site header — matches the new homepage design exactly.
 * Used on Blogs, BlogPost, and any other page that needs the nav.
 */
export default function SiteHeader({ openModal }) {
  const navigate = useNavigate();
  const [navScrolled, setNavScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setNavScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const open = (id) => { if (openModal) openModal(id); };

  const toolRoutes = [
    '/tools/bmi-calculator',
    '/tools/feeding-calculator',
    '/tools/cost-calculator',
    '/tools/age-calculator',
    '/tools/best-vegetables',
    '/tools/natural-healing',
    '/tools/aafco-planner',
    '/tools/health-quiz',
  ];
  const openTool = (idx) => navigate(toolRoutes[idx] || '/tools');

  return (
    <div className="site-header">
      {/* TICKER */}
      <div className="ticker">
        <span className="ticker-t">
          🐾 Vet Approved &amp; Internationally Acclaimed &nbsp;·&nbsp; Free same-day delivery · Gurgaon &amp; Delhi NCR &nbsp;·&nbsp; Freshly cooked every morning &nbsp;·&nbsp; NABL certified every batch &nbsp;·&nbsp; Book a sample for ₹99 — no subscription &nbsp;·&nbsp; 5,00,000 meals served since 2020 &nbsp;·&nbsp; Zero preservatives · Zero fillers &nbsp;·&nbsp; AI-Powered Dog Analysis — Free &nbsp;·&nbsp;&nbsp; 🐾 Vet Approved &amp; Internationally Acclaimed
        </span>
      </div>

      {/* NAV */}
      <nav className={`nav${navScrolled ? ' s' : ''}`}>
        <div className="nav-in">
          <Link to="/" className="nav-logo">
            <img src={logoImg} alt="Doglicious.in" style={{ height: '44px', width: 'auto', mixBlendMode: 'multiply', display: 'block' }} />
          </Link>

          <ul className="nav-links">
            <li><Link to="/#book">Book Sample</Link></li>
            <li><Link to="/#recipes">Recipes</Link></li>
            <li>
              <button>AI Analysis <span className="nav-caret">▾</span></button>
              <div className="dd-menu">
                <div className="dd-item" onClick={() => open('vet')}>
                  <div className="dd-icon">🔬</div>
                  <div><div style={{ fontWeight: 700 }}>Vet Rx Scan</div><div className="dd-sub">Upload photo · describe symptoms — Free</div></div>
                </div>
                <div className="dd-item" onClick={() => open('analysis')}>
                  <div className="dd-icon">💩</div>
                  <div>
                    <div style={{ fontWeight: 700 }}>Poop Analyser <span style={{ fontSize: '9px', background: 'var(--c2)', color: 'var(--c3)', padding: '2px 6px', borderRadius: '999px', fontWeight: 700, letterSpacing: '.04em', verticalAlign: 'middle' }}>SOON</span></div>
                    <div className="dd-sub">Stool health AI analysis — Coming soon</div>
                  </div>
                </div>
              </div>
            </li>
            <li>
              <button>Free Tools <span className="nav-caret">▾</span></button>
              <div className="dd-menu" style={{ minWidth: '260px', right: 0, left: 'auto' }}>
                {[['⚖️','Dog BMI Calculator','Is your dog at a healthy weight?',0],['🍽️','Feeding Calculator','How much should your dog eat?',1],['💰','Cost Calculator','Fresh vs kibble — real comparison',2],['📅','Age Calculator','Dog age in human years',3]].map(([ic,n,s,idx]) => (
                  <div key={n} className="dd-item" onClick={() => openTool(idx)}><div className="dd-icon">{ic}</div><div><div>{n}</div><div className="dd-sub">{s}</div></div></div>
                ))}
                <div className="dd-sep" />
                {[['🥦','Safe Vegetables Guide',"What's safe for your dog?",4],['💊','Natural Healing Guide','Vet-reviewed remedies',5],['📋','AAFCO Meal Planner','Build a balanced meal plan',6],['🧠','Dog Health Quiz',"Get your dog's health score",7]].map(([ic,n,s,idx]) => (
                  <div key={n} className="dd-item" onClick={() => openTool(idx)}><div className="dd-icon">{ic}</div><div><div>{n}</div><div className="dd-sub">{s}</div></div></div>
                ))}
              </div>
            </li>
            <li><Link to="/blogs">Blogs</Link></li>
            <li><Link to="/#faq">FAQs</Link></li>
          </ul>

          <div className="nav-r">
            <button className="btn-nav-cta" onClick={() => navigate('/?book=1')}>
              <span style={{ fontSize: '13px', fontWeight: 800, letterSpacing: '.01em' }}>Upgrade Now! 🚀</span>
              <span style={{ fontSize: '10px', fontWeight: 600, opacity: .80, marginTop: '1px' }}>Book a Sample for ₹99</span>
            </button>
            <button className={`hbg${mobileMenuOpen ? ' o' : ''}`} onClick={() => setMobileMenuOpen(p => !p)}>
              <span /><span /><span />
            </button>
          </div>
        </div>
      </nav>

      {/* MOBILE DRAWER */}
      <div className={`mob-drawer${mobileMenuOpen ? ' o' : ''}`}>
        <Link to="/#book" onClick={() => setMobileMenuOpen(false)}>Book ₹99 Sample</Link>
        <Link to="/#recipes" onClick={() => setMobileMenuOpen(false)}>Recipes</Link>
        <span className="mob-section">AI Analysis</span>
        <button onClick={() => { setMobileMenuOpen(false); open('vet'); }}>🔬 Vet Rx Scan — Free</button>
        <button onClick={() => { setMobileMenuOpen(false); open('analysis'); }}>💩 Poop Analyser — Coming soon</button>
        <span className="mob-section">Free Tools</span>
        <button onClick={() => { setMobileMenuOpen(false); openTool(0); }}>⚖️ BMI · 🍽️ Feeding · 💰 Cost</button>
        <button onClick={() => { setMobileMenuOpen(false); openTool(3); }}>📅 Age · 🥦 Vegetables · 🧠 Quiz</button>
        <span className="mob-section">Browse</span>
        <Link to="/blogs" onClick={() => setMobileMenuOpen(false)}>Blogs</Link>
        <Link to="/#faq" onClick={() => setMobileMenuOpen(false)}>FAQs</Link>
        <button onClick={() => { setMobileMenuOpen(false); navigate('/?book=1'); }}>Book a Sample for ₹99 →</button>
      </div>
    </div>
  );
}
