import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'
import { registerSW } from 'virtual:pwa-register'

// Register the PWA service worker for offline caching and installability
const updateSW = registerSW({
  onNeedRefresh() {
    // We could show a "New version available" prompt here, but we'll auto-refresh for now
    updateSW(true)
  },
  onOfflineReady() {
    console.log('✅ PWA is ready to work offline')
  },
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
)
