import { NextResponse } from "next/server";
import Attendance from "../../../../../models/Attendance";
import { connectToDB } from "../../../../../lib/mongodb";

export async function GET(req, { params }) {
  try {
    await connectToDB();

    const attendance = await Attendance.find({ batch: params.batchId }).populate(
      "student",
      "name email"
    );

    return NextResponse.json({ attendance }, { status: 200 });
  } catch (error) {
    console.error(
      `Error in GET /api/attendance/batch/${params.batchId}:`,
      error
    );
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
