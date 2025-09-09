const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// User schema (matching your existing model)
const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["admin", "trainer", "student"],
      default: "student",
    },
    status: {
      type: String,
      enum: ["active", "invited"],
      default: "active",
    },
    phone: { type: String },
    profileImage: { type: String },
    passwordResetToken: { type: String },
    passwordResetExpires: { type: Date },
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", UserSchema);

// Seed accounts data
const seedAccounts = [
  {
    name: "Admin User",
    email: "admin@tunalismus.com",
    password: "admin@1234",
    role: "admin",
    status: "active"
  },
  {
    name: "Trainer User", 
    email: "trainer@tunalismus.com",
    password: "trainer@1234",
    role: "trainer",
    status: "active"
  },
  {
    name: "Student User",
    email: "student@tunalismus.com", 
    password: "student@1234",
    role: "student",
    status: "active"
  }
];

async function clearAndSeedDatabase() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://test:test1234@cluster0.gjtfwdb.mongodb.net/tunalismusnext?retryWrites=true&w=majority&appName=Cluster0';
    
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(mongoUri, {
      dbName: "library", // Use the same database name as the app
    });
    console.log('✅ Connected to MongoDB successfully');

    // Get the database instance
    const db = mongoose.connection.db;
    
    // Clear ALL collections in the database
    console.log('🧹 Clearing all collections in the database...');
    const collections = await db.listCollections().toArray();
    
    for (const collection of collections) {
      console.log(`🗑️  Dropping collection: ${collection.name}`);
      await db.collection(collection.name).drop();
    }
    
    console.log('✅ All collections cleared successfully');

    // Create new accounts
    console.log('👥 Creating seed accounts...');
    
    for (const account of seedAccounts) {
      // Hash the password
      const hashedPassword = await bcrypt.hash(account.password, 12);
      
      // Create user
      const user = new User({
        ...account,
        password: hashedPassword
      });
      
      await user.save();
      console.log(`✅ Created ${account.role} account: ${account.email}`);
    }

    console.log('\n🎉 Database cleared and seed accounts created successfully!');
    console.log('\n📋 Test Accounts:');
    console.log('┌─────────────────────────────────────────────────────────┐');
    console.log('│ Admin Portal:  admin@tunalismus.com / admin@1234        │');
    console.log('│ Trainer Portal: trainer@tunalismus.com / trainer@1234   │');
    console.log('│ Student Portal: student@tunalismus.com / student@1234   │');
    console.log('└─────────────────────────────────────────────────────────┘');
    
    console.log('\n🔗 Portal URLs:');
    console.log('• Admin:  http://localhost:3000/admin/login');
    console.log('• Trainer: http://localhost:3000/trainer/login');
    console.log('• Student: http://localhost:3000/student/login');
    console.log('• Universal: http://localhost:3000/login');

  } catch (error) {
    console.error('❌ Error clearing and seeding database:', error);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
    process.exit(0);
  }
}

// Run the clear and seed function
clearAndSeedDatabase();
