const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Define the Course schema inline to match the new model
const CourseSchema = new mongoose.Schema({
  // Basic Course Information
  name: {
    type: String,
    default: null
  },
  language: {
    type: String,
    required: true,
    enum: ['English', 'German', 'French', 'Spanish', 'Italian', 'Portuguese', 'Russian', 'Chinese', 'Japanese', 'Korean', 'Arabic', 'Hindi']
  },
  level: {
    type: String,
    required: true,
    enum: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'Beginner', 'Intermediate', 'Advanced']
  },
  
  // Course Schedule
  month: {
    type: Number,
    required: true,
    min: 1,
    max: 12
  },
  year: {
    type: Number,
    required: true,
    min: 2020,
    max: 2030
  },
  
  // Admin Configuration
  totalCapacity: {
    type: Number,
    required: true,
    min: 1,
    max: 1000
  },
  courseDuration: {
    type: Number,
    required: true,
    min: 1,
    max: 24
  },
  batchSizeLimit: {
    type: Number,
    required: true,
    min: 5,
    max: 100
  },
  
  // Batch Type Configuration
  batchTypes: {
    regular: {
      enabled: {
        type: Boolean,
        default: true
      },
      studentCount: {
        type: Number,
        default: 0,
        min: 0
      }
    },
    revision: {
      enabled: {
        type: Boolean,
        default: false
      },
      studentCount: {
        type: Number,
        default: 0,
        min: 0
      }
    }
  },
  
  // Course Status
  status: {
    type: String,
    enum: ['draft', 'active', 'completed', 'cancelled'],
    default: 'active'
  },
  
  // Pricing Structure
  pricing: {
    regular: {
      basePrice: {
        type: Number,
        required: true,
        min: 0
      },
      offlineMaterialCost: {
        type: Number,
        default: 0,
        min: 0
      },
      totalPrice: {
        type: Number,
        required: true,
        min: 0
      }
    },
    revision: {
      basePrice: {
        type: Number,
        required: true,
        min: 0
      },
      offlineMaterialCost: {
        type: Number,
        default: 0,
        min: 0
      },
      totalPrice: {
        type: Number,
        required: true,
        min: 0
      }
    }
  },
  
  // Legacy price field for backward compatibility
  price: {
    type: Number,
    required: true,
    min: 0
  },
  
  // Course Description
  description: {
    type: String,
    default: ''
  },
  
  // Offline Materials
  offlineMaterials: {
    enabled: {
      type: Boolean,
      default: false
    },
    materials: [{
      name: {
        type: String,
        required: true
      },
      description: {
        type: String,
        default: ''
      },
      type: {
        type: String,
        enum: ['book', 'workbook', 'cd', 'dvd', 'other'],
        required: true
      },
      cost: {
        type: Number,
        required: true,
        min: 0
      },
      quantity: {
        type: Number,
        default: 1,
        min: 1
      },
      totalCost: {
        type: Number,
        required: true,
        min: 0
      },
      supplier: {
        type: String,
        default: ''
      },
      notes: {
        type: String,
        default: ''
      }
    }],
    totalCost: {
      type: Number,
      default: 0,
      min: 0
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for auto-generated course name
CourseSchema.virtual('displayName').get(function() {
  if (this.name) {
    return this.name;
  }
  
  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];
  
  return `${this.language} ${this.level} ${monthNames[this.month - 1]} ${this.year}`;
});

// Virtual for total enrolled students
CourseSchema.virtual('totalEnrolled').get(function() {
  return (this.batchTypes.regular.studentCount || 0) + (this.batchTypes.revision.studentCount || 0);
});

// Virtual for available slots
CourseSchema.virtual('availableSlots').get(function() {
  return this.totalCapacity - this.totalEnrolled;
});

// Create model
const Course = mongoose.model('Course', CourseSchema, 'courses');

async function seedCourses() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://test:test1234@cluster0.gjtfwdb.mongodb.net/tunalismusnext?retryWrites=true&w=majority&appName=Cluster0';
    
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB successfully');

    // Clear existing courses
    console.log('🧹 Clearing existing courses...');
    await Course.deleteMany({});
    console.log('✅ Existing courses cleared');

    // Create sample courses
    console.log('📚 Creating sample courses...');
    
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
            studentCount: 15
          },
          revision: {
            enabled: true,
            studentCount: 5
          }
        },
        status: "active",
        pricing: {
          regular: {
            basePrice: 5000,
            offlineMaterialCost: 500,
            totalPrice: 5500
          },
          revision: {
            basePrice: 8000,
            offlineMaterialCost: 500,
            totalPrice: 8500
          }
        },
        price: 5000,
        description: "Learn English from the basics with our comprehensive A1 course. Perfect for beginners who want to start their English learning journey with confidence.",
        offlineMaterials: {
          enabled: true,
          materials: [
            {
              name: "English A1 Textbook",
              description: "Comprehensive textbook covering all A1 topics",
              type: "book",
              cost: 300,
              quantity: 1,
              totalCost: 300,
              supplier: "Oxford Press"
            },
            {
              name: "Practice Workbook",
              description: "Exercises and activities for practice",
              type: "workbook",
              cost: 200,
              quantity: 1,
              totalCost: 200,
              supplier: "Cambridge Press"
            }
          ],
          totalCost: 500
        }
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
            studentCount: 12
          },
          revision: {
            enabled: false,
            studentCount: 0
          }
        },
        status: "active",
        pricing: {
          regular: {
            basePrice: 6000,
            offlineMaterialCost: 800,
            totalPrice: 6800
          },
          revision: {
            basePrice: 0,
            offlineMaterialCost: 0,
            totalPrice: 0
          }
        },
        price: 6000,
        description: "Intermediate German course for B1 level learners. Build on your existing knowledge and develop fluency in German conversation and writing.",
        offlineMaterials: {
          enabled: true,
          materials: [
            {
              name: "German B1 Textbook",
              description: "Intermediate German textbook with grammar and vocabulary",
              type: "book",
              cost: 500,
              quantity: 1,
              totalCost: 500,
              supplier: "Hueber Verlag"
            },
            {
              name: "Audio CD Set",
              description: "Audio materials for listening practice",
              type: "cd",
              cost: 300,
              quantity: 1,
              totalCost: 300,
              supplier: "Hueber Verlag"
            }
          ],
          totalCost: 800
        }
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
            studentCount: 18
          },
          revision: {
            enabled: true,
            studentCount: 7
          }
        },
        status: "active",
        pricing: {
          regular: {
            basePrice: 5500,
            offlineMaterialCost: 600,
            totalPrice: 6100
          },
          revision: {
            basePrice: 7500,
            offlineMaterialCost: 600,
            totalPrice: 8100
          }
        },
        price: 5500,
        description: "French A2 course designed to help you communicate in everyday situations. Learn practical French for travel, work, and daily life.",
        offlineMaterials: {
          enabled: true,
          materials: [
            {
              name: "French A2 Textbook",
              description: "Complete A2 French course book",
              type: "book",
              cost: 400,
              quantity: 1,
              totalCost: 400,
              supplier: "CLE International"
            },
            {
              name: "French Grammar Workbook",
              description: "Grammar exercises and practice",
              type: "workbook",
              cost: 200,
              quantity: 1,
              totalCost: 200,
              supplier: "CLE International"
            }
          ],
          totalCost: 600
        }
      },
      {
        language: "Spanish",
        level: "Beginner",
        month: 4,
        year: 2024,
        totalCapacity: 35,
        courseDuration: 3,
        batchSizeLimit: 10,
        batchTypes: {
          regular: {
            enabled: true,
            studentCount: 8
          },
          revision: {
            enabled: true,
            studentCount: 3
          }
        },
        status: "active",
        pricing: {
          regular: {
            basePrice: 4500,
            offlineMaterialCost: 400,
            totalPrice: 4900
          },
          revision: {
            basePrice: 6500,
            offlineMaterialCost: 400,
            totalPrice: 6900
          }
        },
        price: 4500,
        description: "Start your Spanish journey with our beginner-friendly course. Learn essential vocabulary, grammar, and conversation skills.",
        offlineMaterials: {
          enabled: true,
          materials: [
            {
              name: "Spanish Beginner Textbook",
              description: "Complete beginner Spanish course",
              type: "book",
              cost: 350,
              quantity: 1,
              totalCost: 350,
              supplier: "Edinumen"
            },
            {
              name: "Spanish Practice Book",
              description: "Exercises and activities",
              type: "workbook",
              cost: 150,
              quantity: 1,
              totalCost: 150,
              supplier: "Edinumen"
            }
          ],
          totalCost: 500
        }
      },
      {
        language: "Italian",
        level: "Intermediate",
        month: 5,
        year: 2024,
        totalCapacity: 25,
        courseDuration: 4,
        batchSizeLimit: 8,
        batchTypes: {
          regular: {
            enabled: true,
            studentCount: 6
          },
          revision: {
            enabled: false,
            studentCount: 0
          }
        },
        status: "active",
        pricing: {
          regular: {
            basePrice: 7000,
            offlineMaterialCost: 700,
            totalPrice: 7700
          },
          revision: {
            basePrice: 0,
            offlineMaterialCost: 0,
            totalPrice: 0
          }
        },
        price: 7000,
        description: "Intermediate Italian course focusing on conversation, culture, and advanced grammar. Perfect for those who want to deepen their Italian skills.",
        offlineMaterials: {
          enabled: true,
          materials: [
            {
              name: "Italian Intermediate Textbook",
              description: "Comprehensive intermediate Italian course",
              type: "book",
              cost: 450,
              quantity: 1,
              totalCost: 450,
              supplier: "Alma Edizioni"
            },
            {
              name: "Italian Culture Reader",
              description: "Cultural insights and reading practice",
              type: "book",
              cost: 250,
              quantity: 1,
              totalCost: 250,
              supplier: "Alma Edizioni"
            }
          ],
          totalCost: 700
        }
      }
    ];

    const createdCourses = [];
    for (const courseData of courses) {
      const course = new Course(courseData);
      await course.save();
      createdCourses.push(course);
      console.log(`✅ Created course: ${course.displayName}`);
    }

    console.log('\n🎉 Course seeding successful!');
    console.log('\n📊 Summary:');
    console.log(`• Courses created: ${createdCourses.length}`);
    
    console.log('\n📚 Available Courses:');
    createdCourses.forEach(course => {
      console.log(`• ${course.displayName} - ${course.language} ${course.level}`);
      console.log(`  Regular: ₹${course.pricing.regular.totalPrice} | Revision: ₹${course.pricing.revision.totalPrice}`);
      console.log(`  Available slots: ${course.availableSlots}/${course.totalCapacity}`);
    });

  } catch (error) {
    console.error('❌ Error seeding courses:', error);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
    process.exit(0);
  }
}

// Run the seed function
seedCourses();
