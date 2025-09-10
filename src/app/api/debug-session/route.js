import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";

export async function GET(req) {
  try {
    // Get token using getToken
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    
    // Get session using getServerSession
    const session = await getServerSession(authOptions);
    
    // Get all cookies
    const cookies = req.cookies.getAll();
    
    // Debug information
    const debugInfo = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      nextAuthUrl: process.env.NEXTAUTH_URL,
      hasToken: !!token,
      tokenInfo: token ? {
        sub: token.sub,
        role: token.role,
        email: token.email,
        name: token.name
      } : null,
      hasSession: !!session,
      sessionInfo: session ? {
        user: session.user,
        expires: session.expires
      } : null,
      cookies: cookies.map(cookie => ({
        name: cookie.name,
        value: cookie.value.substring(0, 20) + '...', // Truncate for security
        hasValue: !!cookie.value
      })),
      authCookies: cookies.filter(cookie => 
        cookie.name.includes('next-auth') || cookie.name.includes('session')
      ).map(cookie => ({
        name: cookie.name,
        hasValue: !!cookie.value,
        valueLength: cookie.value?.length || 0
      }))
    };
    
    return NextResponse.json({
      status: 'debug',
      debug: debugInfo
    });
    
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
