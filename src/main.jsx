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

// Defer SW registration until browser is idle.
// @vite-ignore prevents Vite from generating a <link rel="modulepreload">
// for the workbox chunk, which would put it in the critical JS chain.
const loadSW = () => {
  import(/* @vite-ignore */ 'virtual:pwa-register').then(({ registerSW }) => {
    registerSW({
      onNeedRefresh(updateSW) {
        updateSW(true)
      },
      onOfflineReady() {
        console.log('✅ App is ready to work offline')
      },
      onRegisteredSW(_swUrl, registration) {
        if (registration) {
          setInterval(() => registration.update(), 60 * 1000)
        }
      }
    })
  })
}

// Use requestIdleCallback (or fallback to setTimeout) so the workbox
// chunk is only fetched when the browser has nothing else to do.
if ('requestIdleCallback' in window) {
  requestIdleCallback(loadSW, { timeout: 5000 })
} else {
  setTimeout(loadSW, 3000)
}
