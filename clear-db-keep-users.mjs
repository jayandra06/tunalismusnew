import mongoose from 'mongoose';
import Course from './src/models/Course.js';
import Batch from './src/models/Batch.js';
import User from './src/models/User.js';
import Enrollment from './src/models/Enrollment.js';
import Payment from './src/models/Payment.js';
import Session from './src/models/Session.js';

async function clearDatabaseKeepUsers() {
  try {
    // Connect to MongoDB
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: "tunalismusnext",
    });
    console.log('✅ Connected to MongoDB');

    // Get user count before clearing
    const userCount = await User.countDocuments();
    console.log(`👥 Found ${userCount} users in database`);

    if (userCount === 0) {
      console.log('⚠️ No users found in database. Nothing to preserve.');
      return;
    }

    // Show user details
    const users = await User.find({}, 'name email role createdAt');
    console.log('\n📋 Current users:');
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.email}) - Role: ${user.role} - Created: ${user.createdAt.toDateString()}`);
    });

    // Get counts of other collections
    const courseCount = await Course.countDocuments();
    const batchCount = await Batch.countDocuments();
    const enrollmentCount = await Enrollment.countDocuments();
    const paymentCount = await Payment.countDocuments();
    const sessionCount = await Session.countDocuments();

    console.log('\n📊 Current database contents:');
    console.log(`👥 Users: ${userCount}`);
    console.log(`📚 Courses: ${courseCount}`);
    console.log(`🎯 Batches: ${batchCount}`);
    console.log(`📝 Enrollments: ${enrollmentCount}`);
    console.log(`💳 Payments: ${paymentCount}`);
    console.log(`🔐 Sessions: ${sessionCount}`);

    console.log('\n🗑️  Starting database cleanup (preserving users)...');

    // Delete in order to respect foreign key constraints
    // 1. Delete Sessions first
    console.log('🔐 Deleting sessions...');
    const deletedSessions = await Session.deleteMany({});
    console.log(`   ✅ Deleted ${deletedSessions.deletedCount} sessions`);

    // 2. Delete Payments (references users and courses)
    console.log('💳 Deleting payments...');
    const deletedPayments = await Payment.deleteMany({});
    console.log(`   ✅ Deleted ${deletedPayments.deletedCount} payments`);

    // 3. Delete Enrollments (references users, courses, and batches)
    console.log('📝 Deleting enrollments...');
    const deletedEnrollments = await Enrollment.deleteMany({});
    console.log(`   ✅ Deleted ${deletedEnrollments.deletedCount} enrollments`);

    // 4. Delete Batches (references courses and instructors)
    console.log('🎯 Deleting batches...');
    const deletedBatches = await Batch.deleteMany({});
    console.log(`   ✅ Deleted ${deletedBatches.deletedCount} batches`);

    // 5. Delete Courses
    console.log('📚 Deleting courses...');
    const deletedCourses = await Course.deleteMany({});
    console.log(`   ✅ Deleted ${deletedCourses.deletedCount} courses`);

    // Verify users are still there
    const remainingUserCount = await User.countDocuments();
    console.log(`\n✅ Database cleanup completed!`);
    console.log(`👥 Users preserved: ${remainingUserCount}/${userCount}`);

    if (remainingUserCount === userCount) {
      console.log('🎉 All users successfully preserved!');
    } else {
      console.log('⚠️  Warning: Some users may have been lost!');
    }

    // Show final state
    console.log('\n📊 Final database state:');
    console.log(`👥 Users: ${await User.countDocuments()}`);
    console.log(`📚 Courses: ${await Course.countDocuments()}`);
    console.log(`🎯 Batches: ${await Batch.countDocuments()}`);
    console.log(`📝 Enrollments: ${await Enrollment.countDocuments()}`);
    console.log(`💳 Payments: ${await Payment.countDocuments()}`);
    console.log(`🔐 Sessions: ${await Session.countDocuments()}`);

    console.log('\n🎉 Database cleanup completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   • Sessions: ${deletedSessions.deletedCount}`);
    console.log(`   • Payments: ${deletedPayments.deletedCount}`);
    console.log(`   • Enrollments: ${deletedEnrollments.deletedCount}`);
    console.log(`   • Batches: ${deletedBatches.deletedCount}`);
    console.log(`   • Courses: ${deletedCourses.deletedCount}`);
    console.log(`   • Users: PRESERVED (${remainingUserCount})`);

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
clearDatabaseKeepUsers();
