import { NextResponse } from "next/server";
import Batch from "../../../../../models/Batch";
import { connectToDB } from "../../../../../lib/mongodb";

export async function GET(req, { params }) {
  try {
    await connectToDB();

    const batch = await Batch.findById(params.id);

    if (!batch) {
      return NextResponse.json({ message: "Batch not found" }, { status: 404 });
    }

    const meetingUrl = `${process.env.JITSI_SERVER_URL}/${params.id}`;

    return NextResponse.json({ meetingUrl }, { status: 200 });
  } catch (error) {
    console.error(
      `Error in GET /api/meetings/batch/${params.id}:`,
      error
    );
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
