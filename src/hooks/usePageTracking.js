import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Custom hook to track page views in Google Analytics
 * Sends a page view event whenever the route changes
 */
export const usePageTracking = () => {
  const location = useLocation();

  useEffect(() => {
    // Check if gtag is available (Google Analytics loaded)
    if (typeof window.gtag !== 'undefined') {
      // Send page view to Google Analytics
      window.gtag('config', 'G-P00SY4W1CL', {
        page_path: location.pathname + location.search + location.hash,
      });

      // Optional: Log for debugging (remove in production if needed)
      console.log('GA Page View:', location.pathname + location.search + location.hash);
    }
  }, [location]);
};
