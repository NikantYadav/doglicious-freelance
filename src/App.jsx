import React, { Suspense, lazy } from 'react'
import { Routes, Route } from 'react-router-dom'
import { usePageTracking } from './hooks/usePageTracking'

import Home from './pages/Home'

const Products = lazy(() => import('./pages/Products'))
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'))
const RefundPolicy = lazy(() => import('./pages/RefundPolicy'))
const ShippingPolicy = lazy(() => import('./pages/ShippingPolicy'))
const TermsOfService = lazy(() => import('./pages/TermsOfService'))
const VetRxScan = lazy(() => import('./pages/VetRxScan'))
const AafcoPlanner = lazy(() => import('./pages/AafcoPlanner'))
const AgeCalculator = lazy(() => import('./pages/AgeCalculator'))
const BestVegetables = lazy(() => import('./pages/BestVegetables'))
const BmiCalculator = lazy(() => import('./pages/BmiCalculator'))
const CostCalculator = lazy(() => import('./pages/CostCalculator'))
const FeedingCalculator = lazy(() => import('./pages/FeedingCalculator'))
const HealthQuiz = lazy(() => import('./pages/HealthQuiz'))
const NaturalHealing = lazy(() => import('./pages/NaturalHealing'))
const BlogPost = lazy(() => import('./pages/BlogPost'))

export default function App() {
  // Track page views on route changes
  usePageTracking();

  return (
    <Suspense fallback={<div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
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
    </Suspense>
  )
}
