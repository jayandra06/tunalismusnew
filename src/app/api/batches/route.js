import { NextResponse } from "next/server";
import Batch from "../../../models/Batch";
import { connectToDB } from "../../../lib/mongodb";
import { authorize } from "../../../lib/auth";

export async function POST(req) {
  try {
    await connectToDB();

    const userRole = req.headers.get("X-User-Role");

    if (!authorize("admin", userRole)) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { name, course, trainer, startDate, endDate, schedule } =
      await req.json();

    if (!name || !course || !trainer || !startDate || !endDate) {
      return NextResponse.json(
        {
          message:
            "Name, course, trainer, start date, and end date are required",
        },
        { status: 400 }
      );
    }

    const batch = await Batch.create({
      name,
      course,
      trainer,
      startDate,
      endDate,
      schedule,
    });

    return NextResponse.json({ batch }, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/batches:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function GET(req) {
  try {
    await connectToDB();

    const batches = await Batch.find({})
      .populate("course")
      .populate("trainer", "name email");

    return NextResponse.json({ batches }, { status: 200 });
  } catch (error) {
    console.error("Error in GET /api/batches:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
