# Production Deployment Guide

## Environment Variables for Production

Make sure these environment variables are set in your production deployment (Vercel/Netlify/etc.):

```bash
# Database Configuration
MONGODB_URI=mongodb+srv://test:test1234@cluster0.gjtfwdb.mongodb.net/tunalismusnext?retryWrites=true&w=majority&appName=Cluster0

# JWT Configuration
JWT_SECRET=12345678

# NextAuth Configuration
NEXTAUTH_SECRET=12345678
NEXTAUTH_URL=https://tunalismus.in

# Email Configuration (Hostinger SMTP)
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=587
SMTP_USER=contact@tunalismus.com
SMTP_PASS=PJayandraBabu@06

# Razorpay Configuration (Test Mode)
RAZORPAY_KEY_ID=rzp_test_zoIIpcKimwlQ4w
RAZORPAY_KEY_SECRET=MOem642O4yeIHuRD6giYsF8V

# Application Configuration
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://tunalismus.in

# Production URLs (for payment links)
BASE_URL=https://tunalismus.in

# Jitsi Meet Configuration
JITSI_DOMAIN=meet.tunalismus.in
JITSI_APP_ID=tunalismus
JITSI_ROOM_PREFIX=batch
```

## Key Changes Made for Production

1. **NextAuth Cookie Security**: Updated to use `secure: true` in production
2. **Environment URLs**: Changed from localhost to production domain
3. **Enhanced Debugging**: Added comprehensive logging for production debugging

## Deployment Steps

1. **Set Environment Variables**: Add all the above variables to your production deployment platform
2. **Deploy**: Push the latest code to trigger deployment
3. **Test**: Verify authentication works on production

## Troubleshooting

If you still get 403 errors:

1. Check that all environment variables are set correctly
2. Verify the database connection is working
3. Check the browser console for detailed error logs
4. Ensure the domain matches exactly in NEXTAUTH_URL

## Testing Production

After deployment, test these URLs:
- https://tunalismus.in/login
- https://tunalismus.in/trainer/batches
- https://tunalismus.in/admin/dashboard
- https://tunalismus.in/student/dashboard
