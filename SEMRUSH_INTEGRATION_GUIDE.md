# Semrush Integration Guide

## Overview
This guide explains how to set up and use the Semrush integration with your Tunalismus website for comprehensive SEO analytics and optimization.

## Features

### 🎯 **Analytics Tracking**
- **Page Views**: Track website traffic and user engagement
- **Unique Visitors**: Monitor unique user sessions
- **Bounce Rate**: Analyze user retention and content quality
- **Session Duration**: Measure user engagement time
- **Conversion Tracking**: Monitor course enrollments, payments, and registrations

### 📊 **SEO Insights**
- **Keyword Analysis**: Track keyword rankings and search performance
- **Competitor Analysis**: Monitor competitor traffic and keywords
- **Backlink Monitoring**: Track domain authority and backlink growth
- **Content Optimization**: Get suggestions for improving SEO

### 🔧 **Admin Panel**
- **Settings Management**: Configure API credentials and tracking
- **Analytics Dashboard**: View comprehensive SEO metrics
- **Connection Testing**: Verify Semrush API connectivity
- **Real-time Updates**: Refresh analytics data on demand

## Setup Instructions

### 1. **Get Semrush Credentials**
1. Sign up for a Semrush account at [semrush.com](https://semrush.com)
2. Navigate to your project settings
3. Generate an API key
4. Note your Project ID and Tracking ID

### 2. **Configure Environment Variables**
Update your `.env.local` file with your Semrush credentials:

```env
# Semrush Configuration
SEMRUSH_API_KEY=your_actual_api_key_here
SEMRUSH_PROJECT_ID=your_actual_project_id_here
SEMRUSH_TRACKING_ID=your_actual_tracking_id_here
NEXT_PUBLIC_SEMRUSH_TRACKING_ID=your_actual_tracking_id_here
SEMRUSH_ENABLED=true
```

### 3. **Access Admin Panel**
1. Log in to your admin account
2. Navigate to **Marketing → Semrush Analytics**
3. Enter your credentials in the Settings tab
4. Test the connection
5. Save settings

## Usage

### **Tracking Events**
The integration automatically tracks various user interactions:

```javascript
import { 
  trackCourseEnrollment, 
  trackPayment, 
  trackUserRegistration 
} from '@/lib/semrush-tracking';

// Track course enrollment
trackCourseEnrollment('German Beginner Course', 'german-101', 299);

// Track payment
trackPayment(299, 'razorpay', 'German Beginner Course');

// Track user registration
trackUserRegistration('student', 'website');
```

### **SEO Optimization**
Use the SEO Optimizer component on any page:

```jsx
import SEOOptimizer from '@/components/system/seo-optimizer';

<SEOOptimizer 
  pageUrl="/courses/german"
  pageTitle="Learn German - Tunalismus"
  pageContent={pageContent}
/>
```

### **Admin Analytics**
Access comprehensive analytics through the admin panel:
- **Overview**: Key metrics and performance indicators
- **Analytics**: Detailed traffic and user behavior data
- **SEO Insights**: Keyword rankings and competitor analysis
- **Settings**: Configuration and connection management

## API Endpoints

### **Admin Endpoints** (Protected)
- `GET /api/admin/semrush/settings` - Get current settings
- `POST /api/admin/semrush/settings` - Update settings
- `GET /api/admin/semrush/analytics` - Get analytics data
- `POST /api/admin/semrush/test-connection` - Test API connection

### **Public Endpoints**
- `POST /api/semrush/track` - Track custom events (if needed)

## Event Types Tracked

### **User Actions**
- Page views
- Course views
- Course enrollments
- Payments
- User registrations
- Contact form submissions

### **Content Interactions**
- Blog post views
- File downloads
- External link clicks
- Search queries
- Ad interactions

### **SEO Metrics**
- Keyword rankings
- Organic traffic
- Backlink growth
- Domain authority
- Competitor analysis

## Best Practices

### **1. Privacy Compliance**
- Ensure GDPR compliance for EU users
- Implement cookie consent for tracking
- Provide opt-out mechanisms

### **2. Performance**
- Analytics script loads asynchronously
- No impact on page load times
- Efficient data collection

### **3. Data Accuracy**
- Regular connection testing
- Monitor API rate limits
- Validate tracking implementation

## Troubleshooting

### **Common Issues**

1. **Connection Failed**
   - Verify API credentials
   - Check network connectivity
   - Ensure Semrush account is active

2. **No Data Showing**
   - Wait 24-48 hours for initial data
   - Verify tracking ID is correct
   - Check if tracking is enabled

3. **Analytics Not Updating**
   - Refresh the admin panel
   - Test connection again
   - Check API rate limits

### **Debug Mode**
Enable debug logging by setting:
```env
NODE_ENV=development
```

## Security Considerations

- API keys are stored securely in environment variables
- Admin endpoints require authentication
- Tracking data is anonymized
- No sensitive user data is transmitted

## Support

For technical support:
1. Check the admin panel connection status
2. Review error logs in the browser console
3. Verify Semrush account status
4. Contact Semrush support for API issues

## Future Enhancements

- Real-time analytics dashboard
- Automated SEO reports
- Competitor monitoring alerts
- Content optimization suggestions
- A/B testing integration
- Advanced conversion tracking

---

**Note**: This integration uses mock data for demonstration. In production, replace mock data with actual Semrush API calls.
