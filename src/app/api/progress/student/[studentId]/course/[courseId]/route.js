import { NextResponse } from "next/server";
import Progress from "../../../../../../../models/Progress";
import { connectToDB } from "../../../../../../../lib/mongodb";

export async function GET(req, { params }) {
  try {
    await connectToDB();

    const progress = await Progress.findOne({
      student: params.studentId,
      course: params.courseId,
    });

    if (!progress) {
      return NextResponse.json(
        { message: "Progress not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ progress }, { status: 200 });
  } catch (error) {
    console.error(
      `Error in GET /api/progress/student/${params.studentId}/course/${params.courseId}:`,
      error
    );
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
