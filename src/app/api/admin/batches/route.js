import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import Batch from "../../../../models/Batch";
import Course from "../../../../models/Course";
import User from "../../../../models/User";
import { connectToDB } from "../../../../lib/mongodb";

export async function GET(req) {
  try {
    await connectToDB();

    // Debug: Log all headers
    console.log('🔍 Admin Batches API Headers Debug:', {
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
      console.log('❌ Admin access denied in batches API route:', { userRole, expected: 'admin' });
      return NextResponse.json({ message: "Admin access required" }, { status: 403 });
    }
    
    console.log('✅ Admin access granted in batches API route');

    // Fetch all batches with populated course and instructor data
    const batches = await Batch.find({})
      .populate({
        path: 'course',
        select: 'name description language level month year',
        options: { toJSON: { virtuals: true } }
      })
      .populate('instructor', 'name email')
      .sort({ createdAt: -1 });

    // Ensure course names are properly set
    const batchesWithCourseNames = batches.map(batch => {
      if (batch.course) {
        // If course has a name, use it; otherwise generate displayName
        if (!batch.course.name) {
          const monthNames = [
            'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
            'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
          ];
          batch.course.displayName = `${batch.course.language} ${batch.course.level} ${monthNames[batch.course.month - 1]} ${batch.course.year}`;
        } else {
          batch.course.displayName = batch.course.name;
        }
      }
      return batch;
    });

    return NextResponse.json({ batches: batchesWithCourseNames });

  } catch (error) {
    console.error("Error fetching batches:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    await connectToDB();

    // Get user role from middleware headers first
    let userRole = req.headers.get("X-User-Role");
    
    // Fallback: If headers aren't set by middleware, try to get token directly
    if (!userRole) {
      const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
      if (token) {
        userRole = token.role;
      }
    }
    
    if (userRole !== "admin") {
      return NextResponse.json({ message: "Admin access required" }, { status: 403 });
    }

    const { name, courseId, startDate, endDate, maxStudents, description } = await req.json();

    // Validate required fields
    if (!name || !courseId) {
      return NextResponse.json(
        { message: "Name and course ID are required" },
        { status: 400 }
      );
    }

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return NextResponse.json(
        { message: "Course not found" },
        { status: 404 }
      );
    }

    // Create new batch
    const batch = new Batch({
      name,
      course: courseId,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      maxStudents: maxStudents || 30,
      description,
      status: 'active',
      students: []
    });

    await batch.save();

    // Populate the created batch with course data
    await batch.populate('course', 'name description');

    return NextResponse.json({ batch }, { status: 201 });

  } catch (error) {
    console.error("Error creating batch:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

