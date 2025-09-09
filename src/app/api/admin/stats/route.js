import { NextResponse } from "next/server";
import User from "../../../../models/User";
import Course from "../../../../models/Course";
import Payment from "../../../../models/Payment";
import { connectToDB } from "../../../../lib/mongodb";

export async function GET(req) {
  try {
    await connectToDB();

    // Get user role from middleware headers
    const userRole = req.headers.get("X-User-Role");
    
    if (userRole !== "admin") {
      return NextResponse.json({ message: "Admin access required" }, { status: 403 });
    }

    // Fetch statistics
    const [
      totalUsers,
      totalCourses,
      totalTrainers,
      totalPayments,
      activeStudents,
      completedCourses
    ] = await Promise.all([
      User.countDocuments(),
      Course.countDocuments(),
      User.countDocuments({ role: "trainer" }),
      Payment.find({ status: "completed" }),
      User.countDocuments({ role: "student", status: "active" }),
      Course.countDocuments({ status: "completed" })
    ]);

    // Calculate total revenue
    const totalRevenue = totalPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0);

    const stats = {
      totalUsers,
      totalCourses,
      totalTrainers,
      totalRevenue,
      activeStudents,
      completedCourses
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

