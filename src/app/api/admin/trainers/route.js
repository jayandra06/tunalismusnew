import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import User from "../../../../models/User";
import { connectToDB } from "../../../../lib/mongodb";

export async function GET(req) {
  try {
    await connectToDB();

    // Debug: Log all headers
    console.log('🔍 Admin Trainers API Headers Debug:', {
      allHeaders: Object.fromEntries(req.headers.entries()),
      userRole: req.headers.get("X-User-Role"),
      userId: req.headers.get("X-User-Id"),
      authorization: req.headers.get("authorization"),
      cookie: req.headers.get("cookie")
    });

    // Get user role from middleware headers first
    let userRole = req.headers.get("X-User-Role");
    
    // Fallback: If headers aren't set by middleware, try to get token directly
    if (!userRole) {
      console.log('⚠️ No X-User-Role header found, trying direct token check...');
      const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
      if (token) {
        userRole = token.role;
        console.log('✅ Got role from direct token:', userRole);
      }
    }
    
    if (userRole !== "admin") {
      console.log('❌ Admin access denied in trainers API route:', { userRole, expected: 'admin' });
      return NextResponse.json({ message: "Admin access required" }, { status: 403 });
    }
    
    console.log('✅ Admin access granted in trainers API route');

    // Fetch all trainers (users with role 'trainer')
    const trainers = await User.find({ role: 'trainer' })
      .select('name email role status createdAt')
      .sort({ createdAt: -1 });

    return NextResponse.json({ trainers });

  } catch (error) {
    console.error("Error fetching trainers:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
