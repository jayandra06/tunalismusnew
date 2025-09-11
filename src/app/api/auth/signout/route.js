import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function POST(req) {
  try {
    console.log('🔓 Custom signout endpoint called');
    
    // Get the token to verify the user is authenticated
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    
    if (token) {
      console.log('🔓 Signing out user:', token.email);
    }

    // Create response with cleared cookies
    const response = NextResponse.json({ 
      message: 'Signed out successfully',
      success: true 
    });

    // Clear all NextAuth cookies
    const cookiesToClear = [
      'next-auth.session-token',
      'next-auth.callback-url', 
      'next-auth.csrf-token',
      '__Secure-next-auth.session-token',
      '__Host-next-auth.csrf-token'
    ];

    cookiesToClear.forEach(cookieName => {
      // Clear cookie for current domain
      response.cookies.set(cookieName, '', {
        expires: new Date(0),
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        domain: process.env.NODE_ENV === 'production' ? 'tunalismus.in' : undefined
      });
      
      // Also clear cookie without domain (fallback)
      response.cookies.set(cookieName, '', {
        expires: new Date(0),
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      });
    });

    console.log('✅ All cookies cleared');
    return response;

  } catch (error) {
    console.error('❌ Signout error:', error);
    return NextResponse.json(
      { message: 'Signout failed', error: error.message },
      { status: 500 }
    );
  }
}
