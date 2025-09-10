import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import Batch from "../../../../models/Batch";
import Course from "../../../../models/Course";
import { connectToDB } from "../../../../lib/mongodb";
import { authorize } from "../../../../lib/auth";

export async function GET(req) {
  try {
    await connectToDB();

    const userRole = req.headers.get("X-User-Role");
    const userId = req.headers.get("X-User-Id");

    // Fallback authentication if headers are missing
    let actualUserRole = userRole;
    let actualUserId = userId;

    if (!userRole || !userId) {
      console.log("⚠️ No X-User-Role or X-User-Id header found, trying direct token check...");
      const token = await getToken({ 
        req, 
        secret: process.env.NEXTAUTH_SECRET 
      });

      if (token) {
        actualUserRole = token.role;
        actualUserId = token.sub;
        console.log(`✅ Got role from direct token: ${actualUserRole}`);
      } else {
        console.log("❌ No valid token found");
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
      }
    }

    // Only students can access this route
    if (!authorize("student", actualUserRole)) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    // Find all batches the student is in through enrollments
    const Enrollment = require("../../../../models/Enrollment").default;
    const enrollments = await Enrollment.find({ 
      student: actualUserId, 
      status: { $in: ['enrolled', 'active'] } 
    }).populate('batch');
    
    const studentBatches = enrollments.map(enrollment => enrollment.batch);

    // For now, return mock session data since we don't have a Meeting/Session model
    // In a real implementation, you would query a Meeting or Session model
    const mockSessions = [
      {
        _id: '1',
        title: 'React Components Deep Dive',
        course: 'React Fundamentals',
        batch: 'Batch A',
        type: 'lecture',
        date: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        startTime: '10:00',
        endTime: '12:00',
        duration: 120,
        location: 'Online - Zoom',
        instructor: 'John Doe',
        status: 'upcoming',
        description: 'Learn about React components, props, and state management'
      },
      {
        _id: '2',
        title: 'JavaScript Async Programming',
        course: 'JavaScript Advanced',
        batch: 'Batch B',
        type: 'workshop',
        date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Day after tomorrow
        startTime: '14:00',
        endTime: '17:00',
        duration: 180,
        location: 'Classroom 101',
        instructor: 'Jane Smith',
        status: 'upcoming',
        description: 'Hands-on workshop on promises, async/await, and error handling'
      },
      {
        _id: '3',
        title: 'Project Review Session',
        course: 'React Fundamentals',
        batch: 'Batch A',
        type: 'review',
        date: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
        startTime: '15:00',
        endTime: '16:30',
        duration: 90,
        location: 'Online - Zoom',
        instructor: 'John Doe',
        status: 'completed',
        description: 'Review of student projects and feedback session'
      }
    ];

    return NextResponse.json({ sessions: mockSessions }, { status: 200 });
  } catch (error) {
    console.error("Error in GET /api/student/schedule:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
