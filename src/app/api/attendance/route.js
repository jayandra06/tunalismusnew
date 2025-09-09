import { NextResponse } from "next/server";
import Attendance from "../../../models/Attendance";
import { connectToDB } from "../../../lib/mongodb";
import { authorize } from "../../../lib/auth";

export async function POST(req) {
  try {
    await connectToDB();

    const userRole = req.headers.get("X-User-Role");

    if (!authorize("trainer", userRole)) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { batch, student, date, status } = await req.json();

    if (!batch || !student || !date) {
      return NextResponse.json(
        { message: "Batch, student, and date are required" },
        { status: 400 }
      );
    }

    const attendance = await Attendance.findOneAndUpdate(
      { batch, student, date },
      { status },
      { new: true, upsert: true }
    );

    return NextResponse.json({ attendance }, { status: 200 });
  } catch (error) {
    console.error("Error in POST /api/attendance:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
