import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../lib/auth";

export async function GET(req) {
  try {
    console.log('🔍 Testing session...');
    
    const session = await getServerSession(authOptions);
    
    console.log('📋 Session result:', session);
    
    const testResult = {
      status: 'success',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      session: {
        exists: !!session,
        user: session?.user || null,
        userId: session?.user?.id || null,
        userRole: session?.user?.role || null,
        userEmail: session?.user?.email || null,
        userName: session?.user?.name || null
      },
      cookies: {
        sessionToken: req.cookies.get('next-auth.session-token')?.value ? 'exists' : 'missing',
        csrfToken: req.cookies.get('next-auth.csrf-token')?.value ? 'exists' : 'missing',
        callbackUrl: req.cookies.get('next-auth.callback-url')?.value ? 'exists' : 'missing'
      },
      headers: {
        authorization: req.headers.get('authorization') || 'missing',
        cookie: req.headers.get('cookie') ? 'exists' : 'missing'
      }
    };
    
    return NextResponse.json(testResult);
    
  } catch (error) {
    console.error('❌ Session test failed:', error);
    
    return NextResponse.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      error: error.message,
      session: {
        exists: false
      }
    }, { status: 500 });
  }
}
