import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function GET(req) {
  try {
    // Get token to check authentication
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    
    // Check environment variables (without exposing sensitive data)
    const envCheck = {
      NODE_ENV: process.env.NODE_ENV,
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'SET' : 'NOT_SET',
      MONGODB_URI: process.env.MONGODB_URI ? 'SET' : 'NOT_SET',
      JITSI_DOMAIN: process.env.JITSI_DOMAIN,
      hasToken: !!token,
      tokenRole: token?.role,
      tokenSub: token?.sub,
      timestamp: new Date().toISOString()
    };
    
    return NextResponse.json({
      status: 'healthy',
      environment: envCheck,
      message: 'Production environment check'
    });
    
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
