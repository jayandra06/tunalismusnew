import { NextResponse } from "next/server";
import Course from "../../../../models/Course";
import { connectToDB } from "../../../../lib/mongodb";

export async function GET(req, { params }) {
  try {
    console.log('🔍 API Route started');
    
    await connectToDB();
    console.log('✅ Database connected');

    const { courseId } = await params;
    console.log('🔍 Course ID from params:', courseId);
    
    // Validate courseId
    if (!courseId) {
      console.log('❌ No courseId provided');
      return NextResponse.json({ message: "Course ID is required" }, { status: 400 });
    }
    
    // Try to find the course without population first to see if it exists
    console.log('🔍 Searching for course...');
    const courseExists = await Course.findById(courseId);
    console.log('🔍 Course exists:', !!courseExists);
    
    if (!courseExists) {
      console.log('❌ Course not found with ID:', courseId);
      return NextResponse.json({ message: "Course not found" }, { status: 404 });
    }

    // Now try to populate the instructor field
    console.log('🔍 Populating course data...');
    const course = await Course.findById(courseId)
      .populate('instructor', 'name email')
      .populate('trainers', 'name email');

    console.log('✅ Course found and populated:', {
      id: course._id,
      name: course.name,
      language: course.language,
      level: course.level,
      hasInstructor: !!course.instructor,
      hasTrainers: course.trainers?.length > 0
    });

    return NextResponse.json({ course }, { status: 200 });
  } catch (error) {
    console.error("❌ Error in GET /api/courses/[courseId]:", error);
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
      courseId: params?.courseId,
      name: error.name
    });
    return NextResponse.json(
      { 
        message: "Internal Server Error",
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}
