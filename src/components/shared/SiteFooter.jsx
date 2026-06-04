import { Link, useNavigate } from 'react-router-dom';
import { logoImg } from '../../data/homeData';

/**
 * Shared site footer — matches the new homepage design exactly.
 */
export default function SiteFooter() {
  const navigate = useNavigate();

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

  return (
    <footer>
      <div className="w">
        <div className="footer-top">
          <div>
            <div className="f-logo">
              <img src={logoImg} style={{ maxWidth: '140px', height: 'auto', display: 'block', borderRadius: 8 }} alt="Doglicious.in" />
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
              <li><Link to="/?book=1">Book ₹99 Sample</Link></li>
              <li><Link to="/#recipes">All Recipes</Link></li>
              <li><Link to="/vetrxscan">VetRx (Free · First 2 scans / ₹99/mo – 05 scans/mo)</Link></li>
              <li><Link to="/poopsense">Poop AI – (First 07 days Free – ₹499/mo)</Link></li>
            </ul>
          </div>

          <div>
            <div className="f-hl">Company</div>
            <ul className="fl">
              <li><Link to="/#faq">FAQ</Link></li>
              <li><Link to="/blogs">Blog</Link></li>
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
              <img src={logoImg} style={{ maxWidth: '90px', height: 'auto', mixBlendMode: 'screen', opacity: .9 }} alt="Doglicious" />
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
  );
}
