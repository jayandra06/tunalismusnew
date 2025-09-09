import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import Enrollment from "../../../../../models/Enrollment";
import Batch from "../../../../../models/Batch";
import { connectToDB } from "../../../../../lib/mongodb";
import { authorize } from "../../../../../lib/auth";

export async function PATCH(req, { params }) {
  try {
    await connectToDB();

    // Get user info from middleware headers
    const userRole = req.headers.get("X-User-Role");
    const userId = req.headers.get("X-User-Id");

    // Fallback authentication if headers are missing
    let actualUserRole = userRole;
    let actualUserId = userId;

    if (!userRole || !userId) {
      console.log("⚠️ No X-User-Role or X-User-Id header found, trying direct token check...");
      const token = await getToken({ 
        req, 
        secret: process.env.NEXTAUTH_SECRET 
      });

      if (token) {
        actualUserRole = token.role;
        actualUserId = token.sub;
        console.log(`✅ Got role from direct token: ${actualUserRole}`);
      } else {
        console.log("❌ No valid token found");
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
      }
    }

    // Only admins can update enrollments
    if (!authorize("admin", actualUserRole)) {
      return NextResponse.json({ message: "Admin access required" }, { status: 403 });
    }

    const { enrollmentId } = await params;
    const { batchId } = await req.json();

    if (!batchId) {
      return NextResponse.json({ message: "Batch ID is required" }, { status: 400 });
    }

    // Find the enrollment
    const enrollment = await Enrollment.findById(enrollmentId);
    if (!enrollment) {
      return NextResponse.json({ message: "Enrollment not found" }, { status: 404 });
    }

    // Find the batch
    const batch = await Batch.findById(batchId);
    if (!batch) {
      return NextResponse.json({ message: "Batch not found" }, { status: 404 });
    }

    // Check if batch has space
    if (batch.students.length >= batch.maxStudents) {
      return NextResponse.json({ message: "Batch is full" }, { status: 400 });
    }

    // Remove student from old batch if exists
    if (enrollment.batch) {
      const oldBatch = await Batch.findById(enrollment.batch);
      if (oldBatch) {
        oldBatch.students = oldBatch.students.filter(
          studentId => studentId.toString() !== enrollment.student.toString()
        );
        await oldBatch.save();
      }
    }

    // Add student to new batch
    if (!batch.students.includes(enrollment.student)) {
      batch.students.push(enrollment.student);
      await batch.save();
    }

    // Update enrollment
    enrollment.batch = batchId;
    enrollment.status = 'active';
    await enrollment.save();

    return NextResponse.json({ 
      message: "Batch assigned successfully",
      enrollment: {
        _id: enrollment._id,
        batch: {
          _id: batch._id,
          batchNumber: batch.batchNumber,
          batchType: batch.batchType
        }
      }
    }, { status: 200 });

  } catch (error) {
    console.error("Error in PATCH /api/admin/enrollments/[enrollmentId]:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
