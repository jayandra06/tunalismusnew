'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { trackPageView } from '@/lib/gtm';

/**
 * Custom hook to automatically track page views
 * @param {string} pageTitle - Optional custom page title
 */
export const useGTMPageView = (pageTitle = '') => {
  const pathname = usePathname();

  useEffect(() => {
    // Only track on client side
    if (typeof window !== 'undefined') {
      // Track page view when pathname changes
      const title = pageTitle || document.title || 'Tunalismus';
      trackPageView(pathname, title);
    }
  }, [pathname, pageTitle]);
};

/**
 * Custom hook to track component interactions
 * @param {string} componentName - Name of the component
 */
export const useGTMComponent = (componentName) => {
  const trackComponentEvent = (eventName, parameters = {}) => {
    import('@/lib/gtm').then(({ trackEvent }) => {
      trackEvent(eventName, {
        component_name: componentName,
        ...parameters,
      });
    });
  };

  return { trackComponentEvent };
};

export default useGTMPageView;
