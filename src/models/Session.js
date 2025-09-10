import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema({
  // Session Identification
  title: {
    type: String,
    required: true,
    trim: true
  },
  
  // Batch Reference
  batch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Batch',
    required: true
  },
  
  // Session Details
  type: {
    type: String,
    required: true,
    enum: ['lecture', 'workshop', 'review', 'exam', 'practical', 'assignment']
  },
  
  // Session Schedule
  date: {
    type: Date,
    required: true
  },
  startTime: {
    type: String,
    required: true,
    match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ // HH:MM format
  },
  endTime: {
    type: String,
    required: true,
    match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ // HH:MM format
  },
  duration: {
    type: Number, // in minutes
    required: true,
    min: 15,
    max: 480 // 8 hours max
  },
  
  // Location Information
  location: {
    type: String,
    required: true,
    trim: true
  },
  isOnline: {
    type: Boolean,
    default: false
  },
  meetingUrl: {
    type: String,
    default: ''
  },
  
  // Session Content
  description: {
    type: String,
    default: '',
    trim: true
  },
  objectives: [{
    type: String,
    trim: true
  }],
  materials: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    url: {
      type: String,
      default: ''
    },
    type: {
      type: String,
      enum: ['document', 'video', 'audio', 'link', 'other'],
      default: 'document'
    }
  }],
  
  // Session Status
  status: {
    type: String,
    enum: ['scheduled', 'in-progress', 'completed', 'cancelled', 'postponed'],
    default: 'scheduled'
  },
  
  // Attendance Tracking
  attendance: [{
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    status: {
      type: String,
      enum: ['present', 'absent', 'late', 'excused'],
      default: 'absent'
    },
    joinTime: {
      type: Date,
      default: null
    },
    leaveTime: {
      type: Date,
      default: null
    },
    notes: {
      type: String,
      default: ''
    }
  }],
  
  // Session Notes
  trainerNotes: {
    type: String,
    default: ''
  },
  studentFeedback: [{
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      trim: true
    },
    submittedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Session Recording
  recording: {
    url: {
      type: String,
      default: ''
    },
    duration: {
      type: Number, // in minutes
      default: 0
    },
    isAvailable: {
      type: Boolean,
      default: false
    }
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

// Virtual for session date and time combined
sessionSchema.virtual('sessionDateTime').get(function() {
  const [hours, minutes] = this.startTime.split(':').map(Number);
  const sessionDate = new Date(this.date);
  sessionDate.setHours(hours, minutes, 0, 0);
  return sessionDate;
});

// Virtual for session end date and time
sessionSchema.virtual('sessionEndDateTime').get(function() {
  const [hours, minutes] = this.endTime.split(':').map(Number);
  const sessionDate = new Date(this.date);
  sessionDate.setHours(hours, minutes, 0, 0);
  return sessionDate;
});

// Virtual for attendance count
sessionSchema.virtual('attendanceCount').get(function() {
  return this.attendance.filter(a => a.status === 'present').length;
});

// Virtual for total enrolled students
sessionSchema.virtual('totalStudents').get(function() {
  return this.attendance.length;
});

// Method to check if session is today
sessionSchema.methods.isToday = function() {
  const today = new Date();
  const sessionDate = new Date(this.date);
  return sessionDate.toDateString() === today.toDateString();
};

// Method to check if session is upcoming
sessionSchema.methods.isUpcoming = function() {
  const now = new Date();
  return this.sessionDateTime > now && this.status === 'scheduled';
};

// Method to check if session is in progress
sessionSchema.methods.isInProgress = function() {
  const now = new Date();
  return now >= this.sessionDateTime && now <= this.sessionEndDateTime && this.status === 'in-progress';
};

// Method to check if session is completed
sessionSchema.methods.isCompleted = function() {
  const now = new Date();
  return now > this.sessionEndDateTime || this.status === 'completed';
};

// Method to mark attendance
sessionSchema.methods.markAttendance = function(studentId, status, notes = '') {
  const attendanceRecord = this.attendance.find(a => a.student.toString() === studentId.toString());
  
  if (attendanceRecord) {
    attendanceRecord.status = status;
    attendanceRecord.notes = notes;
    if (status === 'present' || status === 'late') {
      attendanceRecord.joinTime = new Date();
    }
  } else {
    this.attendance.push({
      student: studentId,
      status,
      notes,
      joinTime: (status === 'present' || status === 'late') ? new Date() : null
    });
  }
  
  return attendanceRecord;
};

// Method to start session
sessionSchema.methods.startSession = function() {
  this.status = 'in-progress';
  this.updatedAt = new Date();
  return this;
};

// Method to end session
sessionSchema.methods.endSession = function() {
  this.status = 'completed';
  this.updatedAt = new Date();
  
  // Set leave time for all present students
  this.attendance.forEach(record => {
    if (record.status === 'present' || record.status === 'late') {
      record.leaveTime = new Date();
    }
  });
  
  return this;
};

// Method to cancel session
sessionSchema.methods.cancelSession = function(reason = '') {
  this.status = 'cancelled';
  this.trainerNotes = reason;
  this.updatedAt = new Date();
  return this;
};

// Method to postpone session
sessionSchema.methods.postponeSession = function(newDate, newStartTime, newEndTime, reason = '') {
  this.status = 'postponed';
  this.date = newDate;
  this.startTime = newStartTime;
  this.endTime = newEndTime;
  this.duration = this.calculateDuration(newStartTime, newEndTime);
  this.trainerNotes = reason;
  this.updatedAt = new Date();
  return this;
};

// Static method to calculate duration
sessionSchema.statics.calculateDuration = function(startTime, endTime) {
  const [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = endTime.split(':').map(Number);
  
  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;
  
  return endMinutes - startMinutes;
};

// Method to calculate duration
sessionSchema.methods.calculateDuration = function(startTime, endTime) {
  return Session.calculateDuration(startTime, endTime);
};

// Pre-save middleware to calculate duration
sessionSchema.pre('save', function(next) {
  if (this.isModified('startTime') || this.isModified('endTime')) {
    this.duration = this.calculateDuration(this.startTime, this.endTime);
  }
  next();
});

// Indexes for efficient queries
sessionSchema.index({ batch: 1, date: 1 });
sessionSchema.index({ date: 1, startTime: 1 });
sessionSchema.index({ status: 1 });
sessionSchema.index({ type: 1 });
sessionSchema.index({ 'attendance.student': 1 });

// Clear any existing model to avoid conflicts
if (mongoose.models.Session) {
  delete mongoose.models.Session;
}

const Session = mongoose.model('Session', sessionSchema, 'sessions');
export default Session;
