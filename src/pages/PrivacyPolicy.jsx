import { Link } from 'react-router-dom';
import '../styles/Home.css';
import '../styles/PrivacyPolicy.css';
import Navbar from '../components/home/Navbar';
import Footer from '../components/home/Footer';
import { logoImg } from '../data/homeData';
import { useState, useEffect } from 'react';

export default function PrivacyPolicy() {
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
          <h1 className="ph-title">Privacy Policy</h1>
          <p className="ph-meta">
            Petlicious Superfoods India Private Limited &nbsp;·&nbsp; Last updated: March 31, 2024 &nbsp;·&nbsp;{' '}
            <a href="mailto:woof@doglicious.in">woof@doglicious.in</a>
          </p>
        </div>
      </header>

      <main className="page-body">
        <nav className="toc-box" aria-label="Contents">
          <div className="toc-heading">Contents</div>
          <ul className="toc-links">
            <li><a href="#purpose">Purpose of this Policy</a></li>
            <li><a href="#scope">Scope</a></li>
            <li><a href="#processing">Processing of Personal Data</a></li>
            <li><a href="#disclosure">Disclosure of Data</a></li>
            <li><a href="#non-personal">Non-Personal Data</a></li>
            <li><a href="#cookies">Cookies</a></li>
            <li><a href="#your-rights">Your Rights</a></li>
            <li><a href="#security">Security</a></li>
            <li><a href="#applicable-law">Applicable Laws</a></li>
            <li><a href="#retention">Retention Periods</a></li>
            <li><a href="#data-protection">Data Protection (GDPR)</a></li>
          </ul>
        </nav>

        <div className="section" id="purpose">
          <span className="sec-num">01</span>
          <h2 className="sec-heading">Purpose of this Policy</h2>
          <div className="sec-text">
            <p>Petlicious™ (referred to as "we", "us" or "our") respects your need to understand how and why information is being collected, used, disclosed, transferred and stored. We have developed this Policy to familiarise you with our practices.</p>
            <p>This Policy sets out the way in which we process your information when you visit and use <a href="https://www.doglicious.in">www.doglicious.in</a>, our services and our application for mobile devices, in accordance with applicable data protection laws.</p>
            <div className="callout">
              <p>Please read this Policy together with any other policies we may provide when collecting or processing your personal data, so that you are fully aware of how and why we are using your personal data.</p>
            </div>
          </div>
        </div>

        <div className="section" id="scope">
          <span className="sec-num">02</span>
          <h2 className="sec-heading">Scope</h2>
          <div className="sec-text">
            <p>We provide this Policy to inform you of our policies and procedures regarding how we collect and process the personal data we receive from users of this website, our services and our application.</p>
            <p>Personal data is any information that directly or indirectly identifies you — directly through a name, or indirectly through a combination of other information.</p>
            <p>This Policy applies only to personal data you provide to us via the website and/or application. This Policy does not apply to any third-party websites or mobile apps.</p>
          </div>
        </div>

        <div className="section" id="processing">
          <span className="sec-num">03</span>
          <h2 className="sec-heading">Processing of Personal Data</h2>
          <div className="sec-text">
            <p>We may process your personal data for the following purposes:</p>
            <ul>
              <li><strong>Providing our services</strong> — to set up your account, allow you to order food for your pets, and submit reviews. Data processed: name, phone, email, home address, IP address.</li>
              <li><strong>Customer service</strong> — to adequately respond to your questions and requests.</li>
              <li><strong>Marketing</strong> — to contact you about our services. Data processed: website behaviour, IP address, email, postal address, phone number, location, and account information.</li>
            </ul>
            <p>We may also use your personal data to: send booking confirmations; send updates to consultation bookings; customise content; request reviews; send verification messages; validate your account; contact you on your pet's birthday with a special offer; and send vouchers or special offers.</p>
          </div>
        </div>

        <div className="section" id="disclosure">
          <span className="sec-num">04</span>
          <h2 className="sec-heading">Disclosure of Data</h2>
          <div className="sec-text">
            <p>It may be necessary for Petlicious™ to disclose your personal data by law, in the context of litigation, legal process, or by request from public or governmental authorities.</p>
            <p>We may also disclose your personal information if we determine that disclosure is necessary for purposes of law enforcement, national security, or to prevent illegal or unethical activity.</p>
          </div>
        </div>

        <div className="section" id="non-personal">
          <span className="sec-num">05</span>
          <h2 className="sec-heading">Non-Personal Data</h2>
          <div className="sec-text">
            <p>Non-personal data cannot be used to identify an individual. We may collect information regarding customer activities on our portals. This aggregated information is used in research, analysis, to improve our services and for promotional schemes.</p>
            <p>Such non-personal data may be shared in aggregated, non-personal form with a third party to enhance customer experience, products or services.</p>
          </div>
        </div>

        <div className="section" id="cookies">
          <span className="sec-num">06</span>
          <h2 className="sec-heading">Cookies</h2>
          <div className="sec-text">
            <p>The website www.doglicious.in uses cookies. During use of this website/application you will be prompted to accept all cookies.</p>
            <p>This data is used for information, processing of information and passing of information to third parties to help improve our services, including maintenance services, fraud detection, database management, web analytics, and monitoring and evaluation services.</p>
          </div>
        </div>

        <div className="section" id="your-rights">
          <span className="sec-num">07</span>
          <h2 className="sec-heading">Your Rights and How to Exercise Them</h2>
          <div className="sec-text">
            <p>You can request access to or a copy of your personal data collected and processed by us. You may also request the rectification and removal of personal data or the restriction of its processing.</p>
            <p>If you have an objection to use of your data under this Policy, please write to our privacy team at <a href="mailto:woof@doglicious.in">woof@doglicious.in</a>. To prevent misuse, we will ask you to identify yourself.</p>
          </div>
        </div>

        <div className="section" id="security">
          <span className="sec-num">08</span>
          <h2 className="sec-heading">Security</h2>
          <div className="sec-text">
            <div className="callout">
              <p>Petlicious™ takes extensive technical and legal measures to safeguard your personal data. The website uses a reliable SSL Certificate to ensure your personal data is not misused in any manner whatsoever.</p>
            </div>
          </div>
        </div>

        <div className="section" id="applicable-law">
          <span className="sec-num">09</span>
          <h2 className="sec-heading">Applicable Laws and Regulations</h2>
          <div className="sec-text">
            <p>Your data and information shall be protected under the provisions of:</p>
            <ul>
              <li>General Data Protection Regulation (GDPR)</li>
              <li>Information Technology Act, 2000</li>
              <li>Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011</li>
            </ul>
          </div>
        </div>

        <div className="section" id="retention">
          <span className="sec-num">10</span>
          <h2 className="sec-heading">Retention Periods</h2>
          <div className="sec-text">
            <p>We do not keep your personal data longer than necessary for the purpose of the processing — including satisfying legal, regulatory, accounting, or reporting requirements and the establishment or defence of legal claims.</p>
            <p>In some circumstances we may anonymise your personal data for research or statistical purposes, in which case we may use this information indefinitely without notice to you.</p>
          </div>
        </div>

        <div className="section" id="data-protection">
          <span className="sec-num">11</span>
          <h2 className="sec-heading">Data Protection (GDPR Rights)</h2>
          <div className="sec-text">
            <p>Under applicable data protection laws, you have the following rights:</p>
            <ul>
              <li><strong>Right to be informed</strong> — how your personal data is used, in clear and plain language.</li>
              <li><strong>Right to access</strong> — confirmation of whether we are processing your data and access to it.</li>
              <li><strong>Right to rectification</strong> — have any inaccurate or incomplete personal data corrected.</li>
              <li><strong>Right to erasure</strong> — request deletion of certain personal data held by us.</li>
              <li><strong>Right to restrict processing</strong> — block processing of your personal data in certain circumstances.</li>
              <li><strong>Right to data portability</strong> — receive a copy of your personal data in a commonly used electronic format.</li>
              <li><strong>Right to object</strong> — object to processing based on legitimate interests or for direct marketing.</li>
              <li><strong>Right not to be subject to automated decisions</strong> — that produce legal or similarly significant effects on you.</li>
            </ul>
            <p>We try to respond to all legitimate requests within one month.</p>
          </div>
        </div>

        <div className="contact-box">
          <div className="contact-icon">📧</div>
          <div>
            <div className="contact-title">Questions about this Privacy Policy?</div>
            <div className="contact-body">
              Email us at <a href="mailto:woof@doglicious.in">woof@doglicious.in</a> or call <a href="tel:9889887980">988 988 7980</a>.<br /><br />
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
