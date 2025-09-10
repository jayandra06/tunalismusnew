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
  
  // Jitsi Meet Integration
  jitsiMeeting: {
    roomName: {
      type: String,
      default: ''
    },
    roomPassword: {
      type: String,
      default: ''
    },
    isActive: {
      type: Boolean,
      default: false
    },
    lastMeetingDate: {
      type: Date,
      default: null
    },
    meetingHistory: [{
      date: {
        type: Date,
        default: Date.now
      },
      duration: {
        type: Number, // in minutes
        default: 0
      },
      participants: [{
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        },
        joinTime: {
          type: Date,
          default: Date.now
        },
        leaveTime: {
          type: Date,
          default: null
        },
        role: {
          type: String,
          enum: ['trainer', 'student', 'admin'],
          default: 'student'
        }
      }]
    }]
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

// Method to initialize Jitsi meeting for batch
batchSchema.methods.initializeJitsiMeeting = function() {
  try {
    // Import jitsi service dynamically
    const jitsiService = require('../lib/jitsi-service').default;
    const meetingInfo = jitsiService.getMeetingInfo(this._id.toString(), this.name);
    
    this.jitsiMeeting.roomName = meetingInfo.roomName;
    this.jitsiMeeting.roomPassword = meetingInfo.password;
    this.jitsiMeeting.isActive = true;
    this.jitsiMeeting.lastMeetingDate = new Date();
    
    return meetingInfo;
  } catch (error) {
    console.error('Error initializing Jitsi meeting:', error);
    // Fallback: generate basic meeting info
    const roomName = `batch-${this._id}-${this.name?.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '-') || 'class'}`;
    const crypto = require('crypto');
    const secret = process.env.JITSI_ROOM_SECRET || 'tunalismus-secret-key';
    const hash = crypto.createHash('sha256').update(`${this._id}-${secret}`).digest('hex');
    const roomPassword = hash.substring(0, 8).toUpperCase();
    
    this.jitsiMeeting.roomName = roomName;
    this.jitsiMeeting.roomPassword = roomPassword;
    this.jitsiMeeting.isActive = true;
    this.jitsiMeeting.lastMeetingDate = new Date();
    
    return {
      roomName,
      password: roomPassword,
      domain: process.env.JITSI_DOMAIN || 'meet.tunalismus.com',
      baseUrl: `https://${process.env.JITSI_DOMAIN || 'meet.tunalismus.com'}/${roomName}`,
      displayName: `${this.name} - Batch Class`
    };
  }
};

// Method to get Jitsi meeting URL for a user
batchSchema.methods.getJitsiMeetingUrl = function(user, userRole) {
  try {
    const jitsiService = require('../lib/jitsi-service').default;
    
    if (!this.jitsiMeeting.roomName) {
      this.initializeJitsiMeeting();
    }
    
    switch (userRole) {
      case 'trainer':
        return jitsiService.generateTrainerMeetingUrl(this._id.toString(), this.name, user);
      case 'admin':
        return jitsiService.generateAdminMeetingUrl(this._id.toString(), this.name, user);
      case 'student':
      default:
        return jitsiService.generateStudentMeetingUrl(this._id.toString(), this.name, user);
    }
  } catch (error) {
    console.error('Error generating Jitsi meeting URL:', error);
    // Fallback: generate basic URL
    const roomName = this.jitsiMeeting.roomName || `batch-${this._id}-${this.name?.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '-') || 'class'}`;
    const domain = process.env.JITSI_DOMAIN || 'meet.tunalismus.com';
    const appId = process.env.JITSI_APP_ID || 'tunalismus';
    
    let url = `https://${domain}/${roomName}`;
    const params = new URLSearchParams();
    
    if (user.name) {
      params.append('userInfo.displayName', user.name);
    }
    if (user.email) {
      params.append('userInfo.email', user.email);
    }
    
    // Add role-specific settings
    if (userRole === 'trainer' || userRole === 'admin') {
      params.append('config.startWithAudioMuted', 'false');
      params.append('config.startWithVideoMuted', 'false');
      if (this.jitsiMeeting.roomPassword) {
        params.append('password', this.jitsiMeeting.roomPassword);
      }
    } else {
      params.append('config.startWithAudioMuted', 'true');
      params.append('config.startWithVideoMuted', 'true');
    }
    
    params.append('appId', appId);
    params.append('roomName', `${this.name} - Batch Class`);
    params.append('t', Date.now().toString());
    
    return `${url}?${params.toString()}`;
  }
};

// Method to record meeting participation
batchSchema.methods.recordMeetingParticipation = function(userId, userRole, action = 'join') {
  const now = new Date();
  
  // Find or create today's meeting record
  let todayMeeting = this.jitsiMeeting.meetingHistory.find(
    meeting => meeting.date.toDateString() === now.toDateString()
  );
  
  if (!todayMeeting) {
    todayMeeting = {
      date: now,
      duration: 0,
      participants: []
    };
    this.jitsiMeeting.meetingHistory.push(todayMeeting);
  }
  
  // Find existing participant record
  let participant = todayMeeting.participants.find(
    p => p.user.toString() === userId.toString()
  );
  
  if (!participant) {
    participant = {
      user: userId,
      joinTime: now,
      leaveTime: null,
      role: userRole
    };
    todayMeeting.participants.push(participant);
  } else if (action === 'leave') {
    participant.leaveTime = now;
  }
  
  return participant;
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