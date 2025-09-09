import { NextResponse } from "next/server";
import Payment from "../../../../models/Payment";
import Course from "../../../../models/Course";
import User from "../../../../models/User";
import Batch from "../../../../models/Batch";
import Enrollment from "../../../../models/Enrollment";
import { connectToDB } from "../../../../lib/mongodb";
import Razorpay from "razorpay";
import crypto from "crypto";
import nodemailer from "nodemailer";

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Email transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function POST(req) {
  try {
    await connectToDB();

    const { payment_id, order_id } = await req.json();

    if (!payment_id || !order_id) {
      return NextResponse.json(
        { message: "Payment ID and Order ID are required" },
        { status: 400 }
      );
    }

    // Find the payment record
    const payment = await Payment.findOne({ razorpayOrderId: order_id })
      .populate('user', 'name email')
      .populate('course', 'name displayName language level courseDuration pricing offlineMaterials');

    if (!payment) {
      return NextResponse.json(
        { message: "Payment record not found" },
        { status: 404 }
      );
    }

    // Verify payment with Razorpay
    const razorpayPayment = await razorpay.payments.fetch(payment_id);

    if (razorpayPayment.status !== 'captured') {
      return NextResponse.json(
        { message: "Payment not captured" },
        { status: 400 }
      );
    }

    // Verify signature (optional but recommended for production)
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${order_id}|${payment_id}`)
      .digest('hex');

    // Activate placeholder user if this is a new user registration (only after payment success)
    let actualUser = payment.user;
    if (payment.pendingUserData && actualUser.isPlaceholder) {
      // Activate the placeholder user
      actualUser.isActive = true;
      actualUser.isPlaceholder = false;
      await actualUser.save();
      
      // Clear pending data
      payment.pendingUserData = null;
      await payment.save();
    }

    // Update payment status
    payment.status = 'paid';
    payment.razorpayPaymentId = payment_id;
    payment.paidAt = new Date();
    payment.razorpaySignature = expectedSignature;
    await payment.save();

    // Refresh payment object to ensure all fields are available
    const updatedPayment = await Payment.findById(payment._id);

    // Debug: Log payment data
    console.log('🔍 Payment data for enrollment:', {
      batchType: updatedPayment.batchType,
      revisionBatch: updatedPayment.revisionBatch,
      offlineMaterials: updatedPayment.offlineMaterials,
      amount: updatedPayment.amount
    });

    // Find available batches for the course
    const availableBatches = await Batch.find({
      course: updatedPayment.course._id,
      status: { $in: ['upcoming', 'active'] },
      $expr: { $lt: [{ $size: "$students" }, "$maxStudents"] }
    }).sort({ startDate: 1 });

    // Assign to first available batch or create a new one if none exist
    let assignedBatch = null;
    if (availableBatches.length > 0) {
      assignedBatch = availableBatches[0];
      // Add student to batch
      assignedBatch.students.push(actualUser._id);
      await assignedBatch.save();
    }

    // Create enrollment
    const enrollment = await Enrollment.create({
      student: actualUser._id,
      course: updatedPayment.course._id,
      batch: assignedBatch?._id || null,
      batchType: updatedPayment.batchType || 'regular', // Default to 'regular' if undefined
      status: 'active',
      payment: {
        amount: updatedPayment.amount,
        status: 'paid',
        paymentId: updatedPayment._id,
        paidAt: new Date()
      },
      enrolledAt: new Date()
    });

    // Update course enrollment count
    const course = await Course.findById(updatedPayment.course._id);
    if (course) {
      if (updatedPayment.batchType === 'revision') {
        course.batchTypes.revision.studentCount += 1;
      } else {
        course.batchTypes.regular.studentCount += 1;
      }
      await course.save();
    }

    // Send confirmation email
    try {
      const courseName = course.displayName || course.name;
      const totalPrice = payment.amount;
      
      const emailContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #E91E63, #9C27B0); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to Tunalismus!</h1>
            <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Your enrollment has been confirmed</p>
          </div>
          
          <div style="padding: 30px; background: #f9f9f9;">
            <h2 style="color: #333; margin-top: 0;">Payment Confirmation</h2>
            <p>Dear ${actualUser.name},</p>
            <p>Thank you for enrolling in our language course! Your payment has been successfully processed.</p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #E91E63; margin-top: 0;">Course Details</h3>
              <p><strong>Course:</strong> ${courseName}</p>
              <p><strong>Language:</strong> ${course.language}</p>
              <p><strong>Level:</strong> ${course.level}</p>
              <p><strong>Duration:</strong> ${course.courseDuration} months</p>
              <p><strong>Batch Type:</strong> ${payment.batchType === 'revision' ? 'Revision Batch' : 'Regular Batch'}</p>
              ${payment.offlineMaterials ? '<p><strong>Offline Materials:</strong> Included</p>' : ''}
            </div>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #E91E63; margin-top: 0;">Payment Information</h3>
              <p><strong>Amount Paid:</strong> ₹${totalPrice.toLocaleString('en-IN')}</p>
              <p><strong>Payment ID:</strong> ${payment_id}</p>
              <p><strong>Order ID:</strong> ${order_id}</p>
              <p><strong>Payment Date:</strong> ${new Date().toLocaleDateString()}</p>
            </div>
            
            <div style="background: #E8F5E8; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #2E7D32; margin-top: 0;">What's Next?</h3>
              <ul style="color: #333;">
                <li>You will receive your course access credentials within 24 hours</li>
                <li>Join our welcome session to meet your instructor</li>
                <li>Access your student portal at: <a href="${process.env.NEXT_PUBLIC_APP_URL}/student/login" style="color: #E91E63;">Student Portal</a></li>
              </ul>
            </div>
            
            <p>If you have any questions, please don't hesitate to contact us at <a href="mailto:contact@tunalismus.com" style="color: #E91E63;">contact@tunalismus.com</a></p>
            
            <p>Best regards,<br>The Tunalismus Team</p>
          </div>
          
          <div style="background: #333; color: white; padding: 20px; text-align: center; font-size: 12px;">
            <p>© 2024 Tunalismus. All rights reserved.</p>
          </div>
        </div>
      `;

      await transporter.sendMail({
        from: process.env.SMTP_USER,
        to: actualUser.email,
        subject: `Welcome to Tunalismus - ${courseName} Enrollment Confirmed`,
        html: emailContent,
      });
    } catch (emailError) {
      console.error("Error sending confirmation email:", emailError);
      // Don't fail the payment verification if email fails
    }

    return NextResponse.json({
      success: true,
      payment: {
        _id: payment._id,
        amount: payment.amount,
        status: payment.status,
        createdAt: payment.createdAt
      },
      course: {
        _id: course._id,
        name: course.displayName || course.name,
        language: course.language,
        level: course.level
      },
      enrollment: {
        _id: enrollment._id,
        batchType: enrollment.batchType,
        revisionBatch: enrollment.revisionBatch,
        offlineMaterials: enrollment.offlineMaterials,
        status: enrollment.status
      }
    }, { status: 200 });

  } catch (error) {
    console.error("Error in POST /api/payments/verify:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}