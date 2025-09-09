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
      }
    ];

    return NextResponse.json({ sessions: mockSessions }, { status: 200 });
  } catch (error) {
    console.error("Error in GET /api/trainer/sessions:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    await connectToDB();

    const userRole = req.headers.get("X-User-Role");
    const userId = req.headers.get("X-User-Id");

    // Only trainers can create sessions
    if (!authorize("trainer", userRole)) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { title, batchId, type, date, startTime, endTime, location, description, materials } = body;

    // Validate required fields
    if (!title || !batchId || !type || !date || !startTime || !endTime || !location) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verify batch exists and belongs to trainer
    const batch = await Batch.findById(batchId).populate('course', 'title');
    if (!batch) {
      return NextResponse.json(
        { message: "Batch not found" },
        { status: 404 }
      );
    }

    if (batch.trainer.toString() !== userId) {
      return NextResponse.json(
        { message: "Access denied" },
        { status: 403 }
      );
    }

    // For now, return a mock session since we don't have a Session model
    // In a real implementation, you would create a new Session document
    const newSession = {
      _id: Date.now().toString(),
      title,
      batch: {
        _id: batch._id,
        name: batch.name,
        course: batch.course
      },
      type,
      date: new Date(date),
      startTime,
      endTime,
      duration: calculateDuration(startTime, endTime),
      location,
      status: 'scheduled',
      description: description || '',
      students: batch.students.length,
      materials: materials || [],
      createdAt: new Date()
    };

    return NextResponse.json(
      { 
        message: "Session created successfully", 
        session: newSession 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in POST /api/trainer/sessions:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// Helper function to calculate duration in minutes
function calculateDuration(startTime, endTime) {
  const [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = endTime.split(':').map(Number);
  
  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;
  
  return endMinutes - startMinutes;
}
