import mongoose from 'mongoose';
import Course from './src/models/Course.js';
import Batch from './src/models/Batch.js';
import User from './src/models/User.js';
import Enrollment from './src/models/Enrollment.js';
import Payment from './src/models/Payment.js';

async function clearDatabase() {
  try {
    // Connect to MongoDB
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Delete in order to respect foreign key constraints
    console.log('\n🗑️  Starting database cleanup...');

    // 1. Delete Payments first (references users and courses)
    console.log('📄 Deleting payments...');
    const deletedPayments = await Payment.deleteMany({});
    console.log(`   ✅ Deleted ${deletedPayments.deletedCount} payments`);

    // 2. Delete Enrollments (references users, courses, and batches)
    console.log('📚 Deleting enrollments...');
    const deletedEnrollments = await Enrollment.deleteMany({});
    console.log(`   ✅ Deleted ${deletedEnrollments.deletedCount} enrollments`);

    // 3. Delete Batches (references courses and instructors)
    console.log('👥 Deleting batches...');
    const deletedBatches = await Batch.deleteMany({});
    console.log(`   ✅ Deleted ${deletedBatches.deletedCount} batches`);

    // 4. Delete Courses
    console.log('📖 Deleting courses...');
    const deletedCourses = await Course.deleteMany({});
    console.log(`   ✅ Deleted ${deletedCourses.deletedCount} courses`);

    // 5. Delete Students (users with role 'student')
    console.log('👨‍🎓 Deleting students...');
    const deletedStudents = await User.deleteMany({ role: 'student' });
    console.log(`   ✅ Deleted ${deletedStudents.deletedCount} students`);

    // 6. Optionally delete all users (including admins and trainers)
    // Uncomment the next 3 lines if you want to delete ALL users
    // console.log('👤 Deleting all users...');
    // const deletedUsers = await User.deleteMany({});
    // console.log(`   ✅ Deleted ${deletedUsers.deletedCount} users`);

    console.log('\n🎉 Database cleanup completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   • Payments: ${deletedPayments.deletedCount}`);
    console.log(`   • Enrollments: ${deletedEnrollments.deletedCount}`);
    console.log(`   • Batches: ${deletedBatches.deletedCount}`);
    console.log(`   • Courses: ${deletedCourses.deletedCount}`);
    console.log(`   • Students: ${deletedStudents.deletedCount}`);

  } catch (error) {
    console.error('❌ Error during database cleanup:', error);
  } finally {
    // Close connection
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
    process.exit(0);
  }
}

// Run the cleanup
clearDatabase();
