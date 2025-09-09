import { NextResponse } from "next/server";
import Payment from "../../../../models/Payment";
import User from "../../../../models/User";
import Course from "../../../../models/Course";
import { connectToDB } from "../../../../lib/mongodb";
import nodemailer from "nodemailer";

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

    const { payment_id, order_id, error_code, error_description } = await req.json();

    if (!order_id) {
      return NextResponse.json(
        { message: "Order ID is required" },
        { status: 400 }
      );
    }

    // Find the payment record
    const payment = await Payment.findOne({ razorpayOrderId: order_id })
      .populate('user', 'name email')
      .populate('course', 'name displayName language level courseDuration');

    if (!payment) {
      return NextResponse.json(
        { message: "Payment record not found" },
        { status: 404 }
      );
    }

    // Update payment status to failed
    payment.status = 'failed';
    payment.razorpayPaymentId = payment_id;
    payment.failedAt = new Date();
    payment.failureReason = error_description || 'Payment failed';
    await payment.save();

    // Get user email (handle both existing and placeholder users)
    let userEmail = payment.user?.email;
    let userName = payment.user?.name;
    
    // If it's a placeholder user, get email from metadata
    if (!userEmail && payment.metadata?.userEmail) {
      userEmail = payment.metadata.userEmail;
      userName = payment.metadata.userEmail.split('@')[0];
    }

    // Send failure notification email
    if (userEmail) {
      try {
        const courseName = payment.course?.displayName || payment.course?.name || 'Course';
        
        const emailContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #f44336, #d32f2f); padding: 30px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Payment Failed</h1>
              <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">We couldn't process your payment</p>
            </div>
            
            <div style="padding: 30px; background: #f9f9f9;">
              <h2 style="color: #333; margin-top: 0;">Payment Failed</h2>
              <p>Dear ${userName},</p>
              <p>We're sorry to inform you that your payment for the course enrollment could not be processed successfully.</p>
              
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #f44336; margin-top: 0;">Course Details</h3>
                <p><strong>Course:</strong> ${courseName}</p>
                <p><strong>Language:</strong> ${payment.course?.language || 'N/A'}</p>
                <p><strong>Level:</strong> ${payment.course?.level || 'N/A'}</p>
                <p><strong>Amount:</strong> ₹${payment.amount?.toLocaleString('en-IN') || '0'}</p>
                <p><strong>Order ID:</strong> ${order_id}</p>
                <p><strong>Failure Reason:</strong> ${payment.failureReason}</p>
              </div>
              
              <div style="background: #fff3e0; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #f57c00; margin-top: 0;">What's Next?</h3>
                <ul style="color: #333;">
                  <li>You can try the payment again by visiting the course enrollment page</li>
                  <li>If the issue persists, please contact our support team</li>
                  <li>Your course slot is temporarily reserved for 24 hours</li>
                </ul>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/courses/enroll/${payment.course?._id}" 
                   style="background: #E91E63; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                  Try Payment Again
                </a>
              </div>
              
              <p>If you have any questions or need assistance, please don't hesitate to contact us at <a href="mailto:contact@tunalismus.com" style="color: #E91E63;">contact@tunalismus.com</a></p>
              
              <p>Best regards,<br>The Tunalismus Team</p>
            </div>
            
            <div style="background: #333; color: white; padding: 20px; text-align: center; font-size: 12px;">
              <p>© 2024 Tunalismus. All rights reserved.</p>
            </div>
          </div>
        `;

        await transporter.sendMail({
          from: process.env.SMTP_USER,
          to: userEmail,
          subject: `Payment Failed - ${courseName} Enrollment`,
          html: emailContent,
        });
      } catch (emailError) {
        console.error("Error sending failure email:", emailError);
        // Don't fail the payment failure handler if email fails
      }
    }

    return NextResponse.json({
      success: true,
      message: "Payment failure recorded and user notified",
      payment: {
        _id: payment._id,
        status: payment.status,
        failureReason: payment.failureReason
      }
    }, { status: 200 });

  } catch (error) {
    console.error("Error in POST /api/payments/failure:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
