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
}, { timestamps: true });

const CourseSchema = new mongoose.Schema({
  language: { type: String, required: true },
  level: { type: String, required: true },
  month: { type: Number, required: true },
  year: { type: Number, required: true },
  totalCapacity: { type: Number, required: true },
  courseDuration: { type: Number, required: true },
  batchSizeLimit: { type: Number, required: true },
  batchTypes: {
    regular: {
      enabled: { type: Boolean, default: true },
      price: { type: Number, default: 0 }
    },
    revision: {
      enabled: { type: Boolean, default: false },
      price: { type: Number, default: 0 }
    }
  },
  status: { type: String, enum: ["active", "inactive"], default: "active" }
}, { timestamps: true });

const BatchSchema = new mongoose.Schema({
  batchNumber: { type: Number, required: true },
  batchType: { type: String, required: true, enum: ['regular', 'revision'] },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  maxStudents: { type: Number, required: true },
  currentStudents: { type: Number, default: 0 },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  duration: { type: Number, required: true },
  status: { type: String, enum: ['scheduled', 'active', 'completed', 'cancelled'], default: 'scheduled' },
  instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  isLeftoverBatch: { type: Boolean, default: false }
}, { timestamps: true });

const EnrollmentSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  batch: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch', default: null },
  batchType: { type: String, required: true, enum: ['regular', 'revision'] },
  status: { type: String, enum: ['pending', 'enrolled', 'active', 'completed', 'cancelled', 'transferred'], default: 'pending' },
  payment: {
    amount: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
    method: { type: String, default: 'Razorpay' },
    transactionId: { type: String }
  },
  enrollmentDate: { type: Date, default: Date.now }
}, { timestamps: true });

const PaymentSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
  method: { type: String, default: 'Razorpay' },
  transactionId: { type: String },
  paymentDate: { type: Date, default: Date.now }
}, { timestamps: true });

// Create models
const User = mongoose.model('User', UserSchema, 'users');
const Course = mongoose.model('Course', CourseSchema, 'courses');
const Batch = mongoose.model('Batch', BatchSchema, 'batches');
const Enrollment = mongoose.model('Enrollment', EnrollmentSchema, 'enrollments');
const Payment = mongoose.model('Payment', PaymentSchema, 'payments');

async function seedCompleteData() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://test:test1234@cluster0.gjtfwdb.mongodb.net/tunalismusnext?retryWrites=true&w=majority&appName=Cluster0';
    
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(mongoUri, {
      dbName: "library",
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

    // Create users
    console.log('👥 Creating users...');
    
    const users = [
      {
        name: "Admin User",
        email: "admin@tunalismus.com",
        password: await bcrypt.hash("admin@1234", 12),
        role: "admin",
        status: "active"
      },
      {
        name: "Trainer User", 
        email: "trainer@tunalismus.com",
        password: await bcrypt.hash("trainer@1234", 12),
        role: "trainer",
        status: "active"
      },
      {
        name: "Student User",
        email: "student@tunalismus.com", 
        password: await bcrypt.hash("student@1234", 12),
        role: "student",
        status: "active"
      },
      {
        name: "John Doe",
        email: "john@example.com",
        password: await bcrypt.hash("password123", 12),
        role: "student",
        status: "active"
      },
      {
        name: "Jane Smith",
        email: "jane@example.com",
        password: await bcrypt.hash("password123", 12),
        role: "student",
        status: "active"
      },
      {
        name: "Mike Johnson",
        email: "mike@example.com",
        password: await bcrypt.hash("password123", 12),
        role: "student",
        status: "active"
      }
    ];

    const createdUsers = [];
    for (const userData of users) {
      const user = new User(userData);
      await user.save();
      createdUsers.push(user);
      console.log(`✅ Created ${userData.role} account: ${userData.email}`);
    }

    // Create courses
    console.log('📚 Creating courses...');
    
    const courses = [
      {
        language: "English",
        level: "A1",
        month: 1,
        year: 2024,
        totalCapacity: 50,
        courseDuration: 3,
        batchSizeLimit: 10,
        batchTypes: {
          regular: {
            enabled: true,
            price: 5000
          },
          revision: {
            enabled: true,
            price: 3000
          }
        },
        status: "active"
      },
      {
        language: "German",
        level: "B1",
        month: 2,
        year: 2024,
        totalCapacity: 30,
        courseDuration: 4,
        batchSizeLimit: 8,
        batchTypes: {
          regular: {
            enabled: true,
            price: 6000
          },
          revision: {
            enabled: false,
            price: 0
          }
        },
        status: "active"
      },
      {
        language: "French",
        level: "A2",
        month: 3,
        year: 2024,
        totalCapacity: 40,
        courseDuration: 3,
        batchSizeLimit: 12,
        batchTypes: {
          regular: {
            enabled: true,
            price: 5500
          },
          revision: {
            enabled: true,
            price: 3500
          }
        },
        status: "active"
      }
    ];

    const createdCourses = [];
    for (const courseData of courses) {
      const course = new Course(courseData);
      await course.save();
      createdCourses.push(course);
      console.log(`✅ Created course: ${courseData.language} ${courseData.level}`);
    }

    // Create batches for each course
    console.log('🎯 Creating batches...');
    
    for (const course of createdCourses) {
      // Create regular batches
      if (course.batchTypes.regular.enabled) {
        const regularBatch1 = new Batch({
          batchNumber: 1,
          batchType: 'regular',
          course: course._id,
          maxStudents: course.batchSizeLimit,
          currentStudents: 8,
          startDate: new Date(course.year, course.month - 1, 1),
          endDate: new Date(course.year, course.month - 1 + course.courseDuration, 0),
          duration: course.courseDuration,
          status: 'active',
          instructor: createdUsers.find(u => u.role === 'trainer')._id
        });
        await regularBatch1.save();

        const regularBatch2 = new Batch({
          batchNumber: 2,
          batchType: 'regular',
          course: course._id,
          maxStudents: course.batchSizeLimit,
          currentStudents: 6,
          startDate: new Date(course.year, course.month - 1, 1),
          endDate: new Date(course.year, course.month - 1 + course.courseDuration, 0),
          duration: course.courseDuration,
          status: 'active',
          instructor: createdUsers.find(u => u.role === 'trainer')._id
        });
        await regularBatch2.save();
        console.log(`✅ Created regular batches for ${course.language} ${course.level}`);
      }

      // Create revision batches
      if (course.batchTypes.revision.enabled) {
        const revisionBatch = new Batch({
          batchNumber: 1,
          batchType: 'revision',
          course: course._id,
          maxStudents: course.batchSizeLimit,
          currentStudents: 4,
          startDate: new Date(course.year, course.month - 1, 1),
          endDate: new Date(course.year, course.month - 1 + course.courseDuration, 0),
          duration: course.courseDuration,
          status: 'active',
          instructor: createdUsers.find(u => u.role === 'trainer')._id
        });
        await revisionBatch.save();
        console.log(`✅ Created revision batch for ${course.language} ${course.level}`);
      }
    }

    // Create enrollments
    console.log('📝 Creating enrollments...');
    
    const students = createdUsers.filter(u => u.role === 'student');
    const enrollments = [];

    for (let i = 0; i < students.length; i++) {
      const student = students[i];
      const course = createdCourses[i % createdCourses.length];
      const batchType = i % 2 === 0 ? 'regular' : 'revision';
      
      // Find a batch for this course and batch type
      const batches = await Batch.find({ 
        course: course._id, 
        batchType: batchType 
      });
      
      if (batches.length > 0) {
        const batch = batches[0];
        
        const enrollment = new Enrollment({
          student: student._id,
          course: course._id,
          batch: batch._id,
          batchType: batchType,
          status: 'enrolled',
          payment: {
            amount: course.batchTypes[batchType].price,
            status: 'paid',
            method: 'Razorpay',
            transactionId: `txn_${Date.now()}_${i}`
          },
          enrollmentDate: new Date()
        });
        
        await enrollment.save();
        enrollments.push(enrollment);
        console.log(`✅ Created enrollment for ${student.name} in ${course.language} ${course.level}`);
      }
    }

    // Create payments
    console.log('💳 Creating payments...');
    
    for (const enrollment of enrollments) {
      const payment = new Payment({
        student: enrollment.student,
        course: enrollment.course,
        amount: enrollment.payment.amount,
        status: enrollment.payment.status,
        method: enrollment.payment.method,
        transactionId: enrollment.payment.transactionId,
        paymentDate: new Date()
      });
      
      await payment.save();
      console.log(`✅ Created payment for enrollment ${enrollment._id}`);
    }

    console.log('\n🎉 Complete data seeding successful!');
    console.log('\n📊 Summary:');
    console.log(`• Users: ${createdUsers.length}`);
    console.log(`• Courses: ${createdCourses.length}`);
    console.log(`• Batches: ${await Batch.countDocuments()}`);
    console.log(`• Enrollments: ${enrollments.length}`);
    console.log(`• Payments: ${await Payment.countDocuments()}`);
    
    console.log('\n🔐 Test Accounts:');
    console.log('┌─────────────────────────────────────────────────────────┐');
    console.log('│ Admin Portal:  admin@tunalismus.com / admin@1234        │');
    console.log('│ Trainer Portal: trainer@tunalismus.com / trainer@1234   │');
    console.log('│ Student Portal: student@tunalismus.com / student@1234   │');
    console.log('└─────────────────────────────────────────────────────────┘');

  } catch (error) {
    console.error('❌ Error seeding complete data:', error);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
    process.exit(0);
  }
}

// Run the seed function
seedCompleteData();
