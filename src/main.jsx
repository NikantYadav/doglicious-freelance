import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'

// Render app immediately — do NOT import workbox-window eagerly as it
// adds it to the critical JS chain and delays FCP/LCP.
ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
)

// Defer SW registration until after page load so workbox-window is NOT
// in the critical path. The import() itself is lazy, so the workbox chunk
// is only fetched after the page is interactive.
window.addEventListener('load', () => {
  import('virtual:pwa-register').then(({ registerSW }) => {
    registerSW({
      onNeedRefresh(updateSW) {
        // Activate the new service worker and reload the page
        updateSW(true)
      },
      onOfflineReady() {
        console.log('✅ App is ready to work offline')
      },
      onRegisteredSW(swUrl, registration) {
        // Poll for updates every 60s so long-lived tabs pick up new deploys
        if (registration) {
          setInterval(() => registration.update(), 60 * 1000)
        }
      }
    })
  })
})
