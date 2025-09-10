import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import User from "../../../../models/User";
import Course from "../../../../models/Course";
import Batch from "../../../../models/Batch";
import Enrollment from "../../../../models/Enrollment";
import Progress from "../../../../models/Progress";
import { connectToDB } from "../../../../lib/mongodb";
import { authorize } from "../../../../lib/auth";

export async function GET(req) {
  try {
    await connectToDB();

    // Get user info from middleware headers first
    let userId = req.headers.get("X-User-Id");
    let userRole = req.headers.get("X-User-Role");
    
    // Fallback: If headers aren't set by middleware, try to get token directly
    if (!userRole) {
      console.log('⚠️ No X-User-Role header found, trying direct token check...');
      const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
      if (token) {
        userRole = token.role;
        userId = token.sub;
        console.log('✅ Got role from direct token:', userRole);
      }
    }
    
    if (!authorize("trainer", userRole)) {
      return NextResponse.json({ message: "Trainer access required" }, { status: 403 });
    }

    // Get trainer's batches (using instructor field)
    const trainerBatches = await Batch.find({ instructor: userId });

    // Calculate stats
    const totalBatches = trainerBatches.length;
    
    // Get total students across all trainer's batches
    const batchIds = trainerBatches.map(batch => batch._id);
    const totalStudents = await Enrollment.countDocuments({ 
      batch: { $in: batchIds }, 
      status: { $in: ['enrolled', 'active'] } 
    });
    
    // Calculate total teaching hours (mock calculation based on batch duration)
    const totalHours = totalBatches * 40; // Assuming 40 hours per batch on average
    
    // Count upcoming sessions (mock data for now - would come from Meeting/Session model)
    const upcomingSessions = Math.floor(Math.random() * 10) + 5; // Random between 5-15
    
    // Count completed sessions (mock data for now - would come from Meeting/Session model)
    const completedSessions = Math.floor(Math.random() * 20) + 15; // Random between 15-35
    
    // Average rating (mock data for now - would come from student feedback)
    const averageRating = (Math.random() * 1.5 + 3.5).toFixed(1); // Random between 3.5-5.0

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

