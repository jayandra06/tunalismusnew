import mongoose from "mongoose";

const enrollmentSchema = new mongoose.Schema({
  // Student Reference
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Course Reference
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  
  // Batch Assignment
  batch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Batch',
    default: null // null means not yet assigned to a batch
  },
  
  // Enrollment Details
  batchType: {
    type: String,
    required: true,
    enum: ['regular', 'revision']
  },
  
  // Enrollment Status
  status: {
    type: String,
    enum: ['pending', 'enrolled', 'active', 'completed', 'cancelled', 'transferred'],
    default: 'pending'
  },
  
  // Payment Information
  payment: {
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    status: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending'
    },
    paymentId: {
      type: String,
      default: null
    },
    paidAt: {
      type: Date,
      default: null
    }
  },
  
  // Enrollment Dates
  enrolledAt: {
    type: Date,
    default: Date.now
  },
  startedAt: {
    type: Date,
    default: null
  },
  completedAt: {
    type: Date,
    default: null
  },
  
  // Progress Tracking
  progress: {
    attendance: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    assignments: {
      completed: {
        type: Number,
        default: 0
      },
      total: {
        type: Number,
        default: 0
      }
    },
    tests: {
      completed: {
        type: Number,
        default: 0
      },
      total: {
        type: Number,
        default: 0
      }
    },
    overallGrade: {
      type: String,
      enum: ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'F'],
      default: null
    }
  },
  
  // Notes and Comments
  notes: {
    type: String,
    default: ''
  },
  
  // Transfer Information (if applicable)
  transferHistory: [{
    fromBatch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Batch'
    },
    toBatch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Batch'
    },
    reason: String,
    transferredAt: {
      type: Date,
      default: Date.now
    }
  }],
  
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
  timestamps: true
});

// Virtual for enrollment duration
enrollmentSchema.virtual('enrollmentDuration').get(function() {
  if (this.startedAt && this.completedAt) {
    const diffTime = Math.abs(this.completedAt - this.startedAt);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // days
  }
  return null;
});

// Virtual for progress percentage
enrollmentSchema.virtual('progressPercentage').get(function() {
  const attendance = this.progress.attendance || 0;
  const assignments = this.progress.assignments.total > 0 
    ? (this.progress.assignments.completed / this.progress.assignments.total) * 100 
    : 0;
  const tests = this.progress.tests.total > 0 
    ? (this.progress.tests.completed / this.progress.tests.total) * 100 
    : 0;
  
  return Math.round((attendance + assignments + tests) / 3);
});

// Method to check if enrollment is active
enrollmentSchema.methods.isActive = function() {
  return this.status === 'active' || this.status === 'enrolled';
};

// Method to check if enrollment is completed
enrollmentSchema.methods.isCompleted = function() {
  return this.status === 'completed';
};

// Method to check if payment is completed
enrollmentSchema.methods.isPaymentCompleted = function() {
  return this.payment.status === 'paid';
};

// Method to transfer student to another batch
enrollmentSchema.methods.transferToBatch = function(newBatchId, reason) {
  const oldBatchId = this.batch;
  
  // Add to transfer history
  this.transferHistory.push({
    fromBatch: oldBatchId,
    toBatch: newBatchId,
    reason: reason || 'Admin transfer'
  });
  
  // Update batch assignment
  this.batch = newBatchId;
  this.updatedAt = new Date();
  
  return this.save();
};

// Index for efficient queries
enrollmentSchema.index({ student: 1, course: 1 });
enrollmentSchema.index({ course: 1, batch: 1 });
enrollmentSchema.index({ status: 1 });
enrollmentSchema.index({ 'payment.status': 1 });
enrollmentSchema.index({ enrolledAt: 1 });

// Clear any existing model to avoid conflicts
if (mongoose.models.Enrollment) {
  delete mongoose.models.Enrollment;
}

export default mongoose.model('Enrollment', enrollmentSchema, 'enrollments');
