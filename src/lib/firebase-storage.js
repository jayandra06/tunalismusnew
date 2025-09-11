import { initializeApp, getApps } from 'firebase/app';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject, uploadBytesResumable } from 'firebase/storage';

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || "AIzaSyAynbc2kNUaSYsC6_ntCIPKyaCZ9MRlQ84",
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || "job-portal-3615c.firebaseapp.com",
  projectId: process.env.FIREBASE_PROJECT_ID || "job-portal-3615c",
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "job-portal-3615c.firebasestorage.app",
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "11604616538",
  appId: process.env.FIREBASE_APP_ID || "1:11604616538:web:cf7767d5deec99c333bf63",
  measurementId: process.env.FIREBASE_MEASUREMENT_ID || "G-4P540W77ZB"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const storage = getStorage(app);

// Utility functions for Firebase Storage operations

/**
 * Upload a file to Firebase Storage
 * @param {File|Buffer} file - The file to upload
 * @param {string} path - The path where to store the file
 * @param {Object} options - Upload options
 * @returns {Promise<{url: string, path: string}>}
 */
export async function uploadFile(file, path, options = {}) {
  try {
    const storageRef = ref(storage, path);
    
    // Convert Buffer to Uint8Array if needed
    let fileData = file;
    if (Buffer.isBuffer(file)) {
      fileData = new Uint8Array(file);
    }
    
    const snapshot = await uploadBytes(storageRef, fileData, {
      contentType: options.contentType || file.type,
      customMetadata: options.metadata || {}
    });
    
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return {
      url: downloadURL,
      path: path,
      fullPath: snapshot.ref.fullPath
    };
  } catch (error) {
    console.error('Error uploading file:', error);
    throw new Error(`Failed to upload file: ${error.message}`);
  }
}

/**
 * Upload a file with progress tracking
 * @param {File|Buffer} file - The file to upload
 * @param {string} path - The path where to store the file
 * @param {Function} onProgress - Progress callback function
 * @param {Object} options - Upload options
 * @returns {Promise<{url: string, path: string}>}
 */
export async function uploadFileWithProgress(file, path, onProgress, options = {}) {
  try {
    const storageRef = ref(storage, path);
    
    // Convert Buffer to Uint8Array if needed
    let fileData = file;
    if (Buffer.isBuffer(file)) {
      fileData = new Uint8Array(file);
    }
    
    const uploadTask = uploadBytesResumable(storageRef, fileData, {
      contentType: options.contentType || file.type,
      customMetadata: options.metadata || {}
    });
    
    return new Promise((resolve, reject) => {
      uploadTask.on('state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          if (onProgress) {
            onProgress(progress, snapshot);
          }
        },
        (error) => {
          console.error('Upload error:', error);
          reject(new Error(`Failed to upload file: ${error.message}`));
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            resolve({
              url: downloadURL,
              path: path,
              fullPath: uploadTask.snapshot.ref.fullPath
            });
          } catch (error) {
            reject(error);
          }
        }
      );
    });
  } catch (error) {
    console.error('Error uploading file with progress:', error);
    throw new Error(`Failed to upload file: ${error.message}`);
  }
}

/**
 * Delete a file from Firebase Storage
 * @param {string} path - The path of the file to delete
 * @returns {Promise<void>}
 */
export async function deleteFile(path) {
  try {
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
  } catch (error) {
    console.error('Error deleting file:', error);
    throw new Error(`Failed to delete file: ${error.message}`);
  }
}

/**
 * Get download URL for a file
 * @param {string} path - The path of the file
 * @returns {Promise<string>}
 */
export async function getFileURL(path) {
  try {
    const storageRef = ref(storage, path);
    return await getDownloadURL(storageRef);
  } catch (error) {
    console.error('Error getting file URL:', error);
    throw new Error(`Failed to get file URL: ${error.message}`);
  }
}

/**
 * Generate a unique file path for blog content
 * @param {string} type - Type of content (video, image, thumbnail, subtitle)
 * @param {string} blogId - Blog post ID
 * @param {string} filename - Original filename
 * @returns {string}
 */
export function generateBlogFilePath(type, blogId, filename) {
  const timestamp = Date.now();
  const extension = filename.split('.').pop();
  const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
  
  return `blog/${type}/${blogId}/${timestamp}_${sanitizedFilename}`;
}

/**
 * Generate thumbnail path for video
 * @param {string} blogId - Blog post ID
 * @param {string} videoFilename - Original video filename
 * @returns {string}
 */
export function generateThumbnailPath(blogId, videoFilename) {
  const timestamp = Date.now();
  const baseFilename = videoFilename.split('.')[0];
  const sanitizedFilename = baseFilename.replace(/[^a-zA-Z0-9.-]/g, '_');
  
  return `blog/thumbnails/${blogId}/${timestamp}_${sanitizedFilename}.jpg`;
}

/**
 * Generate subtitle path
 * @param {string} blogId - Blog post ID
 * @param {string} language - Language code
 * @param {string} filename - Original filename
 * @returns {string}
 */
export function generateSubtitlePath(blogId, language, filename) {
  const timestamp = Date.now();
  const extension = filename.split('.').pop();
  
  return `blog/subtitles/${blogId}/${language}/${timestamp}_${language}.${extension}`;
}

/**
 * Validate file type for blog content
 * @param {File} file - The file to validate
 * @param {string} type - Expected file type (video, image, subtitle)
 * @returns {boolean}
 */
export function validateFileType(file, type) {
  const allowedTypes = {
    video: ['video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/mov'],
    image: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],
    subtitle: ['text/vtt', 'application/x-subrip', 'text/plain']
  };
  
  return allowedTypes[type]?.includes(file.type) || false;
}

/**
 * Get file size in MB
 * @param {File} file - The file
 * @returns {number}
 */
export function getFileSizeMB(file) {
  return file.size / (1024 * 1024);
}

/**
 * Validate file size
 * @param {File} file - The file to validate
 * @param {number} maxSizeMB - Maximum size in MB
 * @returns {boolean}
 */
export function validateFileSize(file, maxSizeMB) {
  return getFileSizeMB(file) <= maxSizeMB;
}

/**
 * Extract YouTube video ID from URL
 * @param {string} url - YouTube URL
 * @returns {string|null}
 */
export function extractYouTubeId(url) {
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

/**
 * Extract Vimeo video ID from URL
 * @param {string} url - Vimeo URL
 * @returns {string|null}
 */
export function extractVimeoId(url) {
  const regex = /vimeo\.com\/(\d+)/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

/**
 * Generate video thumbnail from YouTube/Vimeo
 * @param {string} platform - 'youtube' or 'vimeo'
 * @param {string} videoId - Video ID
 * @returns {string}
 */
export function generateVideoThumbnail(platform, videoId) {
  if (platform === 'youtube') {
    return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  } else if (platform === 'vimeo') {
    // Vimeo requires API call for thumbnail, this is a placeholder
    return `https://vumbnail.com/${videoId}.jpg`;
  }
  return null;
}

export default storage;
