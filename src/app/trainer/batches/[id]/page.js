"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  BookOpen, 
  Users, 
  Calendar, 
  Clock,
  MapPin,
  Edit,
  ArrowLeft,
  Plus,
  Eye,
  MessageSquare,
  Award,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  UserPlus,
  FileText,
  Video
} from "lucide-react";
import Link from "next/link";

export default function BatchDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [batch, setBatch] = useState(null);
  const [students, setStudents] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchBatchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const batchId = params.id;
        
        // Fetch batch details
        const batchResponse = await fetch(`/api/batches/${batchId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (batchResponse.ok) {
          const batchData = await batchResponse.json();
          setBatch(batchData.batch);
        } else {
          // Mock data for now
          setBatch({
            _id: batchId,
            name: 'React Fundamentals - Batch A',
            course: {
              _id: 'course1',
              title: 'React Fundamentals',
              description: 'Learn the basics of React development'
            },
            startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            maxStudents: 25,
            schedule: 'Mon, Wed, Fri 10:00 AM - 12:00 PM',
            location: 'Online - Zoom',
            type: 'regular',
            status: 'active',
            progress: 65,
            totalSessions: 20,
            completedSessions: 13,
            description: 'This batch covers React fundamentals including components, props, state, and lifecycle methods.'
          });
        }

        // Fetch students
        const studentsResponse = await fetch(`/api/trainer/students`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (studentsResponse.ok) {
          const studentsData = await studentsResponse.json();
          // Filter students for this batch
          const batchStudents = studentsData.students?.filter(s => s.batch._id === batchId) || [];
          setStudents(batchStudents);
        } else {
          // Mock data
          setStudents([
            {
              _id: '1',
              name: 'John Doe',
              email: 'john@example.com',
              phone: '+1 (555) 123-4567',
              progress: 75,
              attendance: 85,
              assignments: { completed: 8, total: 10 },
              lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000),
              status: 'active',
              joinDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
              performance: 'excellent'
            },
            {
              _id: '2',
              name: 'Jane Smith',
              email: 'jane@example.com',
              phone: '+1 (555) 234-5678',
              progress: 60,
              attendance: 90,
              assignments: { completed: 6, total: 10 },
              lastActivity: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
              status: 'active',
              joinDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
              performance: 'good'
            },
            {
              _id: '3',
              name: 'Mike Johnson',
              email: 'mike@example.com',
              phone: '+1 (555) 345-6789',
              progress: 45,
              attendance: 70,
              assignments: { completed: 4, total: 10 },
              lastActivity: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
              status: 'at-risk',
              joinDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
              performance: 'needs-improvement'
            }
          ]);
        }

        // Fetch sessions
        const sessionsResponse = await fetch(`/api/trainer/schedule`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (sessionsResponse.ok) {
          const sessionsData = await sessionsResponse.json();
          // Filter sessions for this batch
          const batchSessions = sessionsData.sessions?.filter(s => s.batch._id === batchId) || [];
          setSessions(batchSessions);
        } else {
          // Mock data
          setSessions([
            {
              _id: '1',
              title: 'React Components Deep Dive',
              type: 'lecture',
              date: new Date(Date.now() + 24 * 60 * 60 * 1000),
              startTime: '10:00',
              endTime: '12:00',
              duration: 120,
              location: 'Online - Zoom',
              status: 'scheduled',
              description: 'Learn about React components, props, and state management'
            },
            {
              _id: '2',
              title: 'Project Review Session',
              type: 'review',
              date: new Date(Date.now() - 24 * 60 * 60 * 1000),
              startTime: '15:00',
              endTime: '16:30',
              duration: 90,
              location: 'Online - Zoom',
              status: 'completed',
              description: 'Review of student projects and feedback session'
            }
          ]);
        }
      } catch (error) {
        console.error('Error fetching batch data:', error);
        setError('Error loading batch data');
      } finally {
        setLoading(false);
      }
    };

    fetchBatchData();
  }, [params.id]);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !batch) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">{error || 'Batch not found'}</div>
        <Link href="/trainer/batches">
          <Button>Back to Batches</Button>
        </Link>
      </div>
    );
  }

  const activeStudents = students.filter(s => s.status === 'active');
  const atRiskStudents = students.filter(s => s.status === 'at-risk');
  const averageProgress = students.length > 0 
    ? Math.round(students.reduce((acc, s) => acc + s.progress, 0) / students.length)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/trainer/batches">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Batches
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{batch.name}</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              {batch.course.title} • {batch.type.charAt(0).toUpperCase() + batch.type.slice(1)} Batch
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Edit className="h-4 w-4 mr-2" />
            Edit Batch
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Add Student
          </Button>
        </div>
      </div>

      {/* Batch Status and Progress */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Badge className={getStatusColor(batch.status)}>
                {batch.status?.charAt(0).toUpperCase() + batch.status?.slice(1)}
              </Badge>
            </div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mt-2">Status</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{batch.progress}%</div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Progress</p>
            <Progress value={batch.progress} className="h-2 mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{students.length}</div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Students</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Max: {batch.maxStudents}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {batch.completedSessions}/{batch.totalSessions}
            </div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Sessions</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', name: 'Overview', icon: Eye },
            { id: 'students', name: 'Students', icon: Users },
            { id: 'sessions', name: 'Sessions', icon: Calendar },
            { id: 'materials', name: 'Materials', icon: FileText }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {tab.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Batch Information */}
          <Card>
            <CardHeader>
              <CardTitle>Batch Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">Description</h4>
                <p className="text-gray-600 dark:text-gray-400">{batch.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Start Date:</span>
                  <p className="text-gray-600 dark:text-gray-400">{formatDate(batch.startDate)}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">End Date:</span>
                  <p className="text-gray-600 dark:text-gray-400">{formatDate(batch.endDate)}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Schedule:</span>
                  <p className="text-gray-600 dark:text-gray-400">{batch.schedule}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Location:</span>
                  <p className="text-gray-600 dark:text-gray-400">{batch.location}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Student Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>Student Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-2xl font-bold text-green-600">{activeStudents.length}</div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Active Students</p>
                </div>
                <div>
                  <div className="text-2xl font-bold text-yellow-600">{atRiskStudents.length}</div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">At Risk</p>
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">{averageProgress}%</div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Average Progress</p>
                <Progress value={averageProgress} className="h-2 mt-2" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'students' && (
        <Card>
          <CardHeader>
            <CardTitle>Students ({students.length})</CardTitle>
            <CardDescription>Manage students in this batch</CardDescription>
          </CardHeader>
          <CardContent>
            {students.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">No students enrolled yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {students.map((student) => (
                  <div key={student._id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                        <span className="text-blue-600 dark:text-blue-400 font-semibold">
                          {student.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">{student.name}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{student.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{student.progress}%</div>
                        <Progress value={student.progress} className="h-1 w-16" />
                      </div>
                      <Badge className={getStatusColor(student.status)}>
                        {student.status}
                      </Badge>
                      <div className="flex space-x-1">
                        <Button size="sm" variant="outline">
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Award className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === 'sessions' && (
        <Card>
          <CardHeader>
            <CardTitle>Sessions ({sessions.length})</CardTitle>
            <CardDescription>Manage training sessions for this batch</CardDescription>
          </CardHeader>
          <CardContent>
            {sessions.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">No sessions scheduled yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {sessions.map((session) => (
                  <div key={session._id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
                        {session.type === 'lecture' ? <BookOpen className="h-5 w-5 text-white" /> : <Video className="h-5 w-5 text-white" />}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">{session.title}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {formatDate(session.date)} • {session.startTime} - {session.endTime}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(session.status)}>
                        {session.status}
                      </Badge>
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === 'materials' && (
        <Card>
          <CardHeader>
            <CardTitle>Course Materials</CardTitle>
            <CardDescription>Materials specific to this batch</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">No materials uploaded yet</p>
              <Button className="mt-4" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Upload Material
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
