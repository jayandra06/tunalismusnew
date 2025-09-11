import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Blog from '@/models/Blog';
import { connectToDB } from '@/lib/mongodb';
import { deleteFile } from '@/lib/firebase-storage';

// GET /api/admin/blog/[id] - Get single blog post for admin
export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !['admin', 'trainer'].includes(session.user.role)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    await connectToDB();
    
    const { id } = params;
    
    const post = await Blog.findById(id)
      .populate('author', 'name email bio avatar')
      .lean();
    
    if (!post) {
      return NextResponse.json(
        { success: false, error: 'Blog post not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: post
    });
    
  } catch (error) {
    console.error('Error fetching admin blog post:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch blog post' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/blog/[id] - Update blog post
export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !['admin', 'trainer'].includes(session.user.role)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    await connectToDB();
    
    const { id } = params;
    const body = await request.json();
    
    // Find existing post
    const existingPost = await Blog.findById(id);
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
    
    // Update blog post
    const updatedPost = await Blog.findByIdAndUpdate(
      id,
      {
        ...body,
        updatedAt: new Date(),
        readTime: calculateReadTime(body.content),
        metaTitle: body.metaTitle || body.title,
        metaDescription: body.metaDescription || body.excerpt
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

// DELETE /api/admin/blog/[id] - Delete blog post
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !['admin', 'trainer'].includes(session.user.role)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    await connectToDB();
    
    const { id } = params;
    
    const post = await Blog.findById(id);
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
    await Blog.findByIdAndDelete(id);
    
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
