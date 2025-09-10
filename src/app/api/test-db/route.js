import { NextResponse } from "next/server";
import { connectToDB } from "../../../lib/mongodb";
import User from "../../../models/User";
import Course from "../../../models/Course";
import Batch from "../../../models/Batch";
import Enrollment from "../../../models/Enrollment";

export async function GET(req) {
  try {
    console.log('🔍 Testing database connection...');
    
    // Test database connection
    await connectToDB();
    console.log('✅ Database connected successfully');
    
    // Test User model
    const userCount = await User.countDocuments();
    console.log('👥 User count:', userCount);
    
    // Test Course model
    const courseCount = await Course.countDocuments();
    console.log('📚 Course count:', courseCount);
    
    // Test Batch model
    const batchCount = await Batch.countDocuments();
    console.log('🎯 Batch count:', batchCount);
    
    // Test Enrollment model
    const enrollmentCount = await Enrollment.countDocuments();
    console.log('📝 Enrollment count:', enrollmentCount);
    
    // Get sample data
    const sampleUsers = await User.find({}).limit(3).select('name email role');
    const sampleCourses = await Course.find({}).limit(3).select('language level month year');
    const sampleBatches = await Batch.find({}).limit(3).select('name batchNumber batchType status');
    
    const testResults = {
      status: 'success',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      database: {
        connected: true,
        counts: {
          users: userCount,
          courses: courseCount,
          batches: batchCount,
          enrollments: enrollmentCount
        },
        sampleData: {
          users: sampleUsers,
          courses: sampleCourses,
          batches: sampleBatches
        }
      }
    };
    
    return NextResponse.json(testResults);
    
  } catch (error) {
    console.error('❌ Database test failed:', error);
    
    return NextResponse.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      error: error.message,
      database: {
        connected: false
      }
    }, { status: 500 });
  }
}
