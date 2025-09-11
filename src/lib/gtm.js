/**
 * Google Tag Manager utility functions
 * Provides helper functions for tracking events and page views
 */

// Initialize dataLayer if it doesn't exist
if (typeof window !== 'undefined' && !window.dataLayer) {
  window.dataLayer = [];
}

/**
 * Push an event to Google Tag Manager dataLayer
 * @param {Object} event - The event object to push
 * @param {string} event.event - Event name (e.g., 'page_view', 'click', 'purchase')
 * @param {Object} event - Additional event parameters
 */
export const gtmPush = (event) => {
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push(event);
  }
};

/**
 * Track page view
 * @param {string} pagePath - The path of the page
 * @param {string} pageTitle - The title of the page
 */
export const trackPageView = (pagePath, pageTitle) => {
  gtmPush({
    event: 'page_view',
    page_path: pagePath,
    page_title: pageTitle,
    page_location: window.location.href,
  });
};

/**
 * Track custom event
 * @param {string} eventName - Name of the event
 * @param {Object} parameters - Additional parameters for the event
 */
export const trackEvent = (eventName, parameters = {}) => {
  gtmPush({
    event: eventName,
    ...parameters,
  });
};

/**
 * Track user engagement events
 */
export const trackEngagement = {
  // Track button clicks
  buttonClick: (buttonName, location = '') => {
    trackEvent('button_click', {
      button_name: buttonName,
      button_location: location,
    });
  },

  // Track form submissions
  formSubmit: (formName, formType = '') => {
    trackEvent('form_submit', {
      form_name: formName,
      form_type: formType,
    });
  },

  // Track link clicks
  linkClick: (linkText, linkUrl, linkLocation = '') => {
    trackEvent('link_click', {
      link_text: linkText,
      link_url: linkUrl,
      link_location: linkLocation,
    });
  },

  // Track video interactions
  videoPlay: (videoTitle, videoDuration = '') => {
    trackEvent('video_play', {
      video_title: videoTitle,
      video_duration: videoDuration,
    });
  },

  videoPause: (videoTitle, currentTime = '') => {
    trackEvent('video_pause', {
      video_title: videoTitle,
      video_current_time: currentTime,
    });
  },

  videoComplete: (videoTitle, videoDuration = '') => {
    trackEvent('video_complete', {
      video_title: videoTitle,
      video_duration: videoDuration,
    });
  },
};

/**
 * Track e-commerce events (for course enrollments, payments, etc.)
 */
export const trackEcommerce = {
  // Track course enrollment
  courseEnrollment: (courseName, coursePrice, courseCategory = '') => {
    trackEvent('course_enrollment', {
      course_name: courseName,
      course_price: coursePrice,
      course_category: courseCategory,
      currency: 'INR',
    });
  },

  // Track payment initiation
  paymentInitiated: (amount, currency = 'INR', paymentMethod = '') => {
    trackEvent('payment_initiated', {
      payment_amount: amount,
      payment_currency: currency,
      payment_method: paymentMethod,
    });
  },

  // Track successful payment
  paymentSuccess: (amount, currency = 'INR', paymentMethod = '', transactionId = '') => {
    trackEvent('payment_success', {
      payment_amount: amount,
      payment_currency: currency,
      payment_method: paymentMethod,
      transaction_id: transactionId,
    });
  },

  // Track payment failure
  paymentFailure: (amount, currency = 'INR', paymentMethod = '', errorReason = '') => {
    trackEvent('payment_failure', {
      payment_amount: amount,
      payment_currency: currency,
      payment_method: paymentMethod,
      error_reason: errorReason,
    });
  },
};

/**
 * Track user authentication events
 */
export const trackAuth = {
  // Track login attempts
  loginAttempt: (method = 'email') => {
    trackEvent('login_attempt', {
      login_method: method,
    });
  },

  // Track successful login
  loginSuccess: (method = 'email', userType = '') => {
    trackEvent('login_success', {
      login_method: method,
      user_type: userType,
    });
  },

  // Track login failure
  loginFailure: (method = 'email', errorReason = '') => {
    trackEvent('login_failure', {
      login_method: method,
      error_reason: errorReason,
    });
  },

  // Track signup attempts
  signupAttempt: (method = 'email') => {
    trackEvent('signup_attempt', {
      signup_method: method,
    });
  },

  // Track successful signup
  signupSuccess: (method = 'email', userType = '') => {
    trackEvent('signup_success', {
      signup_method: method,
      user_type: userType,
    });
  },

  // Track logout
  logout: () => {
    trackEvent('logout');
  },
};

/**
 * Track content engagement (for blog posts, courses, etc.)
 */
export const trackContent = {
  // Track blog post views
  blogPostView: (postTitle, postCategory, postAuthor = '') => {
    trackEvent('blog_post_view', {
      post_title: postTitle,
      post_category: postCategory,
      post_author: postAuthor,
    });
  },

  // Track course content views
  courseContentView: (courseName, lessonName, lessonType = '') => {
    trackEvent('course_content_view', {
      course_name: courseName,
      lesson_name: lessonName,
      lesson_type: lessonType,
    });
  },

  // Track content sharing
  contentShare: (contentTitle, contentType, shareMethod = '') => {
    trackEvent('content_share', {
      content_title: contentTitle,
      content_type: contentType,
      share_method: shareMethod,
    });
  },

  // Track search queries
  search: (searchQuery, searchResults = 0, searchCategory = '') => {
    trackEvent('search', {
      search_query: searchQuery,
      search_results: searchResults,
      search_category: searchCategory,
    });
  },
};

/**
 * Track user interactions with language learning features
 */
export const trackLanguageLearning = {
  // Track language selection
  languageSelected: (language, proficiency = '') => {
    trackEvent('language_selected', {
      language: language,
      proficiency_level: proficiency,
    });
  },

  // Track lesson completion
  lessonCompleted: (lessonName, courseName, language = '') => {
    trackEvent('lesson_completed', {
      lesson_name: lessonName,
      course_name: courseName,
      language: language,
    });
  },

  // Track quiz attempts
  quizAttempt: (quizName, courseName, score = 0) => {
    trackEvent('quiz_attempt', {
      quiz_name: quizName,
      course_name: courseName,
      quiz_score: score,
    });
  },

  // Track speaking practice
  speakingPractice: (language, practiceType = '') => {
    trackEvent('speaking_practice', {
      language: language,
      practice_type: practiceType,
    });
  },
};

/**
 * Track errors and exceptions
 */
export const trackError = (errorMessage, errorType = 'javascript', errorLocation = '') => {
  trackEvent('error', {
    error_message: errorMessage,
    error_type: errorType,
    error_location: errorLocation,
  });
};

/**
 * Set user properties for better tracking
 * @param {Object} userProperties - User properties to set
 */
export const setUserProperties = (userProperties) => {
  gtmPush({
    event: 'user_properties',
    ...userProperties,
  });
};

/**
 * Track custom dimensions (if configured in GTM)
 * @param {Object} customDimensions - Custom dimensions to track
 */
export const trackCustomDimensions = (customDimensions) => {
  gtmPush({
    event: 'custom_dimensions',
    ...customDimensions,
  });
};

// Export default object with all tracking functions
export default {
  gtmPush,
  trackPageView,
  trackEvent,
  trackEngagement,
  trackEcommerce,
  trackAuth,
  trackContent,
  trackLanguageLearning,
  trackError,
  setUserProperties,
  trackCustomDimensions,
};
