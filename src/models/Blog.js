import mongoose from 'mongoose';

const subtitleSchema = new mongoose.Schema({
  language: {
    type: String,
    required: true,
    enum: ['en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'zh', 'ja', 'ko', 'ar', 'hi']
  },
  firebasePath: {
    type: String,
    required: true
  },
  label: {
    type: String,
    required: true
  }
}, { _id: false });

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  excerpt: {
    type: String,
    required: true,
    maxlength: 500
  },
  content: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['text', 'video', 'mixed'],
    default: 'text'
  },
  
  // Video-related fields
  videoUrl: {
    type: String,
    enum: ['firebase', 'youtube', 'vimeo', 'external'],
    default: null
  },
  firebaseVideoPath: {
    type: String,
    default: null
  },
  firebaseThumbnailPath: {
    type: String,
    default: null
  },
  externalVideoUrl: {
    type: String,
    default: null
  },
  videoId: {
    type: String, // For YouTube/Vimeo IDs
    default: null
  },
  
  // Video metadata
  duration: {
    type: String, // Format: "5:30"
    default: null
  },
  transcript: {
    type: String,
    default: null
  },
  subtitles: [subtitleSchema],
  
  // Content categorization
  category: {
    type: String,
    required: true,
    enum: [
      'Learning Tips',
      'Cultural Insights', 
      'Study Plans',
      'Psychology',
      'Technology',
      'Immersion',
      'Grammar',
      'Vocabulary',
      'Pronunciation',
      'Conversation',
      'Reading',
      'Writing',
      'Listening',
      'Speaking'
    ]
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  language: {
    type: String,
    enum: ['spanish', 'french', 'german', 'italian', 'portuguese', 'russian', 'chinese', 'japanese', 'korean', 'arabic', 'hindi', 'english'],
    default: 'english'
  },
  
  // SEO and display
  featured: {
    type: Boolean,
    default: false
  },
  published: {
    type: Boolean,
    default: false
  },
  publishedAt: {
    type: Date,
    default: null
  },
  readTime: {
    type: String,
    default: '5 min read'
  },
  
  // Media
  image: {
    type: String, // URL or Firebase path
    default: null
  },
  firebaseImagePath: {
    type: String,
    default: null
  },
  
  // Author information
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  authorName: {
    type: String,
    required: true
  },
  
  // Analytics
  views: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  
  // SEO
  metaTitle: {
    type: String,
    maxlength: 60
  },
  metaDescription: {
    type: String,
    maxlength: 160
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
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

// Indexes for better performance
blogSchema.index({ slug: 1 });
blogSchema.index({ published: 1, publishedAt: -1 });
blogSchema.index({ category: 1 });
blogSchema.index({ language: 1 });
blogSchema.index({ difficulty: 1 });
blogSchema.index({ featured: 1 });
blogSchema.index({ author: 1 });
blogSchema.index({ tags: 1 });

// Virtual for formatted date
blogSchema.virtual('formattedDate').get(function() {
  return this.publishedAt ? this.publishedAt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }) : this.createdAt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

// Virtual for video URL based on type
blogSchema.virtual('videoUrlResolved').get(function() {
  if (this.type === 'video' || this.type === 'mixed') {
    switch (this.videoUrl) {
      case 'firebase':
        return this.firebaseVideoPath;
      case 'youtube':
        return `https://www.youtube.com/watch?v=${this.videoId}`;
      case 'vimeo':
        return `https://vimeo.com/${this.videoId}`;
      case 'external':
        return this.externalVideoUrl;
      default:
        return null;
    }
  }
  return null;
});

// Virtual for thumbnail URL
blogSchema.virtual('thumbnailUrl').get(function() {
  if (this.firebaseThumbnailPath) {
    return this.firebaseThumbnailPath;
  }
  if (this.image) {
    return this.image;
  }
  return null;
});

// Pre-save middleware to update updatedAt
blogSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  
  // Auto-generate slug if not provided
  if (!this.slug && this.title) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
  }
  
  // Set publishedAt when published is set to true
  if (this.published && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  
  next();
});

// Static method to find published posts
blogSchema.statics.findPublished = function() {
  return this.find({ published: true }).sort({ publishedAt: -1 });
};

// Static method to find featured posts
blogSchema.statics.findFeatured = function() {
  return this.find({ published: true, featured: true }).sort({ publishedAt: -1 });
};

// Static method to find by category
blogSchema.statics.findByCategory = function(category) {
  return this.find({ published: true, category }).sort({ publishedAt: -1 });
};

// Static method to find by language
blogSchema.statics.findByLanguage = function(language) {
  return this.find({ published: true, language }).sort({ publishedAt: -1 });
};

// Static method to find by difficulty
blogSchema.statics.findByDifficulty = function(difficulty) {
  return this.find({ published: true, difficulty }).sort({ publishedAt: -1 });
};

// Static method to search posts
blogSchema.statics.search = function(query) {
  return this.find({
    published: true,
    $or: [
      { title: { $regex: query, $options: 'i' } },
      { excerpt: { $regex: query, $options: 'i' } },
      { content: { $regex: query, $options: 'i' } },
      { tags: { $in: [new RegExp(query, 'i')] } }
    ]
  }).sort({ publishedAt: -1 });
};

const Blog = mongoose.models.Blog || mongoose.model('Blog', blogSchema);

export default Blog;
