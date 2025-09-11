import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Blog from '@/models/Blog';
import { connectDB } from '@/lib/mongodb';

// GET /api/blog/[slug] - Get single blog post by slug
export async function GET(request, { params }) {
  try {
    await connectDB();
    
    const { slug } = params;
    
    const post = await Blog.findOne({ slug, published: true })
      .populate('author', 'name email bio avatar')
      .lean();
    
    if (!post) {
      return NextResponse.json(
        { success: false, error: 'Blog post not found' },
        { status: 404 }
      );
    }
    
    // Increment view count
    await Blog.findByIdAndUpdate(post._id, { $inc: { views: 1 } });
    
    // Get related posts
    const relatedPosts = await Blog.find({
      _id: { $ne: post._id },
      published: true,
      $or: [
        { category: post.category },
        { language: post.language },
        { tags: { $in: post.tags } }
      ]
    })
    .select('title slug excerpt image firebaseThumbnailPath category readTime publishedAt')
    .sort({ publishedAt: -1 })
    .limit(3)
    .lean();
    
    return NextResponse.json({
      success: true,
      data: {
        post,
        relatedPosts
      }
    });
    
  } catch (error) {
    console.error('Error fetching blog post:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch blog post' },
      { status: 500 }
    );
  }
}

// PUT /api/blog/[slug] - Update blog post
export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !['admin', 'trainer'].includes(session.user.role)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    await connectDB();
    
    const { slug } = params;
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
    
    // Find existing post
    const existingPost = await Blog.findOne({ slug });
    if (!existingPost) {
      return NextResponse.json(
        { success: false, error: 'Blog post not found' },
        { status: 404 }
      );
    }
    
    // Check if user is author or admin
    if (existingPost.author.toString() !== session.user.id && session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized to edit this post' },
        { status: 403 }
      );
    }
    
    // Handle video updates
    let videoData = {};
    const videoFile = formData.get('videoFile');
    const thumbnailFile = formData.get('thumbnailFile');
    
    if (parsedData.type === 'video' || parsedData.type === 'mixed') {
      if (videoFile && videoFile.size > 0) {
        // Handle new video upload
        const { uploadFile, validateFileType, validateFileSize, generateBlogFilePath } = await import('@/lib/firebase-storage');
        
        if (!validateFileType(videoFile, 'video')) {
          return NextResponse.json(
            { success: false, error: 'Invalid video file type' },
            { status: 400 }
          );
        }
        
        if (!validateFileSize(videoFile, 500)) {
          return NextResponse.json(
            { success: false, error: 'Video file too large (max 500MB)' },
            { status: 400 }
          );
        }
        
        const videoPath = generateBlogFilePath('videos', existingPost._id.toString(), videoFile.name);
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
          
          const { generateThumbnailPath } = await import('@/lib/firebase-storage');
          const thumbnailPath = generateThumbnailPath(existingPost._id.toString(), videoFile.name);
          const thumbnailUpload = await uploadFile(thumbnailFile, thumbnailPath, {
            contentType: thumbnailFile.type
          });
          
          videoData.firebaseThumbnailPath = thumbnailUpload.url;
        }
      } else if (parsedData.externalVideoUrl) {
        // Handle external video URLs
        const { extractYouTubeId, extractVimeoId, generateVideoThumbnail } = await import('@/lib/firebase-storage');
        
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
    
    // Update blog post
    const updatedPost = await Blog.findByIdAndUpdate(
      existingPost._id,
      {
        ...parsedData,
        ...videoData,
        updatedAt: new Date(),
        readTime: calculateReadTime(parsedData.content),
        metaTitle: parsedData.metaTitle || parsedData.title,
        metaDescription: parsedData.metaDescription || parsedData.excerpt
      },
      { new: true, runValidators: true }
    ).populate('author', 'name email');
    
    return NextResponse.json({
      success: true,
      data: updatedPost,
      message: 'Blog post updated successfully'
    });
    
  } catch (error) {
    console.error('Error updating blog post:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update blog post' },
      { status: 500 }
    );
  }
}

// DELETE /api/blog/[slug] - Delete blog post
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !['admin', 'trainer'].includes(session.user.role)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    await connectDB();
    
    const { slug } = params;
    
    const post = await Blog.findOne({ slug });
    if (!post) {
      return NextResponse.json(
        { success: false, error: 'Blog post not found' },
        { status: 404 }
      );
    }
    
    // Check if user is author or admin
    if (post.author.toString() !== session.user.id && session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized to delete this post' },
        { status: 403 }
      );
    }
    
    // Delete associated files from Firebase Storage
    const { deleteFile } = await import('@/lib/firebase-storage');
    
    try {
      if (post.firebaseVideoPath) {
        await deleteFile(post.firebaseVideoPath);
      }
      if (post.firebaseThumbnailPath) {
        await deleteFile(post.firebaseThumbnailPath);
      }
      if (post.firebaseImagePath) {
        await deleteFile(post.firebaseImagePath);
      }
      if (post.subtitles && post.subtitles.length > 0) {
        for (const subtitle of post.subtitles) {
          if (subtitle.firebasePath) {
            await deleteFile(subtitle.firebasePath);
          }
        }
      }
    } catch (fileError) {
      console.error('Error deleting files:', fileError);
      // Continue with post deletion even if file deletion fails
    }
    
    // Delete the blog post
    await Blog.findByIdAndDelete(post._id);
    
    return NextResponse.json({
      success: true,
      message: 'Blog post deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting blog post:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete blog post' },
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
