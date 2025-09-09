import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import User from "../../../../models/User";
import Course from "../../../../models/Course";
import Payment from "../../../../models/Payment";
import { connectToDB } from "../../../../lib/mongodb";

export async function GET(req) {
  try {
    // Check authentication directly in the API route
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    
    console.log('🔍 API Route Debug:', {
      hasToken: !!token,
      tokenRole: token?.role,
      tokenSub: token?.sub,
      cookies: req.cookies,
      hasSessionCookie: !!req.cookies['next-auth.session-token']
    });
    
    if (!token) {
      console.log('❌ No token found in API route');
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    
    if (token.role !== "admin") {
      console.log('❌ Admin access denied in API route:', { tokenRole: token.role, requiredRole: 'admin' });
      return NextResponse.json({ message: "Admin access required" }, { status: 403 });
    }

    await connectToDB();

    // Fetch statistics
    const [
      totalUsers,
      totalCourses,
      totalTrainers,
      totalPayments,
      activeStudents,
      completedCourses
    ] = await Promise.all([
      User.countDocuments(),
      Course.countDocuments(),
      User.countDocuments({ role: "trainer" }),
      Payment.find({ status: "completed" }),
      User.countDocuments({ role: "student", status: "active" }),
      Course.countDocuments({ status: "completed" })
    ]);

    // Calculate total revenue
    const totalRevenue = totalPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0);

    const stats = {
      totalUsers,
      totalCourses,
      totalTrainers,
      totalRevenue,
      activeStudents,
      completedCourses
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

