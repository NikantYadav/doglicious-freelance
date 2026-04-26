import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/home/Navbar';
import Footer from '../components/home/Footer';
import { logoImg, BLOGS } from '../data/homeData';
import '../styles/BlogPost.css';

export default function BlogPost() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [navScrolled, setNavScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const blog = BLOGS[parseInt(id)];

  useEffect(() => {
    const onScroll = () => setNavScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { window.scrollTo(0, 0); }, [id]);

  const openTool = (idx) => navigate('/', { state: { openTool: idx } });

  if (!blog) {
    return (
      <>
        <Navbar navScrolled={navScrolled} mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen} openModal={() => {}} openTool={openTool} logoImg={logoImg} />
        <div className="bp-not-found">
          <h2>Article not found</h2>
          <button onClick={() => navigate('/')}>← Back to home</button>
        </div>
        <Footer openModal={() => {}} openTool={openTool} />
      </>
    );
  }

  return (
    <>
      <Navbar navScrolled={navScrolled} mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen} openModal={() => {}} openTool={openTool} logoImg={logoImg} />

      {/* Breadcrumb */}
      <div className="bp-breadcrumb">
        <div className="bp-mx">
          <a href="/">Home</a><span>›</span>
          <a href="/#blogs">Blog</a><span>›</span>
          <span>{blog.tag}</span>
        </div>
      </div>

      {/* Article */}
      <article className="bp-article">
        <div className="bp-mx">
          <div className="bp-meta-top">
            <span className="bp-tag">{blog.tag}</span>
            <span className="bp-mins">{blog.mins} min read</span>
          </div>
          <h1 className="bp-title">{blog.title}</h1>
          <div className="bp-kw">{blog.kw}</div>
          <div className="bp-body" dangerouslySetInnerHTML={{ __html: blog.body }} />
        </div>
      </article>

      {/* CTA */}
      <div className="bp-cta-wrap">
        <div className="bp-mx">
          <div className="bp-cta">
            <h3>Ready to feed your dog better?</h3>
            <p>Try Doglicious fresh food — vet-approved, human-grade, delivered to your door.</p>
            <a href="/#booking" className="bp-cta-btn">Book ₹99 Sample →</a>
          </div>
        </div>
      </div>

      {/* Back link */}
      <div className="bp-back-wrap">
        <div className="bp-mx">
          <button className="bp-back-btn" onClick={() => navigate('/#blogs')}>
            ← Back to all articles
          </button>
        </div>
      </div>

      <Footer openModal={() => {}} openTool={openTool} />
    </>
  );
}