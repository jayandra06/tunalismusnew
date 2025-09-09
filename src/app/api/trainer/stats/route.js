import { NextResponse } from "next/server";
import User from "../../../../models/User";
import Course from "../../../../models/Course";
import Batch from "../../../../models/Batch";
import Progress from "../../../../models/Progress";
import { connectToDB } from "../../../../lib/mongodb";
import { authorize } from "../../../../lib/auth";

export async function GET(req) {
  try {
    await connectToDB();

    // Get user info from middleware headers
    const userId = req.headers.get("X-User-Id");
    const userRole = req.headers.get("X-User-Role");
    
    if (!authorize("trainer", userRole)) {
      return NextResponse.json({ message: "Trainer access required" }, { status: 403 });
    }

    // Get trainer's batches
    const trainerBatches = await Batch.find({ trainer: userId })
      .populate('students', 'name email');

    // Calculate stats
    const totalBatches = trainerBatches.length;
    const totalStudents = trainerBatches.reduce((acc, batch) => acc + batch.students.length, 0);
    
    // Calculate total teaching hours (mock calculation based on batch duration)
    const totalHours = totalBatches * 40; // Assuming 40 hours per batch on average
    
    // Count upcoming sessions (mock data for now)
    const upcomingSessions = 8; // This would come from a Meeting/Session model
    
    // Count completed sessions (mock data for now)
    const completedSessions = 24; // This would come from a Meeting/Session model
    
    // Average rating (mock data for now)
    const averageRating = 4.8;

    const stats = {
      totalBatches,
      totalStudents,
      upcomingSessions,
      completedSessions,
      averageRating,
      totalHours
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching trainer stats:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

