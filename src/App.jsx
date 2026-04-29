import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { usePageTracking } from './hooks/usePageTracking'
import Home from './pages/Home'
import Products from './pages/Products'
import FreeTools from './pages/FreeTools'
import Blogs from './pages/Blogs'
import PrivacyPolicy from './pages/PrivacyPolicy'
import RefundPolicy from './pages/RefundPolicy'
import ShippingPolicy from './pages/ShippingPolicy'
import TermsOfService from './pages/TermsOfService'
import VetRxScan from './pages/VetRxScan'
import AafcoPlanner from './pages/AafcoPlanner'
import AgeCalculator from './pages/AgeCalculator'
import BestVegetables from './pages/BestVegetables'
import BmiCalculator from './pages/BmiCalculator'
import CostCalculator from './pages/CostCalculator'
import FeedingCalculator from './pages/FeedingCalculator'
import HealthQuiz from './pages/HealthQuiz'
import NaturalHealing from './pages/NaturalHealing'
import BlogPost from './pages/BlogPost'

export default function App() {
  // Track page views on route changes
  usePageTracking();

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/products" element={<Products />} />
      <Route path="/tools" element={<FreeTools />} />
      <Route path="/blogs" element={<Blogs />} />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/refund-policy" element={<RefundPolicy />} />
      <Route path="/shipping-policy" element={<ShippingPolicy />} />
      <Route path="/terms-of-service" element={<TermsOfService />} />
      <Route path="/vetrxscan" element={<VetRxScan />} />
      <Route path="/tools/aafco-planner" element={<AafcoPlanner />} />
      <Route path="/tools/age-calculator" element={<AgeCalculator />} />
      <Route path="/tools/best-vegetables" element={<BestVegetables />} />
      <Route path="/tools/bmi-calculator" element={<BmiCalculator />} />
      <Route path="/tools/cost-calculator" element={<CostCalculator />} />
      <Route path="/tools/feeding-calculator" element={<FeedingCalculator />} />
      <Route path="/tools/health-quiz" element={<HealthQuiz />} />
      <Route path="/tools/natural-healing" element={<NaturalHealing />} />
      <Route path="/blog/:id" element={<BlogPost />} />
    </Routes>
  )
}
