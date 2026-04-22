import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import VetRxScan from './pages/VetRxScan'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/vetrxscan" element={<VetRxScan />} />
    </Routes>
  )
}
