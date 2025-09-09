import { NextResponse } from "next/server";
import Batch from "../../../../models/Batch";
import Course from "../../../../models/Course";
import { connectToDB } from "../../../../lib/mongodb";
import { authorize } from "../../../../lib/auth";

export async function GET(req) {
  try {
    await connectToDB();

    const userRole = req.headers.get("X-User-Role");
    const userId = req.headers.get("X-User-Id");

    // Only students can access this route
    if (!authorize("student", userRole)) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    // Find all batches the student is in
    const studentBatches = await Batch.find({ students: userId }).populate('course', 'title');

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
