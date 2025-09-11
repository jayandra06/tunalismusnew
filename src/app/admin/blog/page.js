'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Search, 
  Filter,
  Calendar,
  User,
  Tag,
  Video,
  FileText,
  Globe
} from 'lucide-react';

export default function AdminBlogPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Redirect if not admin/trainer
  useEffect(() => {
    if (status === 'loading') return;
    if (!session || !['admin', 'trainer'].includes(session.user.role)) {
      router.push('/unauthorized');
    }
  }, [session, status, router]);

  // Fetch blog posts
  useEffect(() => {
    if (session && ['admin', 'trainer'].includes(session.user.role)) {
      fetchPosts();
    }
  }, [session, currentPage, searchTerm, filterCategory, filterStatus]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10'
      });
      
      if (searchTerm) params.append('search', searchTerm);
      if (filterCategory) params.append('category', filterCategory);
      if (filterStatus) params.append('status', filterStatus);

      const response = await fetch(`/api/admin/blog?${params}`);
      const data = await response.json();

      if (data.success) {
        setPosts(data.data.posts);
        setTotalPages(data.data.pagination.pages);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (postId, title) => {
    if (!confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/blog/${postId}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      if (data.success) {
        fetchPosts(); // Refresh the list
      } else {
        alert('Failed to delete post');
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Failed to delete post');
    }
  };

  const togglePublished = async (postId, currentStatus) => {
    try {
      const response = await fetch(`/api/admin/blog/${postId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          published: !currentStatus
        })
      });

      const data = await response.json();
      if (data.success) {
        fetchPosts(); // Refresh the list
      } else {
        alert('Failed to update post status');
      }
    } catch (error) {
      console.error('Error updating post:', error);
      alert('Failed to update post status');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'video':
        return <Video className="w-4 h-4 text-blue-500" />;
      case 'mixed':
        return <div className="flex space-x-1"><Video className="w-3 h-3 text-blue-500" /><FileText className="w-3 h-3 text-green-500" /></div>;
      default:
        return <FileText className="w-4 h-4 text-green-500" />;
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[var(--color-warm-zinc)] to-white dark:from-zinc-800 dark:to-zinc-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-dusty-rose)] mx-auto mb-4"></div>
          <p className="text-[var(--color-muted-zinc)] dark:text-zinc-300">Loading blog posts...</p>
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
            <h1 className="text-3xl font-bold text-[var(--color-muted-zinc)] dark:text-zinc-300 mb-2">
              Blog Management
            </h1>
            <p className="text-zinc-600 dark:text-zinc-300">
              Manage your blog posts and content
            </p>
          </div>
          <Link
            href="/admin/blog/create"
            className="bg-[var(--color-dusty-rose)] hover:bg-[var(--color-dusty-rose)]/90 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center space-x-2 mt-4 sm:mt-0"
          >
            <Plus className="w-5 h-5" />
            <span>Create New Post</span>
          </Link>
        </div>

        {/* Filters and Search */}
        <div className="bg-white dark:bg-zinc-800 rounded-xl p-6 shadow-lg mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search posts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-700 text-[var(--color-muted-zinc)] dark:text-zinc-300 focus:ring-2 focus:ring-[var(--color-dusty-rose)] focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-700 text-[var(--color-muted-zinc)] dark:text-zinc-300 focus:ring-2 focus:ring-[var(--color-dusty-rose)] focus:border-transparent"
            >
              <option value="">All Categories</option>
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

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-700 text-[var(--color-muted-zinc)] dark:text-zinc-300 focus:ring-2 focus:ring-[var(--color-dusty-rose)] focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>

            {/* Clear Filters */}
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterCategory('');
                setFilterStatus('');
                setCurrentPage(1);
              }}
              className="px-4 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-700 text-[var(--color-muted-zinc)] dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-600 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Posts Table */}
        <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-zinc-50 dark:bg-zinc-700">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--color-muted-zinc)] dark:text-zinc-300">
                    Post
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--color-muted-zinc)] dark:text-zinc-300">
                    Type
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--color-muted-zinc)] dark:text-zinc-300">
                    Category
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--color-muted-zinc)] dark:text-zinc-300">
                    Author
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--color-muted-zinc)] dark:text-zinc-300">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--color-muted-zinc)] dark:text-zinc-300">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--color-muted-zinc)] dark:text-zinc-300">
                    Views
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--color-muted-zinc)] dark:text-zinc-300">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
                {posts.map((post) => (
                  <tr key={post._id} className="hover:bg-zinc-50 dark:hover:bg-zinc-700/50">
                    <td className="px-6 py-4">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          {post.image || post.firebaseThumbnailPath ? (
                            <img
                              src={post.image || post.firebaseThumbnailPath}
                              alt={post.title}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-zinc-200 dark:bg-zinc-600 rounded-lg flex items-center justify-center">
                              {getTypeIcon(post.type)}
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-sm font-semibold text-[var(--color-muted-zinc)] dark:text-zinc-300 truncate">
                            {post.title}
                          </h3>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                            {post.excerpt}
                          </p>
                          {post.featured && (
                            <span className="inline-block bg-[var(--color-dusty-rose)] text-white text-xs px-2 py-1 rounded-full mt-1">
                              Featured
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        {getTypeIcon(post.type)}
                        <span className="text-sm text-[var(--color-muted-zinc)] dark:text-zinc-300 capitalize">
                          {post.type}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-block bg-[var(--color-soft-blue)]/10 text-[var(--color-soft-blue)] text-xs px-2 py-1 rounded-full">
                        {post.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-zinc-400" />
                        <span className="text-sm text-[var(--color-muted-zinc)] dark:text-zinc-300">
                          {post.authorName}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => togglePublished(post._id, post.published)}
                        className={`inline-block px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                          post.published
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                        }`}
                      >
                        {post.published ? 'Published' : 'Draft'}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-zinc-400" />
                        <span className="text-sm text-[var(--color-muted-zinc)] dark:text-zinc-300">
                          {formatDate(post.publishedAt || post.createdAt)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-[var(--color-muted-zinc)] dark:text-zinc-300">
                        {post.views || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <Link
                          href={`/blog/${post.slug}`}
                          className="p-2 text-zinc-400 hover:text-[var(--color-dusty-rose)] transition-colors"
                          title="View Post"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link
                          href={`/admin/blog/edit/${post.slug}`}
                          className="p-2 text-zinc-400 hover:text-blue-500 transition-colors"
                          title="Edit Post"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(post._id, post.title)}
                          className="p-2 text-zinc-400 hover:text-red-500 transition-colors"
                          title="Delete Post"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-zinc-200 dark:border-zinc-700">
              <div className="flex items-center justify-between">
                <div className="text-sm text-zinc-500 dark:text-zinc-400">
                  Page {currentPage} of {totalPages}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-700 text-[var(--color-muted-zinc)] dark:text-zinc-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-50 dark:hover:bg-zinc-600 transition-colors"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-700 text-[var(--color-muted-zinc)] dark:text-zinc-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-50 dark:hover:bg-zinc-600 transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Empty State */}
        {posts.length === 0 && !loading && (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-zinc-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-[var(--color-muted-zinc)] dark:text-zinc-300 mb-2">
              No blog posts found
            </h3>
            <p className="text-zinc-500 dark:text-zinc-400 mb-6">
              {searchTerm || filterCategory || filterStatus
                ? 'Try adjusting your search or filters'
                : 'Get started by creating your first blog post'}
            </p>
            <Link
              href="/admin/blog/create"
              className="bg-[var(--color-dusty-rose)] hover:bg-[var(--color-dusty-rose)]/90 text-white px-6 py-3 rounded-lg font-semibold transition-colors inline-flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Create New Post</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
