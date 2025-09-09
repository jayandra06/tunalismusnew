import { NextResponse } from "next/server";
import Payment from "../../../../models/Payment";
import User from "../../../../models/User";
import Course from "../../../../models/Course";
import { connectToDB } from "../../../../lib/mongodb";

export async function GET(req) {
  try {
    await connectToDB();

    // Get user role from middleware headers
    const userRole = req.headers.get("X-User-Role");
    
    if (userRole !== "admin") {
      return NextResponse.json({ message: "Admin access required" }, { status: 403 });
    }

    // Get query parameters
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const status = searchParams.get('status');
    const method = searchParams.get('method');

    // Build filter object
    const filter = {};
    if (status) filter.status = status;
    if (method) filter.method = method;

    // Calculate skip value for pagination
    const skip = (page - 1) * limit;

    // Fetch payments with populated references
    const payments = await Payment.find(filter)
      .populate('student', 'name email phone')
      .populate('course', 'language level month year')
      .sort({ paymentDate: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const total = await Payment.countDocuments(filter);

    // Calculate payment statistics
    const stats = await Payment.aggregate([
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amount" },
          totalPayments: { $sum: 1 },
          completedAmount: {
            $sum: {
              $cond: [{ $eq: ["$status", "paid"] }, "$amount", 0]
            }
          },
          completedCount: {
            $sum: {
              $cond: [{ $eq: ["$status", "paid"] }, 1, 0]
            }
          },
          pendingAmount: {
            $sum: {
              $cond: [{ $eq: ["$status", "pending"] }, "$amount", 0]
            }
          },
          pendingCount: {
            $sum: {
              $cond: [{ $eq: ["$status", "pending"] }, 1, 0]
            }
          },
          failedAmount: {
            $sum: {
              $cond: [{ $eq: ["$status", "failed"] }, "$amount", 0]
            }
          },
          failedCount: {
            $sum: {
              $cond: [{ $eq: ["$status", "failed"] }, 1, 0]
            }
          }
        }
      }
    ]);

    const paymentStats = stats[0] || {
      totalAmount: 0,
      totalPayments: 0,
      completedAmount: 0,
      completedCount: 0,
      pendingAmount: 0,
      pendingCount: 0,
      failedAmount: 0,
      failedCount: 0
    };

    return NextResponse.json({
      payments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      stats: paymentStats
    });

  } catch (error) {
    console.error("Error fetching payments:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    await connectToDB();

    // Get user role from middleware headers
    const userRole = req.headers.get("X-User-Role");
    
    if (userRole !== "admin") {
      return NextResponse.json({ message: "Admin access required" }, { status: 403 });
    }

    const {
      studentId,
      courseId,
      amount,
      status = 'paid',
      method = 'Razorpay',
      transactionId
    } = await req.json();

    // Validate required fields
    if (!studentId || !courseId || !amount) {
      return NextResponse.json(
        { message: "Student ID, Course ID, and amount are required" },
        { status: 400 }
      );
    }

    // Check if student exists
    const student = await User.findById(studentId);
    if (!student) {
      return NextResponse.json(
        { message: "Student not found" },
        { status: 404 }
      );
    }

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return NextResponse.json(
        { message: "Course not found" },
        { status: 404 }
      );
    }

    // Create payment record
    const payment = new Payment({
      student: studentId,
      course: courseId,
      amount,
      status,
      method,
      transactionId,
      paymentDate: new Date()
    });

    await payment.save();

    // Populate the response
    await payment.populate('student', 'name email phone');
    await payment.populate('course', 'language level month year');

    return NextResponse.json({ payment }, { status: 201 });

  } catch (error) {
    console.error("Error creating payment:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
