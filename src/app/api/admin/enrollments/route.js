import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import Enrollment from "../../../../models/Enrollment";
import Course from "../../../../models/Course";
import User from "../../../../models/User";
import { connectToDB } from "../../../../lib/mongodb";

export async function GET(req) {
  try {
    await connectToDB();

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
      console.log('❌ Admin access denied in enrollments API route:', { userRole, expected: 'admin' });
      return NextResponse.json({ message: "Admin access required" }, { status: 403 });
    }
    
    console.log('✅ Admin access granted in enrollments API route');

    // Get query parameters
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const status = searchParams.get('status');
    const courseId = searchParams.get('courseId');
    const batchId = searchParams.get('batchId');

    // Build filter object
    const filter = {};
    if (status) filter.status = status;
    if (courseId) filter.course = courseId;
    if (batchId) filter.batch = batchId;

    // Calculate skip value for pagination
    const skip = (page - 1) * limit;

    // Fetch enrollments with populated data
    const enrollments = await Enrollment.find(filter)
      .populate('student', 'name email phone')
      .populate('course', 'displayName language level')
      .populate('batch', 'batchNumber batchType')
      .sort({ enrolledAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const total = await Enrollment.countDocuments(filter);

    return NextResponse.json({
      enrollments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error("Error fetching enrollments:", error);
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
      console.log('⚠️ No X-User-Role header found, trying direct token check...');
      const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
      if (token) {
        userRole = token.role;
        console.log('✅ Got role from direct token:', userRole);
      }
    }
    
    if (userRole !== "admin") {
      console.log('❌ Admin access denied in enrollments API route:', { userRole, expected: 'admin' });
      return NextResponse.json({ message: "Admin access required" }, { status: 403 });
    }
    
    console.log('✅ Admin access granted in enrollments API route');

    const {
      studentId,
      courseId,
      batchType,
      paymentAmount,
      paymentMethod = 'Razorpay'
    } = await req.json();

    // Validate required fields
    if (!studentId || !courseId || !batchType || !paymentAmount) {
      return NextResponse.json(
        { message: "Student ID, Course ID, batch type, and payment amount are required" },
        { status: 400 }
      );
    }

    // Check if student exists
    const student = await User.findById(studentId);
    if (!student) {
      return NextResponse.json(
        { message: "Student not found" },
        { status: 404 }
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

    // Validate batch type
    if (!course.batchTypes[batchType]?.enabled) {
      return NextResponse.json(
        { message: `Batch type '${batchType}' is not enabled for this course` },
        { status: 400 }
      );
    }

    // Check if student is already enrolled in this course
    const existingEnrollment = await Enrollment.findOne({
      student: studentId,
      course: courseId,
      status: { $in: ['enrolled', 'active', 'pending'] }
    });

    if (existingEnrollment) {
      return NextResponse.json(
        { message: "Student is already enrolled in this course" },
        { status: 400 }
      );
    }

    // Check course capacity
    const currentEnrollments = await Enrollment.countDocuments({
      course: courseId,
      status: { $in: ['enrolled', 'active'] }
    });

    if (currentEnrollments >= course.totalCapacity) {
      return NextResponse.json(
        { message: "Course is full" },
        { status: 400 }
      );
    }

    // Create new enrollment
    const enrollment = new Enrollment({
      student: studentId,
      course: courseId,
      batchType,
      status: 'pending',
      payment: {
        amount: paymentAmount,
        status: 'pending',
        paymentMethod
      },
      enrolledAt: new Date()
    });

    await enrollment.save();

    // Populate the enrollment data
    await enrollment.populate([
      { path: 'student', select: 'name email phone' },
      { path: 'course', select: 'displayName language level' }
    ]);

    return NextResponse.json({ enrollment }, { status: 201 });

  } catch (error) {
    console.error("Error creating enrollment:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
