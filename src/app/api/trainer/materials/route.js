import { NextResponse } from "next/server";
import Material from "../../../../models/Material";
import Batch from "../../../../models/Batch";
import { connectToDB } from "../../../../lib/mongodb";
import { authorize } from "../../../../lib/auth";

export async function GET(req) {
  try {
    await connectToDB();

    const userRole = req.headers.get("X-User-Role");
    const userId = req.headers.get("X-User-Id");

    // Only trainers can access this route
    if (!authorize("trainer", userRole)) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    // Find all batches assigned to this trainer
    const trainerBatches = await Batch.find({ instructor: userId });

    // Get the unique course IDs from these batches
    const courseIds = [...new Set(trainerBatches.map(batch => batch.course))];

    // Find all materials for these courses/batches
    const materials = await Material.find({ 
      $or: [
        { course: { $in: courseIds } },
        { batch: { $in: trainerBatches.map(b => b._id) } }
      ]
    })
    .populate('course', 'title language level month year name description')
    .populate('batch', 'name course')
    .populate('uploadedBy', 'name email')
    .sort({ createdAt: -1 });

    // Return actual materials from database
    return NextResponse.json({ materials }, { status: 200 });
  } catch (error) {
    console.error("Error in GET /api/trainer/materials:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
