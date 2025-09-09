import { NextResponse } from "next/server";
import User from "../../../../models/User";
import Course from "../../../../models/Course";
import Batch from "../../../../models/Batch";
import Progress from "../../../../models/Progress";
import Enrollment from "../../../../models/Enrollment";
import { connectToDB } from "../../../../lib/mongodb";
import { authorize } from "../../../../lib/auth";

export async function GET(req) {
  try {
    await connectToDB();

    // Get user info from middleware headers
    const userId = req.headers.get("X-User-Id");
    const userRole = req.headers.get("X-User-Role");
    
    if (!authorize("student", userRole)) {
      return NextResponse.json({ message: "Student access required" }, { status: 403 });
    }

    // Get student's enrollments
    const enrollments = await Enrollment.find({ student: userId }).populate('course', 'title');
    
    // Get student's progress records
    const progressRecords = await Progress.find({ student: userId });
    
    // Get student's batches
    const studentBatches = await Batch.find({ students: userId });

    // Calculate stats
    const enrolledCourses = enrollments.length;
    const completedCourses = progressRecords.filter(p => p.percentage >= 100).length;
    const averageProgress = progressRecords.length > 0 
      ? Math.round(progressRecords.reduce((acc, p) => acc + p.percentage, 0) / progressRecords.length)
      : 0;
    
    // Calculate total learning hours (mock calculation based on completed lessons)
    const totalLessons = progressRecords.reduce((acc, p) => acc + p.completedLessons, 0);
    const totalHours = Math.round(totalLessons * 0.5); // Assuming 30 minutes per lesson
    
    // Count upcoming sessions (mock data for now)
    const upcomingSessions = 5; // This would come from a Meeting/Session model
    
    // Certificates are same as completed courses for now
    const certificates = completedCourses;

    const stats = {
      enrolledCourses,
      completedCourses,
      upcomingSessions,
      totalHours,
      averageProgress,
      certificates
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching student stats:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

