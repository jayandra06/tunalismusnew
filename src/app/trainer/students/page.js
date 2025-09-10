"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Users, 
  BookOpen, 
  TrendingUp, 
  Clock,
  CheckCircle,
  AlertCircle,
  Search,
  Filter,
  Eye,
  MessageSquare,
  Award,
  Calendar,
  Mail,
  Phone,
  MapPin,
  Star,
  UserCheck,
  UserX
} from "lucide-react";

export default function TrainerStudentsPage() {
  const [students, setStudents] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBatch, setFilterBatch] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const fetchData = async () => {
    try {
      console.log('🔄 Fetching trainer students and batches...');
      
      // Fetch students and batches
      const [studentsResponse, batchesResponse] = await Promise.all([
        fetch('/api/trainer/students', {
          credentials: 'include'
        }),
        fetch('/api/trainer/batches', {
          credentials: 'include'
        })
      ]);
        
        if (studentsResponse.ok) {
          const studentsData = await studentsResponse.json();
          setStudents(studentsData.students || []);
        } else {
          // Mock data for now
          setStudents([
            {
              _id: '1',
              name: 'John Doe',
              email: 'john@example.com',
              phone: '+1 (555) 123-4567',
              batch: {
                _id: 'batch1',
                name: 'React Fundamentals - Batch A',
                course: { title: 'React Fundamentals' }
              },
              progress: 75,
              attendance: 85,
              assignments: { completed: 8, total: 10 },
              lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
              status: 'active',
              joinDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
              performance: 'excellent'
            },
            {
              _id: '2',
              name: 'Jane Smith',
              email: 'jane@example.com',
              phone: '+1 (555) 234-5678',
              batch: {
                _id: 'batch1',
                name: 'React Fundamentals - Batch A',
                course: { title: 'React Fundamentals' }
              },
              progress: 60,
              attendance: 90,
              assignments: { completed: 6, total: 10 },
              lastActivity: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
              status: 'active',
              joinDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000), // 25 days ago
              performance: 'good'
            },
            {
              _id: '3',
              name: 'Mike Johnson',
              email: 'mike@example.com',
              phone: '+1 (555) 345-6789',
              batch: {
                _id: 'batch1',
                name: 'React Fundamentals - Batch A',
                course: { title: 'React Fundamentals' }
              },
              progress: 45,
              attendance: 70,
              assignments: { completed: 4, total: 10 },
              lastActivity: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
              status: 'at-risk',
              joinDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), // 20 days ago
              performance: 'needs-improvement'
            },
            {
              _id: '4',
              name: 'Sarah Wilson',
              email: 'sarah@example.com',
              phone: '+1 (555) 456-7890',
              batch: {
                _id: 'batch2',
                name: 'JavaScript Advanced - Batch B',
                course: { title: 'JavaScript Advanced' }
              },
              progress: 80,
              attendance: 95,
              assignments: { completed: 12, total: 15 },
              lastActivity: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
              status: 'active',
              joinDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
              performance: 'excellent'
            },
            {
              _id: '5',
              name: 'David Brown',
              email: 'david@example.com',
              phone: '+1 (555) 567-8901',
              batch: {
                _id: 'batch2',
                name: 'JavaScript Advanced - Batch B',
                course: { title: 'JavaScript Advanced' }
              },
              progress: 55,
              attendance: 80,
              assignments: { completed: 8, total: 15 },
              lastActivity: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
              status: 'active',
              joinDate: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000), // 12 days ago
              performance: 'good'
            }
          ]);
        }
        
        if (batchesResponse.ok) {
          const batchesData = await batchesResponse.json();
          setBatches(batchesData.batches || []);
        } else {
          setBatches([
            { _id: 'batch1', name: 'React Fundamentals - Batch A' },
            { _id: 'batch2', name: 'JavaScript Advanced - Batch B' }
          ]);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Error loading student data');
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    fetchData();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'at-risk':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'inactive':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'completed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getPerformanceColor = (performance) => {
    switch (performance) {
      case 'excellent':
        return 'text-green-600';
      case 'good':
        return 'text-blue-600';
      case 'needs-improvement':
        return 'text-yellow-600';
      case 'poor':
        return 'text-red-600';
      default:
        return 'text-gray-600';
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

  const getTimeAgo = (date) => {
    const now = new Date();
    const diffTime = Math.abs(now - new Date(date));
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays < 7) return `${diffDays} days ago`;
    return formatDate(date);
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBatch = filterBatch === 'all' || student.batch._id === filterBatch;
    const matchesStatus = filterStatus === 'all' || student.status === filterStatus;
    
    return matchesSearch && matchesBatch && matchesStatus;
  });

  const activeStudents = students.filter(s => s.status === 'active');
  const atRiskStudents = students.filter(s => s.status === 'at-risk');
  const averageProgress = students.length > 0 
    ? Math.round(students.reduce((acc, s) => acc + s.progress, 0) / students.length)
    : 0;
  const averageAttendance = students.length > 0 
    ? Math.round(students.reduce((acc, s) => acc + s.attendance, 0) / students.length)
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
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Students</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Monitor student progress and manage your class
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Students</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{students.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <UserCheck className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{activeStudents.length}</p>
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
              <AlertCircle className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">At Risk</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{atRiskStudents.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Student Management</CardTitle>
          <CardDescription>
            Search and filter your students
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <select
              value={filterBatch}
              onChange={(e) => setFilterBatch(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="all">All Batches</option>
              {batches.map(batch => (
                <option key={batch._id} value={batch._id}>
                  {batch.name}
                </option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="at-risk">At Risk</option>
              <option value="inactive">Inactive</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          {/* Students List */}
          {filteredStudents.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No Students Found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {searchTerm || filterBatch !== 'all' || filterStatus !== 'all'
                  ? "No students match your current filters."
                  : "You don't have any students assigned yet."
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredStudents.map((student) => (
                <Card key={student._id} className="hover:shadow-md transition-shadow duration-200">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                          <span className="text-blue-600 dark:text-blue-400 font-semibold text-lg">
                            {student.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                              {student.name}
                            </h3>
                            <Badge className={getStatusColor(student.status)}>
                              {student.status?.charAt(0).toUpperCase() + student.status?.slice(1)}
                            </Badge>
                            <Badge variant="outline" className={getPerformanceColor(student.performance)}>
                              {student.performance?.replace('-', ' ')}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm mb-4">
                            <div className="flex items-center text-gray-600 dark:text-gray-400">
                              <Mail className="h-4 w-4 mr-2" />
                              <span>{student.email}</span>
                            </div>
                            <div className="flex items-center text-gray-600 dark:text-gray-400">
                              <Phone className="h-4 w-4 mr-2" />
                              <span>{student.phone}</span>
                            </div>
                            <div className="flex items-center text-gray-600 dark:text-gray-400">
                              <BookOpen className="h-4 w-4 mr-2" />
                              <span>{student.batch.name}</span>
                            </div>
                            <div className="flex items-center text-gray-600 dark:text-gray-400">
                              <Calendar className="h-4 w-4 mr-2" />
                              <span>Joined {formatDate(student.joinDate)}</span>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                  Progress
                                </span>
                                <span className="text-sm font-bold text-gray-900 dark:text-white">
                                  {student.progress}%
                                </span>
                              </div>
                              <Progress value={student.progress} className="h-2" />
                            </div>
                            
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                  Attendance
                                </span>
                                <span className="text-sm font-bold text-gray-900 dark:text-white">
                                  {student.attendance}%
                                </span>
                              </div>
                              <Progress value={student.attendance} className="h-2" />
                            </div>
                            
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                  Assignments
                                </span>
                                <span className="text-sm font-bold text-gray-900 dark:text-white">
                                  {student.assignments.completed}/{student.assignments.total}
                                </span>
                              </div>
                              <Progress 
                                value={(student.assignments.completed / student.assignments.total) * 100} 
                                className="h-2" 
                              />
                            </div>
                          </div>
                          
                          <div className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                            Last activity: {getTimeAgo(student.lastActivity)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="ml-4 flex flex-col gap-2">
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                        <Button variant="outline" size="sm">
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Message
                        </Button>
                        <Button variant="outline" size="sm">
                          <Award className="h-4 w-4 mr-2" />
                          Grade
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* At-Risk Students Alert */}
      {atRiskStudents.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-900/10">
          <CardHeader>
            <CardTitle className="flex items-center text-yellow-800 dark:text-yellow-400">
              <AlertCircle className="h-5 w-5 mr-2" />
              Students Needing Attention
            </CardTitle>
            <CardDescription className="text-yellow-700 dark:text-yellow-300">
              These students may need additional support or intervention
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {atRiskStudents.slice(0, 3).map((student) => (
                <div key={student._id} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center">
                      <span className="text-yellow-600 dark:text-yellow-400 font-semibold text-sm">
                        {student.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{student.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {student.batch.name} • {student.progress}% progress
                      </p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" className="border-yellow-300 text-yellow-700 hover:bg-yellow-100 dark:border-yellow-600 dark:text-yellow-400 dark:hover:bg-yellow-900/20">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Contact
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
