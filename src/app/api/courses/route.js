import { NextResponse } from "next/server";
import Course from "../../../models/Course";
import { connectToDB } from "../../../lib/mongodb";
import { authorize } from "../../../lib/auth";

export async function POST(req) {
  try {
    await connectToDB();

    const userRole = req.headers.get("X-User-Role");

    if (!authorize("admin", userRole)) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { title, description, level, durationWeeks, price } = await req.json();

    if (!title || !level || !durationWeeks || !price) {
      return NextResponse.json(
        { message: "Title, level, duration, and price are required" },
        { status: 400 }
      );
    }

    const course = await Course.create({
      title,
      description,
      level,
      durationWeeks,
      price,
    });

    return NextResponse.json({ course }, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/courses:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function GET(req) {
  try {
    await connectToDB();

    // Get query parameters
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const language = searchParams.get('language');
    const level = searchParams.get('level');

    // Build query object
    const query = {};
    if (status) query.status = status;
    if (language) query.language = language;
    if (level) query.level = level;

    const courses = await Course.find(query)
      .populate('instructor', 'name email')
      .sort({ createdAt: -1 });

    return NextResponse.json({ courses }, { status: 200 });
  } catch (error) {
    console.error("Error in GET /api/courses:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
