"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
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
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
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
    fetchCourses();
  }, [session, status]);

  const fetchCourses = async () => {
    try {
      const response = await fetch('/api/admin/courses', {
        credentials: 'include', // Include cookies for authentication
      });
      
      if (response.ok) {
        const data = await response.json();
        setCourses(data.courses || []);
      } else {
        // Mock data for now with batch management features
        setCourses([
          {
            _id: "1",
            displayName: "German A1 Jan 2024",
            language: "German",
            level: "A1",
            month: 1,
            year: 2024,
            totalCapacity: 100,
            courseDuration: 3,
            batchSizeLimit: 25,
            batchTypes: {
              regular: { enabled: true, studentCount: 75 },
              revision: { enabled: true, studentCount: 25 }
            },
            price: 2999,
            status: "active",
            instructor: "Sarah Wilson",
            createdAt: "2024-01-15T10:30:00Z",
            batchSummary: {
              totalStudents: 100,
              totalBatches: 4,
              batchTypes: {
                regular: { batches: 3, students: 75 },
                revision: { batches: 1, students: 25 }
              },
              leftoverBatches: []
            }
          },
          {
            _id: "2",
            displayName: "French B2 Feb 2024",
            language: "French",
            level: "B2",
            month: 2,
            year: 2024,
            totalCapacity: 50,
            courseDuration: 4,
            batchSizeLimit: 20,
            batchTypes: {
              regular: { enabled: true, studentCount: 45 },
              revision: { enabled: false, studentCount: 0 }
            },
            price: 3999,
            status: "active",
            instructor: "John Doe",
            createdAt: "2024-01-16T10:30:00Z",
            batchSummary: {
              totalStudents: 45,
              totalBatches: 3,
              batchTypes: {
                regular: { batches: 3, students: 45 },
                revision: { batches: 0, students: 0 }
              },
              leftoverBatches: [
                { _id: "batch3", batchType: "regular", currentStudents: 5, maxStudents: 20 }
              ]
            }
          },
          {
            _id: "3",
            displayName: "English C1 Mar 2024",
            language: "English",
            level: "C1",
            month: 3,
            year: 2024,
            totalCapacity: 30,
            courseDuration: 2,
            batchSizeLimit: 15,
            batchTypes: {
              regular: { enabled: true, studentCount: 0 },
              revision: { enabled: false, studentCount: 0 }
            },
            price: 4999,
            status: "draft",
            instructor: "Mike Johnson",
            createdAt: "2024-01-17T10:30:00Z",
            batchSummary: {
              totalStudents: 0,
              totalBatches: 0,
              batchTypes: {
                regular: { batches: 0, students: 0 },
                revision: { batches: 0, students: 0 }
              },
              leftoverBatches: []
            }
          }
        ]);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
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
                  <span className="text-gray-600 dark:text-gray-400">Instructor:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{course.instructor || 'Unassigned'}</span>
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
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
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
