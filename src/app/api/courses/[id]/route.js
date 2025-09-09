import { NextResponse } from "next/server";
import Course from "../../../../models/Course";
import { connectToDB } from "../../../../lib/mongodb";

export async function GET(req, { params }) {
  try {
    await connectToDB();

    const course = await Course.findById(params.id)
      .populate('instructor', 'name email');

    if (!course) {
      return NextResponse.json({ message: "Course not found" }, { status: 404 });
    }

    return NextResponse.json({ course }, { status: 200 });
  } catch (error) {
    console.error("Error in GET /api/courses/[id]:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}