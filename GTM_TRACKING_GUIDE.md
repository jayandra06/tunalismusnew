# Google Tag Manager (GTM) Tracking Guide

## Overview
Google Tag Manager has been successfully installed on your Tunalismus website with the container ID: `GTM-M89CJD2F`

## Installation Details

### 1. GTM Code Placement
- **Head Script**: Added to `/src/app/layout.js` in the `<head>` section
- **Body Script**: Added immediately after the opening `<body>` tag
- **Strategy**: Uses Next.js `afterInteractive` strategy for optimal performance

### 2. Files Modified
- `/src/app/layout.js` - Main layout with GTM scripts
- `/src/lib/gtm.js` - GTM utility functions
- `/src/hooks/useGTM.js` - React hooks for tracking
- `/src/app/page.js` - Example page with tracking

## Available Tracking Functions

### Basic Tracking
```javascript
import { trackPageView, trackEvent } from '@/lib/gtm';

// Track page views
trackPageView('/blog/my-post', 'My Blog Post');

// Track custom events
trackEvent('button_click', {
  button_name: 'enroll_now',
  button_location: 'hero_section'
});
```

### User Engagement
```javascript
import { trackEngagement } from '@/lib/gtm';

// Track button clicks
trackEngagement.buttonClick('enroll_now', 'hero_section');

// Track form submissions
trackEngagement.formSubmit('contact_form', 'contact');

// Track link clicks
trackEngagement.linkClick('Learn More', '/courses', 'footer');
```

### E-commerce Tracking
```javascript
import { trackEcommerce } from '@/lib/gtm';

// Track course enrollment
trackEcommerce.courseEnrollment('German Beginner', 5000, 'Language Learning');

// Track payments
trackEcommerce.paymentInitiated(5000, 'INR', 'razorpay');
trackEcommerce.paymentSuccess(5000, 'INR', 'razorpay', 'txn_123');
```

### Authentication Tracking
```javascript
import { trackAuth } from '@/lib/gtm';

// Track login/signup
trackAuth.loginAttempt('email');
trackAuth.loginSuccess('email', 'student');
trackAuth.signupSuccess('email', 'trainer');
```

### Content Tracking
```javascript
import { trackContent } from '@/lib/gtm';

// Track blog post views
trackContent.blogPostView('Learn German in 90 Days', 'Study Plans', 'Sema');

// Track course content
trackContent.courseContentView('German Beginner', 'Lesson 1', 'video');
```

### Language Learning Specific
```javascript
import { trackLanguageLearning } from '@/lib/gtm';

// Track language selection
trackLanguageLearning.languageSelected('German', 'beginner');

// Track lesson completion
trackLanguageLearning.lessonCompleted('Lesson 1', 'German Beginner', 'German');

// Track quiz attempts
trackLanguageLearning.quizAttempt('Grammar Quiz', 'German Beginner', 85);
```

## React Hooks Usage

### Automatic Page View Tracking
```javascript
import { useGTMPageView } from '@/hooks/useGTM';

function MyPage() {
  useGTMPageView('My Custom Page Title');
  
  return <div>My Page Content</div>;
}
```

### Component Event Tracking
```javascript
import { useGTMComponent } from '@/hooks/useGTM';

function MyComponent() {
  const { trackComponentEvent } = useGTMComponent('MyComponent');
  
  const handleClick = () => {
    trackComponentEvent('button_click', {
      button_name: 'cta_button'
    });
  };
  
  return <button onClick={handleClick}>Click Me</button>;
}
```

## Common Use Cases for Tunalismus

### 1. Course Enrollment Tracking
```javascript
// In your enrollment component
import { trackEcommerce } from '@/lib/gtm';

const handleEnrollment = (course) => {
  trackEcommerce.courseEnrollment(
    course.name,
    course.price,
    course.category
  );
};
```

### 2. Blog Post Engagement
```javascript
// In your blog post component
import { trackContent } from '@/lib/gtm';

useEffect(() => {
  trackContent.blogPostView(
    post.title,
    post.category,
    post.author
  );
}, [post]);
```

### 3. Video Learning Tracking
```javascript
// In your video player component
import { trackEngagement } from '@/lib/gtm';

const handleVideoPlay = () => {
  trackEngagement.videoPlay(video.title, video.duration);
};

const handleVideoComplete = () => {
  trackEngagement.videoComplete(video.title, video.duration);
};
```

### 4. User Authentication Flow
```javascript
// In your login component
import { trackAuth } from '@/lib/gtm';

const handleLogin = async (credentials) => {
  try {
    trackAuth.loginAttempt('email');
    const result = await login(credentials);
    trackAuth.loginSuccess('email', result.user.role);
  } catch (error) {
    trackAuth.loginFailure('email', error.message);
  }
};
```

## GTM Container Configuration

### Recommended Tags to Set Up in GTM:

1. **Google Analytics 4** - For comprehensive website analytics
2. **Facebook Pixel** - For social media advertising
3. **Google Ads Conversion Tracking** - For paid advertising
4. **Custom HTML Tags** - For specific tracking needs

### Recommended Triggers:

1. **Page View** - All pages
2. **Button Click** - CTA buttons, enrollment buttons
3. **Form Submit** - Contact forms, enrollment forms
4. **Video Play** - Course videos, blog videos
5. **Scroll Depth** - User engagement tracking

### Recommended Variables:

1. **Page URL** - Current page URL
2. **Page Title** - Current page title
3. **User Role** - Student, Trainer, Admin
4. **Course Name** - For course-related events
5. **Language** - Target language being learned

## Testing Your GTM Setup

### 1. GTM Preview Mode
1. Go to your GTM container
2. Click "Preview" button
3. Enter your website URL
4. Test different pages and interactions

### 2. Browser Developer Tools
1. Open browser dev tools
2. Go to Network tab
3. Look for requests to `googletagmanager.com`
4. Check Console for `dataLayer` events

### 3. Google Analytics Real-Time Reports
1. Go to Google Analytics
2. Navigate to Real-Time reports
3. Test your website
4. Verify events are being tracked

## Best Practices

1. **Test Before Going Live** - Always test in GTM preview mode
2. **Use Descriptive Event Names** - Make events easy to understand
3. **Include Context** - Add relevant parameters to events
4. **Don't Over-Track** - Focus on meaningful user interactions
5. **Respect Privacy** - Ensure compliance with privacy regulations

## Troubleshooting

### Common Issues:

1. **Events Not Firing**
   - Check GTM container ID is correct
   - Verify triggers are set up properly
   - Check browser console for errors

2. **Data Not Appearing in Analytics**
   - Allow 24-48 hours for data to appear
   - Check GTM preview mode
   - Verify tag configuration

3. **Performance Issues**
   - Use `afterInteractive` strategy for scripts
   - Minimize the number of tags
   - Use GTM's built-in performance monitoring

## Support

For GTM-related issues:
1. Check GTM documentation
2. Use GTM preview mode for debugging
3. Check browser console for errors
4. Verify container configuration

Your GTM setup is now ready to track user interactions and provide valuable insights for your language learning platform!
