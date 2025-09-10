import mongoose from "mongoose";

const courseSchema = new mongoose.Schema({
  // Basic Course Information
  name: {
    type: String,
    default: null // null means auto-generate, custom name if provided
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
    max: 24 // months
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
    enum: ['draft', 'published', 'active', 'completed', 'cancelled'],
    default: 'draft'
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
  },
  
  // Multi-Trainer Support
  trainers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  // Legacy Instructor Assignment (for backward compatibility)
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for auto-generated course name
courseSchema.virtual('displayName').get(function() {
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
courseSchema.virtual('totalEnrolled').get(function() {
  return (this.batchTypes.regular.studentCount || 0) + (this.batchTypes.revision.studentCount || 0);
});

// Virtual for available slots
courseSchema.virtual('availableSlots').get(function() {
  return this.totalCapacity - this.totalEnrolled;
});

// Method to check if course is full
courseSchema.methods.isFull = function() {
  return this.totalEnrolled >= this.totalCapacity;
};

// Method to get batch distribution summary
courseSchema.methods.getBatchSummary = function() {
  const regularBatches = Math.ceil((this.batchTypes.regular.studentCount || 0) / this.batchSizeLimit);
  const revisionBatches = Math.ceil((this.batchTypes.revision.studentCount || 0) / this.batchSizeLimit);
  
  return {
    regular: {
      students: this.batchTypes.regular.studentCount || 0,
      batches: regularBatches,
      fullBatches: Math.floor((this.batchTypes.regular.studentCount || 0) / this.batchSizeLimit),
      leftoverStudents: (this.batchTypes.regular.studentCount || 0) % this.batchSizeLimit
    },
    revision: {
      students: this.batchTypes.revision.studentCount || 0,
      batches: revisionBatches,
      fullBatches: Math.floor((this.batchTypes.revision.studentCount || 0) / this.batchSizeLimit),
      leftoverStudents: (this.batchTypes.revision.studentCount || 0) % this.batchSizeLimit
    }
  };
};

// Method to calculate total price for a batch type
courseSchema.methods.getTotalPrice = function(batchType) {
  if (!this.pricing[batchType]) {
    return this.price; // Fallback to legacy price
  }
  
  const basePrice = this.pricing[batchType].basePrice || 0;
  const offlineCost = this.offlineMaterials.enabled ? this.pricing[batchType].offlineMaterialCost || 0 : 0;
  
  return basePrice + offlineCost;
};

// Method to get pricing breakdown
courseSchema.methods.getPricingBreakdown = function(batchType) {
  if (!this.pricing[batchType]) {
    return {
      basePrice: this.price,
      offlineMaterialCost: 0,
      totalPrice: this.price
    };
  }
  
  const basePrice = this.pricing[batchType].basePrice || 0;
  const offlineCost = this.offlineMaterials.enabled ? this.pricing[batchType].offlineMaterialCost || 0 : 0;
  
  return {
    basePrice,
    offlineMaterialCost: offlineCost,
    totalPrice: basePrice + offlineCost
  };
};

// Method to update offline materials total cost
courseSchema.methods.updateOfflineMaterialsCost = function() {
  if (!this.offlineMaterials.enabled || !this.offlineMaterials.materials) {
    this.offlineMaterials.totalCost = 0;
    return;
  }
  
  const totalCost = this.offlineMaterials.materials.reduce((sum, material) => {
    return sum + (material.totalCost || 0);
  }, 0);
  
  this.offlineMaterials.totalCost = totalCost;
  
  // Update pricing for both batch types
  if (this.pricing.regular) {
    this.pricing.regular.offlineMaterialCost = totalCost;
    this.pricing.regular.totalPrice = this.pricing.regular.basePrice + totalCost;
  }
  
  if (this.pricing.revision) {
    this.pricing.revision.offlineMaterialCost = totalCost;
    this.pricing.revision.totalPrice = this.pricing.revision.basePrice + totalCost;
  }
};

// Method to get all trainers (including legacy instructor)
courseSchema.methods.getAllTrainers = function() {
  const allTrainers = [...this.trainers];
  
  // Add legacy instructor if not already in trainers array
  if (this.instructor && !allTrainers.includes(this.instructor)) {
    allTrainers.push(this.instructor);
  }
  
  return allTrainers;
};

// Method to check if a user is a trainer for this course
courseSchema.methods.isTrainer = function(userId) {
  return this.trainers.includes(userId) || this.instructor?.toString() === userId?.toString();
};

// Index for efficient queries
courseSchema.index({ language: 1, level: 1, month: 1, year: 1 });
courseSchema.index({ status: 1 });
courseSchema.index({ instructor: 1 });
courseSchema.index({ trainers: 1 });

// Clear any existing model to avoid conflicts
if (mongoose.models.Course) {
  delete mongoose.models.Course;
}

export default mongoose.model('Course', courseSchema, 'courses');