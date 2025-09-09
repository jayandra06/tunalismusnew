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

    // Only trainers can access this route
    if (!authorize("trainer", userRole)) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    // Find all batches assigned to this trainer
    const batches = await Batch.find({ trainer: userId })
      .populate('course', 'title description')
      .populate('students', 'name email')
      .sort({ startDate: -1 });

    return NextResponse.json({ batches }, { status: 200 });
  } catch (error) {
    console.error("Error in GET /api/trainer/batches:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
