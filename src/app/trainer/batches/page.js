"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  BookOpen, 
  Users, 
  Calendar, 
  Clock,
  TrendingUp,
  Eye,
  Edit,
  Plus,
  Filter,
  Search,
  MapPin,
  GraduationCap,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import Link from "next/link";

export default function TrainerBatchesPage() {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    const fetchBatches = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/trainer/batches', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setBatches(data.batches || []);
        } else {
          // Mock data for now
          setBatches([
            {
              _id: '1',
              name: 'React Fundamentals - Batch A',
              course: {
                _id: 'course1',
                title: 'React Fundamentals',
                description: 'Learn the basics of React development'
              },
              startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
              endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
              students: [
                { _id: 's1', name: 'John Doe', email: 'john@example.com' },
                { _id: 's2', name: 'Jane Smith', email: 'jane@example.com' },
                { _id: 's3', name: 'Mike Johnson', email: 'mike@example.com' }
              ],
              status: 'active',
              progress: 65,
              totalSessions: 20,
              completedSessions: 13,
              location: 'Online - Zoom',
              schedule: 'Mon, Wed, Fri 10:00 AM - 12:00 PM'
            },
            {
              _id: '2',
              name: 'JavaScript Advanced - Batch B',
              course: {
                _id: 'course2',
                title: 'JavaScript Advanced',
                description: 'Advanced JavaScript concepts and patterns'
              },
              startDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
              endDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days from now
              students: [
                { _id: 's4', name: 'Sarah Wilson', email: 'sarah@example.com' },
                { _id: 's5', name: 'David Brown', email: 'david@example.com' }
              ],
              status: 'active',
              progress: 40,
              totalSessions: 25,
              completedSessions: 10,
              location: 'Classroom 101',
              schedule: 'Tue, Thu 2:00 PM - 4:00 PM'
            },
            {
              _id: '3',
              name: 'Node.js Backend - Batch C',
              course: {
                _id: 'course3',
                title: 'Node.js Backend Development',
                description: 'Server-side development with Node.js'
              },
              startDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 60 days ago
              endDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
              students: [
                { _id: 's6', name: 'Emily Davis', email: 'emily@example.com' },
                { _id: 's7', name: 'Chris Lee', email: 'chris@example.com' },
                { _id: 's8', name: 'Lisa Garcia', email: 'lisa@example.com' }
              ],
              status: 'completed',
              progress: 100,
              totalSessions: 30,
              completedSessions: 30,
              location: 'Online - Zoom',
              schedule: 'Mon, Wed, Fri 6:00 PM - 8:00 PM'
            }
          ]);
        }
      } catch (error) {
        console.error('Error fetching batches:', error);
        setError('Error loading batches');
      } finally {
        setLoading(false);
      }
    };

    fetchBatches();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'completed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'upcoming':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'paused':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getProgressColor = (progress) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 60) return 'bg-blue-500';
    if (progress >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(new Date(date));
  };

  const getDaysRemaining = (endDate) => {
    const now = new Date();
    const end = new Date(endDate);
    const diffTime = end - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const filteredBatches = batches.filter(batch => {
    const matchesSearch = batch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         batch.course.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || batch.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const activeBatches = batches.filter(batch => batch.status === 'active');
  const completedBatches = batches.filter(batch => batch.status === 'completed');
  const totalStudents = batches.reduce((acc, batch) => acc + batch.students.length, 0);
  const averageProgress = batches.length > 0 
    ? Math.round(batches.reduce((acc, batch) => acc + batch.progress, 0) / batches.length)
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">{error}</div>
        <Button onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Batches</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage your training batches and track student progress
          </p>
        </div>
        <Link href="/trainer/batches/new">
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Create Batch
          </Button>
        </Link>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Batches</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{batches.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Students</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalStudents}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Progress</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{averageProgress}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-emerald-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{completedBatches.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Batch Management</CardTitle>
          <CardDescription>
            Search and filter your training batches
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search batches..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="upcoming">Upcoming</option>
              <option value="paused">Paused</option>
            </select>
          </div>

          {/* Batches Grid */}
          {filteredBatches.length === 0 ? (
            <div className="text-center py-12">
              <GraduationCap className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No Batches Found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {searchTerm || filterStatus !== 'all'
                  ? "No batches match your current filters."
                  : "You don't have any batches assigned yet."
                }
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {filteredBatches.map((batch) => (
                <Card key={batch._id} className="hover:shadow-lg transition-shadow duration-200">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                          {batch.name}
                        </CardTitle>
                        <CardDescription className="text-gray-600 dark:text-gray-400 mb-3">
                          {batch.course.description}
                        </CardDescription>
                        <div className="flex items-center gap-2 mb-3">
                          <Badge className={getStatusColor(batch.status)}>
                            {batch.status?.charAt(0).toUpperCase() + batch.status?.slice(1)}
                          </Badge>
                          <Badge variant="outline" className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {batch.students.length} students
                          </Badge>
                        </div>
                      </div>
                      <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                        <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* Progress Section */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Course Progress
                        </span>
                        <span className="text-sm font-bold text-gray-900 dark:text-white">
                          {batch.progress}%
                        </span>
                      </div>
                      <Progress 
                        value={batch.progress} 
                        className="h-2"
                      />
                      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                        <span>{batch.completedSessions} of {batch.totalSessions} sessions completed</span>
                        <span>{batch.totalSessions - batch.completedSessions} remaining</span>
                      </div>
                    </div>

                    {/* Batch Details */}
                    <div className="space-y-2 text-sm mb-4">
                      <div className="flex items-center text-gray-600 dark:text-gray-400">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>{formatDate(batch.startDate)} - {formatDate(batch.endDate)}</span>
                      </div>
                      <div className="flex items-center text-gray-600 dark:text-gray-400">
                        <Clock className="h-4 w-4 mr-2" />
                        <span>{batch.schedule}</span>
                      </div>
                      <div className="flex items-center text-gray-600 dark:text-gray-400">
                        <MapPin className="h-4 w-4 mr-2" />
                        <span>{batch.location}</span>
                      </div>
                      {batch.status === 'active' && (
                        <div className="flex items-center text-gray-600 dark:text-gray-400">
                          <AlertCircle className="h-4 w-4 mr-2" />
                          <span>{getDaysRemaining(batch.endDate)} days remaining</span>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Link href={`/trainer/batches/${batch._id}`} className="flex-1">
                        <Button className="w-full bg-blue-600 hover:bg-blue-700">
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      </Link>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common batch management tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Link href="/trainer/batches/new">
              <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center">
                <Plus className="h-6 w-6 mb-2" />
                <span>Create Batch</span>
              </Button>
            </Link>
            <Link href="/trainer/students">
              <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center">
                <Users className="h-6 w-6 mb-2" />
                <span>Manage Students</span>
              </Button>
            </Link>
            <Link href="/trainer/schedule">
              <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center">
                <Calendar className="h-6 w-6 mb-2" />
                <span>Schedule Sessions</span>
              </Button>
            </Link>
            <Link href="/trainer/materials">
              <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center">
                <BookOpen className="h-6 w-6 mb-2" />
                <span>Upload Materials</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
