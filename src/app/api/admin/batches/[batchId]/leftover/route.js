import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import Batch from "../../../../../../models/Batch";
import User from "../../../../../../models/User";
import { connectToDB } from "../../../../../../lib/mongodb";
import { BatchManagementService } from "../../../../../../lib/batch-management-service";

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

    const { batchId } = await params;
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
