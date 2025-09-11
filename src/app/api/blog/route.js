import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Blog from '@/models/Blog';
import { connectDB } from '@/lib/mongodb';
import { 
  uploadFile, 
  uploadFileWithProgress, 
  deleteFile, 
  generateBlogFilePath, 
  generateThumbnailPath,
  generateSubtitlePath,
  validateFileType, 
  validateFileSize,
  extractYouTubeId,
  extractVimeoId,
  generateVideoThumbnail
} from '@/lib/firebase-storage';

// GET /api/blog - Get all published blog posts with filtering
export async function GET(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const category = searchParams.get('category');
    const language = searchParams.get('language');
    const difficulty = searchParams.get('difficulty');
    const type = searchParams.get('type');
    const featured = searchParams.get('featured');
    const search = searchParams.get('search');
    
    // Build query
    let query = { published: true };
    
    if (category) query.category = category;
    if (language) query.language = language;
    if (difficulty) query.difficulty = difficulty;
    if (type) query.type = type;
    if (featured === 'true') query.featured = true;
    
    // Search functionality
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Execute query
    const [posts, total] = await Promise.all([
      Blog.find(query)
        .populate('author', 'name email')
        .sort({ publishedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Blog.countDocuments(query)
    ]);
    
    return NextResponse.json({
      success: true,
      data: {
        posts,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
    
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch blog posts' },
      { status: 500 }
    );
  }
}

// POST /api/blog - Create new blog post
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !['admin', 'trainer'].includes(session.user.role)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    await connectDB();
    
    const formData = await request.formData();
    const data = Object.fromEntries(formData.entries());
    
    // Parse JSON fields
    const parsedData = {
      ...data,
      tags: data.tags ? JSON.parse(data.tags) : [],
      subtitles: data.subtitles ? JSON.parse(data.subtitles) : [],
      featured: data.featured === 'true',
      published: data.published === 'true'
    };
    
    // Validate required fields
    if (!parsedData.title || !parsedData.content || !parsedData.category) {
      return NextResponse.json(
        { success: false, error: 'Title, content, and category are required' },
        { status: 400 }
      );
    }
    
    // Handle video upload if present
    let videoData = {};
    const videoFile = formData.get('videoFile');
    const thumbnailFile = formData.get('thumbnailFile');
    
    if (parsedData.type === 'video' || parsedData.type === 'mixed') {
      if (videoFile && videoFile.size > 0) {
        // Validate video file
        if (!validateFileType(videoFile, 'video')) {
          return NextResponse.json(
            { success: false, error: 'Invalid video file type' },
            { status: 400 }
          );
        }
        
        if (!validateFileSize(videoFile, 500)) { // 500MB limit
          return NextResponse.json(
            { success: false, error: 'Video file too large (max 500MB)' },
            { status: 400 }
          );
        }
        
        // Generate temporary blog ID for file paths
        const tempBlogId = `temp_${Date.now()}`;
        const videoPath = generateBlogFilePath('videos', tempBlogId, videoFile.name);
        
        // Upload video
        const videoUpload = await uploadFile(videoFile, videoPath, {
          contentType: videoFile.type,
          metadata: {
            blogTitle: parsedData.title,
            uploadedBy: session.user.id
          }
        });
        
        videoData = {
          videoUrl: 'firebase',
          firebaseVideoPath: videoUpload.url,
          duration: parsedData.duration || null
        };
        
        // Handle thumbnail
        if (thumbnailFile && thumbnailFile.size > 0) {
          if (!validateFileType(thumbnailFile, 'image')) {
            return NextResponse.json(
              { success: false, error: 'Invalid thumbnail file type' },
              { status: 400 }
            );
          }
          
          const thumbnailPath = generateThumbnailPath(tempBlogId, videoFile.name);
          const thumbnailUpload = await uploadFile(thumbnailFile, thumbnailPath, {
            contentType: thumbnailFile.type
          });
          
          videoData.firebaseThumbnailPath = thumbnailUpload.url;
        }
      } else if (parsedData.externalVideoUrl) {
        // Handle external video URLs (YouTube, Vimeo)
        const url = parsedData.externalVideoUrl;
        let videoId = null;
        let platform = null;
        
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
          videoId = extractYouTubeId(url);
          platform = 'youtube';
        } else if (url.includes('vimeo.com')) {
          videoId = extractVimeoId(url);
          platform = 'vimeo';
        }
        
        if (videoId) {
          videoData = {
            videoUrl: platform,
            videoId: videoId,
            externalVideoUrl: url,
            firebaseThumbnailPath: generateVideoThumbnail(platform, videoId),
            duration: parsedData.duration || null
          };
        } else {
          videoData = {
            videoUrl: 'external',
            externalVideoUrl: url,
            duration: parsedData.duration || null
          };
        }
      }
    }
    
    // Handle subtitle files
    const subtitleFiles = formData.getAll('subtitleFiles');
    const processedSubtitles = [];
    
    for (let i = 0; i < subtitleFiles.length; i++) {
      const subtitleFile = subtitleFiles[i];
      if (subtitleFile && subtitleFile.size > 0) {
        const language = formData.get(`subtitleLanguage_${i}`);
        
        if (!validateFileType(subtitleFile, 'subtitle')) {
          return NextResponse.json(
            { success: false, error: `Invalid subtitle file type for ${language}` },
            { status: 400 }
          );
        }
        
        const tempBlogId = `temp_${Date.now()}`;
        const subtitlePath = generateSubtitlePath(tempBlogId, language, subtitleFile.name);
        
        const subtitleUpload = await uploadFile(subtitleFile, subtitlePath, {
          contentType: subtitleFile.type
        });
        
        processedSubtitles.push({
          language: language,
          firebasePath: subtitleUpload.url,
          label: formData.get(`subtitleLabel_${i}`) || language.toUpperCase()
        });
      }
    }
    
    // Create blog post
    const blogPost = new Blog({
      ...parsedData,
      ...videoData,
      subtitles: processedSubtitles.length > 0 ? processedSubtitles : parsedData.subtitles,
      author: session.user.id,
      authorName: session.user.name,
      readTime: calculateReadTime(parsedData.content),
      metaTitle: parsedData.metaTitle || parsedData.title,
      metaDescription: parsedData.metaDescription || parsedData.excerpt
    });
    
    await blogPost.save();
    
    return NextResponse.json({
      success: true,
      data: blogPost,
      message: 'Blog post created successfully'
    });
    
  } catch (error) {
    console.error('Error creating blog post:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create blog post' },
      { status: 500 }
    );
  }
}

// Helper function to calculate read time
function calculateReadTime(content) {
  const wordsPerMinute = 200;
  const wordCount = content.split(/\s+/).length;
  const minutes = Math.ceil(wordCount / wordsPerMinute);
  return `${minutes} min read`;
}
