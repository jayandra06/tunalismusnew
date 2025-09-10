import { NextResponse } from "next/server";
import Batch from "../../../../models/Batch";
import Session from "../../../../models/Session";
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
    const trainerBatches = await Batch.find({ instructor: userId })
      .populate('course', 'title name language level')
      .select('_id name course');

    // Get all sessions for the trainer's batches
    const batchIds = trainerBatches.map(batch => batch._id);
    const sessions = await Session.find({ batch: { $in: batchIds } })
      .populate('batch', 'name course')
      .populate('batch.course', 'title name language level')
      .populate('attendance.student', 'name email')
      .sort({ date: 1, startTime: 1 });

    // Format sessions for frontend
    const formattedSessions = sessions.map(session => {
      const batch = session.batch;
      const course = batch.course;
      
      // Generate display name for the course
      let courseDisplayName = course.name || course.title;
      if (!courseDisplayName && course.language && course.level) {
        const monthNames = [
          'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
          'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
        ];
        courseDisplayName = `${course.language} ${course.level} ${monthNames[course.month - 1]} ${course.year}`;
      }

      return {
        _id: session._id,
        title: session.title,
        batch: {
          _id: batch._id,
          name: batch.name,
          course: { 
            title: courseDisplayName || 'Course',
            name: course.name,
            language: course.language,
            level: course.level
          }
        },
        type: session.type,
        date: session.date,
        startTime: session.startTime,
        endTime: session.endTime,
        duration: session.duration,
        location: session.location,
        status: session.status,
        description: session.description,
        students: session.attendance.length,
        materials: session.materials.map(m => m.name),
        objectives: session.objectives,
        isOnline: session.isOnline,
        meetingUrl: session.meetingUrl,
        attendance: session.attendance,
        trainerNotes: session.trainerNotes,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt
      };
    });

    return NextResponse.json({ sessions: formattedSessions }, { status: 200 });
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
    const batch = await Batch.findById(batchId).populate('course', 'title name language level');
    if (!batch) {
      return NextResponse.json(
        { message: "Batch not found" },
        { status: 404 }
      );
    }

    if (batch.instructor.toString() !== userId) {
      return NextResponse.json(
        { message: "Access denied" },
        { status: 403 }
      );
    }

    // Create new session
    const newSession = new Session({
      title,
      batch: batchId,
      type,
      date: new Date(date),
      startTime,
      endTime,
      duration: calculateDuration(startTime, endTime),
      location,
      status: 'scheduled',
      description: description || '',
      materials: materials ? materials.map(m => ({
        name: m,
        type: 'document'
      })) : [],
      isOnline: location.toLowerCase().includes('online') || location.toLowerCase().includes('zoom') || location.toLowerCase().includes('meet')
    });

    await newSession.save();

    // Populate the session for response
    await newSession.populate([
      { path: 'batch', select: 'name course' },
      { path: 'batch.course', select: 'title name language level' }
    ]);

    // Format response
    const course = newSession.batch.course;
    let courseDisplayName = course.name || course.title;
    if (!courseDisplayName && course.language && course.level) {
      const monthNames = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
      ];
      courseDisplayName = `${course.language} ${course.level} ${monthNames[course.month - 1]} ${course.year}`;
    }

    const formattedSession = {
      _id: newSession._id,
      title: newSession.title,
      batch: {
        _id: newSession.batch._id,
        name: newSession.batch.name,
        course: { 
          title: courseDisplayName || 'Course',
          name: course.name,
          language: course.language,
          level: course.level
        }
      },
      type: newSession.type,
      date: newSession.date,
      startTime: newSession.startTime,
      endTime: newSession.endTime,
      duration: newSession.duration,
      location: newSession.location,
      status: newSession.status,
      description: newSession.description,
      students: 0, // No students enrolled yet
      materials: newSession.materials.map(m => m.name),
      objectives: newSession.objectives,
      isOnline: newSession.isOnline,
      meetingUrl: newSession.meetingUrl,
      attendance: [],
      trainerNotes: newSession.trainerNotes,
      createdAt: newSession.createdAt,
      updatedAt: newSession.updatedAt
    };

    return NextResponse.json(
      { 
        message: "Session created successfully", 
        session: formattedSession 
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
