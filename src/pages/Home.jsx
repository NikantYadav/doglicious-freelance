import React from 'react'
import { Link } from 'react-router-dom'
import '../styles/Home.css'

export default function Home() {
  return (
    <div className="home-container">
      <div className="home-content">
        <div className="logo-section">
          <h1>🐾 Doglicious</h1>
          <p className="tagline">Superfood for Dogs</p>
        </div>
        
        <div className="hero-section">
          <h2>Welcome to Doglicious</h2>
          <p>Premium nutrition and AI-powered health insights for your furry friend</p>
        </div>

        <div className="features">
          <div className="feature-card">
            <span className="feature-icon">🥗</span>
            <h3>Premium Meals</h3>
            <p>Customized superfood meals for your dog</p>
          </div>
          
          <div className="feature-card">
            <span className="feature-icon">🤖</span>
            <h3>AI Health Scan</h3>
            <p>Instant health insights with VetRx Scan</p>
          </div>
          
          <div className="feature-card">
            <span className="feature-icon">💚</span>
            <h3>Expert Care</h3>
            <p>Veterinary-backed nutrition advice</p>
          </div>
        </div>

        <div className="cta-section">
          <Link to="/vetrxscan" className="cta-button">
            Try VetRx Scan 🔬
          </Link>
          <p className="cta-subtitle">AI-powered dog health diagnosis</p>
        </div>
      </div>
    </div>
  )
}
