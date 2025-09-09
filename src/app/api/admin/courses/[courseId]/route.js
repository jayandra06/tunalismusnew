import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import Course from "../../../../../models/Course";
import { connectToDB } from "../../../../../lib/mongodb";

export async function GET(req, { params }) {
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
      console.log('❌ Admin access denied in individual course API route:', { userRole, expected: 'admin' });
      return NextResponse.json({ message: "Admin access required" }, { status: 403 });
    }
    
    console.log('✅ Admin access granted in individual course API route');

    const { courseId } = await params;

    // Find the course by ID and populate instructor
    const course = await Course.findById(courseId).populate('instructor', 'name email');
    
    if (!course) {
      return NextResponse.json({ message: "Course not found" }, { status: 404 });
    }

    return NextResponse.json({ course });

  } catch (error) {
    console.error("Error fetching course:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PUT(req, { params }) {
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
      console.log('❌ Admin access denied in individual course update API route:', { userRole, expected: 'admin' });
      return NextResponse.json({ message: "Admin access required" }, { status: 403 });
    }
    
    console.log('✅ Admin access granted in individual course update API route');

    const { courseId } = await params;
    const updateData = await req.json();

    // Find the course by ID
    const course = await Course.findById(courseId);
    
    if (!course) {
      return NextResponse.json({ message: "Course not found" }, { status: 404 });
    }

    // Update the course with new data
    const updatedCourse = await Course.findByIdAndUpdate(
      courseId,
      updateData,
      { new: true, runValidators: true }
    ).populate('instructor', 'name email');

    return NextResponse.json({ 
      message: "Course updated successfully",
      course: updatedCourse 
    });

  } catch (error) {
    console.error("Error updating course:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
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
      console.log('❌ Admin access denied in individual course delete API route:', { userRole, expected: 'admin' });
      return NextResponse.json({ message: "Admin access required" }, { status: 403 });
    }
    
    console.log('✅ Admin access granted in individual course delete API route');

    const { courseId } = await params;

    // Find the course by ID
    const course = await Course.findById(courseId);
    
    if (!course) {
      return NextResponse.json({ message: "Course not found" }, { status: 404 });
    }

    // Delete the course
    await Course.findByIdAndDelete(courseId);

    return NextResponse.json({ message: "Course deleted successfully" });

  } catch (error) {
    console.error("Error deleting course:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}