import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import Batch from "../../../../models/Batch";
import Course from "../../../../models/Course";
import Enrollment from "../../../../models/Enrollment";
import { connectToDB } from "../../../../lib/mongodb";
import { authorize } from "../../../../lib/auth";

export async function GET(req) {
  try {
    await connectToDB();

    // Debug: Log all headers
    console.log('🔍 Trainer Batches API Headers Debug:', {
      allHeaders: Object.fromEntries(req.headers.entries()),
      userRole: req.headers.get("X-User-Role"),
      userId: req.headers.get("X-User-Id"),
      authorization: req.headers.get("authorization"),
      cookie: req.headers.get("cookie")
    });

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
      console.log('❌ Authorization failed:', { userRole, requiredRole: 'trainer' });
      return NextResponse.json({ 
        message: "Forbidden",
        debug: {
          userRole,
          userId,
          hasToken: !!userRole,
          environment: process.env.NODE_ENV,
          timestamp: new Date().toISOString()
        }
      }, { status: 403 });
    }

    // Find all batches assigned to this trainer (using instructor field)
    const batches = await Batch.find({ instructor: userId })
      .populate('course', 'language level month year name description')
      .sort({ startDate: -1 });

    // Get students for each batch through enrollments
    const batchesWithStudents = await Promise.all(
      batches.map(async (batch) => {
        const enrollments = await Enrollment.find({ 
          batch: batch._id, 
          status: { $in: ['enrolled', 'active'] } 
        }).populate('student', 'name email');
        
        const students = enrollments.map(enrollment => ({
          _id: enrollment.student._id,
          name: enrollment.student.name,
          email: enrollment.student.email,
          enrollmentId: enrollment._id,
          status: enrollment.status,
          progress: enrollment.progress
        }));

        // Generate displayName for the course
        const course = batch.course;
        let displayName = course.name;
        if (!displayName) {
          const monthNames = [
            'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
            'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
          ];
          displayName = `${course.language} ${course.level} ${monthNames[course.month - 1]} ${course.year}`;
        }

        // Initialize Jitsi meeting if not already done
        if (!batch.jitsiMeeting.roomName) {
          batch.initializeJitsiMeeting();
          await batch.save();
        }

        // Get meeting information
        const jitsiService = (await import("../../../../lib/jitsi-service")).default;
        const meetingInfo = jitsiService.getMeetingInfo(batch._id.toString(), displayName);
        
        // Generate meeting URL for trainer
        const trainer = {
          name: req.headers.get("X-User-Name") || "Trainer",
          email: req.headers.get("X-User-Email") || "trainer@example.com"
        };
        
        const meetingUrl = await batch.getJitsiMeetingUrl(trainer, 'trainer');

        return {
          ...batch.toObject(),
          course: {
            ...course,
            displayName
          },
          students,
          meeting: {
            roomName: meetingInfo.roomName,
            roomPassword: meetingInfo.password,
            meetingUrl,
            isActive: batch.jitsiMeeting.isActive,
            lastMeetingDate: batch.jitsiMeeting.lastMeetingDate
          }
        };
      })
    );

    return NextResponse.json({ batches: batchesWithStudents }, { status: 200 });
  } catch (error) {
    console.error("Error in GET /api/trainer/batches:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
