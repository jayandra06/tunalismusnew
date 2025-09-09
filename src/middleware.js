import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req) {
  const { pathname } = req.nextUrl;
  console.log('🚀 Middleware called for:', pathname);
  
  // Debug environment variable
  console.log('🔧 Middleware Debug:', {
    hasSecret: !!process.env.NEXTAUTH_SECRET,
    secretLength: process.env.NEXTAUTH_SECRET?.length || 0,
    pathname
  });
  
  const token = await getToken({ req, secret: "12345678" });

  const publicPaths = [
    "/api/auth/[...nextauth]",
  ];

  // Allow public paths
  if (publicPaths.some(path => pathname.startsWith(path))) {
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
      hasToken: !!token,
      tokenRole: token?.role,
      tokenSub: token?.sub,
      cookies: req.cookies,
      hasSessionCookie: !!req.cookies['next-auth.session-token']
    });
    
    if (!token) {
      console.log('❌ No token found');
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Check role-based access for API routes
    if (pathname.startsWith("/api/admin/") && token.role !== "admin") {
      console.log('❌ Admin access denied:', { tokenRole: token.role, requiredRole: 'admin' });
      return NextResponse.json({ message: "Admin access required" }, { status: 403 });
    }
    
    if (pathname.startsWith("/api/trainer/") && !["admin", "trainer"].includes(token.role)) {
      return NextResponse.json({ message: "Trainer access required" }, { status: 403 });
    }
    
    if (pathname.startsWith("/api/student/") && !["admin", "trainer", "student"].includes(token.role)) {
      return NextResponse.json({ message: "Student access required" }, { status: 403 });
    }

    const requestHeaders = new Headers(req.headers);
    requestHeaders.set("X-User-Id", token.sub);
    requestHeaders.set("X-User-Role", token.role);

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
    "/api/((?!auth).)*", 
    "/admin/:path*", 
    "/trainer/:path*", 
    "/student/:path*",
    "/login/:path*",
    "/signup/:path*"
  ],
};