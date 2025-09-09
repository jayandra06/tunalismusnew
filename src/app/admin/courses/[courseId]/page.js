"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ArrowLeft,
  Edit,
  Trash2,
  BookOpen,
  Users,
  Clock,
  DollarSign,
  Package,
  User
} from "lucide-react";
import Link from "next/link";

export default function CourseDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const courseId = params.courseId;

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('🔍 Course Details Page Session:', {
      status,
      session: session ? 'Present' : 'None',
      user: session?.user,
      role: session?.user?.role
    });
    
    // Only fetch course if user is authenticated and has admin role
    if (status === 'authenticated' && session?.user?.role === 'admin' && courseId) {
      fetchCourse();
    } else if (status === 'unauthenticated') {
      // Redirect to login if not authenticated
      router.push('/admin/login');
    }
  }, [courseId, session, status, router]);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/courses/${courseId}`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Course not found');
      }
      
      const data = await response.json();
      setCourse(data.course);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCourse = async () => {
    if (window.confirm(`Are you sure you want to delete "${course.displayName || course.name}"? This action cannot be undone.`)) {
      try {
        const response = await fetch(`/api/admin/courses/${courseId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });

        if (response.ok) {
          alert('Course deleted successfully!');
          router.push('/admin/courses');
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

  const formatPrice = (price) => {
    const validPrice = isNaN(price) || price === null || price === undefined ? 0 : price;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(validPrice);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'draft': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'completed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
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
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Course Not Found</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-8">{error}</p>
        <Link href="/admin/courses">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Courses
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/courses">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Courses
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {course.displayName || course.name}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Course Details and Management
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/admin/courses/${courseId}/edit`}>
            <Button variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Edit Course
            </Button>
          </Link>
          <Button 
            variant="outline" 
            className="text-red-600 hover:text-red-700"
            onClick={handleDeleteCourse}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Course
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Course Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Course Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Status:</span>
              <Badge className={getStatusBadgeColor(course.status)}>
                {course.status}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Language:</span>
              <span className="font-medium">{course.language}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Level:</span>
              <span className="font-medium">{course.level}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Duration:</span>
              <span className="font-medium">{course.courseDuration} months</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Capacity:</span>
              <span className="font-medium">{course.totalCapacity} students</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Batch Size Limit:</span>
              <span className="font-medium">{course.batchSizeLimit} students</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Trainer:</span>
              <span className="font-medium">
                {course.instructor ? 
                  (typeof course.instructor === 'object' ? course.instructor.name : course.instructor) 
                  : 'Unassigned'
                }
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Created:</span>
              <span className="font-medium">{formatDate(course.createdAt)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Pricing Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Pricing Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {course.pricing?.regular && (
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900 dark:text-white">Regular Batch</h4>
                <div className="pl-4 space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Base Price:</span>
                    <span>{formatPrice(course.pricing.regular.basePrice)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Materials Cost:</span>
                    <span>{formatPrice(course.pricing.regular.offlineMaterialCost)}</span>
                  </div>
                  <div className="flex justify-between font-medium border-t pt-1">
                    <span>Total Price:</span>
                    <span className="text-green-600 dark:text-green-400">
                      {formatPrice(course.pricing.regular.totalPrice)}
                    </span>
                  </div>
                </div>
              </div>
            )}
            
            {course.pricing?.revision && course.pricing.revision.totalPrice > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900 dark:text-white">Revision Batch</h4>
                <div className="pl-4 space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Base Price:</span>
                    <span>{formatPrice(course.pricing.revision.basePrice)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Materials Cost:</span>
                    <span>{formatPrice(course.pricing.revision.offlineMaterialCost)}</span>
                  </div>
                  <div className="flex justify-between font-medium border-t pt-1">
                    <span>Total Price:</span>
                    <span className="text-purple-600 dark:text-purple-400">
                      {formatPrice(course.pricing.revision.totalPrice)}
                    </span>
                  </div>
                </div>
              </div>
            )}
            
            {course.offlineMaterials?.enabled && course.offlineMaterials.materials?.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Offline Materials
                </h4>
                <div className="pl-4 space-y-1">
                  {course.offlineMaterials.materials.map((material, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">{material.name}:</span>
                      <span>{formatPrice(material.totalCost)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between font-medium border-t pt-1">
                    <span>Total Materials Cost:</span>
                    <span className="text-orange-600 dark:text-orange-400">
                      {formatPrice(course.offlineMaterials.totalCost)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Batch Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Batch Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Regular Batches:</span>
                <div className="text-right">
                  <div className="font-medium">
                    {course.batchTypes.regular.enabled ? 'Enabled' : 'Disabled'}
                  </div>
                  {course.batchTypes.regular.enabled && (
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {course.batchTypes.regular.studentCount} students enrolled
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Revision Batches:</span>
                <div className="text-right">
                  <div className="font-medium">
                    {course.batchTypes.revision.enabled ? 'Enabled' : 'Disabled'}
                  </div>
                  {course.batchTypes.revision.enabled && (
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {course.batchTypes.revision.studentCount} students enrolled
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Description */}
        <Card>
          <CardHeader>
            <CardTitle>Course Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-300">
              {course.description || `Learn ${course.language} at ${course.level} level with our comprehensive course designed for ${course.courseDuration} months.`}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
