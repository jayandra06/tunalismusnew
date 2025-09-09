"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  BookOpen, 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  Users,
  Clock,
  DollarSign,
  Star,
  Download,
  Upload,
  Settings,
  AlertTriangle,
  CheckCircle,
  XCircle
} from "lucide-react";
import Link from "next/link";

export default function CoursesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [showLeftoverModal, setShowLeftoverModal] = useState(false);
  const [leftoverBatch, setLeftoverBatch] = useState(null);
  const [loadingBatches, setLoadingBatches] = useState({});

  useEffect(() => {
    console.log('🔍 Courses Page Session:', {
      status,
      session: session ? 'Present' : 'None',
      user: session?.user,
      role: session?.user?.role
    });
    
    // Only fetch courses if user is authenticated and has admin role
    if (status === 'authenticated' && session?.user?.role === 'admin') {
      fetchCourses();
    } else if (status === 'unauthenticated') {
      // Redirect to login if not authenticated
      router.push('/admin/login');
    }
  }, [session, status, router]);

  const fetchCourses = async () => {
    try {
      console.log('🔄 Fetching courses...');
      console.log('🍪 Current session:', session);
      console.log('🔑 Session status:', status);
      
      const response = await fetch('/api/admin/courses', {
        credentials: 'include', // Include cookies for authentication
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store' // Prevent caching
      });
      
      console.log('📡 Response status:', response.status);
      console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Courses fetched successfully:', data.courses?.length || 0, 'courses');
        console.log('📋 Sample course data:', data.courses?.[0]);
        setCourses(data.courses || []);
        setError(null); // Clear any previous errors
      } else {
        let errorMessage = 'Unknown error';
        try {
          const errorData = await response.json();
          console.error('❌ Failed to fetch courses:', errorData);
          errorMessage = errorData.message || 'Unknown error';
        } catch (parseError) {
          console.error('❌ Failed to parse error response:', parseError);
          if (response.status === 403) {
            errorMessage = 'Access denied. Please log in as an admin.';
          } else if (response.status === 401) {
            errorMessage = 'Authentication required. Please log in.';
          } else {
            errorMessage = `Server error (${response.status})`;
          }
        }
        setError(`Failed to load courses: ${errorMessage}`);
        setCourses([]);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      setError(`Network error: ${error.message}`);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBatches = async (courseId) => {
    try {
      setLoadingBatches(prev => ({ ...prev, [courseId]: true }));
      console.log('Creating batches for course:', courseId);
      const response = await fetch(`/api/admin/courses/${courseId}/batches`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include', // Include cookies for authentication
        body: JSON.stringify({ action: 'create_batches' })
      });

      console.log('Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Batch creation result:', data);
        // Check for leftover batches
        if (data.result.leftoverBatches && data.result.leftoverBatches.length > 0) {
          setLeftoverBatch(data.result.leftoverBatches[0]);
          setShowLeftoverModal(true);
        } else {
          alert('Batches created successfully!');
        }
        // Refresh courses
        fetchCourses();
      } else {
        const errorData = await response.json();
        console.error('API Error:', errorData);
        alert(`Error creating batches: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error creating batches:', error);
      alert(`Network error: ${error.message}`);
    } finally {
      setLoadingBatches(prev => ({ ...prev, [courseId]: false }));
    }
  };

  const handleLeftoverBatchAction = async (action, targetBatchId = null) => {
    try {
      const response = await fetch(`/api/admin/batches/${leftoverBatch._id}/leftover`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action, targetBatchId })
      });

      if (response.ok) {
        setShowLeftoverModal(false);
        setLeftoverBatch(null);
        // Refresh courses
        fetchCourses();
      }
    } catch (error) {
      console.error('Error handling leftover batch:', error);
    }
  };

  const handleViewCourse = (courseId) => {
    // Navigate to course details page or open modal
    router.push(`/admin/courses/${courseId}`);
  };

  const handleEditCourse = (courseId) => {
    // Navigate to edit course page
    router.push(`/admin/courses/${courseId}/edit`);
  };

  const handleDeleteCourse = async (courseId, courseName) => {
    console.log('🗑️ Attempting to delete course:', { courseId, courseName });
    
    if (window.confirm(`Are you sure you want to delete "${courseName}"? This action cannot be undone.`)) {
      try {
        console.log('📡 Sending DELETE request to:', `/api/admin/courses/${courseId}`);
        const response = await fetch(`/api/admin/courses/${courseId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });

        if (response.ok) {
          alert('Course deleted successfully!');
          fetchCourses(); // Refresh the courses list
        } else {
          const errorData = await response.json();
          alert(`Error deleting course: ${errorData.message || 'Unknown error'}`);
        }
      } catch (error) {
        console.error('Error deleting course:', error);
        alert(`Network error: ${error.message}`);
      }
    }
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = (course.displayName && course.displayName.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         course.language.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.level.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (course.instructor && course.instructor.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === "all" || course.status === statusFilter;
    const matchesCategory = categoryFilter === "all" || course.language === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'draft': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'archived': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getLevelBadgeColor = (level) => {
    switch (level) {
      case 'Beginner': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'Intermediate': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'Advanced': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Show loading while checking authentication
  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  // Redirect if not authenticated
  if (status === 'unauthenticated') {
    router.push('/admin/login');
    return null;
  }

  // Check if user has admin role
  if (session?.user?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Courses</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          
          {error.includes('Access denied') || error.includes('Authentication required') ? (
            <div className="space-y-3">
              <p className="text-sm text-gray-500">
                You need to log in as an admin to access this page.
              </p>
              <div className="flex gap-3 justify-center">
                <Button 
                  onClick={() => router.push('/admin/login')} 
                  className="bg-red-600 hover:bg-red-700"
                >
                  Go to Admin Login
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => {
                    setError(null);
                    setLoading(true);
                    fetchCourses();
                  }}
                >
                  Retry
                </Button>
              </div>
            </div>
          ) : (
            <Button onClick={() => {
              setError(null);
              setLoading(true);
              fetchCourses();
            }} className="bg-red-600 hover:bg-red-700">
              Retry
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Courses Management</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage all courses and learning materials
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Link href="/admin/courses/create">
            <Button className="flex items-center gap-2 bg-red-600 hover:bg-red-700">
              <Plus className="h-4 w-4" />
              Create Course
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Total Courses
            </CardTitle>
            <BookOpen className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {courses.length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Active Courses
            </CardTitle>
            <BookOpen className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {courses.filter(c => c.status === 'active').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Total Students
            </CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {courses.reduce((sum, course) => sum + (course.batchSummary?.totalStudents || 0), 0)}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Total Revenue
            </CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatPrice(courses.reduce((sum, course) => sum + (course.price * (course.batchSummary?.totalStudents || 0)), 0))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
            
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="all">All Categories</option>
              <option value="Web Development">Web Development</option>
              <option value="Programming">Programming</option>
              <option value="Data Science">Data Science</option>
              <option value="Design">Design</option>
              <option value="Mobile Development">Mobile Development</option>
            </select>
            
            <Button variant="outline" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Import Courses
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course) => (
          <Card key={course._id} className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2">
                    {course.displayName || `${course.language} ${course.level} ${course.month} ${course.year}`}
                  </CardTitle>
                  <CardDescription className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    {course.language} {course.level} • {course.month}/{course.year}
                  </CardDescription>
                </div>
                <div className="flex flex-col gap-1 ml-2">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(course.status)}`}>
                    {course.status}
                  </span>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getLevelBadgeColor(course.level)}`}>
                    {course.level}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Trainer:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {course.instructor ? 
                      (typeof course.instructor === 'object' ? course.instructor.name : course.instructor) 
                      : 'Unassigned'
                    }
                  </span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Capacity:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {course.batchSummary?.totalStudents || 0}/{course.totalCapacity}
                  </span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Duration:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{course.courseDuration} months</span>
                </div>
                
                {/* Pricing Information */}
                <div className="space-y-2">
                  {course.batchTypes.regular.enabled && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Regular Price:</span>
                      <span className="font-bold text-blue-600 dark:text-blue-400">
                        {formatPrice(course.pricing?.regular?.totalPrice || course.price)}
                      </span>
                    </div>
                  )}
                  {course.batchTypes.revision.enabled && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Revision Price:</span>
                      <span className="font-bold text-purple-600 dark:text-purple-400">
                        {formatPrice(course.pricing?.revision?.totalPrice || course.price)}
                      </span>
                    </div>
                  )}
                  {course.offlineMaterials?.enabled && course.offlineMaterials.totalCost > 0 && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500 dark:text-gray-400">Materials:</span>
                      <span className="font-medium text-orange-600 dark:text-orange-400">
                        {formatPrice(course.offlineMaterials.totalCost)}
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Batches:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {course.batchSummary?.totalBatches || 0} total
                  </span>
                </div>

                {/* Batch Type Distribution */}
                <div className="space-y-2">
                  {course.batchTypes.regular.enabled && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500 dark:text-gray-400">Regular:</span>
                      <span className="font-medium text-blue-600 dark:text-blue-400">
                        {course.batchTypes.regular.studentCount} students
                      </span>
                    </div>
                  )}
                  {course.batchTypes.revision.enabled && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500 dark:text-gray-400">Revision:</span>
                      <span className="font-medium text-purple-600 dark:text-purple-400">
                        {course.batchTypes.revision.studentCount} students
                      </span>
                    </div>
                  )}
                </div>

                {/* Leftover Batch Warning */}
                {course.batchSummary?.leftoverBatches && course.batchSummary.leftoverBatches.length > 0 && (
                  <div className="flex items-center gap-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                    <span className="text-xs text-yellow-700 dark:text-yellow-300">
                      {course.batchSummary.leftoverBatches.length} leftover batch(es) need attention
                    </span>
                  </div>
                )}
                
                <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Created: {formatDate(course.createdAt)}
                    </span>
                    <div className="flex items-center space-x-1">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewCourse(course._id)}
                        title="View Course Details"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditCourse(course._id)}
                        title="Edit Course"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleDeleteCourse(course._id, course.displayName || course.name)}
                        title="Delete Course"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {/* Batch Management Actions */}
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                      onClick={() => handleCreateBatches(course._id)}
                      disabled={loadingBatches[course._id]}
                    >
                      <Settings className="h-4 w-4 mr-1" />
                      {loadingBatches[course._id] ? 'Creating...' : 'Manage Batches'}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {filteredCourses.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No courses found matching your criteria</p>
          </CardContent>
        </Card>
      )}

      {/* Leftover Batch Modal */}
      {showLeftoverModal && leftoverBatch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Leftover Batch Detected
              </h3>
            </div>
            
            <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                <strong>{leftoverBatch.batchType.charAt(0).toUpperCase() + leftoverBatch.batchType.slice(1)} Batch {leftoverBatch.batchNumber}</strong> has <strong>{leftoverBatch.currentStudents}</strong> students, which is less than the batch size limit (<strong>{leftoverBatch.maxStudents}</strong>).
              </p>
            </div>
            
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              What would you like to do with these students?
            </p>
            
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => handleLeftoverBatchAction('leave')}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Leave as Separate Batch
              </Button>
              <Button
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                onClick={() => handleLeftoverBatchAction('merge')}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Merge with Previous Batch
              </Button>
            </div>
            
            <Button
              variant="ghost"
              className="w-full mt-3"
              onClick={() => {
                setShowLeftoverModal(false);
                setLeftoverBatch(null);
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
