import { Link } from 'react-router-dom';
import '../styles/Home.css';
import '../styles/RefundPolicy.css';
import Navbar from '../components/home/Navbar';
import Footer from '../components/home/Footer';
import { logoImg } from '../data/homeData';
import { useState, useEffect } from 'react';

export default function RefundPolicy() {
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
          <h1 className="ph-title">Cancellation &amp; Refund Policy</h1>
          <p className="ph-meta">
            Operated at <a href="https://www.doglicious.in">doglicious.in</a> by Petlicious Superfoods India Private Limited &nbsp;·&nbsp;{' '}
            <a href="mailto:woof@doglicious.in">woof@doglicious.in</a>
          </p>
        </div>
      </header>

      <main className="page-body">
        <div className="refund-card">
          <div className="big">5</div>
          <div className="big-label">Day Money-Back Guarantee</div>
          <div className="big-sub">Full refund, no questions asked, within 5 calendar days of purchase</div>
        </div>

        <div className="section" id="guarantee">
          <span className="sec-num">Our Promise</span>
          <h2 className="sec-heading">Full Money-Back Guarantee</h2>
          <div className="sec-text">
            <p>Thanks for purchasing our products (or subscribing to our services) at <a href="https://www.doglicious.in">https://www.doglicious.in</a> operated by Petlicious Superfoods India Private Limited.</p>
            <p>We offer a <strong>full money-back guarantee</strong> for all purchases made on our website. If you are not satisfied with the product or service, you can get your money back — no questions asked.</p>
            <div className="callout">
              <p>You are eligible for a <strong>full reimbursement within 5 calendar days</strong> of your purchase. After the 5-day period you will no longer be eligible and won't be able to receive a refund. We encourage our customers to try the product in the first few days after their purchase to ensure it fits your needs.</p>
            </div>
          </div>
        </div>

        <div className="section" id="cancellation-process">
          <span className="sec-num">Process</span>
          <h2 className="sec-heading">How to Cancel an Order</h2>
          <div className="sec-text">
            <div className="timeline">
              <div className="tl-item">
                <div className="tl-num">1</div>
                <div>
                  <div className="tl-title">Notify us immediately</div>
                  <div className="tl-body">Contact us preferably by phone at <a href="tel:9889887980">988 988 7980</a> or by email at <a href="mailto:woof@doglicious.in">woof@doglicious.in</a>. All cancellations must be communicated <strong>24 hours prior</strong> to scheduled delivery.</div>
                </div>
              </div>
              <div className="tl-item">
                <div className="tl-num">2</div>
                <div>
                  <div className="tl-title">Cancellation is confirmed</div>
                  <div className="tl-body">We will confirm your cancellation and process your refund. We will not accept cancellation requests after the cut-off period.</div>
                </div>
              </div>
              <div className="tl-item">
                <div className="tl-num">3</div>
                <div>
                  <div className="tl-title">Receive your refund</div>
                  <div className="tl-body">If the cancellation was made in time, we will refund to your original payment source account or credit the said amount in your Petlicious wallet at the end of the month.</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="section" id="special-cases">
          <span className="sec-num">Special Cases</span>
          <h2 className="sec-heading">Special Circumstances</h2>
          <div className="sec-text">
            <ul>
              <li><strong>Wrong item delivered:</strong> You have the right to reject the delivery and shall be fully refunded for the missing item, provided you adhere to our process to verify the wrong delivery.</li>
              <li><strong>Failed delivery beyond your control:</strong> Petlicious may adjust the amount paid and extend it in subscription, or refund to your source account or Petlicious wallet.</li>
              <li><strong>Product unavailability:</strong> We may cancel an order if the product is not available for reasons not within our control. We will notify you and return any payment made.</li>
            </ul>
          </div>
        </div>

        <div className="section" id="timeline-policy">
          <span className="sec-num">At a Glance</span>
          <h2 className="sec-heading">Refund at a Glance</h2>
          <div className="sec-text">
            <div className="info-grid">
              <div className="info-chip">
                <div className="info-chip-label">Eligibility Window</div>
                <div className="info-chip-value">5 calendar days from purchase</div>
              </div>
              <div className="info-chip">
                <div className="info-chip-label">Cancellation Notice</div>
                <div className="info-chip-value">24 hours before delivery</div>
              </div>
              <div className="info-chip">
                <div className="info-chip-label">Refund Method</div>
                <div className="info-chip-value">Original payment source or wallet</div>
              </div>
              <div className="info-chip">
                <div className="info-chip-label">Wallet Credit</div>
                <div className="info-chip-value">End of the month</div>
              </div>
            </div>
          </div>
        </div>

        <div className="contact-box">
          <div className="contact-icon">💬</div>
          <div>
            <div className="contact-title">Request a Refund or Ask a Question</div>
            <div className="contact-body">
              📧 <a href="mailto:woof@doglicious.in">woof@doglicious.in</a><br />
              📱 <a href="tel:9889887980">988 988 7980</a> (10 AM – 6 PM)<br /><br />
              <strong>Petlicious Superfoods India Private Limited</strong><br />
              Plot No 1126, Lotus Villas, Opp Hamilton Court, Chakkarpur, DLF Phase IV, Gurugram, Haryana 122002
            </div>
          </div>
        </div>
      </main>

      <Footer openModal={openModal} openTool={openTool} />
    </>
  );
}
