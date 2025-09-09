import { NextResponse } from "next/server";
import Batch from "../../../../models/Batch";
import { connectToDB } from "../../../../lib/mongodb";
import { authorize } from "../../../../lib/auth";

export async function GET(req, { params }) {
  try {
    await connectToDB();

    const userRole = req.headers.get("X-User-Role");
    const userId = req.headers.get("X-User-Id");
    const batchId = params.id;

    // Only trainers and admins can access this route
    if (!authorize("trainer", userRole)) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    // Find the batch
    const batch = await Batch.findById(batchId)
      .populate('course', 'title description')
      .populate('students', 'name email phone')
      .populate('trainer', 'name email');

    if (!batch) {
      return NextResponse.json(
        { message: "Batch not found" },
        { status: 404 }
      );
    }

    // Check if user has access to this batch (trainer or admin)
    if (userRole !== 'admin' && batch.trainer._id.toString() !== userId) {
      return NextResponse.json(
        { message: "Access denied" },
        { status: 403 }
      );
    }

    return NextResponse.json({ batch }, { status: 200 });
  } catch (error) {
    console.error("Error in GET /api/batches/[id]:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PUT(req, { params }) {
  try {
    await connectToDB();

    const userRole = req.headers.get("X-User-Role");
    const userId = req.headers.get("X-User-Id");
    const batchId = params.id;

    // Only trainers and admins can update batches
    if (!authorize("trainer", userRole)) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { name, description, startDate, endDate, maxStudents, schedule, location, type, status } = body;

    // Find the batch
    const batch = await Batch.findById(batchId);

    if (!batch) {
      return NextResponse.json(
        { message: "Batch not found" },
        { status: 404 }
      );
    }

    // Check if user has access to this batch (trainer or admin)
    if (userRole !== 'admin' && batch.trainer.toString() !== userId) {
      return NextResponse.json(
        { message: "Access denied" },
        { status: 403 }
      );
    }

    // Update batch fields
    if (name) batch.name = name;
    if (description) batch.description = description;
    if (startDate) batch.startDate = new Date(startDate);
    if (endDate) batch.endDate = new Date(endDate);
    if (maxStudents) batch.maxStudents = maxStudents;
    if (schedule) batch.schedule = schedule;
    if (location) batch.location = location;
    if (type) batch.type = type;
    if (status) batch.status = status;

    await batch.save();

    // Populate the response
    await batch.populate('course', 'title description');
    await batch.populate('students', 'name email phone');
    await batch.populate('trainer', 'name email');

    return NextResponse.json(
      { 
        message: "Batch updated successfully", 
        batch 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in PUT /api/batches/[id]:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  try {
    await connectToDB();

    const userRole = req.headers.get("X-User-Role");
    const userId = req.headers.get("X-User-Id");
    const batchId = params.id;

    // Only admins can delete batches
    if (userRole !== 'admin') {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    // Find and delete the batch
    const batch = await Batch.findByIdAndDelete(batchId);

    if (!batch) {
      return NextResponse.json(
        { message: "Batch not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Batch deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in DELETE /api/batches/[id]:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}