# Homepage Ads System

## Overview

The Homepage Ads System is a comprehensive solution for managing and displaying promotional advertisements on the homepage. It includes admin management, targeting rules, analytics tracking, and multiple ad types with animations.

## Features

### ✅ Completed Features

1. **Database Model** (`src/models/HomepageAd.js`)
   - Complete schema with all required fields
   - Analytics tracking (impressions, clicks, closes)
   - Targeting rules and frequency control
   - Validation and indexing

2. **Admin Interface**
   - Marketing section in admin sidebar
   - Ads management page with table view
   - Create/Edit ad forms with all fields
   - Status management (Draft/Published)
   - Analytics dashboard

3. **API Endpoints**
   - CRUD operations for ads management
   - Public API for fetching active ads
   - Analytics tracking endpoints
   - Targeting rule application

4. **Frontend Renderer** (`src/components/system/homepage-ads-renderer.jsx`)
   - Dynamic ad rendering based on type
   - Animation support (fade, slide, bounce, zoom)
   - Responsive design
   - Frequency control (per session, per day, always)
   - Auto-close timers

5. **Ad Types Supported**
   - **Popup**: Center modal with fade-in effect
   - **Banner**: Top sticky strip, closable
   - **Toast**: Bottom-right slide-in notification
   - **Badge**: Small glowing dot near hero section
   - **Flyer**: Image card in sidebar
   - **Floating Button**: Pulsating button bottom-right

6. **Targeting Options**
   - All visitors
   - Guests only
   - Logged-in users
   - Role-based (admin, trainer, student)

7. **Analytics**
   - Impression tracking
   - Click tracking
   - Close tracking
   - Real-time counters

## File Structure

```
src/
├── models/
│   └── HomepageAd.js                 # Database model
├── app/
│   ├── admin/
│   │   ├── layout.js                 # Updated with Marketing section
│   │   └── marketing/
│   │       └── homepage-ads/
│   │           ├── page.js           # Main management page
│   │           ├── new/page.js       # Create ad form
│   │           └── [id]/edit/page.js # Edit ad form
│   ├── api/
│   │   ├── admin/homepage-ads/       # Admin CRUD APIs
│   │   ├── homepage-ads/             # Public APIs
│   │   └── test-homepage-ads/        # Test endpoint
│   └── page.js                       # Updated with ads renderer
├── components/
│   ├── system/
│   │   └── homepage-ads-renderer.jsx # Main renderer component
│   └── ui/
│       └── switch.jsx                # Switch component
└── app/
    ├── globals.css                   # Ad animations
    └── layout.js                     # Updated with Toaster
```

## Usage

### For Admins

1. **Access**: Go to Admin Portal → Marketing → Homepage Ads
2. **Create Ad**: Click "Create New Ad" button
3. **Configure**: Fill in all required fields
4. **Target**: Set audience and frequency rules
5. **Publish**: Change status from Draft to Published

### For Users

Ads automatically appear on the homepage based on:
- User authentication status
- Role-based targeting
- Frequency rules
- Date range (start/end dates)
- Ad priority

## API Endpoints

### Admin APIs (Protected)
- `GET /api/admin/homepage-ads` - List all ads
- `POST /api/admin/homepage-ads` - Create new ad
- `GET /api/admin/homepage-ads/[id]` - Get specific ad
- `PUT /api/admin/homepage-ads/[id]` - Update ad
- `PATCH /api/admin/homepage-ads/[id]` - Partial update
- `DELETE /api/admin/homepage-ads/[id]` - Delete ad

### Public APIs
- `GET /api/homepage-ads` - Get active ads for current user
- `POST /api/homepage-ads/[id]/track` - Track interactions

### Test API
- `GET /api/test-homepage-ads` - Create test ads
- `DELETE /api/test-homepage-ads` - Delete test ads

## Configuration

### Ad Types
```javascript
const adTypes = [
  'popup',           // Center modal
  'banner',          // Top strip
  'toast',           // Bottom-right notification
  'badge',           // Small indicator
  'flyer',           // Sidebar card
  'floating_button'  // Pulsating button
];
```

### Targeting Options
```javascript
const targetAudiences = [
  'all',        // Everyone
  'guest',      // Non-logged-in users
  'logged_in',  // Authenticated users
  'role_based'  // Specific roles
];
```

### Frequency Options
```javascript
const frequencies = [
  'per_session',  // Once per browser session
  'per_day',      // Once per day
  'always'        // Every time
];
```

### Animation Types
```javascript
const animations = [
  'fade_in',   // Smooth fade
  'slide_in',  // Slide from side
  'bounce',    // Bounce effect
  'zoom_in',   // Scale up
  'none'       // No animation
];
```

## Testing

### Manual Testing
1. Start the development server: `npm run dev`
2. Create test ads via admin interface
3. Visit homepage to see ads
4. Test different user roles and targeting

### API Testing
```bash
# Create test ads
curl -X GET http://localhost:3000/api/test-homepage-ads

# Delete test ads
curl -X DELETE http://localhost:3000/api/test-homepage-ads
```

## Customization

### Adding New Ad Types
1. Add type to `ad_type` enum in model
2. Add rendering logic in `homepage-ads-renderer.jsx`
3. Add CSS animations in `globals.css`

### Custom Animations
Add new animation classes in `globals.css`:
```css
.ad-custom_animation.ad-hidden {
  /* Initial state */
}

.ad-custom_animation.ad-visible {
  /* Final state */
  animation: customAnimation 0.5s ease-out;
}

@keyframes customAnimation {
  /* Animation keyframes */
}
```

## Performance Considerations

- Ads are loaded asynchronously
- Frequency rules use localStorage/sessionStorage
- Analytics tracking is non-blocking
- Images are lazy-loaded
- Animations use CSS transforms for performance

## Security

- Admin APIs require authentication
- Input validation on all endpoints
- XSS protection in ad content
- Rate limiting on analytics endpoints

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- CSS Grid and Flexbox support required
- localStorage/sessionStorage support required
- ES6+ JavaScript features

## Future Enhancements

- A/B testing for ads
- Advanced analytics dashboard
- Ad scheduling with time zones
- Multi-language ad content
- Image optimization and CDN
- Advanced targeting rules
- Ad performance insights
- Bulk ad operations

## Troubleshooting

### Common Issues

1. **Ads not showing**: Check if ads are published and within date range
2. **Targeting not working**: Verify user authentication and role
3. **Animations not working**: Check CSS is loaded and browser support
4. **Analytics not tracking**: Verify API endpoints are accessible

### Debug Mode
Enable debug logging by setting `NODE_ENV=development` and check browser console for detailed logs.

## Support

For issues or questions about the Homepage Ads System, check:
1. Browser console for errors
2. Network tab for API failures
3. Database for ad status and targeting
4. Admin interface for configuration issues
