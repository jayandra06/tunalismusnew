import { NextResponse } from "next/server";
import Material from "../../../models/Material";
import { connectToDB } from "../../../lib/mongodb";
import { authorize } from "../../../lib/auth";

export async function POST(req) {
  try {
    await connectToDB();

    const userRole = req.headers.get("X-User-Role");
    const userId = req.headers.get("X-User-Id");

    if (!authorize("trainer", userRole)) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { title, description, fileUrl, type, course, batch } = await req.json();

    if (!title || !fileUrl) {
      return NextResponse.json(
        { message: "Title and fileUrl are required" },
        { status: 400 }
      );
    }

    if (!course && !batch) {
      return NextResponse.json(
        { message: "Course or batch is required" },
        { status: 400 }
      );
    }

    const material = await Material.create({
      title,
      description: description || "",
      fileUrl,
      type: type || "pdf",
      course,
      batch,
      uploadedBy: userId,
      status: "published",
      size: "",
      downloads: 0,
    });

    return NextResponse.json({ material }, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/materials:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
