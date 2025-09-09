import { NextResponse } from "next/server";
import Batch from "../../../../models/Batch";
import { connectToDB } from "../../../../lib/mongodb";
import { authorize } from "../../../../lib/auth";

export async function GET(req, { params }) {
  try {
    await connectToDB();

    const batch = await Batch.findById(params.id)
      .populate("course")
      .populate("trainer", "name email")
      .populate("students", "name email");

    if (!batch) {
      return NextResponse.json({ message: "Batch not found" }, { status: 404 });
    }

    return NextResponse.json({ batch }, { status: 200 });
  } catch (error) {
    console.error(`Error in GET /api/batches/${params.id}:`, error);
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

    if (!authorize("admin", userRole)) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { name, course, trainer, startDate, endDate, schedule, students } =
      await req.json();

    const updatedBatch = await Batch.findByIdAndUpdate(
      params.id,
      { name, course, trainer, startDate, endDate, schedule, students },
      { new: true }
    );

    if (!updatedBatch) {
      return NextResponse.json({ message: "Batch not found" }, { status: 404 });
    }

    return NextResponse.json({ batch: updatedBatch }, { status: 200 });
  } catch (error) {
    console.error(`Error in PUT /api/batches/${params.id}:`, error);
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

    if (!authorize("admin", userRole)) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const deletedBatch = await Batch.findByIdAndDelete(params.id);

    if (!deletedBatch) {
      return NextResponse.json({ message: "Batch not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Batch deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error(`Error in DELETE /api/batches/${params.id}:`, error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
