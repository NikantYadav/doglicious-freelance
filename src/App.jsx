import React, { Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { usePageTracking } from './hooks/usePageTracking'

const Home = React.lazy(() => import('./pages/Home'))
const Products = React.lazy(() => import('./pages/Products'))
const FreeTools = React.lazy(() => import('./pages/FreeTools'))
const Blogs = React.lazy(() => import('./pages/Blogs'))
const PrivacyPolicy = React.lazy(() => import('./pages/PrivacyPolicy'))
const RefundPolicy = React.lazy(() => import('./pages/RefundPolicy'))
const ShippingPolicy = React.lazy(() => import('./pages/ShippingPolicy'))
const TermsOfService = React.lazy(() => import('./pages/TermsOfService'))
const VetRxScan = React.lazy(() => import('./pages/VetRxScan'))
const AafcoPlanner = React.lazy(() => import('./pages/AafcoPlanner'))
const AgeCalculator = React.lazy(() => import('./pages/AgeCalculator'))
const BestVegetables = React.lazy(() => import('./pages/BestVegetables'))
const BmiCalculator = React.lazy(() => import('./pages/BmiCalculator'))
const CostCalculator = React.lazy(() => import('./pages/CostCalculator'))
const FeedingCalculator = React.lazy(() => import('./pages/FeedingCalculator'))
const HealthQuiz = React.lazy(() => import('./pages/HealthQuiz'))
const NaturalHealing = React.lazy(() => import('./pages/NaturalHealing'))
const BlogPost = React.lazy(() => import('./pages/BlogPost'))

export default function App() {
  // Track page views on route changes
  usePageTracking();

  return (
    <Suspense fallback={<div style={{ height: '100vh', width: '100vw', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>Loading...</div>}>
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
    </Suspense>
  )
}
