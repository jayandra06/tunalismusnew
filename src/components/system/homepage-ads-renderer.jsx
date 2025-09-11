"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { X, ExternalLink, Clock } from 'lucide-react';

const HomepageAdsRenderer = () => {
  const { data: session } = useSession();
  const [ads, setAds] = useState([]);
  const [visibleAds, setVisibleAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const timersRef = useRef({});

  useEffect(() => {
    fetchActiveAds();
  }, [session]);

  const fetchActiveAds = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/homepage-ads');
      if (!response.ok) throw new Error('Failed to fetch ads');
      
      const data = await response.json();
      const fetchedAds = data.ads || [];
      
      // Filter ads based on frequency rules
      const filteredAds = await filterAdsByFrequency(fetchedAds);
      setAds(filteredAds);
      
      // Show ads with staggered timing
      showAdsWithStagger(filteredAds);
    } catch (error) {
      console.error('Error fetching ads:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAdsByFrequency = async (ads) => {
    const filteredAds = [];
    
    for (const ad of ads) {
      let shouldShow = true;
      
      switch (ad.frequency) {
        case 'per_session':
          const sessionKey = `ad_shown_${ad._id}_session`;
          if (sessionStorage.getItem(sessionKey)) {
            shouldShow = false;
          }
          break;
          
        case 'per_day':
          const dayKey = `ad_shown_${ad._id}_${new Date().toDateString()}`;
          if (localStorage.getItem(dayKey)) {
            shouldShow = false;
          }
          break;
          
        case 'always':
          shouldShow = true;
          break;
      }
      
      if (shouldShow) {
        filteredAds.push(ad);
      }
    }
    
    return filteredAds;
  };

  const showAdsWithStagger = (ads) => {
    // Clear existing visible ads first
    setVisibleAds([]);
    
    ads.forEach((ad, index) => {
      // Stagger ad appearance by 500ms per ad
      setTimeout(() => {
        setVisibleAds(prev => {
          // Check if ad already exists to prevent duplicates
          const exists = prev.some(existingAd => existingAd._id === ad._id);
          if (exists) return prev;
          return [...prev, ad];
        });
        trackAdInteraction(ad._id, 'impression');
      }, index * 500);
    });
  };

  const trackAdInteraction = async (adId, action) => {
    try {
      await fetch(`/api/homepage-ads/${adId}/track`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action }),
      });
    } catch (error) {
      console.error('Error tracking ad interaction:', error);
    }
  };

  const handleCloseAd = (ad) => {
    setVisibleAds(prev => prev.filter(a => a._id !== ad._id));
    trackAdInteraction(ad._id, 'close');
    
    // Mark as shown for frequency control
    markAdAsShown(ad);
  };

  const markAdAsShown = (ad) => {
    switch (ad.frequency) {
      case 'per_session':
        sessionStorage.setItem(`ad_shown_${ad._id}_session`, 'true');
        break;
      case 'per_day':
        localStorage.setItem(`ad_shown_${ad._id}_${new Date().toDateString()}`, 'true');
        break;
    }
  };

  const handleAdClick = (ad) => {
    trackAdInteraction(ad._id, 'click');
    markAdAsShown(ad);
  };

  const handleCTAClick = (ad, e) => {
    e.stopPropagation();
    trackAdInteraction(ad._id, 'click');
    markAdAsShown(ad);
    
    if (ad.cta_link) {
      window.open(ad.cta_link, '_blank');
    }
  };

  // Auto-close timer effect
  useEffect(() => {
    visibleAds.forEach(ad => {
      if (ad.timer && ad.timer > 0) {
        const timerId = setTimeout(() => {
          handleCloseAd(ad);
        }, ad.timer * 1000);
        
        timersRef.current[ad._id] = timerId;
      }
    });

    return () => {
      Object.values(timersRef.current).forEach(timerId => {
        clearTimeout(timerId);
      });
    };
  }, [visibleAds]);

  if (loading || visibleAds.length === 0) {
    return null;
  }

  return (
    <div className="homepage-ads-container">
      {visibleAds.map(ad => (
        <AdComponent
          key={ad._id}
          ad={ad}
          onClose={() => handleCloseAd(ad)}
          onClick={() => handleAdClick(ad)}
          onCTAClick={(e) => handleCTAClick(ad, e)}
        />
      ))}
    </div>
  );
};

const AdComponent = ({ ad, onClose, onClick, onCTAClick }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [timeLeft, setTimeLeft] = useState(ad.timer || 0);

  useEffect(() => {
    // Trigger animation
    setTimeout(() => setIsVisible(true), 100);
  }, []);

  // Countdown timer
  useEffect(() => {
    if (ad.timer && ad.timer > 0) {
      const interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [ad.timer]);

  const getAdStyles = () => {
    const baseStyles = {
      borderRadius: `${ad.border_radius || 8}px`,
      animationDuration: `${ad.animation_duration || 300}ms`,
    };

    if (ad.background_color) {
      baseStyles.backgroundColor = ad.background_color;
    }
    if (ad.text_color) {
      baseStyles.color = ad.text_color;
    }

    return baseStyles;
  };

  const getAnimationClass = () => {
    const baseClass = 'homepage-ad';
    const animationClass = `ad-${ad.animation_type || 'fade_in'}`;
    const visibilityClass = isVisible ? 'ad-visible' : 'ad-hidden';
    
    return `${baseClass} ${animationClass} ${visibilityClass}`;
  };

  switch (ad.ad_type) {
    case 'popup':
      return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div
            className={`${getAnimationClass()} bg-white dark:bg-gray-800 p-6 max-w-md w-full mx-4 shadow-2xl relative`}
            style={getAdStyles()}
            onClick={onClick}
          >
            {ad.closable && (
              <button
                onClick={onClose}
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="h-5 w-5" />
              </button>
            )}
            
            {ad.media_url && (
              <img
                src={ad.media_url}
                alt="Ad media"
                className="w-full h-32 object-cover rounded-lg mb-4"
              />
            )}
            
            <div className="space-y-4">
              <p className="text-gray-900 dark:text-white">{ad.special_note}</p>
              
              {ad.cta_text && ad.cta_link && (
                <button
                  onClick={onCTAClick}
                  className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                >
                  {ad.cta_text}
                </button>
              )}
              
              {ad.timer && (
                <div className="flex items-center justify-center text-sm text-gray-500">
                  <Clock className="h-4 w-4 mr-1" />
                  Auto-closes in {timeLeft}s
                </div>
              )}
            </div>
          </div>
        </div>
      );

    case 'banner':
      return (
        <div
          className={`${getAnimationClass()} fixed top-0 left-0 right-0 z-[9998] bg-red-600 text-white p-4 shadow-lg`}
          style={getAdStyles()}
          onClick={onClick}
        >
          <div className="container mx-auto flex items-center justify-between">
            <div className="flex-1">
              <p className="font-medium">{ad.special_note}</p>
              {ad.cta_text && ad.cta_link && (
                <button
                  onClick={onCTAClick}
                  className="ml-4 bg-white text-red-600 px-3 py-1 rounded text-sm font-medium hover:bg-gray-100 transition-colors"
                >
                  {ad.cta_text}
                </button>
              )}
            </div>
            
            {ad.closable && (
              <button
                onClick={onClose}
                className="absolute top-2 right-2 text-white hover:text-gray-200 z-[99999] bg-black/20 hover:bg-black/40 rounded-full p-1"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
      );

    case 'toast':
      return (
        <div
          className={`${getAnimationClass()} fixed bottom-4 right-4 z-[9997] bg-white dark:bg-gray-800 p-4 max-w-sm shadow-xl border border-gray-200 dark:border-gray-700`}
          style={getAdStyles()}
          onClick={onClick}
        >
          {ad.closable && (
            <button
              onClick={onClose}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          
          <div className="space-y-2">
            <p className="text-gray-900 dark:text-white text-sm">{ad.special_note}</p>
            
            {ad.cta_text && ad.cta_link && (
              <button
                onClick={onCTAClick}
                className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center"
              >
                {ad.cta_text}
                <ExternalLink className="h-3 w-3 ml-1" />
              </button>
            )}
          </div>
        </div>
      );

    case 'badge':
      return (
        <div
          className={`${getAnimationClass()} fixed top-20 right-4 z-[9996] bg-red-500 text-white p-2 rounded-full shadow-lg cursor-pointer hover:scale-110 transition-transform`}
          style={getAdStyles()}
          onClick={onClick}
        >
          <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
        </div>
      );

    case 'flyer':
      return (
        <div
          className={`${getAnimationClass()} fixed top-1/2 right-4 z-[9995] bg-white dark:bg-gray-800 p-4 max-w-xs shadow-xl border border-gray-200 dark:border-gray-700`}
          style={getAdStyles()}
          onClick={onClick}
        >
          {ad.closable && (
            <button
              onClick={onClose}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          
          {ad.media_url && (
            <img
              src={ad.media_url}
              alt="Ad media"
              className="w-full h-24 object-cover rounded mb-3"
            />
          )}
          
          <div className="space-y-2">
            <p className="text-gray-900 dark:text-white text-sm">{ad.special_note}</p>
            
            {ad.cta_text && ad.cta_link && (
              <button
                onClick={onCTAClick}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-1 px-3 rounded text-xs font-medium transition-colors"
              >
                {ad.cta_text}
              </button>
            )}
          </div>
        </div>
      );

    case 'floating_button':
      return (
        <div
          className={`${getAnimationClass()} fixed bottom-4 right-4 z-[9994] bg-red-600 text-white p-4 rounded-full shadow-lg cursor-pointer hover:scale-110 transition-transform`}
          style={getAdStyles()}
          onClick={onClick}
        >
          <div className="w-6 h-6 flex items-center justify-center">
            <span className="text-sm font-bold">!</span>
          </div>
        </div>
      );

    default:
      return null;
  }
};

export default HomepageAdsRenderer;
