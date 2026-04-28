import { Link } from 'react-router-dom';
import '../styles/Home.css';
import '../styles/TermsOfService.css';
import Navbar from '../components/home/Navbar';
import Footer from '../components/home/Footer';
import { logoImg } from '../data/homeData';
import { useState, useEffect } from 'react';

export default function TermsOfService() {
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
          <h1 className="ph-title">Terms of Service</h1>
          <p className="ph-meta">
            Petlicious Superfoods India Private Limited &nbsp;·&nbsp; Last updated: April 3, 2022 &nbsp;·&nbsp;{' '}
            <a href="mailto:woof@doglicious.in">woof@doglicious.in</a>
          </p>
        </div>
      </header>

      <main className="page-body">
        <div className="callout" style={{ marginBottom: '28px' }}>
          <p>These Terms govern your use of <strong>https://doglicious.in/</strong> and our mobile application. The Platform is owned by <strong>Petlicious Superfoods India Private Limited</strong>, incorporated under the Companies Act, 2014, registered at Flat No. 601/1, Tarika Apartments, GH-08, Sector-43, Gurugram, Haryana-122001. By using the Platform, you signify your acceptance of these Terms.</p>
        </div>

        <nav className="toc-box" aria-label="Contents">
          <div className="toc-heading">Contents</div>
          <ul className="toc-links">
            <li><a href="#registration">Registration</a></li>
            <li><a href="#eligibility">Eligibility</a></li>
            <li><a href="#prices">Prices and Payment</a></li>
            <li><a href="#promotions">Promotional Discounts</a></li>
            <li><a href="#food-safety">Food Safety Standards</a></li>
            <li><a href="#delivery">Delivery</a></li>
            <li><a href="#cancellation">Cancellation and Refund</a></li>
            <li><a href="#feedback">Feedback</a></li>
            <li><a href="#liability">Limitation of Liability</a></li>
            <li><a href="#disclaimer">Disclaimer</a></li>
            <li><a href="#jurisdiction">Jurisdiction</a></li>
            <li><a href="#indemnification">Indemnification</a></li>
          </ul>
        </nav>

        <div className="section" id="registration">
          <span className="sec-num">01</span>
          <h2 className="sec-heading">Registration</h2>
          <div className="sec-text">
            <p>Any contract for the supply of goods and services from this Platform is between you and Petlicious. You warrant that the details you provide at registration are accurate and complete, and that you will keep them updated. You also warrant that the credit or debit card details you provide are your own and that you have sufficient funds to make the payment.</p>
            <p>When registering you may be required to provide an e-mail address and password. You must keep these details secure and not provide them to a third party. If you believe your account has been accessed by a third party, change your password immediately.</p>
          </div>
        </div>

        <div className="section" id="eligibility">
          <span className="sec-num">02</span>
          <h2 className="sec-heading">Eligibility</h2>
          <div className="sec-text">
            <p>This Platform is open for all ages. However, for persons younger than 18 years old, use of our services is only allowed with the valid consent of a parent or guardian. Petlicious disclaims any liability arising from data provided in relation to persons under 18 without appropriate consent.</p>
          </div>
        </div>

        <div className="section" id="prices">
          <span className="sec-num">03</span>
          <h2 className="sec-heading">Prices and Payment</h2>
          <div className="sec-text">
            <ul>
              <li>All prices listed on the Platform are correct at the time of publication; however, we reserve the right to alter these in the future.</li>
              <li>Petlicious reserves the right to alter prices, delivery charges and taxes from time to time.</li>
              <li>Payment information is collected by our payment partner. We advise Users not to save payment details in order to avoid any misuse.</li>
              <li>You are responsible for payment of all applicable taxes including GST, duties and cesses.</li>
            </ul>
          </div>
        </div>

        <div className="section" id="promotions">
          <span className="sec-num">04</span>
          <h2 className="sec-heading">Promotional Discounts</h2>
          <div className="sec-text">
            <p>We may offer promotional discount codes applicable on purchases made on the website. These may apply to all or certain specified products. Only one discount code is permissible per order. You cannot use a discount code if an order is already placed.</p>
          </div>
        </div>

        <div className="section" id="food-safety">
          <span className="sec-num">05</span>
          <h2 className="sec-heading">Food Safety Standards and Protocols</h2>
          <div className="sec-text">
            <ul>
              <li>We take utmost care in sourcing our ingredients. Our food is freshly cooked with high quality, human grade ingredients.</li>
              <li>All our recipes are curated by International Dog Nutritionist – Cam Wimble, London, UK.</li>
              <li>We maintain all safety precautions and hygiene standards while preparing food. If any foreign particle or substance is found in the meal, please report immediately.</li>
              <li>We advise you to consult your Vet to discuss your pet's food habits and allergies before subscribing.</li>
            </ul>
          </div>
        </div>

        <div className="section" id="delivery">
          <span className="sec-num">06</span>
          <h2 className="sec-heading">Delivery</h2>
          <div className="sec-text">
            <p>Delivery timings are approximate and may vary based on distance, order amount, traffic and weather conditions.</p>
            <ul>
              <li>All orders are delivered by our own delivery network or any other reputed delivery service we may choose to use.</li>
              <li>If goods are not delivered within the estimated time, please contact us at <a href="mailto:woof@doglicious.in">woof@doglicious.in</a>.</li>
              <li>If you fail to accept food when it is out for delivery, it shall be deemed delivered and all risk shall pass on to you.</li>
              <li>Petlicious shall not be liable for losses arising out of late delivery.</li>
              <li>We will not be responsible for any delays due to force majeure events — including earthquake, flood, fire, storm, war, terrorism, pandemic, or lockdown.</li>
            </ul>
          </div>
        </div>

        <div className="section" id="cancellation">
          <span className="sec-num">07</span>
          <h2 className="sec-heading">Cancellation and Refund</h2>
          <div className="sec-text">
            <div className="callout">
              <p><strong>Important:</strong> You must notify us immediately if you decide to cancel, preferably by phone. All cancellations must be communicated <strong>24 hours prior</strong> to scheduled delivery. We will not accept cancellation requests after the cut-off period.</p>
            </div>
            <ul>
              <li>We may cancel an order if the product is not available for reasons not within our control. We will notify you and return any payment made.</li>
              <li>If cancellation was made in time, we will refund to your payment source account or credit the amount in your Petlicious wallet at the end of the month.</li>
              <li>In the unlikely event that we deliver a wrong item, you have the right to reject delivery and shall be fully refunded.</li>
              <li>In case of failed delivery beyond the customer's control, Petlicious may adjust the amount paid or extend it in subscription.</li>
            </ul>
          </div>
        </div>

        <div className="section" id="feedback">
          <span className="sec-num">08</span>
          <h2 className="sec-heading">Feedback</h2>
          <div className="sec-text">
            <p>Petlicious reserves the right to publish or un-publish any feedback received from its customers on its website or app. Users provide the Company the right to use their details for publishing such feedback — including name, photo, star rating, details of the pet, and feedback text.</p>
          </div>
        </div>

        <div className="section" id="liability">
          <span className="sec-num">09</span>
          <h2 className="sec-heading">Limitation of Liability</h2>
          <div className="sec-text">
            <ul>
              <li>By accepting these terms, you agree to relieve us from any liability arising from your use of information from any third party, or your use of any third-party Platform, or your consumption of any food or beverages ordered from us.</li>
              <li>If we are found liable for any loss or damage to you, such liability is limited to the amount you have paid for the relevant items.</li>
              <li>We do not accept liability for any delays, failures, errors or omissions or loss of transmitted information, viruses or other contamination transmitted via our Platform.</li>
              <li>In the event Petlicious has a reasonable belief that there exists an abuse of vouchers and/or discount codes, Petlicious may block the user immediately and reserves the right to refuse future service and seek compensation.</li>
            </ul>
          </div>
        </div>

        <div className="section" id="disclaimer">
          <span className="sec-num">10</span>
          <h2 className="sec-heading">Disclaimer</h2>
          <div className="sec-text">
            <p>We will do everything in our capacity to maintain the quality of food supplied and list all ingredients used in making of food.</p>
            <div className="callout">
              <p><strong>Allergy Responsibility:</strong> If your pet is allergic to any ingredients in the food, it is your responsibility to check and share this information with us. We will not be held liable if your pet faces health issues after consuming the food in case you failed to disclose relevant allergy information.</p>
            </div>
          </div>
        </div>

        <div className="section" id="jurisdiction">
          <span className="sec-num">11</span>
          <h2 className="sec-heading">Jurisdiction</h2>
          <div className="sec-text">
            <p>These terms and conditions and any contract shall be governed and construed in accordance with Indian laws. Both parties hereby submit to the exclusive jurisdiction of the courts of Delhi. All dealings, correspondence and contacts between us shall be made or conducted in the English language.</p>
          </div>
        </div>

        <div className="section" id="indemnification">
          <span className="sec-num">12</span>
          <h2 className="sec-heading">Indemnification</h2>
          <div className="sec-text">
            <p>You agree to indemnify, defend and hold harmless Petlicious and our parent, subsidiaries, affiliates, partners, officers, directors, agents, contractors, licensors, service providers, subcontractors, suppliers, interns and employees from any claim or demand, including reasonable attorneys' fees, made by any third-party due to or arising out of your breach of these Terms of Service or your violation of any law or the rights of a third-party.</p>
          </div>
        </div>

        <div className="contact-box">
          <div className="contact-icon">📬</div>
          <div>
            <div className="contact-title">Complaints &amp; Questions</div>
            <div className="contact-body">
              All complaints should be sent to <a href="mailto:woof@doglicious.in">woof@doglicious.in</a> or call us at <a href="tel:9889887980">988 988 7980</a>.<br /><br />
              <strong>Petlicious Superfoods India Private Limited</strong><br />
              Plot No 1126, Lotus Villas, Opp Hamilton Court, Chakkarpur, DLF Phase IV, Gurugram, Haryana 122002<br />
              CIN: U15400HR2021PTC097017
            </div>
          </div>
        </div>
      </main>

      <Footer openModal={openModal} openTool={openTool} />
    </>
  );
}
