import { NextResponse } from "next/server";
import Material from "../../../../../models/Material";
import { connectToDB } from "../../../../../lib/mongodb";

export async function GET(req, { params }) {
  try {
    await connectToDB();

    const materials = await Material.find({ course: params.courseId });

    return NextResponse.json({ materials }, { status: 200 });
  } catch (error) {
    console.error(
      `Error in GET /api/materials/course/${params.courseId}:`,
      error
    );
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
