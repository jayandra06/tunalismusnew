import mongoose from "mongoose";

const batchSchema = new mongoose.Schema({
  // Batch Identification
  name: {
    type: String,
    required: true
  },
  batchNumber: {
    type: Number,
    required: true
  },
  batchType: {
    type: String,
    required: true,
    enum: ['regular', 'revision']
  },
  
  // Course Reference
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  
  // Batch Configuration
  maxStudents: {
    type: Number,
    required: true,
    min: 1,
    max: 100
  },
  currentStudents: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Batch Schedule
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  duration: {
    type: Number,
    required: true,
    min: 1 // months
  },
  
  // Batch Status
  status: {
    type: String,
    enum: ['upcoming', 'active', 'completed', 'cancelled'],
    default: 'upcoming'
  },
  
  // Instructor Assignment
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  
  // Batch Settings
  isLeftoverBatch: {
    type: Boolean,
    default: false
  },
  mergedFromBatches: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Batch'
  }],
  
  // Meeting Schedule (if applicable)
  meetingSchedule: {
    days: [{
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    }],
    time: {
      start: String, // "09:00"
      end: String    // "11:00"
    },
    timezone: {
      type: String,
      default: 'Asia/Kolkata'
    }
  },
  
  // Batch Notes
  notes: {
    type: String,
    default: ''
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
  timestamps: true
});

// Virtual for available slots
batchSchema.virtual('availableSlots').get(function() {
  return this.maxStudents - this.currentStudents;
});

// Virtual for batch capacity percentage
batchSchema.virtual('capacityPercentage').get(function() {
  return Math.round((this.currentStudents / this.maxStudents) * 100);
});

// Virtual for batch name
batchSchema.virtual('batchName').get(function() {
  return `${this.batchType.charAt(0).toUpperCase() + this.batchType.slice(1)} Batch ${this.batchNumber}`;
});

// Method to check if batch is full
batchSchema.methods.isFull = function() {
  return this.currentStudents >= this.maxStudents;
};

// Method to check if batch has leftover students
batchSchema.methods.hasLeftoverStudents = function() {
  return this.currentStudents < this.maxStudents && this.currentStudents > 0;
};

// Method to get leftover student count
batchSchema.methods.getLeftoverCount = function() {
  if (this.currentStudents < this.maxStudents) {
    return this.maxStudents - this.currentStudents;
  }
  return 0;
};

// Method to check if batch is active
batchSchema.methods.isActive = function() {
  const now = new Date();
  return this.startDate <= now && this.endDate >= now && this.status === 'active';
};

// Method to check if batch is upcoming
batchSchema.methods.isUpcoming = function() {
  const now = new Date();
  return this.startDate > now && this.status === 'scheduled';
};

// Method to check if batch is completed
batchSchema.methods.isCompleted = function() {
  const now = new Date();
  return this.endDate < now || this.status === 'completed';
};

// Index for efficient queries
batchSchema.index({ course: 1, batchType: 1, batchNumber: 1 });
batchSchema.index({ status: 1 });
batchSchema.index({ instructor: 1 });
batchSchema.index({ startDate: 1, endDate: 1 });

// Clear any existing model to avoid conflicts
if (mongoose.models.Batch) {
  delete mongoose.models.Batch;
}

export default mongoose.model('Batch', batchSchema, 'batches');