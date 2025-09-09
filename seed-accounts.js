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

async function seedDatabase() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://test:test1234@cluster0.gjtfwdb.mongodb.net/tunalismusnext?retryWrites=true&w=majority&appName=Cluster0';
    
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(mongoUri, {
      dbName: "library", // Use the same database name as the app
    });
    console.log('✅ Connected to MongoDB successfully');

    // Clear existing test accounts (optional - remove this if you want to keep existing data)
    console.log('🧹 Cleaning up existing test accounts...');
    await User.deleteMany({
      email: { 
        $in: [
          'admin@tunalismus.com',
          'trainer@tunalismus.com', 
          'student@tunalismus.com'
        ]
      }
    });
    console.log('✅ Existing test accounts removed');

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

    console.log('\n🎉 Seed accounts created successfully!');
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
    console.error('❌ Error seeding database:', error);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
    process.exit(0);
  }
}

// Run the seed function
seedDatabase();
