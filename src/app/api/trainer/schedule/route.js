import { NextResponse } from "next/server";
import Batch from "../../../../models/Batch";
import { connectToDB } from "../../../../lib/mongodb";
import { authorize } from "../../../../lib/auth";

export async function GET(req) {
  try {
    await connectToDB();

    const userRole = req.headers.get("X-User-Role");
    const userId = req.headers.get("X-User-Id");

    // Only trainers can access this route
    if (!authorize("trainer", userRole)) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    // Find all batches assigned to this trainer
    const trainerBatches = await Batch.find({ trainer: userId })
      .populate('course', 'title')
      .populate('students', 'name email');

    // For now, return mock session data since we don't have a Meeting/Session model
    // In a real implementation, you would query a Meeting or Session model
    const mockSessions = [
      {
        _id: '1',
        title: 'React Components Deep Dive',
        batch: {
          _id: trainerBatches[0]?._id || 'batch1',
          name: trainerBatches[0]?.name || 'React Fundamentals - Batch A',
          course: { title: trainerBatches[0]?.course?.title || 'React Fundamentals' }
        },
        type: 'lecture',
        date: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        startTime: '10:00',
        endTime: '12:00',
        duration: 120,
        location: 'Online - Zoom',
        status: 'scheduled',
        description: 'Learn about React components, props, and state management',
        students: trainerBatches[0]?.students?.length || 25,
        materials: ['React Components Guide.pdf', 'Component Examples.zip']
      },
      {
        _id: '2',
        title: 'JavaScript Async Programming Workshop',
        batch: {
          _id: trainerBatches[1]?._id || 'batch2',
          name: trainerBatches[1]?.name || 'JavaScript Advanced - Batch B',
          course: { title: trainerBatches[1]?.course?.title || 'JavaScript Advanced' }
        },
        type: 'workshop',
        date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Day after tomorrow
        startTime: '14:00',
        endTime: '17:00',
        duration: 180,
        location: 'Classroom 101',
        status: 'scheduled',
        description: 'Hands-on workshop on promises, async/await, and error handling',
        students: trainerBatches[1]?.students?.length || 18,
        materials: ['Async Programming Guide.pdf', 'Workshop Exercises.zip']
      },
      {
        _id: '3',
        title: 'Project Review Session',
        batch: {
          _id: trainerBatches[0]?._id || 'batch1',
          name: trainerBatches[0]?.name || 'React Fundamentals - Batch A',
          course: { title: trainerBatches[0]?.course?.title || 'React Fundamentals' }
        },
        type: 'review',
        date: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
        startTime: '15:00',
        endTime: '16:30',
        duration: 90,
        location: 'Online - Zoom',
        status: 'completed',
        description: 'Review of student projects and feedback session',
        students: trainerBatches[0]?.students?.length || 25,
        materials: ['Project Guidelines.pdf']
      },
      {
        _id: '4',
        title: 'Node.js Fundamentals',
        batch: {
          _id: trainerBatches[2]?._id || 'batch3',
          name: trainerBatches[2]?.name || 'Node.js Backend - Batch C',
          course: { title: trainerBatches[2]?.course?.title || 'Node.js Backend Development' }
        },
        type: 'lecture',
        date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        startTime: '18:00',
        endTime: '20:00',
        duration: 120,
        location: 'Online - Zoom',
        status: 'scheduled',
        description: 'Introduction to Node.js and server-side development',
        students: trainerBatches[2]?.students?.length || 20,
        materials: ['Node.js Basics.pdf', 'Setup Guide.pdf']
      }
    ];

    return NextResponse.json({ sessions: mockSessions }, { status: 200 });
  } catch (error) {
    console.error("Error in GET /api/trainer/schedule:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
