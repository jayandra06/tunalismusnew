import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function GET(req) {
  try {
    console.log('🔍 Debug Auth API - Headers:', Object.fromEntries(req.headers.entries()));
    console.log('🔍 Debug Auth API - Cookies:', req.cookies.getAll().map(c => ({ name: c.name, hasValue: !!c.value })));
    
    const token = await getToken({ 
      req, 
      secret: process.env.NEXTAUTH_SECRET,
      cookieName: 'next-auth.session-token'
    });
    
    console.log('🔍 Debug Auth API - Token:', token ? {
      sub: token.sub,
      role: token.role,
      email: token.email,
      name: token.name
    } : 'No token found');
    
    return NextResponse.json({
      hasToken: !!token,
      token: token ? {
        sub: token.sub,
        role: token.role,
        email: token.email,
        name: token.name
      } : null,
      headers: {
        'X-User-Role': req.headers.get("X-User-Role"),
        'X-User-Id': req.headers.get("X-User-Id"),
        'Authorization': req.headers.get("Authorization"),
        'Cookie': req.headers.get("Cookie") ? 'Present' : 'Missing'
      },
      cookies: req.cookies.getAll().map(c => ({ name: c.name, hasValue: !!c.value })),
      environment: process.env.NODE_ENV,
      nextAuthSecret: process.env.NEXTAUTH_SECRET ? 'Set' : 'Missing'
    });
  } catch (error) {
    console.error('Debug Auth API Error:', error);
    return NextResponse.json({ 
      error: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
}
