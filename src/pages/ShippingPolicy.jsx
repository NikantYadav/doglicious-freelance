import { Link } from 'react-router-dom';
import '../styles/Home.css';
import '../styles/ShippingPolicy.css';
import Navbar from '../components/home/Navbar';
import Footer from '../components/home/Footer';
import { logoImg } from '../data/homeData';
import { useState, useEffect } from 'react';

export default function ShippingPolicy() {
  const [navScrolled, setNavScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setNavScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const openModal = () => {};
  const openTool = () => {};

  return (
    <>
      <Navbar
        navScrolled={navScrolled}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        openModal={openModal}
        openTool={openTool}
        logoImg={logoImg}
      />

      <header className="page-header">
        <div className="ph-inner">
          <span className="ph-tag">Legal</span>
          <h1 className="ph-title">Shipping Policy</h1>
          <p className="ph-meta">
            Petlicious Superfoods India Private Limited &nbsp;·&nbsp; Last updated: March 31, 2024 &nbsp;·&nbsp;{' '}
            <a href="mailto:woof@doglicious.in">woof@doglicious.in</a>
          </p>
        </div>
      </header>

      <main className="page-body">
        <div className="badge">🚚 Free delivery across Gurgaon &amp; Delhi NCR</div>

        <nav className="toc-box" aria-label="Contents">
          <div className="toc-heading">Contents</div>
          <ul className="toc-links">
            <li><a href="#definitions">Definitions</a></li>
            <li><a href="#processing">Shipment Processing Times</a></li>
            <li><a href="#rates">Shipping Rates &amp; Delivery Estimates</a></li>
            <li><a href="#tracking">Order Confirmation &amp; Tracking</a></li>
            <li><a href="#customs">Customs, Duties and Taxes</a></li>
            <li><a href="#damages">Damages &amp; Fresh Food Guidelines</a></li>
            <li><a href="#contact-us">Contact Us</a></li>
          </ul>
        </nav>

        <div className="section" id="definitions">
          <span className="sec-num">01</span>
          <h2 className="sec-heading">Interpretation and Definitions</h2>
          <div className="sec-text">
            <ul>
              <li><strong>"Company"</strong> — Petlicious Superfoods India Private Limited (PSIPL), referred to as "We", "Us" or "Our"</li>
              <li><strong>"Goods"</strong> — the items offered for sale on the Service</li>
              <li><strong>"Orders"</strong> — a request by You to purchase Goods from Us</li>
              <li><strong>"Service"</strong> — the Website</li>
              <li><strong>"Website"</strong> — accessible from <a href="https://www.doglicious.in">https://www.doglicious.in</a></li>
              <li><strong>"You"</strong> — the individual accessing the Service</li>
            </ul>
          </div>
        </div>

        <div className="section" id="processing">
          <span className="sec-num">02</span>
          <h2 className="sec-heading">Shipment Processing Times</h2>
          <div className="sec-text">
            <p>All Orders are processed within <strong>1–3 business days</strong>. Orders may not be shipped or delivered on weekends or public holidays.</p>
            <div className="callout">
              <p>If we are experiencing a high volume of orders, shipments may be delayed by a few days. If there will be a significant delay, we will contact you via email or telephone.</p>
            </div>
          </div>
        </div>

        <div className="section" id="rates">
          <span className="sec-num">03</span>
          <h2 className="sec-heading">Shipping Rates &amp; Delivery Estimates</h2>
          <div className="sec-text">
            <p>Shipping charges will be calculated and displayed at checkout.</p>
            <div className="info-grid">
              <div className="info-chip">
                <div className="info-chip-label">Shipment Cost</div>
                <div className="info-chip-value">Free in most areas in Gurgaon</div>
              </div>
              <div className="info-chip">
                <div className="info-chip-label">Estimated Delivery Time</div>
                <div className="info-chip-value">1–3 business days</div>
              </div>
              <div className="info-chip">
                <div className="info-chip-label">Delivery Area</div>
                <div className="info-chip-value">Gurgaon &amp; Delhi NCR</div>
              </div>
              <div className="info-chip">
                <div className="info-chip-label">Weekends &amp; Holidays</div>
                <div className="info-chip-value">May not be available</div>
              </div>
            </div>
            <p>The company has the right to charge delivery charges if required with prior consent from the customer. Delivery delays can occasionally occur.</p>
          </div>
        </div>

        <div className="section" id="tracking">
          <span className="sec-num">04</span>
          <h2 className="sec-heading">Order Confirmation &amp; Order Tracking</h2>
          <div className="sec-text">
            <p>You will receive a <strong>call from our customer care team</strong> once your Order has shipped. Our team will keep you informed of the delivery timeline and any updates.</p>
          </div>
        </div>

        <div className="section" id="customs">
          <span className="sec-num">05</span>
          <h2 className="sec-heading">Customs, Duties and Taxes</h2>
          <div className="sec-text">
            <p>PSIPL is not responsible for any customs and taxes applied to your Order. All fees imposed during or after shipping are the responsibility of the customer (tariffs, taxes).</p>
          </div>
        </div>

        <div className="section" id="damages">
          <span className="sec-num">06</span>
          <h2 className="sec-heading">Damages &amp; Fresh Food Guidelines</h2>
          <div className="sec-text">
            <div className="callout">
              <p><strong>Important:</strong> Doglicious provides freshly cooked food and the customer is expected to consume it as soon as received. Since it's fresh food, the shelf life is limited to <strong>1–2 hours only</strong> at room temperature. Please refrigerate the food immediately upon receipt.</p>
            </div>
            <p>PSIPL is not liable for any products damaged due to poor handling or lost during shipping. If you received your Order damaged, please contact the shipment carrier to file a claim. Please save all packaging materials and damaged goods before filing a claim.</p>
          </div>
        </div>

        <div className="contact-box" id="contact-us">
          <div className="contact-icon">📦</div>
          <div>
            <div className="contact-title">Shipping Questions</div>
            <div className="contact-body">
              📧 <a href="mailto:woof@doglicious.in">woof@doglicious.in</a><br />
              📱 <a href="tel:9889887980">988 988 7980</a><br /><br />
              <strong>Petlicious Superfoods India Private Limited</strong><br />
              Plot No 1126, Lotus Villas, Opp Hamilton Court, Chakkarpur, DLF Phase IV, Gurugram, Haryana 122002<br /><br />
              <div className="info-grid" style={{ marginTop: '12px' }}>
                <div className="info-chip"><div className="info-chip-label">CIN</div><div className="info-chip-value">U15400HR2021PTC097017</div></div>
                <div className="info-chip"><div className="info-chip-label">GST</div><div className="info-chip-value">06AAMCP2180K1Z5</div></div>
                <div className="info-chip"><div className="info-chip-label">PAN</div><div className="info-chip-value">AAMCP2180K</div></div>
                <div className="info-chip"><div className="info-chip-label">TAN</div><div className="info-chip-value">RTKP12537A</div></div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer openModal={openModal} openTool={openTool} />
    </>
  );
}
