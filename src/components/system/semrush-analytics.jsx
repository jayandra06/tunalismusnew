'use client';

import { useEffect } from 'react';
import Script from 'next/script';

const SemrushAnalytics = () => {
  const trackingId = process.env.NEXT_PUBLIC_SEMRUSH_TRACKING_ID;

  useEffect(() => {
    // Initialize Semrush tracking when component mounts
    if (typeof window !== 'undefined' && window.semrush) {
      window.semrush('init', trackingId);
    }
  }, [trackingId]);

  // Track page views
  const trackPageView = (url) => {
    if (typeof window !== 'undefined' && window.semrush) {
      window.semrush('track', 'pageview', {
        url: url,
        title: document.title
      });
    }
  };

  // Track custom events
  const trackEvent = (eventName, eventData = {}) => {
    if (typeof window !== 'undefined' && window.semrush) {
      window.semrush('track', 'event', {
        event: eventName,
        ...eventData
      });
    }
  };

  // Track conversions
  const trackConversion = (conversionType, value = 0) => {
    if (typeof window !== 'undefined' && window.semrush) {
      window.semrush('track', 'conversion', {
        type: conversionType,
        value: value
      });
    }
  };

  // Expose tracking functions globally for use in other components
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.semrushTracking = {
        trackPageView,
        trackEvent,
        trackConversion
      };
    }
  }, []);

  if (!trackingId) {
    return null;
  }

  return (
    <>
      {/* Semrush Tracking Script */}
      <Script
        id="semrush-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            (function(s,e,m,r,u,s,h){
              s['SemrushObject']=u;s[u]=s[u]||function(){(s[u].q=s[u].q||[]).push(arguments)};
              s[u].l=1*new Date();h=e.createElement(m);r=e.getElementsByTagName(m)[0];
              h.async=1;h.src='https://cdn.semrush.com/analytics.js';
              r.parentNode.insertBefore(h,r)
            })(window,document,'script','semrush','${trackingId}');
          `
        }}
      />
    </>
  );
};

export default SemrushAnalytics;
