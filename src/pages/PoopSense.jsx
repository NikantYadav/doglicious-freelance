import React from 'react';
import { AppProvider } from '../components/PoopSense/AppContext';
import PoopSenseApp from '../components/PoopSense/PoopSenseApp';
import '../styles/PoopSense.css';

export default function PoopSense() {
  return (
    <div className="ps-page">
      <div className="ps-app">
        <AppProvider>
          <PoopSenseApp />
        </AppProvider>
      </div>
    </div>
  );
}
