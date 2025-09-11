import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req) {
  const { pathname } = req.nextUrl;
  
  console.log('🔍 Middleware triggered for:', pathname, 'Method:', req.method);
  
  // Special debug for API routes
  if (pathname.startsWith("/api/")) {
    console.log('🚨 API ROUTE DETECTED IN MIDDLEWARE:', pathname);
  }
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': process.env.NODE_ENV === 'production' 
          ? 'https://tunalismus.in' 
          : 'http://localhost:3000',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-User-Id, X-User-Role',
        'Access-Control-Allow-Credentials': 'true',
      },
    });
  }
  
  const token = await getToken({ 
    req, 
    secret: process.env.NEXTAUTH_SECRET,
    cookieName: 'next-auth.session-token'
  });
  
  console.log('🔍 Middleware token check:', {
    pathname,
    hasToken: !!token,
    tokenRole: token?.role,
    tokenSub: token?.sub,
    tokenEmail: token?.email,
    environment: process.env.NODE_ENV,
    hasSessionCookie: !!req.cookies.get('next-auth.session-token'),
    sessionCookieValue: req.cookies.get('next-auth.session-token')?.value?.substring(0, 20) + '...' || 'none',
    allCookies: req.cookies.getAll().map(c => ({ name: c.name, hasValue: !!c.value }))
  });

  const publicPaths = [
    "/api/auth/[...nextauth]",
    "/api/health",
    "/api/debug-session",
    "/api/test-db",
    "/api/test-session",
    "/api/test-homepage-ads",
    "/api/homepage-ads",
  ];

  // Allow public paths - return early without any processing
  if (publicPaths.some(path => pathname.startsWith(path))) {
    console.log('✅ Allowing public path:', pathname);
    return NextResponse.next();
  }

  // Allow all NextAuth routes
  if (pathname.startsWith('/api/auth/')) {
    console.log('✅ Allowing NextAuth route:', pathname);
    return NextResponse.next();
  }

  // Allow login pages and home page
  if (pathname.startsWith("/login") || pathname.startsWith("/admin/login") || 
      pathname.startsWith("/trainer/login") || pathname.startsWith("/student/login") || 
      pathname === "/" || pathname.startsWith("/signup")) {
    return NextResponse.next();
  }

  // For API routes, check authentication
  if (pathname.startsWith("/api/")) {
    console.log('🔍 API Route Access Check:', {
      pathname,
      method: req.method,
      hasToken: !!token,
      tokenRole: token?.role,
      tokenSub: token?.sub,
      cookies: req.cookies,
      hasSessionCookie: !!req.cookies.get('next-auth.session-token'),
      allCookies: req.cookies.getAll().map(c => ({ name: c.name, hasValue: !!c.value }))
    });
    
    // Special case: Allow GET requests to /api/courses and /api/courses/[courseId] without authentication
    if (pathname.startsWith("/api/courses") && req.method === "GET") {
      console.log('✅ Allowing public GET request to:', pathname);
      return NextResponse.next();
    }
    
    // Special case: Allow POST requests to /api/payments/order for course enrollment
    if (pathname === "/api/payments/order" && req.method === "POST") {
      console.log('✅ Allowing public POST request to:', pathname);
      return NextResponse.next();
    }
    
    // Special case: Allow POST requests to /api/payments/verify for Razorpay webhooks
    if (pathname === "/api/payments/verify" && req.method === "POST") {
      console.log('✅ Allowing public POST request to:', pathname);
      return NextResponse.next();
    }
    
    if (!token) {
      console.log('❌ No token found for API route:', pathname);
      console.log('🔍 Available cookies:', req.cookies.getAll().map(c => c.name));
      return NextResponse.json({ 
        message: "Unauthorized",
        debug: {
          hasToken: false,
          availableCookies: req.cookies.getAll().map(c => c.name),
          pathname
        }
      }, { status: 401 });
    }

    // Check role-based access for API routes
    if (pathname.startsWith("/api/admin/") && token.role !== "admin") {
      console.log('❌ Admin access denied:', { tokenRole: token.role, requiredRole: 'admin' });
      return NextResponse.json({ message: "Admin access required" }, { status: 403 });
    }
    
    if (pathname.startsWith("/api/trainer/") && !["admin", "trainer"].includes(token.role)) {
      console.log('❌ Trainer API access denied:', { tokenRole: token.role, requiredRoles: ['admin', 'trainer'], pathname });
      return NextResponse.json({ message: "Trainer access required" }, { status: 403 });
    }
    
    if (pathname.startsWith("/api/student/") && !["admin", "trainer", "student"].includes(token.role)) {
      return NextResponse.json({ message: "Student access required" }, { status: 403 });
    }

    // Create new headers object
    const requestHeaders = new Headers();
    
    // Copy existing headers
    req.headers.forEach((value, key) => {
      requestHeaders.set(key, value);
    });
    
    // Set custom headers
    requestHeaders.set("X-User-Id", token.sub);
    requestHeaders.set("X-User-Role", token.role);

    console.log('🔧 Setting headers for API route:', {
      'X-User-Id': token.sub,
      'X-User-Role': token.role,
      'HeaderCount': requestHeaders.size,
      'pathname': pathname,
      'tokenRole': token.role,
      'tokenSub': token.sub
    });

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  // For protected page routes, let client-side auth handle the authentication
  // Only redirect if it's a direct browser request (not client-side navigation)
  if (pathname.startsWith("/admin/") || pathname.startsWith("/trainer/") || pathname.startsWith("/student/")) {
    // Check if this is a direct browser request (has referer header) or client-side navigation
    const referer = req.headers.get('referer');
    const isClientSideNavigation = referer && referer.includes(req.nextUrl.origin);
    
    // If it's a direct browser request without a token, redirect to login
    if (!token && !isClientSideNavigation) {
      if (pathname.startsWith("/admin/")) {
        return NextResponse.redirect(new URL("/admin/login", req.url));
      } else if (pathname.startsWith("/trainer/")) {
        return NextResponse.redirect(new URL("/trainer/login", req.url));
      } else if (pathname.startsWith("/student/")) {
        return NextResponse.redirect(new URL("/student/login", req.url));
      }
      return NextResponse.redirect(new URL("/login", req.url));
    }
    
    // For client-side navigation, let the client handle auth
    return NextResponse.next();
  }

  // For other page routes, let the client-side RouteGuard handle authentication
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};