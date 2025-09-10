import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import Batch from "../../../../models/Batch";
import User from "../../../../models/User";
import Enrollment from "../../../../models/Enrollment";
import Progress from "../../../../models/Progress";
import { connectToDB } from "../../../../lib/mongodb";
import { authorize } from "../../../../lib/auth";

export async function GET(req) {
  try {
    await connectToDB();

    // Get user role from middleware headers first
    let userRole = req.headers.get("X-User-Role");
    let userId = req.headers.get("X-User-Id");
    
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

    // Only trainers can access this route
    if (!authorize("trainer", userRole)) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    // Find all batches assigned to this trainer (using instructor field)
    const trainerBatches = await Batch.find({ instructor: userId })
      .populate('course', 'title');

    // Get all students from these batches through enrollments
    const batchIds = trainerBatches.map(batch => batch._id);
    const enrollments = await Enrollment.find({ 
      batch: { $in: batchIds }, 
      status: { $in: ['enrolled', 'active'] } 
    }).populate('student', 'name email phone').populate('batch', 'name');

    // Get unique students and their batch information
    const allStudents = [];
    const studentMap = new Map();

    for (const enrollment of enrollments) {
      const studentId = enrollment.student._id.toString();
      
      if (!studentMap.has(studentId)) {
        const batch = trainerBatches.find(b => b._id.toString() === enrollment.batch._id.toString());
        studentMap.set(studentId, {
          _id: enrollment.student._id,
          name: enrollment.student.name,
          email: enrollment.student.email,
          phone: enrollment.student.phone,
          batch: {
            _id: batch._id,
            name: batch.name,
            course: batch.course
          },
          enrollmentId: enrollment._id,
          status: enrollment.status,
          progress: enrollment.progress
        });
      }
    }

    allStudents.push(...studentMap.values());

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
