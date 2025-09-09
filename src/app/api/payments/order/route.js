import { NextResponse } from "next/server";
import Course from "../../../../models/Course";
import User from "../../../../models/User";
import Payment from "../../../../models/Payment";
import { connectToDB } from "../../../../lib/mongodb";
import Razorpay from "razorpay";
import bcrypt from "bcryptjs";

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export async function POST(req) {
  try {
    await connectToDB();

    const {
      courseId,
      email,
      password,
      isNewUser,
      revisionBatch,
      offlineMaterials,
      amount,
      batchType
    } = await req.json();

    // Validate required fields
    if (!courseId || !email || !amount) {
      return NextResponse.json(
        { message: "Course ID, email, and amount are required" },
        { status: 400 }
      );
    }

    // Find the course
    const course = await Course.findById(courseId);
    if (!course) {
      return NextResponse.json(
        { message: "Course not found" },
        { status: 404 }
      );
    }

    // Check if course is available
    if (course.status !== 'active') {
      return NextResponse.json(
        { message: "Course is not available for enrollment" },
        { status: 400 }
      );
    }

    if (course.availableSlots <= 0) {
      return NextResponse.json(
        { message: "Course is fully booked" },
        { status: 400 }
      );
    }

    // Handle user authentication/creation
    let user;
    if (isNewUser) {
      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return NextResponse.json(
          { message: "User with this email already exists. Please login instead." },
          { status: 400 }
        );
      }

      // Create new user
      const hashedPassword = await bcrypt.hash(password, 12);
      user = await User.create({
        email,
        password: hashedPassword,
        role: 'student',
        name: email.split('@')[0], // Use email prefix as default name
        isActive: true
      });
    } else {
      // Find existing user
      user = await User.findOne({ email });
      if (!user) {
        return NextResponse.json(
          { message: "User not found. Please check your email or create a new account." },
          { status: 404 }
        );
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return NextResponse.json(
          { message: "Invalid password" },
          { status: 401 }
        );
      }
    }

    // Create Razorpay order
    const orderOptions = {
      amount: amount * 100, // Razorpay expects amount in paise
      currency: 'INR',
      receipt: `course_${courseId}_${user._id}_${Date.now()}`,
      notes: {
        courseId: courseId,
        userId: user._id,
        email: email,
        batchType: batchType,
        revisionBatch: revisionBatch,
        offlineMaterials: offlineMaterials
      }
    };

    const razorpayOrder = await razorpay.orders.create(orderOptions);

    // Create payment record
    const payment = await Payment.create({
      user: user._id,
      course: courseId,
      amount: amount,
      currency: 'INR',
      status: 'pending',
      razorpayOrderId: razorpayOrder.id,
      batchType: batchType,
      revisionBatch: revisionBatch,
      offlineMaterials: offlineMaterials,
      metadata: {
        courseName: course.displayName || course.name,
        userEmail: email,
        batchType: batchType
      }
    });

    return NextResponse.json({
      razorpayOrderId: razorpayOrder.id,
      amount: amount,
      currency: 'INR',
      paymentId: payment._id,
      course: {
        _id: course._id,
        name: course.displayName || course.name,
        language: course.language,
        level: course.level
      }
    }, { status: 201 });

  } catch (error) {
    console.error("Error in POST /api/payments/order:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}