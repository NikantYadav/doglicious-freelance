import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'
import { registerSW } from 'virtual:pwa-register'

// Register the PWA service worker.
// - skipWaiting + clientsClaim (set in vite.config.js) means the new SW
//   takes over immediately when a new version is deployed.
// - onNeedRefresh fires when a new SW is waiting. We call updateSW(true)
//   to activate it and then reload so users always get the latest build
//   without having to manually clear their cache.
registerSW({
  onNeedRefresh(updateSW) {
    // Activate the new service worker and reload the page
    updateSW(true)
  },
  onOfflineReady() {
    console.log('✅ App is ready to work offline')
  },
  onRegisteredSW(swUrl, registration) {
    // Poll for updates every 60 seconds so long-lived tabs also pick up
    // new deployments without requiring a full page reload by the user.
    if (registration) {
      setInterval(() => {
        registration.update()
      }, 60 * 1000)
    }
  }
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
)
