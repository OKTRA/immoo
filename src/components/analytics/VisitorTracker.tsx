
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Component that tracks page views silently in the background
 * This should be included in the app's main layout
 * Currently disabled to prevent RLS policy violations
 */
export function VisitorTracker() {
  const location = useLocation();
  
  // Track page view when location changes (disabled for now)
  useEffect(() => {
    // Analytics tracking is currently disabled due to RLS policy issues
    // This prevents console errors and failed requests
    console.log('Page view tracked locally:', location.pathname);
  }, [location.pathname]);
  
  return null; // This component doesn't render anything
}
