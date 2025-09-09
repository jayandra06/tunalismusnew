"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  UserPlus,
  Download,
  Upload,
  Calculator,
  CreditCard,
  X
} from "lucide-react";
import Link from "next/link";

export default function EnrollmentsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [enrollments, setEnrollments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [courseFilter, setCourseFilter] = useState("all");
  const [showEnrollmentModal, setShowEnrollmentModal] = useState(false);
  const [students, setStudents] = useState([]);
  const [enrollmentForm, setEnrollmentForm] = useState({
    studentId: '',
    courseId: '',
    batchType: 'regular',
    paymentAmount: ''
  });
  const [selectedEnrollment, setSelectedEnrollment] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [availableBatches, setAvailableBatches] = useState({});
  const [loadingBatches, setLoadingBatches] = useState({});
  const [showDropdown, setShowDropdown] = useState({});

  // Handler functions for enrollment actions
  const handleViewEnrollment = (enrollmentId) => {
    const enrollment = enrollments.find(e => e._id === enrollmentId);
    setSelectedEnrollment(enrollment);
    setShowViewModal(true);
  };

  const handleEditEnrollment = (enrollmentId) => {
    const enrollment = enrollments.find(e => e._id === enrollmentId);
    setSelectedEnrollment(enrollment);
    setShowEditModal(true);
  };

  const handleAssignBatch = async (courseId, enrollmentId) => {
    // Toggle dropdown visibility
    setShowDropdown(prev => ({ 
      ...prev, 
      [enrollmentId]: !prev[enrollmentId] 
    }));

    // If batches already loaded for this course, don't fetch again
    if (availableBatches[courseId]) {
      return;
    }

    setLoadingBatches(prev => ({ ...prev, [courseId]: true }));
    
    try {
      const response = await fetch(`/api/admin/batches?courseId=${courseId}`);
      const data = await response.json();
      setAvailableBatches(prev => ({ 
        ...prev, 
        [courseId]: data.batches || [] 
      }));
    } catch (error) {
      console.error('Error fetching batches:', error);
      setAvailableBatches(prev => ({ 
        ...prev, 
        [courseId]: [] 
      }));
    } finally {
      setLoadingBatches(prev => ({ ...prev, [courseId]: false }));
    }
  };

  const handleBatchAssignment = async (enrollmentId, batchId) => {
    if (!batchId) return;
    
    try {
      const response = await fetch(`/api/admin/enrollments/${enrollmentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ batchId }),
      });

      if (response.ok) {
        // Refresh enrollments to show updated data
        fetchEnrollments();
        alert('Batch assigned successfully!');
      } else {
        alert('Failed to assign batch');
      }
    } catch (error) {
      console.error('Error assigning batch:', error);
      alert('Error assigning batch');
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.dropdown-container')) {
        setShowDropdown({});
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    console.log('🔍 Enrollments Page Session:', {
      status,
      session: session ? 'Present' : 'None',
      user: session?.user,
      role: session?.user?.role
    });
    
    // Only fetch data if user is authenticated and has admin role
    if (status === 'authenticated' && session?.user?.role === 'admin') {
      fetchEnrollments();
      fetchCourses();
      fetchStudents();
    } else if (status === 'unauthenticated') {
      // Redirect to login if not authenticated
      router.push('/admin/login');
    }
  }, [session, status, router]);

  const fetchEnrollments = async () => {
    try {
      const response = await fetch('/api/admin/enrollments');
      
      if (response.ok) {
        const data = await response.json();
        setEnrollments(data.enrollments || []);
      } else {
        // Mock data for now
        setEnrollments([
          {
            _id: "1",
            student: {
              _id: "student1",
              name: "John Doe",
              email: "john@example.com",
              phone: "+91 9876543210"
            },
            course: {
              _id: "course1",
              displayName: "German A1 Jan 2024",
              language: "German",
              level: "A1"
            },
            batch: {
              _id: "batch1",
              batchNumber: 1,
              batchType: "regular"
            },
            batchType: "regular",
            status: "enrolled",
            payment: {
              amount: 2999,
              status: "paid",
              paymentId: "PAY_001"
            },
            enrolledAt: "2024-01-15T10:30:00Z"
          },
          {
            _id: "2",
            student: {
              _id: "student2",
              name: "Sarah Wilson",
              email: "sarah@example.com",
              phone: "+91 9876543211"
            },
            course: {
              _id: "course1",
              displayName: "German A1 Jan 2024",
              language: "German",
              level: "A1"
            },
            batch: {
              _id: "batch2",
              batchNumber: 2,
              batchType: "revision"
            },
            batchType: "revision",
            status: "pending",
            payment: {
              amount: 3499,
              status: "pending",
              paymentId: null
            },
            enrolledAt: "2024-01-16T14:20:00Z"
          },
          {
            _id: "3",
            student: {
              _id: "student3",
              name: "Mike Johnson",
              email: "mike@example.com",
              phone: "+91 9876543212"
            },
            course: {
              _id: "course2",
              displayName: "French B2 Feb 2024",
              language: "French",
              level: "B2"
            },
            batch: null,
            batchType: "regular",
            status: "pending",
            payment: {
              amount: 3999,
              status: "pending",
              paymentId: null
            },
            enrolledAt: "2024-01-17T09:15:00Z"
          }
        ]);
      }
    } catch (error) {
      console.error('Error fetching enrollments:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await fetch('/api/admin/courses', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store'
      });
      
      if (response.ok) {
        const data = await response.json();
        setCourses(data.courses || []);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await fetch('/api/admin/users?role=student', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store'
      });
      
      if (response.ok) {
        const data = await response.json();
        setStudents(data.users || []);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const handleEnrollmentSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/admin/enrollments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...enrollmentForm,
          paymentAmount: parseFloat(enrollmentForm.paymentAmount)
        })
      });

      if (response.ok) {
        alert('Student enrolled successfully!');
        setShowEnrollmentModal(false);
        setEnrollmentForm({
          studentId: '',
          courseId: '',
          batchType: 'regular',
          paymentAmount: ''
        });
        fetchEnrollments(); // Refresh the list
      } else {
        const errorData = await response.json();
        alert(`Failed to enroll student: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error enrolling student:', error);
      alert('Failed to enroll student. Please try again.');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEnrollmentForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const filteredEnrollments = enrollments.filter(enrollment => {
    const studentName = enrollment.student?.name || 'Unknown Student';
    const studentEmail = enrollment.student?.email || 'No Email';
    const courseName = enrollment.course?.displayName || enrollment.course?.name || 'Unknown Course';
    
    const matchesSearch = studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         studentEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         courseName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || enrollment.status === statusFilter;
    const matchesCourse = courseFilter === "all" || enrollment.course?._id === courseFilter;
    
    return matchesSearch && matchesStatus && matchesCourse;
  });

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'enrolled': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'active': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'completed': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getPaymentStatusBadgeColor = (status) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'failed': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'refunded': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getBatchTypeBadgeColor = (batchType) => {
    switch (batchType) {
      case 'regular': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'revision': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Student Enrollments</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage student enrollments and batch assignments
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button 
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700"
            onClick={() => setShowEnrollmentModal(true)}
          >
            <UserPlus className="h-4 w-4" />
            Enroll Student
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Total Enrollments
            </CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {enrollments.length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Active Students
            </CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {enrollments.filter(e => e.status === 'active' || e.status === 'enrolled').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Pending Payments
            </CardTitle>
            <CreditCard className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {enrollments.filter(e => e.payment.status === 'pending').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Total Revenue
            </CardTitle>
            <Calculator className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatPrice(enrollments
                .filter(e => e.payment.status === 'paid')
                .reduce((sum, enrollment) => sum + enrollment.payment.amount, 0)
              )}
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
                placeholder="Search enrollments..."
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
              <option value="pending">Pending</option>
              <option value="enrolled">Enrolled</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            
            <select
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="all">All Courses</option>
              {courses.map(course => (
                <option key={course._id} value={course._id}>{course.displayName}</option>
              ))}
            </select>
            
            <Button variant="outline" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Import Enrollments
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Enrollments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Enrollments List ({filteredEnrollments.length} enrollments)</CardTitle>
          <CardDescription>
            View and manage all student enrollments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Student</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Course</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Batch</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Type</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Amount</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Payment</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Enrolled</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEnrollments.map((enrollment) => (
                  <tr key={enrollment._id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                          <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">
                            {(enrollment.student?.name || 'U').charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {enrollment.student?.name || 'Unknown Student'}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {enrollment.student?.email || 'No Email'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {enrollment.course?.displayName || enrollment.course?.name || 'Unknown Course'}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {enrollment.course?.language || 'N/A'} {enrollment.course?.level || 'N/A'}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      {enrollment.batch ? (
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            Batch {enrollment.batch?.batchNumber || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {enrollment.batch?.batchType || 'N/A'}
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-500 dark:text-gray-400">Not Assigned</span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getBatchTypeBadgeColor(enrollment.batchType)}`}>
                        {(enrollment.batchType || 'regular').charAt(0).toUpperCase() + (enrollment.batchType || 'regular').slice(1)}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {formatPrice(enrollment.payment?.amount || 0)}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusBadgeColor(enrollment.payment?.status)}`}>
                        {(enrollment.payment?.status || 'pending').charAt(0).toUpperCase() + (enrollment.payment?.status || 'pending').slice(1)}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(enrollment.status)}`}>
                        {(enrollment.status || 'pending').charAt(0).toUpperCase() + (enrollment.status || 'pending').slice(1)}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-gray-600 dark:text-gray-400">
                      {formatDate(enrollment.enrolledAt)}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewEnrollment(enrollment._id)}
                          title="View Enrollment Details"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEditEnrollment(enrollment._id)}
                          title="Edit Enrollment"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {!enrollment.batch && (
                          <div className="relative min-w-[150px] dropdown-container">
                            {!showDropdown[enrollment._id] ? (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="text-blue-600 hover:text-blue-700"
                                onClick={() => handleAssignBatch(enrollment.course._id, enrollment._id)}
                                title="Assign Batch"
                              >
                                Assign Batch
                              </Button>
                            ) : (
                              <div className="absolute top-0 left-0 z-10 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded shadow-lg min-w-[200px]">
                                <div className="p-2 border-b border-gray-200 dark:border-gray-700">
                                  <div className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                    {enrollment.course?.displayName || enrollment.course?.name || 'Unknown Course'}
                                  </div>
                                </div>
                                <div className="max-h-48 overflow-y-auto">
                                  {loadingBatches[enrollment.course._id] ? (
                                    <div className="p-3 text-center text-sm text-gray-500 dark:text-gray-400">
                                      Loading batches...
                                    </div>
                                  ) : availableBatches[enrollment.course._id]?.length > 0 ? (
                                    availableBatches[enrollment.course._id].map((batch) => (
                                      <button
                                        key={batch._id}
                                        className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                                        onClick={() => {
                                          handleBatchAssignment(enrollment._id, batch._id);
                                          setShowDropdown(prev => ({ ...prev, [enrollment._id]: false }));
                                        }}
                                      >
                                        <div className="font-medium">
                                          {batch.name || `Batch ${batch.batchNumber}`}
                                        </div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                          {batch.batchType} • {batch.currentStudents}/{batch.maxStudents} students
                                        </div>
                                      </button>
                                    ))
                                  ) : (
                                    <div className="p-3 text-center text-sm text-gray-500 dark:text-gray-400">
                                      No batches available
                                    </div>
                                  )}
                                </div>
                                <div className="p-2 border-t border-gray-200 dark:border-gray-700">
                                  <button
                                    className="w-full text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                                    onClick={() => setShowDropdown(prev => ({ ...prev, [enrollment._id]: false }))}
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredEnrollments.length === 0 && (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No enrollments found matching your criteria</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Enrollment Modal */}
      {showEnrollmentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Enroll New Student</h2>
            
            <form onSubmit={handleEnrollmentSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select Student
                </label>
                <select
                  name="studentId"
                  value={enrollmentForm.studentId}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Choose a student...</option>
                  {students.map(student => (
                    <option key={student._id} value={student._id}>
                      {student.name} ({student.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select Course
                </label>
                <select
                  name="courseId"
                  value={enrollmentForm.courseId}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Choose a course...</option>
                  {courses.map(course => (
                    <option key={course._id} value={course._id}>
                      {course.name} - {course.language} {course.level}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Batch Type
                </label>
                <select
                  name="batchType"
                  value={enrollmentForm.batchType}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="regular">Regular</option>
                  <option value="revision">Revision</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Payment Amount (₹)
                </label>
                <Input
                  name="paymentAmount"
                  type="number"
                  value={enrollmentForm.paymentAmount}
                  onChange={handleInputChange}
                  placeholder="Enter payment amount"
                  required
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowEnrollmentModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-red-600 hover:bg-red-700"
                >
                  Enroll Student
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Enrollment Modal */}
      {showViewModal && selectedEnrollment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Enrollment Details</h3>
              <Button variant="outline" size="sm" onClick={() => setShowViewModal(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Student</label>
                  <p className="text-gray-900 dark:text-white">
                    {selectedEnrollment.student?.name || 'Unknown Student'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Email</label>
                  <p className="text-gray-900 dark:text-white">
                    {selectedEnrollment.student?.email || 'No Email'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Course</label>
                  <p className="text-gray-900 dark:text-white">
                    {selectedEnrollment.course?.displayName || selectedEnrollment.course?.name || 'Unknown Course'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Batch Type</label>
                  <p className="text-gray-900 dark:text-white">
                    {(selectedEnrollment.batchType || 'regular').charAt(0).toUpperCase() + (selectedEnrollment.batchType || 'regular').slice(1)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Amount</label>
                  <p className="text-gray-900 dark:text-white">
                    ₹{(selectedEnrollment.payment?.amount || 0).toLocaleString()}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Status</label>
                  <p className="text-gray-900 dark:text-white">
                    {(selectedEnrollment.status || 'pending').charAt(0).toUpperCase() + (selectedEnrollment.status || 'pending').slice(1)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
