import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import Course from "../../../../../../models/Course";
import Batch from "../../../../../../models/Batch";
import User from "../../../../../../models/User";
import { connectToDB } from "../../../../../../lib/mongodb";
import { BatchManagementService } from "../../../../../../lib/batch-management-service";

export async function GET(req, { params }) {
  try {
    // Check authentication directly in the API route
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    
    if (token.role !== "admin") {
      return NextResponse.json({ message: "Admin access required" }, { status: 403 });
    }

    await connectToDB();

    const { courseId } = await params;

    // Get course
    const course = await Course.findById(courseId);
    if (!course) {
      return NextResponse.json({ message: "Course not found" }, { status: 404 });
    }

    // Get batch distribution summary
    const batchSummary = await BatchManagementService.getBatchDistributionSummary(courseId);

    return NextResponse.json({ batchSummary });

  } catch (error) {
    console.error("Error fetching batch summary:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(req, { params }) {
  try {
    // Check authentication directly in the API route
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    
    if (token.role !== "admin") {
      return NextResponse.json({ message: "Admin access required" }, { status: 403 });
    }

    await connectToDB();

    const { courseId } = await params;
    const { action } = await req.json();

    if (action === 'create_batches') {
      // Create batches for the course
      const result = await BatchManagementService.createBatchesForCourse(courseId);
      return NextResponse.json({ result }, { status: 201 });
    } else if (action === 'recalculate_batches') {
      // Recalculate batches
      const result = await BatchManagementService.recalculateBatches(courseId);
      return NextResponse.json({ result }, { status: 200 });
    } else {
      return NextResponse.json(
        { message: "Invalid action" },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error("Error managing batches:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
