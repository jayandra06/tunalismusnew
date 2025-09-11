import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.js';
import Course from './src/models/Course.js';
import Batch from './src/models/Batch.js';
import Enrollment from './src/models/Enrollment.js';
import Payment from './src/models/Payment.js';
import Session from './src/models/Session.js';

dotenv.config({ path: '.env.local' });

async function clearDatabaseKeepUsers() {
  try {
    console.log('🔗 Connecting to MongoDB...');
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

    // Confirm before proceeding
    console.log('\n⚠️  WARNING: This will delete ALL data except users!');
    console.log('The following collections will be cleared:');
    console.log('- Courses');
    console.log('- Batches');
    console.log('- Enrollments');
    console.log('- Payments');
    console.log('- Sessions');
    console.log('\n✅ Users will be preserved.');

    // In a script, we'll proceed automatically
    console.log('\n🗑️  Starting database cleanup...');

    // Clear collections (in order to respect foreign key constraints)
    console.log('🗑️  Clearing sessions...');
    await Session.deleteMany({});
    console.log(`✅ Cleared ${sessionCount} sessions`);

    console.log('🗑️  Clearing payments...');
    await Payment.deleteMany({});
    console.log(`✅ Cleared ${paymentCount} payments`);

    console.log('🗑️  Clearing enrollments...');
    await Enrollment.deleteMany({});
    console.log(`✅ Cleared ${enrollmentCount} enrollments`);

    console.log('🗑️  Clearing batches...');
    await Batch.deleteMany({});
    console.log(`✅ Cleared ${batchCount} batches`);

    console.log('🗑️  Clearing courses...');
    await Course.deleteMany({});
    console.log(`✅ Cleared ${courseCount} courses`);

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

  } catch (error) {
    console.error('❌ Error during database cleanup:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the script
clearDatabaseKeepUsers();
