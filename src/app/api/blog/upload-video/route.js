import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { 
  uploadFileWithProgress, 
  validateFileType, 
  validateFileSize,
  generateBlogFilePath 
} from '@/lib/firebase-storage';

// POST /api/blog/upload-video - Upload video with progress tracking
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !['admin', 'trainer'].includes(session.user.role)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const formData = await request.formData();
    const videoFile = formData.get('videoFile');
    const blogId = formData.get('blogId') || `temp_${Date.now()}`;
    
    if (!videoFile || videoFile.size === 0) {
      return NextResponse.json(
        { success: false, error: 'No video file provided' },
        { status: 400 }
      );
    }
    
    // Validate video file
    if (!validateFileType(videoFile, 'video')) {
      return NextResponse.json(
        { success: false, error: 'Invalid video file type. Supported formats: MP4, WebM, OGG, AVI, MOV' },
        { status: 400 }
      );
    }
    
    if (!validateFileSize(videoFile, 500)) { // 500MB limit
      return NextResponse.json(
        { success: false, error: 'Video file too large. Maximum size: 500MB' },
        { status: 400 }
      );
    }
    
    // Generate file path
    const videoPath = generateBlogFilePath('videos', blogId, videoFile.name);
    
    // Create a readable stream for progress tracking
    const progressData = {
      progress: 0,
      bytesTransferred: 0,
      totalBytes: videoFile.size,
      status: 'uploading'
    };
    
    // Upload with progress tracking
    const result = await uploadFileWithProgress(
      videoFile, 
      videoPath, 
      (progress, snapshot) => {
        progressData.progress = progress;
        progressData.bytesTransferred = snapshot.bytesTransferred;
        progressData.totalBytes = snapshot.totalBytes;
      },
      {
        contentType: videoFile.type,
        metadata: {
          blogId: blogId,
          uploadedBy: session.user.id,
          originalName: videoFile.name,
          uploadDate: new Date().toISOString()
        }
      }
    );
    
    return NextResponse.json({
      success: true,
      data: {
        url: result.url,
        path: result.path,
        fullPath: result.fullPath,
        fileSize: videoFile.size,
        fileName: videoFile.name,
        contentType: videoFile.type
      },
      message: 'Video uploaded successfully'
    });
    
  } catch (error) {
    console.error('Error uploading video:', error);
    return NextResponse.json(
      { success: false, error: `Failed to upload video: ${error.message}` },
      { status: 500 }
    );
  }
}

// GET /api/blog/upload-video - Get upload status (for progress tracking)
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !['admin', 'trainer'].includes(session.user.role)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { searchParams } = new URL(request.url);
    const uploadId = searchParams.get('uploadId');
    
    if (!uploadId) {
      return NextResponse.json(
        { success: false, error: 'Upload ID required' },
        { status: 400 }
      );
    }
    
    // In a real implementation, you might store upload progress in Redis or database
    // For now, we'll return a simple response
    return NextResponse.json({
      success: true,
      data: {
        uploadId,
        status: 'completed', // or 'uploading', 'failed'
        progress: 100
      }
    });
    
  } catch (error) {
    console.error('Error getting upload status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get upload status' },
      { status: 500 }
    );
  }
}
