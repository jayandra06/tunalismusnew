import { NextResponse } from "next/server";
import Batch from "../../../../models/Batch";
import Course from "../../../../models/Course";
import { connectToDB } from "../../../../lib/mongodb";
import { authorize } from "../../../../lib/auth";

export async function GET(req) {
  try {
    await connectToDB();

    const userRole = req.headers.get("X-User-Role");
    const userId = req.headers.get("X-User-Id");

    // Only students can access this route
    if (!authorize("student", userRole)) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    // Find all batches the student is in
    const studentBatches = await Batch.find({ students: userId });

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
