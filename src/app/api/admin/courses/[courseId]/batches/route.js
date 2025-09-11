import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import Course from "../../../../../../models/Course";
import Batch from "../../../../../../models/Batch";
import User from "../../../../../../models/User";
import { connectToDB } from "../../../../../../lib/mongodb";
import { BatchManagementService } from "../../../../../../lib/batch-management-service";

export async function GET(req, { params }) {
  try {
    // Check authentication directly in the API route
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    
    if (token.role !== "admin") {
      return NextResponse.json({ message: "Admin access required" }, { status: 403 });
    }

    await connectToDB();

    const { courseId } = await params;

    // Get course
    const course = await Course.findById(courseId);
    if (!course) {
      return NextResponse.json({ message: "Course not found" }, { status: 404 });
    }

    // Get batch distribution summary
    const batchSummary = await BatchManagementService.getBatchDistributionSummary(courseId);

    return NextResponse.json({ batchSummary });

  } catch (error) {
    console.error("Error fetching batch summary:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(req, { params }) {
  try {
    // First try to get user info from middleware headers
    let userRole = req.headers.get("X-User-Role");
    let userId = req.headers.get("X-User-Id");
    
    console.log('🔍 Batch API Debug - Headers:', {
      userRole,
      userId,
      hasHeaders: !!(userRole && userId)
    });
    
    // If no headers from middleware, try direct token verification
    if (!userRole || !userId) {
      console.log('⚠️ No middleware headers found, trying direct token check...');
      const token = await getToken({ 
        req, 
        secret: process.env.NEXTAUTH_SECRET,
        cookieName: 'next-auth.session-token'
      });
      
      console.log('🔍 Batch API Debug - Direct Token:', {
        hasToken: !!token,
        tokenRole: token?.role,
        tokenSub: token?.sub,
        tokenEmail: token?.email,
        environment: process.env.NODE_ENV,
        hasSessionCookie: !!req.cookies.get('next-auth.session-token'),
        sessionCookieValue: req.cookies.get('next-auth.session-token')?.value?.substring(0, 20) + '...' || 'none',
        allCookies: req.cookies.getAll().map(c => ({ name: c.name, hasValue: !!c.value }))
      });
      
      if (token) {
        userRole = token.role;
        userId = token.sub;
        console.log('✅ Got role from direct token:', userRole);
      }
    }
    
    if (!userRole || !userId) {
      console.log('❌ No authentication found in batch API route');
      return NextResponse.json({ 
        message: "Unauthorized",
        debug: {
          hasToken: false,
          hasHeaders: !!(req.headers.get("X-User-Role") && req.headers.get("X-User-Id")),
          availableCookies: req.cookies.getAll().map(c => c.name),
          environment: process.env.NODE_ENV
        }
      }, { status: 401 });
    }
    
    if (userRole !== "admin") {
      console.log('❌ Admin access denied in batch API route:', { userRole, requiredRole: 'admin' });
      return NextResponse.json({ message: "Admin access required" }, { status: 403 });
    }

    await connectToDB();

    const { courseId } = await params;
    const { action } = await req.json();

    if (action === 'create_batches') {
      // Create batches for the course
      const result = await BatchManagementService.createBatchesForCourse(courseId);
      return NextResponse.json({ result }, { status: 201 });
    } else if (action === 'recalculate_batches') {
      // Recalculate batches
      const result = await BatchManagementService.recalculateBatches(courseId);
      return NextResponse.json({ result }, { status: 200 });
    } else {
      return NextResponse.json(
        { message: "Invalid action" },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error("Error managing batches:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
