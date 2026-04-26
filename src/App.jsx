import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
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
  return (
    <Routes>
      <Route path="/" element={<Home />} />
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
