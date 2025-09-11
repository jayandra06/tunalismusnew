import mongoose from "mongoose";
import Course from "./Course";

const homepageAdSchema = new mongoose.Schema(
  {
    course_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true
    },
    ad_type: {
      type: String,
      required: true,
      enum: ['popup', 'banner', 'toast', 'badge', 'flyer', 'floating_button']
    },
    special_note: {
      type: String,
      required: true
    },
    media_url: {
      type: String,
      default: null
    },
    cta_text: {
      type: String,
      default: null
    },
    cta_link: {
      type: String,
      default: null
    },
    timer: {
      type: Number,
      default: null, // Auto-close in X seconds, null means no auto-close
      min: 1,
      max: 300 // Max 5 minutes
    },
    closable: {
      type: Boolean,
      default: true
    },
    frequency: {
      type: String,
      required: true,
      enum: ['per_session', 'per_day', 'always']
    },
    target_audience: {
      type: String,
      required: true,
      enum: ['all', 'guest', 'logged_in', 'role_based']
    },
    target_roles: {
      type: [String],
      default: [], // Only used when target_audience is 'role_based'
      enum: ['admin', 'trainer', 'student']
    },
    start_date: {
      type: Date,
      required: true
    },
    end_date: {
      type: Date,
      required: true
    },
    status: {
      type: String,
      required: true,
      enum: ['draft', 'published'],
      default: 'draft'
    },
    // Analytics fields
    impressions: {
      type: Number,
      default: 0
    },
    clicks: {
      type: Number,
      default: 0
    },
    closes: {
      type: Number,
      default: 0
    },
    // Additional configuration
    position: {
      type: String,
      default: 'center', // For popup, banner position, etc.
      enum: ['top', 'center', 'bottom', 'left', 'right', 'top_left', 'top_right', 'bottom_left', 'bottom_right']
    },
    priority: {
      type: Number,
      default: 1,
      min: 1,
      max: 10 // Higher number = higher priority
    },
    // Styling options
    background_color: {
      type: String,
      default: null
    },
    text_color: {
      type: String,
      default: null
    },
    border_radius: {
      type: Number,
      default: 8,
      min: 0,
      max: 50
    },
    // Animation settings
    animation_type: {
      type: String,
      default: 'fade_in',
      enum: ['fade_in', 'slide_in', 'bounce', 'zoom_in', 'none']
    },
    animation_duration: {
      type: Number,
      default: 300, // milliseconds
      min: 100,
      max: 2000
    }
  },
  { timestamps: true }
);

// Indexes for efficient queries
homepageAdSchema.index({ status: 1, start_date: 1, end_date: 1 });
homepageAdSchema.index({ course_id: 1 });
homepageAdSchema.index({ ad_type: 1 });
homepageAdSchema.index({ target_audience: 1 });
homepageAdSchema.index({ priority: -1 });

// Virtual to check if ad is currently active
homepageAdSchema.virtual('isActive').get(function() {
  const now = new Date();
  return this.status === 'published' && 
         this.start_date <= now && 
         this.end_date >= now;
});

// Method to check if ad should be shown to a specific user
homepageAdSchema.methods.shouldShowToUser = function(user) {
  // Check if ad is active
  if (!this.isActive) return false;
  
  // Check target audience
  switch (this.target_audience) {
    case 'all':
      return true;
    case 'guest':
      return !user;
    case 'logged_in':
      return !!user;
    case 'role_based':
      return user && this.target_roles.includes(user.role);
    default:
      return false;
  }
};

// Method to increment analytics
homepageAdSchema.methods.incrementImpressions = function() {
  this.impressions += 1;
  return this.save();
};

homepageAdSchema.methods.incrementClicks = function() {
  this.clicks += 1;
  return this.save();
};

homepageAdSchema.methods.incrementCloses = function() {
  this.closes += 1;
  return this.save();
};

// Static method to get active ads for a user
homepageAdSchema.statics.getActiveAdsForUser = function(user) {
  const now = new Date();
  
  return this.find({
    status: 'published',
    start_date: { $lte: now },
    end_date: { $gte: now }
  })
  .populate('course_id', 'name language level')
  .sort({ priority: -1, createdAt: -1 })
  .then(ads => {
    return ads.filter(ad => ad.shouldShowToUser(user));
  });
};

// Clear any existing model to avoid conflicts
if (mongoose.models.HomepageAd) {
  delete mongoose.models.HomepageAd;
}

export default mongoose.model("HomepageAd", homepageAdSchema, "homepage_ads");

