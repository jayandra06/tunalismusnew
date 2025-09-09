import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import Batch from "../../../../../models/Batch";
import { connectToDB } from "../../../../../lib/mongodb";

export async function GET(req, { params }) {
  try {
    await connectToDB();

    // Get user role from middleware headers first
    let userRole = req.headers.get("X-User-Role");
    
    // Fallback: If headers aren't set by middleware, try to get token directly
    if (!userRole) {
      const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
      if (token) {
        userRole = token.role;
      }
    }
    
    if (userRole !== "admin") {
      return NextResponse.json({ message: "Admin access required" }, { status: 403 });
    }

    const { batchId } = await params;

    // Find the batch with populated data
    const batch = await Batch.findById(batchId)
      .populate('course', 'name description')
      .populate('instructor', 'name email');

    if (!batch) {
      return NextResponse.json(
        { message: "Batch not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ batch });

  } catch (error) {
    console.error("Error fetching batch:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PUT(req, { params }) {
  try {
    await connectToDB();

    // Get user role from middleware headers first
    let userRole = req.headers.get("X-User-Role");
    
    // Fallback: If headers aren't set by middleware, try to get token directly
    if (!userRole) {
      const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
      if (token) {
        userRole = token.role;
      }
    }
    
    if (userRole !== "admin") {
      return NextResponse.json({ message: "Admin access required" }, { status: 403 });
    }

    const { batchId } = await params;
    const updateData = await req.json();

    // Update the batch
    const batch = await Batch.findByIdAndUpdate(
      batchId,
      updateData,
      { new: true, runValidators: true }
    ).populate('course', 'name description')
     .populate('instructor', 'name email');

    if (!batch) {
      return NextResponse.json(
        { message: "Batch not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ batch });

  } catch (error) {
    console.error("Error updating batch:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  try {
    await connectToDB();

    // Get user role from middleware headers first
    let userRole = req.headers.get("X-User-Role");
    
    // Fallback: If headers aren't set by middleware, try to get token directly
    if (!userRole) {
      const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
      if (token) {
        userRole = token.role;
      }
    }
    
    if (userRole !== "admin") {
      return NextResponse.json({ message: "Admin access required" }, { status: 403 });
    }

    const { batchId } = await params;

    // Check if batch exists
    const batch = await Batch.findById(batchId);
    if (!batch) {
      return NextResponse.json(
        { message: "Batch not found" },
        { status: 404 }
      );
    }

    // Delete the batch
    await Batch.findByIdAndDelete(batchId);

    return NextResponse.json(
      { message: "Batch deleted successfully" },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error deleting batch:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
