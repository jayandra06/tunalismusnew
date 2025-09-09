import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import Batch from "../../../../models/Batch";
import Course from "../../../../models/Course";
import { connectToDB } from "../../../../lib/mongodb";
import { authorize } from "../../../../lib/auth";

export async function GET(req) {
  try {
    await connectToDB();

    const userRole = req.headers.get("X-User-Role");
    const userId = req.headers.get("X-User-Id");

    // Fallback authentication if headers are missing
    let actualUserRole = userRole;
    let actualUserId = userId;

    if (!userRole || !userId) {
      console.log("⚠️ No X-User-Role or X-User-Id header found, trying direct token check...");
      const token = await getToken({ 
        req, 
        secret: process.env.NEXTAUTH_SECRET 
      });

      if (token) {
        actualUserRole = token.role;
        actualUserId = token.sub;
        console.log(`✅ Got role from direct token: ${actualUserRole}`);
      } else {
        console.log("❌ No valid token found");
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
      }
    }

    // Only students can access this route
    if (!authorize("student", actualUserRole)) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    // Find all batches the student is in
    const studentBatches = await Batch.find({ students: actualUserId });

    // Get the unique course IDs from these batches
    const courseIds = [...new Set(studentBatches.map(batch => batch.course))];

    // Find all courses with these IDs
    const courses = await Course.find({ _id: { $in: courseIds } });

    return NextResponse.json({ courses }, { status: 200 });
  } catch (error) {
    console.error("Error in GET /api/student/courses:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
