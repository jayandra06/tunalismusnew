import { NextResponse } from "next/server";
import Batch from "../../../../models/Batch";
import User from "../../../../models/User";
import Progress from "../../../../models/Progress";
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
      .populate('students', 'name email phone');

    // Get all students from these batches
    const allStudents = [];
    const batchMap = new Map();

    for (const batch of trainerBatches) {
      batchMap.set(batch._id.toString(), batch);
      for (const student of batch.students) {
        // Check if student is already in the list
        const existingStudent = allStudents.find(s => s._id.toString() === student._id.toString());
        if (!existingStudent) {
          allStudents.push({
            ...student.toObject(),
            batch: {
              _id: batch._id,
              name: batch.name,
              course: batch.course
            }
          });
        }
      }
    }

    // Get progress data for each student
    const studentsWithProgress = await Promise.all(
      allStudents.map(async (student) => {
        const progressRecords = await Progress.find({ student: student._id });
        const totalProgress = progressRecords.length > 0 
          ? Math.round(progressRecords.reduce((acc, p) => acc + p.percentage, 0) / progressRecords.length)
          : 0;
        
        const totalLessons = progressRecords.reduce((acc, p) => acc + p.totalLessons, 0);
        const completedLessons = progressRecords.reduce((acc, p) => acc + p.completedLessons, 0);
        
        // Mock additional data for now
        const attendance = Math.floor(Math.random() * 30) + 70; // 70-100%
        const assignments = {
          completed: Math.floor(Math.random() * 8) + 2,
          total: 10
        };
        
        let status = 'active';
        let performance = 'good';
        
        if (totalProgress < 30) {
          status = 'at-risk';
          performance = 'needs-improvement';
        } else if (totalProgress > 80) {
          performance = 'excellent';
        }

        return {
          ...student,
          progress: totalProgress,
          attendance,
          assignments,
          lastActivity: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Random within last week
          status,
          performance,
          joinDate: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000) // Random within last 60 days
        };
      })
    );

    return NextResponse.json({ students: studentsWithProgress }, { status: 200 });
  } catch (error) {
    console.error("Error in GET /api/trainer/students:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
