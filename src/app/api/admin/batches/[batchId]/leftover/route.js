import { NextResponse } from "next/server";
import Batch from "../../../../../../models/Batch";
import User from "../../../../../../models/User";
import { connectToDB } from "../../../../../../lib/mongodb";
import { BatchManagementService } from "../../../../../../lib/batch-management-service";

export async function POST(req, { params }) {
  try {
    await connectToDB();

    // Get user role from middleware headers
    const userRole = req.headers.get("X-User-Role");
    
    if (userRole !== "admin") {
      return NextResponse.json({ message: "Admin access required" }, { status: 403 });
    }

    const { batchId } = params;
    const { action, targetBatchId } = await req.json();

    if (!action || (action === 'merge' && !targetBatchId)) {
      return NextResponse.json(
        { message: "Action and targetBatchId (for merge) are required" },
        { status: 400 }
      );
    }

    // Handle leftover batch
    const result = await BatchManagementService.handleLeftoverBatch(batchId, action, targetBatchId);

    return NextResponse.json({ result }, { status: 200 });

  } catch (error) {
    console.error("Error handling leftover batch:", error);
    return NextResponse.json(
      { message: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
