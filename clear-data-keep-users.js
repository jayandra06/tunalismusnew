const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Define schemas inline since we can't import ES modules in CommonJS
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["admin", "trainer", "student"], default: "student" },
  status: { type: String, enum: ["active", "invited"], default: "active" },
  phone: { type: String },
  profileImage: { type: String },
  passwordResetToken: { type: String },
  passwordResetExpires: { type: Date },
  isActive: { type: Boolean, default: true },
  isPlaceholder: { type: Boolean, default: false },
}, { timestamps: true });

// Create models
const User = mongoose.model('User', UserSchema, 'users');

async function clearDataKeepUsers() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://test:test1234@cluster0.gjtfwdb.mongodb.net/tunalismusnext?retryWrites=true&w=majority&appName=Cluster0';
    
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(mongoUri, {
      dbName: "tunalismusnext",
    });
    console.log('✅ Connected to MongoDB successfully');

    // Get the database instance
    const db = mongoose.connection.db;
    
    // Collections to clear (all except users)
    const collectionsToClear = [
      'courses',
      'batches', 
      'enrollments',
      'payments',
      'attendance',
      'progress',
      'sessions',
      'materials',
      'books'
    ];
    
    console.log('🧹 Clearing all data except users...');
    
    // Clear each collection
    for (const collectionName of collectionsToClear) {
      try {
        const collection = db.collection(collectionName);
        const count = await collection.countDocuments();
        
        if (count > 0) {
          await collection.deleteMany({});
          console.log(`🗑️  Cleared ${count} documents from ${collectionName}`);
        } else {
          console.log(`ℹ️  Collection ${collectionName} is already empty`);
        }
      } catch (error) {
        console.log(`⚠️  Collection ${collectionName} doesn't exist or couldn't be cleared: ${error.message}`);
      }
    }
    
    // Get user count to confirm users are preserved
    const userCount = await User.countDocuments();
    console.log(`👥 Users preserved: ${userCount} users remain in the database`);
    
    // List all remaining collections
    const remainingCollections = await db.listCollections().toArray();
    console.log('\n📋 Remaining collections in database:');
    for (const collection of remainingCollections) {
      const count = await db.collection(collection.name).countDocuments();
      console.log(`   - ${collection.name}: ${count} documents`);
    }

    console.log('\n🎉 Database cleared successfully! All data removed except users.');
    console.log('\n📋 Summary:');
    console.log('   ✅ Users collection preserved');
    console.log('   🗑️  All other collections cleared');
    console.log(`   👥 ${userCount} users remain in the database`);

  } catch (error) {
    console.error('❌ Error clearing database:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
    process.exit(0);
  }
}

// Run the function
clearDataKeepUsers();
