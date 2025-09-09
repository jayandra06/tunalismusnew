"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  ArrowLeft,
  Save,
  X,
  Calendar,
  Users,
  BookOpen,
  User
} from "lucide-react";

export default function EditBatchPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const [batch, setBatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    maxStudents: 30,
    startDate: '',
    endDate: '',
    status: 'upcoming',
    notes: '',
    meetingSchedule: {
      days: [],
      time: {
        start: '',
        end: ''
      },
      timezone: 'Asia/Kolkata'
    }
  });

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
        setFormData({
          name: data.batch.name || '',
          maxStudents: data.batch.maxStudents || 30,
          startDate: data.batch.startDate ? new Date(data.batch.startDate).toISOString().split('T')[0] : '',
          endDate: data.batch.endDate ? new Date(data.batch.endDate).toISOString().split('T')[0] : '',
          status: data.batch.status || 'upcoming',
          notes: data.batch.notes || '',
          meetingSchedule: {
            days: data.batch.meetingSchedule?.days || [],
            time: {
              start: data.batch.meetingSchedule?.time?.start || '',
              end: data.batch.meetingSchedule?.time?.end || ''
            },
            timezone: data.batch.meetingSchedule?.timezone || 'Asia/Kolkata'
          }
        });
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDayToggle = (day) => {
    setFormData(prev => ({
      ...prev,
      meetingSchedule: {
        ...prev.meetingSchedule,
        days: prev.meetingSchedule.days.includes(day)
          ? prev.meetingSchedule.days.filter(d => d !== day)
          : [...prev.meetingSchedule.days, day]
      }
    }));
  };

  const handleTimeChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      meetingSchedule: {
        ...prev.meetingSchedule,
        time: {
          ...prev.meetingSchedule.time,
          [field]: value
        }
      }
    }));
  };

  const handleTimezoneChange = (timezone) => {
    setFormData(prev => ({
      ...prev,
      meetingSchedule: {
        ...prev.meetingSchedule,
        timezone
      }
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await fetch(`/api/admin/batches/${params.batchId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          startDate: formData.startDate ? new Date(formData.startDate) : null,
          endDate: formData.endDate ? new Date(formData.endDate) : null,
        })
      });

      if (response.ok) {
        alert('Batch updated successfully!');
        router.push(`/admin/batches/${params.batchId}`);
      } else {
        const errorData = await response.json();
        alert(`Failed to update batch: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error updating batch:', error);
      alert('Failed to update batch. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    router.push(`/admin/batches/${params.batchId}`);
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
          <p className="text-gray-600 mb-4">The batch you're trying to edit doesn't exist.</p>
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
            onClick={() => router.push(`/admin/batches/${params.batchId}`)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Batch
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Edit Batch</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Update batch information and settings
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Button 
            variant="outline"
            onClick={handleCancel}
            disabled={saving}
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            disabled={saving}
            className="bg-red-600 hover:bg-red-700"
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Batch Information</CardTitle>
              <CardDescription>Update basic batch details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Batch Name
                </label>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter batch name"
                  className="w-full"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Students
                  </label>
                  <Input
                    name="maxStudents"
                    type="number"
                    value={formData.maxStudents}
                    onChange={handleInputChange}
                    min="1"
                    max="100"
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value="upcoming">Upcoming</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Schedule</CardTitle>
              <CardDescription>Update batch timing</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date
                  </label>
                  <Input
                    name="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date
                  </label>
                  <Input
                    name="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    className="w-full"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Meeting Schedule</CardTitle>
              <CardDescription>Set the days and timings for batch sessions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Days Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Meeting Days
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => handleDayToggle(day)}
                      className={`px-3 py-2 text-sm rounded-md border transition-colors ${
                        formData.meetingSchedule.days.includes(day)
                          ? 'bg-red-600 text-white border-red-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {day.slice(0, 3)}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Selected: {formData.meetingSchedule.days.length > 0 ? formData.meetingSchedule.days.join(', ') : 'No days selected'}
                </p>
              </div>

              {/* Time Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Time
                  </label>
                  <select
                    value={formData.meetingSchedule.time.start}
                    onChange={(e) => handleTimeChange('start', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value="">Select start time</option>
                    {Array.from({ length: 48 }, (_, i) => {
                      const hour = Math.floor(i / 2);
                      const minute = (i % 2) * 30;
                      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                      const displayTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                      return (
                        <option key={timeString} value={timeString}>
                          {displayTime}
                        </option>
                      );
                    })}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Time
                  </label>
                  <select
                    value={formData.meetingSchedule.time.end}
                    onChange={(e) => handleTimeChange('end', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value="">Select end time</option>
                    {Array.from({ length: 48 }, (_, i) => {
                      const hour = Math.floor(i / 2);
                      const minute = (i % 2) * 30;
                      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                      const displayTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                      return (
                        <option key={timeString} value={timeString}>
                          {displayTime}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              {/* Timezone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Timezone
                </label>
                <select
                  value={formData.meetingSchedule.timezone}
                  onChange={(e) => handleTimezoneChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">America/New_York (EST)</option>
                  <option value="Europe/London">Europe/London (GMT)</option>
                  <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
                </select>
              </div>

              {/* Schedule Summary */}
              {formData.meetingSchedule.days.length > 0 && formData.meetingSchedule.time.start && formData.meetingSchedule.time.end && (
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">Schedule Summary</h4>
                  <p className="text-sm text-blue-800 dark:text-blue-400">
                    Classes will be held on <strong>{formData.meetingSchedule.days.join(', ')}</strong> from{' '}
                    <strong>{formData.meetingSchedule.time.start}</strong> to{' '}
                    <strong>{formData.meetingSchedule.time.end}</strong> ({formData.meetingSchedule.timezone})
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
              <CardDescription>Additional information about this batch</CardDescription>
            </CardHeader>
            <CardContent>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Enter any additional notes about this batch..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Course Information</CardTitle>
              <CardDescription>Associated course details</CardDescription>
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
              <CardTitle>Current Statistics</CardTitle>
              <CardDescription>Read-only information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-gray-400" />
                  <span className="text-sm font-medium">Current Students</span>
                </div>
                <span className="text-2xl font-bold">{batch.currentStudents || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <span className="text-sm font-medium">Batch Type</span>
                </div>
                <span className="text-sm font-semibold capitalize">{batch.batchType}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <span className="text-sm font-medium">Batch Number</span>
                </div>
                <span className="text-sm font-semibold">{batch.batchNumber}</span>
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
        </div>
      </div>
    </div>
  );
}
