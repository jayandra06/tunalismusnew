"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  ArrowLeft,
  Save,
  BookOpen,
  Package
} from "lucide-react";
import Link from "next/link";

export default function EditCoursePage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const courseId = params.courseId;

  const [loading, setLoading] = useState(false);
  const [trainers, setTrainers] = useState([]);
  const [formData, setFormData] = useState({
    // Basic Information
    name: '',
    language: '',
    level: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    description: '',
    
    // Course Configuration
    totalCapacity: 50,
    courseDuration: 3,
    batchSizeLimit: 25,
    
    // Batch Types
    batchTypes: {
      regular: { enabled: true, studentCount: 0 },
      revision: { enabled: false, studentCount: 0 }
    },
    
    // Pricing
    pricing: {
      regular: {
        basePrice: 0,
        offlineMaterialCost: 0,
        totalPrice: 0
      },
      revision: {
        basePrice: 0,
        offlineMaterialCost: 0,
        totalPrice: 0
      }
    },
    
    // Offline Materials
    offlineMaterials: {
      enabled: false,
      materials: [],
      totalCost: 0
    },
    
    // Instructor
    instructor: '',
    
    // Status
    status: 'draft'
  });

  const [errors, setErrors] = useState({});

  // Fetch course data and trainers on component mount
  useEffect(() => {
    console.log('🔍 Course Edit Page Session:', {
      status,
      session: session ? 'Present' : 'None',
      user: session?.user,
      role: session?.user?.role
    });
    
    // Only fetch data if user is authenticated and has admin role
    if (status === 'authenticated' && session?.user?.role === 'admin') {
      const fetchData = async () => {
        try {
          // Fetch course data
          const courseResponse = await fetch(`/api/admin/courses/${courseId}`, {
            credentials: 'include'
          });
          
          if (courseResponse.ok) {
            const courseData = await courseResponse.json();
            const course = courseData.course;
            
            setFormData({
              name: course.name || '',
              language: course.language || '',
              level: course.level || '',
              month: course.month || new Date().getMonth() + 1,
              year: course.year || new Date().getFullYear(),
              description: course.description || '',
              totalCapacity: course.totalCapacity || 50,
              courseDuration: course.courseDuration || 3,
              batchSizeLimit: course.batchSizeLimit || 25,
              batchTypes: course.batchTypes || {
                regular: { enabled: true, studentCount: 0 },
                revision: { enabled: false, studentCount: 0 }
              },
              pricing: course.pricing || {
                regular: { basePrice: 0, offlineMaterialCost: 0, totalPrice: 0 },
                revision: { basePrice: 0, offlineMaterialCost: 0, totalPrice: 0 }
              },
              offlineMaterials: course.offlineMaterials || {
                enabled: false,
                materials: [],
                totalCost: 0
              },
              instructor: course.instructor?._id || course.instructor || '',
              status: course.status || 'draft'
            });
          }

          // Fetch trainers
          const trainersResponse = await fetch('/api/admin/trainers', {
            credentials: 'include'
          });
          
          if (trainersResponse.ok) {
            const trainersData = await trainersResponse.json();
            setTrainers(trainersData.trainers || []);
          }
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      };

      fetchData();
    } else if (status === 'unauthenticated') {
      // Redirect to login if not authenticated
      router.push('/admin/login');
    }
  }, [courseId, session, status, router]);

  const languages = [
    'English', 'German', 'French', 'Spanish', 'Italian', 
    'Portuguese', 'Russian', 'Chinese', 'Japanese', 'Korean', 'Arabic', 'Hindi'
  ];

  const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'Beginner', 'Intermediate', 'Advanced'];

  const months = [
    { value: 1, name: 'January' },
    { value: 2, name: 'February' },
    { value: 3, name: 'March' },
    { value: 4, name: 'April' },
    { value: 5, name: 'May' },
    { value: 6, name: 'June' },
    { value: 7, name: 'July' },
    { value: 8, name: 'August' },
    { value: 9, name: 'September' },
    { value: 10, name: 'October' },
    { value: 11, name: 'November' },
    { value: 12, name: 'December' }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const handleBatchTypeChange = (type, field, value) => {
    setFormData(prev => ({
      ...prev,
      batchTypes: {
        ...prev.batchTypes,
        [type]: {
          ...prev.batchTypes[type],
          [field]: value
        }
      }
    }));
  };

  const handlePricingChange = (batchType, field, value) => {
    const newFormData = {
      ...formData,
      pricing: {
        ...formData.pricing,
        [batchType]: {
          ...formData.pricing[batchType],
          [field]: parseFloat(value) || 0
        }
      }
    };

    // Recalculate total price
    const basePrice = newFormData.pricing[batchType].basePrice;
    const offlineCost = newFormData.offlineMaterials.enabled ? newFormData.offlineMaterials.totalCost : 0;
    newFormData.pricing[batchType].totalPrice = basePrice + offlineCost;

    setFormData(newFormData);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.language) newErrors.language = 'Language is required';
    if (!formData.level) newErrors.level = 'Level is required';
    if (!formData.totalCapacity || formData.totalCapacity < 1) newErrors.totalCapacity = 'Total capacity must be at least 1';
    if (!formData.courseDuration || formData.courseDuration < 1) newErrors.courseDuration = 'Course duration must be at least 1 month';
    if (!formData.batchSizeLimit || formData.batchSizeLimit < 1) newErrors.batchSizeLimit = 'Batch size limit must be at least 1';
    
    if (!formData.batchTypes.regular.enabled && !formData.batchTypes.revision.enabled) {
      newErrors.batchTypes = 'At least one batch type must be enabled';
    }

    if (formData.batchTypes.regular.enabled && (!formData.pricing.regular.basePrice || formData.pricing.regular.basePrice < 0)) {
      newErrors.regularPrice = 'Regular batch base price is required';
    }

    if (formData.batchTypes.revision.enabled && (!formData.pricing.revision.basePrice || formData.pricing.revision.basePrice < 0)) {
      newErrors.revisionPrice = 'Revision batch base price is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/admin/courses/${courseId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        router.push('/admin/courses');
      } else {
        const error = await response.json();
        setErrors({ submit: error.message || 'Failed to update course' });
      }
    } catch (error) {
      setErrors({ submit: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(price);
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/admin/courses/${courseId}`}>
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Course Details
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Edit Course</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Update course information and settings
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Basic Information
            </CardTitle>
            <CardDescription>
              Update the basic course details and configuration
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Course Name (Optional)
                </label>
                <Input
                  placeholder="Leave empty for auto-generated name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Auto-generated: "{formData.language} {formData.level} {months.find(m => m.value === formData.month)?.name} {formData.year}"
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Language *
                </label>
                <select
                  value={formData.language}
                  onChange={(e) => handleInputChange('language', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="">Select Language</option>
                  {languages.map(lang => (
                    <option key={lang} value={lang}>{lang}</option>
                  ))}
                </select>
                {errors.language && <p className="text-red-500 text-sm mt-1">{errors.language}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Level *
                </label>
                <select
                  value={formData.level}
                  onChange={(e) => handleInputChange('level', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="">Select Level</option>
                  {levels.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
                {errors.level && <p className="text-red-500 text-sm mt-1">{errors.level}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Month *
                </label>
                <select
                  value={formData.month}
                  onChange={(e) => handleInputChange('month', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  {months.map(month => (
                    <option key={month.value} value={month.value}>{month.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Year *
                </label>
                <Input
                  type="number"
                  min="2024"
                  max="2030"
                  value={formData.year}
                  onChange={(e) => handleInputChange('year', parseInt(e.target.value))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Assign Trainer (Optional)
                </label>
                <select
                  value={formData.instructor}
                  onChange={(e) => handleInputChange('instructor', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="">Select a trainer</option>
                  {trainers.map(trainer => (
                    <option key={trainer._id} value={trainer._id}>
                      {trainer.name} ({trainer.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Course Status *
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="draft">Draft (Not accepting enrollments)</option>
                  <option value="published">Published (Accepting enrollments)</option>
                  <option value="active">Active (Course in progress)</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  {formData.status === 'draft' && "Course is in draft mode and won't accept enrollments"}
                  {formData.status === 'published' && "Course is published and accepting enrollments"}
                  {formData.status === 'active' && "Course is currently running"}
                  {formData.status === 'completed' && "Course has finished"}
                  {formData.status === 'cancelled' && "Course has been cancelled"}
                </p>
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                rows={3}
                placeholder="Course description..."
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
          </CardContent>
        </Card>

        {/* Course Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Course Configuration</CardTitle>
            <CardDescription>
              Update capacity, duration, and batch settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Total Capacity *
                </label>
                <Input
                  type="number"
                  min="1"
                  max="1000"
                  value={formData.totalCapacity}
                  onChange={(e) => handleInputChange('totalCapacity', parseInt(e.target.value))}
                />
                {errors.totalCapacity && <p className="text-red-500 text-sm mt-1">{errors.totalCapacity}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Course Duration (Months) *
                </label>
                <Input
                  type="number"
                  min="1"
                  max="24"
                  value={formData.courseDuration}
                  onChange={(e) => handleInputChange('courseDuration', parseInt(e.target.value))}
                />
                {errors.courseDuration && <p className="text-red-500 text-sm mt-1">{errors.courseDuration}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Batch Size Limit *
                </label>
                <Input
                  type="number"
                  min="1"
                  max="100"
                  value={formData.batchSizeLimit}
                  onChange={(e) => handleInputChange('batchSizeLimit', parseInt(e.target.value))}
                />
                {errors.batchSizeLimit && <p className="text-red-500 text-sm mt-1">{errors.batchSizeLimit}</p>}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Batch Types */}
        <Card>
          <CardHeader>
            <CardTitle>Batch Types</CardTitle>
            <CardDescription>
              Configure which batch types are available for this course
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Regular Batches */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-4">
                  <input
                    type="checkbox"
                    checked={formData.batchTypes.regular.enabled}
                    onChange={(e) => handleBatchTypeChange('regular', 'enabled', e.target.checked)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <h3 className="font-semibold text-gray-900 dark:text-white">Regular Batches</h3>
                </div>
                
                {formData.batchTypes.regular.enabled && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Base Price (₹)
                      </label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.pricing.regular.basePrice}
                        onChange={(e) => handlePricingChange('regular', 'basePrice', e.target.value)}
                      />
                      {errors.regularPrice && <p className="text-red-500 text-sm mt-1">{errors.regularPrice}</p>}
                    </div>
                    
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Total Price:</span>
                        <span className="font-semibold text-blue-600 dark:text-blue-400">
                          {formatPrice(formData.pricing.regular.totalPrice)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Revision Batches */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-4">
                  <input
                    type="checkbox"
                    checked={formData.batchTypes.revision.enabled}
                    onChange={(e) => handleBatchTypeChange('revision', 'enabled', e.target.checked)}
                    className="w-4 h-4 text-purple-600"
                  />
                  <h3 className="font-semibold text-gray-900 dark:text-white">Revision Batches</h3>
                </div>
                
                {formData.batchTypes.revision.enabled && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Base Price (₹)
                      </label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.pricing.revision.basePrice}
                        onChange={(e) => handlePricingChange('revision', 'basePrice', e.target.value)}
                      />
                      {errors.revisionPrice && <p className="text-red-500 text-sm mt-1">{errors.revisionPrice}</p>}
                    </div>
                    
                    <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Total Price:</span>
                        <span className="font-semibold text-purple-600 dark:text-purple-400">
                          {formatPrice(formData.pricing.revision.totalPrice)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {errors.batchTypes && <p className="text-red-500 text-sm">{errors.batchTypes}</p>}
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex justify-end gap-4">
          <Link href={`/admin/courses/${courseId}`}>
            <Button variant="outline">Cancel</Button>
          </Link>
          <Button type="submit" disabled={loading} className="bg-red-600 hover:bg-red-700">
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Updating...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Update Course
              </>
            )}
          </Button>
        </div>

        {errors.submit && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <p className="text-red-600 dark:text-red-400">{errors.submit}</p>
          </div>
        )}
      </form>
    </div>
  );
}
