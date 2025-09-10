import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import Batch from "../../../../../models/Batch";
import { connectToDB } from "../../../../../lib/mongodb";
import { authorize } from "../../../../../lib/auth";
import jitsiService from "../../../../../lib/jitsi-service";

// GET /api/meetings/batch/[batchId] - Get meeting information for a batch
export async function GET(req, { params }) {
  try {
    await connectToDB();

    const { batchId } = await params;

    // Get user role from middleware headers first
    let userRole = req.headers.get("X-User-Role");
    let userId = req.headers.get("X-User-Id");
    
    // Fallback: If headers aren't set by middleware, try to get token directly
    if (!userRole) {
      console.log('⚠️ No X-User-Role header found, trying direct token check...');
      const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
      if (token) {
        userRole = token.role;
        userId = token.sub;
        console.log('✅ Got role from direct token:', userRole);
      }
    }

    // Check if user is authorized (trainer, student, or admin)
    if (!authorize(["trainer", "student", "admin"], userRole)) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    // Find the batch
    const batch = await Batch.findById(batchId).populate('course', 'language level month year name');
    
    if (!batch) {
      return NextResponse.json({ message: "Batch not found" }, { status: 404 });
    }

    // Check if user has access to this batch
    let hasAccess = false;
    
    if (userRole === 'admin') {
      hasAccess = true; // Admins can access any batch
    } else if (userRole === 'trainer') {
      hasAccess = batch.instructor.toString() === userId;
    } else if (userRole === 'student') {
      // Check if student is enrolled in this batch
      const Enrollment = require("../../../../../models/Enrollment").default;
      const enrollment = await Enrollment.findOne({
        batch: batchId,
        student: userId,
        status: { $in: ['enrolled', 'active'] }
      });
      hasAccess = !!enrollment;
    }

    if (!hasAccess) {
      return NextResponse.json({ message: "Access denied to this batch" }, { status: 403 });
    }

    // Initialize Jitsi meeting if not already done
    if (!batch.jitsiMeeting.roomName) {
      batch.initializeJitsiMeeting();
      await batch.save();
    }

    // Get meeting information
    const courseName = batch.course?.displayName || batch.course?.name || 
                      `${batch.course?.language} ${batch.course?.level}` || 'Unknown Course';
    
    // Get meeting info from batch or generate fallback
    let meetingInfo;
    if (batch.jitsiMeeting.roomName) {
      meetingInfo = {
        roomName: batch.jitsiMeeting.roomName,
        password: batch.jitsiMeeting.roomPassword,
        domain: process.env.JITSI_DOMAIN || 'meet.tunalismus.com',
        baseUrl: `https://${process.env.JITSI_DOMAIN || 'meet.tunalismus.com'}/${batch.jitsiMeeting.roomName}`,
        displayName: `${courseName} - Batch Class`
      };
    } else {
      // Fallback meeting info
      const crypto = require('crypto');
      const roomName = `batch-${batchId}-${courseName?.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '-') || 'class'}`;
      const secret = process.env.JITSI_ROOM_SECRET || 'tunalismus-secret-key';
      const hash = crypto.createHash('sha256').update(`${batchId}-${secret}`).digest('hex');
      const roomPassword = hash.substring(0, 8).toUpperCase();
      
      meetingInfo = {
        roomName,
        password: roomPassword,
        domain: process.env.JITSI_DOMAIN || 'meet.tunalismus.com',
        baseUrl: `https://${process.env.JITSI_DOMAIN || 'meet.tunalismus.com'}/${roomName}`,
        displayName: `${courseName} - Batch Class`
      };
    }
    
    // Generate meeting URL for the user
    const user = {
      name: req.headers.get("X-User-Name") || "User",
      email: req.headers.get("X-User-Email") || "user@example.com"
    };
    
    const meetingUrl = batch.getJitsiMeetingUrl(user, userRole);

    return NextResponse.json({
      success: true,
      meeting: {
        batchId,
        batchName: batch.name,
        courseName,
        roomName: meetingInfo.roomName,
        roomPassword: userRole === 'trainer' || userRole === 'admin' ? meetingInfo.password : null,
        meetingUrl,
        isActive: batch.jitsiMeeting.isActive,
        lastMeetingDate: batch.jitsiMeeting.lastMeetingDate,
        canModerate: userRole === 'trainer' || userRole === 'admin',
        meetingHistory: batch.jitsiMeeting.meetingHistory.slice(-5) // Last 5 meetings
      }
    }, { status: 200 });

  } catch (error) {
    console.error("Error in GET /api/meetings/batch/[batchId]:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// POST /api/meetings/batch/[batchId] - Start a meeting or record participation
export async function POST(req, { params }) {
  try {
    console.log('🎯 POST /api/meetings/batch/[batchId] called');
    await connectToDB();

    const { batchId } = await params;
    const { action, userRole, userId } = await req.json();

    // Get user role from middleware headers first
    let userRoleFromHeader = req.headers.get("X-User-Role");
    let userIdFromHeader = req.headers.get("X-User-Id");
    
    console.log('🔍 Meeting API Debug:', {
      pathname: req.nextUrl.pathname,
      hasUserRoleHeader: !!userRoleFromHeader,
      hasUserIdHeader: !!userIdFromHeader,
      userRoleFromHeader,
      userIdFromHeader,
      allHeaders: Object.fromEntries(req.headers.entries())
    });
    
    // Fallback: If headers aren't set by middleware, try to get token directly
    if (!userRoleFromHeader) {
      console.log('⚠️ No X-User-Role header found, trying direct token check...');
      const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
      if (token) {
        userRoleFromHeader = token.role;
        userIdFromHeader = token.sub;
        console.log('✅ Got role from direct token:', userRoleFromHeader, 'userId:', userIdFromHeader);
      } else {
        console.log('❌ No token found in fallback check');
      }
    }

    // Use header values or fallback to request body
    const finalUserRole = userRoleFromHeader || userRole;
    const finalUserId = userIdFromHeader || userId;

    console.log('🔍 Final Auth Values:', {
      finalUserRole,
      finalUserId,
      action,
      batchId
    });

    // Check if user is authorized (admin, trainer, or student)
    if (!finalUserRole || !["trainer", "student", "admin"].includes(finalUserRole)) {
      console.log('❌ Authorization failed:', { finalUserRole, validRoles: ["trainer", "student", "admin"] });
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    // Find the batch
    const batch = await Batch.findById(batchId);
    
    if (!batch) {
      return NextResponse.json({ message: "Batch not found" }, { status: 404 });
    }

    // Check if user has access to this batch
    let hasAccess = false;
    
    console.log('🔍 Batch Access Check:', {
      finalUserRole,
      finalUserId,
      batchInstructor: batch.instructor?.toString(),
      batchId
    });
    
    if (finalUserRole === 'admin') {
      hasAccess = true;
      console.log('✅ Admin access granted');
    } else if (finalUserRole === 'trainer') {
      hasAccess = batch.instructor.toString() === finalUserId;
      console.log('🔍 Trainer access check:', {
        batchInstructor: batch.instructor.toString(),
        finalUserId,
        hasAccess
      });
    } else if (finalUserRole === 'student') {
      const Enrollment = require("../../../../../models/Enrollment").default;
      const enrollment = await Enrollment.findOne({
        batch: batchId,
        student: finalUserId,
        status: { $in: ['enrolled', 'active'] }
      });
      hasAccess = !!enrollment;
      console.log('🔍 Student access check:', {
        enrollment: !!enrollment,
        hasAccess
      });
    }

    if (!hasAccess) {
      console.log('❌ Access denied to batch:', { finalUserRole, finalUserId, batchId });
      return NextResponse.json({ message: "Access denied to this batch" }, { status: 403 });
    }

    // Handle different actions
    switch (action) {
      case 'start':
        // Start a meeting (only trainers and admins can start)
        if (finalUserRole === 'trainer' || finalUserRole === 'admin') {
          batch.jitsiMeeting.isActive = true;
          batch.jitsiMeeting.lastMeetingDate = new Date();
          await batch.save();
          
          return NextResponse.json({
            success: true,
            message: "Meeting started successfully",
            isActive: true
          });
        } else {
          return NextResponse.json({ message: "Only trainers and admins can start meetings" }, { status: 403 });
        }

      case 'join':
        // Record user joining the meeting
        batch.recordMeetingParticipation(finalUserId, finalUserRole, 'join');
        await batch.save();
        
        return NextResponse.json({
          success: true,
          message: "Participation recorded"
        });

      case 'leave':
        // Record user leaving the meeting
        batch.recordMeetingParticipation(finalUserId, finalUserRole, 'leave');
        await batch.save();
        
        return NextResponse.json({
          success: true,
          message: "Leave recorded"
        });

      case 'end':
        // End a meeting (only trainers and admins can end)
        if (finalUserRole === 'trainer' || finalUserRole === 'admin') {
          batch.jitsiMeeting.isActive = false;
          await batch.save();
          
          return NextResponse.json({
            success: true,
            message: "Meeting ended successfully",
            isActive: false
          });
        } else {
          return NextResponse.json({ message: "Only trainers and admins can end meetings" }, { status: 403 });
        }

      default:
        return NextResponse.json({ message: "Invalid action" }, { status: 400 });
    }

  } catch (error) {
    console.error("Error in POST /api/meetings/batch/[batchId]:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}