import { NextResponse } from "next/server";
import Material from "../../../../models/Material";
import { connectToDB } from "../../../../lib/mongodb";
import { authorize } from "../../../../lib/auth";

export async function DELETE(req, { params }) {
  try {
    await connectToDB();

    const userRole = req.headers.get("X-User-Role");

    if (!authorize("trainer", userRole)) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const deletedMaterial = await Material.findByIdAndDelete(params.id);

    if (!deletedMaterial) {
      return NextResponse.json(
        { message: "Material not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Material deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error(`Error in DELETE /api/materials/${params.id}:`, error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
