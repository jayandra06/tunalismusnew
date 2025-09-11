'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { 
  Save, 
  Eye, 
  Upload, 
  X, 
  Plus, 
  Video, 
  FileText, 
  Image,
  Globe,
  Clock,
  Tag,
  User,
  AlertCircle,
  CheckCircle,
  ArrowLeft
} from 'lucide-react';
import Link from 'next/link';

export default function EditBlogPost() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const { slug } = params;
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    type: 'text',
    category: '',
    difficulty: 'beginner',
    language: 'english',
    featured: false,
    published: false,
    tags: [],
    metaTitle: '',
    metaDescription: '',
    
    // Video fields
    videoUrl: '',
    externalVideoUrl: '',
    duration: '',
    transcript: '',
    subtitles: []
  });
  
  // UI state
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState('');
  const [errors, setErrors] = useState({});
  const [newTag, setNewTag] = useState('');

  // Redirect if not admin/trainer
  useEffect(() => {
    if (status === 'loading') return;
    if (!session || !['admin', 'trainer'].includes(session.user.role)) {
      router.push('/unauthorized');
    }
  }, [session, status, router]);

  // Fetch blog post data
  useEffect(() => {
    if (session && ['admin', 'trainer'].includes(session.user.role) && slug) {
      fetchBlogPost();
    }
  }, [session, slug]);

  const fetchBlogPost = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/blog/${slug}`);
      const data = await response.json();

      if (data.success) {
        const post = data.data.post;
        setFormData({
          title: post.title || '',
          slug: post.slug || '',
          excerpt: post.excerpt || '',
          content: post.content || '',
          type: post.type || 'text',
          category: post.category || '',
          difficulty: post.difficulty || 'beginner',
          language: post.language || 'english',
          featured: post.featured || false,
          published: post.published || false,
          tags: post.tags || [],
          metaTitle: post.metaTitle || '',
          metaDescription: post.metaDescription || '',
          
          // Video fields
          videoUrl: post.videoUrl || '',
          externalVideoUrl: post.externalVideoUrl || '',
          duration: post.duration || '',
          transcript: post.transcript || '',
          subtitles: post.subtitles || []
        });
      } else {
        setErrors({ fetch: 'Failed to load blog post' });
      }
    } catch (error) {
      console.error('Error fetching blog post:', error);
      setErrors({ fetch: 'Failed to load blog post' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileUpload = async (file, type) => {
    if (!file) return;

    setUploadStatus('uploading');
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('videoFile', file);
      formData.append('blogId', `temp_${Date.now()}`);

      const response = await fetch('/api/blog/upload-video', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      
      if (data.success) {
        setUploadStatus('success');
        setUploadProgress(100);
        
        if (type === 'video') {
          setFormData(prev => ({
            ...prev,
            videoUrl: 'firebase',
            firebaseVideoPath: data.data.url
          }));
        }
        
        return data.data;
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      setUploadStatus('error');
      setErrors(prev => ({ ...prev, [type]: error.message }));
    }
  };

  const handleVideoFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileUpload(file, 'video');
    }
  };

  const handleExternalVideoChange = (e) => {
    const url = e.target.value;
    setFormData(prev => ({ ...prev, externalVideoUrl: url }));
    
    // Auto-detect platform and extract ID
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const videoId = extractYouTubeId(url);
      if (videoId) {
        setFormData(prev => ({
          ...prev,
          videoUrl: 'youtube',
          videoId: videoId,
          firebaseThumbnailPath: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
        }));
      }
    } else if (url.includes('vimeo.com')) {
      const videoId = extractVimeoId(url);
      if (videoId) {
        setFormData(prev => ({
          ...prev,
          videoUrl: 'vimeo',
          videoId: videoId,
          firebaseThumbnailPath: `https://vumbnail.com/${videoId}.jpg`
        }));
      }
    } else if (url) {
      setFormData(prev => ({
        ...prev,
        videoUrl: 'external',
        externalVideoUrl: url
      }));
    }
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim().toLowerCase())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim().toLowerCase()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.slug.trim()) newErrors.slug = 'Slug is required';
    if (!formData.excerpt.trim()) newErrors.excerpt = 'Excerpt is required';
    if (!formData.content.trim()) newErrors.content = 'Content is required';
    if (!formData.category) newErrors.category = 'Category is required';
    
    if (formData.type === 'video' || formData.type === 'mixed') {
      if (!formData.videoUrl && !formData.externalVideoUrl) {
        newErrors.video = 'Video URL or file is required for video posts';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setSaving(true);
    
    try {
      const response = await fetch(`/api/blog/${slug}`, {
        method: 'PUT',
        body: createFormData()
      });
      
      const data = await response.json();
      
      if (data.success) {
        router.push('/admin/blog');
      } else {
        setErrors({ submit: data.error });
      }
    } catch (error) {
      setErrors({ submit: 'Failed to update blog post' });
    } finally {
      setSaving(false);
    }
  };

  const createFormData = () => {
    const formDataObj = new FormData();
    
    // Add all form fields
    Object.keys(formData).forEach(key => {
      if (key === 'tags' || key === 'subtitles') {
        formDataObj.append(key, JSON.stringify(formData[key]));
      } else {
        formDataObj.append(key, formData[key]);
      }
    });
    
    return formDataObj;
  };

  const extractYouTubeId = (url) => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const extractVimeoId = (url) => {
    const regex = /vimeo\.com\/(\d+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[var(--color-warm-zinc)] to-white dark:from-zinc-800 dark:to-zinc-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-dusty-rose)] mx-auto mb-4"></div>
          <p className="text-[var(--color-muted-zinc)] dark:text-zinc-300">Loading blog post...</p>
        </div>
      </div>
    );
  }

  if (errors.fetch) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[var(--color-warm-zinc)] to-white dark:from-zinc-800 dark:to-zinc-900 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-[var(--color-muted-zinc)] dark:text-zinc-300 mb-2">
            Error Loading Post
          </h2>
          <p className="text-zinc-600 dark:text-zinc-300 mb-6">{errors.fetch}</p>
          <Link
            href="/admin/blog"
            className="bg-[var(--color-dusty-rose)] hover:bg-[var(--color-dusty-rose)]/90 text-white px-6 py-3 rounded-lg font-semibold transition-colors inline-flex items-center space-x-2"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Blog</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--color-warm-zinc)] to-white dark:from-zinc-800 dark:to-zinc-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <div className="flex items-center space-x-4 mb-2">
              <Link
                href="/admin/blog"
                className="text-[var(--color-dusty-rose)] hover:text-[var(--color-dusty-rose)]/80 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <h1 className="text-3xl font-bold text-[var(--color-muted-zinc)] dark:text-zinc-300">
                Edit Blog Post
              </h1>
            </div>
            <p className="text-zinc-600 dark:text-zinc-300">
              Update your blog post content and settings
            </p>
          </div>
          <div className="flex space-x-3 mt-4 sm:mt-0">
            <button
              type="button"
              onClick={() => setPreviewMode(!previewMode)}
              className="bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 text-[var(--color-muted-zinc)] dark:text-zinc-300 px-4 py-2 rounded-lg font-semibold transition-colors flex items-center space-x-2"
            >
              <Eye className="w-5 h-5" />
              <span>{previewMode ? 'Edit' : 'Preview'}</span>
            </button>
            <button
              type="submit"
              form="blog-form"
              disabled={saving}
              className="bg-[var(--color-dusty-rose)] hover:bg-[var(--color-dusty-rose)]/90 text-white px-6 py-2 rounded-lg font-semibold transition-colors flex items-center space-x-2 disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              <span>{saving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </div>

        <form id="blog-form" onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white dark:bg-zinc-800 rounded-xl p-6 shadow-lg">
            <h2 className="text-xl font-semibold text-[var(--color-muted-zinc)] dark:text-zinc-300 mb-6">
              Basic Information
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Title */}
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-[var(--color-muted-zinc)] dark:text-zinc-300 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg bg-white dark:bg-zinc-700 text-[var(--color-muted-zinc)] dark:text-zinc-300 focus:ring-2 focus:ring-[var(--color-dusty-rose)] focus:border-transparent ${
                    errors.title ? 'border-red-500' : 'border-zinc-200 dark:border-zinc-600'
                  }`}
                  placeholder="Enter blog post title"
                />
                {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
              </div>

              {/* Slug */}
              <div>
                <label className="block text-sm font-medium text-[var(--color-muted-zinc)] dark:text-zinc-300 mb-2">
                  Slug *
                </label>
                <input
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg bg-white dark:bg-zinc-700 text-[var(--color-muted-zinc)] dark:text-zinc-300 focus:ring-2 focus:ring-[var(--color-dusty-rose)] focus:border-transparent ${
                    errors.slug ? 'border-red-500' : 'border-zinc-200 dark:border-zinc-600'
                  }`}
                  placeholder="url-friendly-slug"
                />
                {errors.slug && <p className="text-red-500 text-sm mt-1">{errors.slug}</p>}
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-[var(--color-muted-zinc)] dark:text-zinc-300 mb-2">
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg bg-white dark:bg-zinc-700 text-[var(--color-muted-zinc)] dark:text-zinc-300 focus:ring-2 focus:ring-[var(--color-dusty-rose)] focus:border-transparent ${
                    errors.category ? 'border-red-500' : 'border-zinc-200 dark:border-zinc-600'
                  }`}
                >
                  <option value="">Select Category</option>
                  <option value="Learning Tips">Learning Tips</option>
                  <option value="Cultural Insights">Cultural Insights</option>
                  <option value="Study Plans">Study Plans</option>
                  <option value="Psychology">Psychology</option>
                  <option value="Technology">Technology</option>
                  <option value="Immersion">Immersion</option>
                  <option value="Grammar">Grammar</option>
                  <option value="Vocabulary">Vocabulary</option>
                  <option value="Pronunciation">Pronunciation</option>
                  <option value="Conversation">Conversation</option>
                  <option value="Reading">Reading</option>
                  <option value="Writing">Writing</option>
                  <option value="Listening">Listening</option>
                  <option value="Speaking">Speaking</option>
                </select>
                {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
              </div>

              {/* Excerpt */}
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-[var(--color-muted-zinc)] dark:text-zinc-300 mb-2">
                  Excerpt *
                </label>
                <textarea
                  name="excerpt"
                  value={formData.excerpt}
                  onChange={handleInputChange}
                  rows={3}
                  className={`w-full px-4 py-3 border rounded-lg bg-white dark:bg-zinc-700 text-[var(--color-muted-zinc)] dark:text-zinc-300 focus:ring-2 focus:ring-[var(--color-dusty-rose)] focus:border-transparent ${
                    errors.excerpt ? 'border-red-500' : 'border-zinc-200 dark:border-zinc-600'
                  }`}
                  placeholder="Brief description of the blog post"
                />
                {errors.excerpt && <p className="text-red-500 text-sm mt-1">{errors.excerpt}</p>}
              </div>
            </div>
          </div>

          {/* Content Editor */}
          <div className="bg-white dark:bg-zinc-800 rounded-xl p-6 shadow-lg">
            <h2 className="text-xl font-semibold text-[var(--color-muted-zinc)] dark:text-zinc-300 mb-6">
              Content
            </h2>
            
            {previewMode ? (
              <div className="prose prose-lg max-w-none dark:prose-invert">
                <div className="bg-zinc-50 dark:bg-zinc-700 rounded-lg p-6">
                  <h1 className="text-3xl font-bold mb-4">{formData.title}</h1>
                  <p className="text-lg text-zinc-600 dark:text-zinc-300 mb-6">{formData.excerpt}</p>
                  <div dangerouslySetInnerHTML={{ __html: formData.content.replace(/\n/g, '<br>') }} />
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-[var(--color-muted-zinc)] dark:text-zinc-300 mb-2">
                  Content *
                </label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  rows={15}
                  className={`w-full px-4 py-3 border rounded-lg bg-white dark:bg-zinc-700 text-[var(--color-muted-zinc)] dark:text-zinc-300 focus:ring-2 focus:ring-[var(--color-dusty-rose)] focus:border-transparent ${
                    errors.content ? 'border-red-500' : 'border-zinc-200 dark:border-zinc-600'
                  }`}
                  placeholder="Write your blog post content here..."
                />
                {errors.content && <p className="text-red-500 text-sm mt-1">{errors.content}</p>}
              </div>
            )}
          </div>

          {/* Additional Settings */}
          <div className="bg-white dark:bg-zinc-800 rounded-xl p-6 shadow-lg">
            <h2 className="text-xl font-semibold text-[var(--color-muted-zinc)] dark:text-zinc-300 mb-6">
              Additional Settings
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Difficulty */}
              <div>
                <label className="block text-sm font-medium text-[var(--color-muted-zinc)] dark:text-zinc-300 mb-2">
                  Difficulty Level
                </label>
                <select
                  name="difficulty"
                  value={formData.difficulty}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-zinc-200 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-[var(--color-muted-zinc)] dark:text-zinc-300 focus:ring-2 focus:ring-[var(--color-dusty-rose)] focus:border-transparent"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              {/* Language */}
              <div>
                <label className="block text-sm font-medium text-[var(--color-muted-zinc)] dark:text-zinc-300 mb-2">
                  Target Language
                </label>
                <select
                  name="language"
                  value={formData.language}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-zinc-200 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-[var(--color-muted-zinc)] dark:text-zinc-300 focus:ring-2 focus:ring-[var(--color-dusty-rose)] focus:border-transparent"
                >
                  <option value="english">English</option>
                  <option value="spanish">Spanish</option>
                  <option value="french">French</option>
                  <option value="german">German</option>
                  <option value="italian">Italian</option>
                  <option value="portuguese">Portuguese</option>
                  <option value="russian">Russian</option>
                  <option value="chinese">Chinese</option>
                  <option value="japanese">Japanese</option>
                  <option value="korean">Korean</option>
                  <option value="arabic">Arabic</option>
                  <option value="hindi">Hindi</option>
                </select>
              </div>

              {/* Tags */}
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-[var(--color-muted-zinc)] dark:text-zinc-300 mb-2">
                  Tags
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center space-x-1 bg-[var(--color-soft-blue)]/10 text-[var(--color-soft-blue)] px-3 py-1 rounded-full text-sm"
                    >
                      <span>{tag}</span>
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="hover:text-red-500"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    className="flex-1 px-4 py-2 border border-zinc-200 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-[var(--color-muted-zinc)] dark:text-zinc-300 focus:ring-2 focus:ring-[var(--color-dusty-rose)] focus:border-transparent"
                    placeholder="Add a tag"
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="bg-[var(--color-soft-blue)] hover:bg-[var(--color-soft-blue)]/90 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Checkboxes */}
              <div className="lg:col-span-2 space-y-4">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    name="featured"
                    checked={formData.featured}
                    onChange={handleInputChange}
                    className="w-5 h-5 text-[var(--color-dusty-rose)] bg-white dark:bg-zinc-700 border-zinc-300 dark:border-zinc-600 rounded focus:ring-[var(--color-dusty-rose)]"
                  />
                  <span className="text-sm font-medium text-[var(--color-muted-zinc)] dark:text-zinc-300">
                    Featured Post
                  </span>
                </label>
                
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    name="published"
                    checked={formData.published}
                    onChange={handleInputChange}
                    className="w-5 h-5 text-[var(--color-dusty-rose)] bg-white dark:bg-zinc-700 border-zinc-300 dark:border-zinc-600 rounded focus:ring-[var(--color-dusty-rose)]"
                  />
                  <span className="text-sm font-medium text-[var(--color-muted-zinc)] dark:text-zinc-300">
                    Published
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Error Display */}
          {errors.submit && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <span className="text-red-700 dark:text-red-400">{errors.submit}</span>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
