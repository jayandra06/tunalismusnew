"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft,
  Edit,
  Trash2,
  Calendar,
  Clock,
  Users,
  BookOpen,
  User,
  AlertTriangle,
  CheckCircle,
  XCircle
} from "lucide-react";
import Link from "next/link";

export default function BatchDetailsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const [batch, setBatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role === 'admin') {
      fetchBatch();
    } else if (status === 'unauthenticated') {
      router.push('/admin/login');
    }
  }, [session, status, router, params.batchId]);

  const fetchBatch = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/batches/${params.batchId}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store'
      });

      if (response.ok) {
        const data = await response.json();
        setBatch(data.batch);
        setError(null);
      } else {
        const errorData = await response.json();
        setError(`Failed to load batch: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error fetching batch:', error);
      setError(`Network error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBatch = async () => {
    if (window.confirm(`Are you sure you want to delete "${batch.name}"? This action cannot be undone.`)) {
      try {
        const response = await fetch(`/api/admin/batches/${params.batchId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include'
        });

        if (response.ok) {
          alert('Batch deleted successfully!');
          router.push('/admin/batches');
        } else {
          const errorData = await response.json();
          alert(`Failed to delete batch: ${errorData.message}`);
        }
      } catch (error) {
        console.error('Error deleting batch:', error);
        alert('Failed to delete batch. Please try again.');
      }
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'upcoming':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'completed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
    }
  };

  // Show loading while checking authentication
  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Batch</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => router.push('/admin/batches')} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Batches
            </Button>
            <Button onClick={fetchBatch} className="bg-red-600 hover:bg-red-700">
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!batch) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-600 mb-4">Batch Not Found</h2>
          <p className="text-gray-600 mb-4">The batch you're looking for doesn't exist.</p>
          <Button onClick={() => router.push('/admin/batches')} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Batches
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button 
            variant="outline" 
            onClick={() => router.push('/admin/batches')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Batches
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{batch.name}</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Batch Details and Information
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Button 
            variant="outline"
            onClick={() => router.push(`/admin/batches/${params.batchId}/edit`)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Batch
          </Button>
          <Button 
            variant="outline" 
            className="text-red-600 hover:text-red-700"
            onClick={handleDeleteBatch}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Batch
          </Button>
        </div>
      </div>

      {/* Status Badge */}
      <div className="flex items-center space-x-2">
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(batch.status)}`}>
          {getStatusIcon(batch.status)}
          <span className="ml-2 capitalize">{batch.status}</span>
        </span>
        {batch.isLeftoverBatch && (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Leftover Batch
          </span>
        )}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Batch Information */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Batch Information</CardTitle>
              <CardDescription>Basic details about this batch</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Batch Name</label>
                  <p className="text-lg font-semibold">{batch.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Batch Number</label>
                  <p className="text-lg font-semibold">{batch.batchNumber}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Batch Type</label>
                  <p className="text-lg font-semibold capitalize">{batch.batchType}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Duration</label>
                  <p className="text-lg font-semibold">{batch.duration} months</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Course Information</CardTitle>
              <CardDescription>Details about the associated course</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-3">
                <BookOpen className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="font-semibold">{batch.course?.name || 'Unknown Course'}</p>
                  <p className="text-sm text-gray-600">{batch.course?.description || 'No description available'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Schedule</CardTitle>
              <CardDescription>Batch timing and duration</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <div>
                    <label className="text-sm font-medium text-gray-500">Start Date</label>
                    <p className="font-semibold">
                      {batch.startDate ? new Date(batch.startDate).toLocaleDateString() : 'TBD'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <div>
                    <label className="text-sm font-medium text-gray-500">End Date</label>
                    <p className="font-semibold">
                      {batch.endDate ? new Date(batch.endDate).toLocaleDateString() : 'TBD'}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Meeting Schedule */}
          {batch.meetingSchedule && (batch.meetingSchedule.days?.length > 0 || batch.meetingSchedule.time?.start) && (
            <Card>
              <CardHeader>
                <CardTitle>Meeting Schedule</CardTitle>
                <CardDescription>Class days and timings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Days */}
                  {batch.meetingSchedule.days && batch.meetingSchedule.days.length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Meeting Days</label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {batch.meetingSchedule.days.map((day) => (
                          <span
                            key={day}
                            className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium"
                          >
                            {day}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Time */}
                  {batch.meetingSchedule.time && (batch.meetingSchedule.time.start || batch.meetingSchedule.time.end) && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Class Time</label>
                      <p className="font-semibold">
                        {batch.meetingSchedule.time.start && batch.meetingSchedule.time.end
                          ? `${batch.meetingSchedule.time.start} - ${batch.meetingSchedule.time.end}`
                          : batch.meetingSchedule.time.start || batch.meetingSchedule.time.end || 'TBD'
                        }
                      </p>
                    </div>
                  )}

                  {/* Timezone */}
                  {batch.meetingSchedule.timezone && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Timezone</label>
                      <p className="font-semibold">{batch.meetingSchedule.timezone}</p>
                    </div>
                  )}

                  {/* Schedule Summary */}
                  {batch.meetingSchedule.days?.length > 0 && batch.meetingSchedule.time?.start && batch.meetingSchedule.time?.end && (
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">Schedule Summary</h4>
                      <p className="text-sm text-blue-800 dark:text-blue-400">
                        Classes are held on <strong>{batch.meetingSchedule.days.join(', ')}</strong> from{' '}
                        <strong>{batch.meetingSchedule.time.start}</strong> to{' '}
                        <strong>{batch.meetingSchedule.time.end}</strong> ({batch.meetingSchedule.timezone})
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Student Information</CardTitle>
              <CardDescription>Enrollment details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-gray-400" />
                    <span className="text-sm font-medium">Current Students</span>
                  </div>
                  <span className="text-2xl font-bold">{batch.currentStudents || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-gray-400" />
                    <span className="text-sm font-medium">Max Students</span>
                  </div>
                  <span className="text-2xl font-bold">{batch.maxStudents}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${((batch.currentStudents || 0) / batch.maxStudents) * 100}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 text-center">
                  {Math.round(((batch.currentStudents || 0) / batch.maxStudents) * 100)}% capacity
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Instructor</CardTitle>
              <CardDescription>Assigned instructor</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-3">
                <User className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="font-semibold">{batch.instructor?.name || 'Not Assigned'}</p>
                  <p className="text-sm text-gray-600">{batch.instructor?.email || ''}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Batch Notes</CardTitle>
              <CardDescription>Additional information</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                {batch.notes || 'No notes available for this batch.'}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
