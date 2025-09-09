import { NextResponse } from "next/server";
import Batch from "../../../models/Batch";
import Course from "../../../models/Course";
import User from "../../../models/User";
import { connectToDB } from "../../../lib/mongodb";
import { authorize } from "../../../lib/auth";

export async function GET(req) {
  try {
    await connectToDB();

    const userRole = req.headers.get("X-User-Role");
    const userId = req.headers.get("X-User-Id");

    // Only trainers and admins can access this route
    if (!authorize("trainer", userRole)) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    // Find all batches assigned to this trainer (or all if admin)
    const query = userRole === 'admin' ? {} : { trainer: userId };
    const batches = await Batch.find(query)
      .populate('course', 'title description')
      .populate('students', 'name email')
      .populate('trainer', 'name email')
      .sort({ startDate: -1 });

    return NextResponse.json({ batches }, { status: 200 });
  } catch (error) {
    console.error("Error in GET /api/batches:", error);
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

    // Only trainers and admins can create batches
    if (!authorize("trainer", userRole)) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { name, course, description, startDate, endDate, maxStudents, schedule, location, type } = body;

    // Validate required fields
    if (!name || !course || !startDate || !endDate || !schedule || !location) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verify course exists
    const courseExists = await Course.findById(course);
    if (!courseExists) {
      return NextResponse.json(
        { message: "Course not found" },
        { status: 404 }
      );
    }

    // Create new batch
    const newBatch = new Batch({
      name,
      course,
      description,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      maxStudents: maxStudents || 25,
      schedule,
      location,
      type: type || 'regular',
      trainer: userId,
      students: [],
      status: 'upcoming',
      progress: 0,
      totalSessions: 0,
      completedSessions: 0
    });

    await newBatch.save();

    // Populate the response
    await newBatch.populate('course', 'title description');
    await newBatch.populate('trainer', 'name email');

    return NextResponse.json(
      { 
        message: "Batch created successfully", 
        batch: newBatch 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in POST /api/batches:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}