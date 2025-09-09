import { NextResponse } from "next/server";
import Progress from "../../../models/Progress";
import { connectToDB } from "../../../lib/mongodb";
import { authorize } from "../../../lib/auth";

export async function POST(req) {
  try {
    await connectToDB();

    const userRole = req.headers.get("X-User-Role");

    if (!authorize("trainer", userRole)) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { student, course, completedLessons, totalLessons } =
      await req.json();

    if (!student || !course || !totalLessons) {
      return NextResponse.json(
        { message: "Student, course, and total lessons are required" },
        { status: 400 }
      );
    }

    const percentage = (completedLessons / totalLessons) * 100;

    const progress = await Progress.findOneAndUpdate(
      { student, course },
      { completedLessons, totalLessons, percentage },
      { new: true, upsert: true }
    );

    return NextResponse.json({ progress }, { status: 200 });
  } catch (error) {
    console.error("Error in POST /api/progress:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function GET(req) {
  try {
    await connectToDB();

    const userRole = req.headers.get("X-User-Role");
    const userId = req.headers.get("X-User-Id");

    if (!authorize("student", userRole)) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const progress = await Progress.find({ student: userId }).populate(
      "course",
      "title"
    );

    return NextResponse.json({ progress }, { status: 200 });
  } catch (error) {
    console.error("Error in GET /api/progress:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
