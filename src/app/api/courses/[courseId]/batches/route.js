import { NextResponse } from "next/server";
import Batch from "../../../../../models/Batch";
import { connectToDB } from "../../../../../lib/mongodb";

export async function GET(req, { params }) {
  try {
    await connectToDB();

    const { courseId } = await params;

    // Find all batches for this course
    const batches = await Batch.find({ 
      course: courseId,
      status: { $in: ['upcoming', 'active'] } // Only show available batches
    })
    .populate('instructor', 'name email')
    .sort({ batchNumber: 1 });

    return NextResponse.json({ batches });

  } catch (error) {
    console.error("Error fetching course batches:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
