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
import JitsiMeetButton from "@/components/ui/jitsi-meet-button";

export default function BatchDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [batch, setBatch] = useState(null);
  const [students, setStudents] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  const fetchBatchData = async () => {
      try {
        const batchId = params.id;
        
        // Fetch batch details from trainer batches API
        const batchResponse = await fetch(`/api/trainer/batches`, {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          cache: 'no-store'
        });
        
        if (batchResponse.ok) {
          const batchData = await batchResponse.json();
          // Find the specific batch
          const specificBatch = batchData.batches?.find(b => b._id === batchId);
          if (specificBatch) {
            setBatch(specificBatch);
          } else {
            setError('Batch not found');
          }
        } else {
          setError('Failed to fetch batch data');
        }

        // Fetch students
        const studentsResponse = await fetch(`/api/trainer/students`, {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          cache: 'no-store'
        });
        
        if (studentsResponse.ok) {
          const studentsData = await studentsResponse.json();
          // Filter students for this batch
          const batchStudents = studentsData.students?.filter(s => s.batch._id === batchId) || [];
          setStudents(batchStudents);
        } else {
          console.error('Failed to fetch students');
          setStudents([]);
        }

        // Fetch sessions
        const sessionsResponse = await fetch(`/api/trainer/schedule`, {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          cache: 'no-store'
        });
        
        if (sessionsResponse.ok) {
          const sessionsData = await sessionsResponse.json();
          // Filter sessions for this batch
          const batchSessions = sessionsData.sessions?.filter(s => s.batch._id === batchId) || [];
          setSessions(batchSessions);
        } else {
          console.error('Failed to fetch sessions');
          setSessions([]);
        }
      } catch (error) {
        console.error('Error fetching batch data:', error);
        setError('Error loading batch data');
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
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
              {batch.course?.displayName || batch.course?.name || 'Unknown Course'} • {batch.type?.charAt(0).toUpperCase() + batch.type?.slice(1) || 'Regular'} Batch
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {/* Meeting Button */}
          <JitsiMeetButton
            batchId={batch._id}
            batchName={batch.course?.displayName || batch.course?.name || `${batch.course?.language} ${batch.course?.level}`}
            meetingUrl={batch.meeting?.meetingUrl}
            roomPassword={batch.meeting?.roomPassword}
            isActive={batch.meeting?.isActive}
            userRole="trainer"
            onMeetingStart={() => {
              // Refresh batch to update status
              fetchBatchData();
            }}
            onMeetingEnd={() => {
              // Refresh batch to update status
              fetchBatchData();
            }}
            onMeetingJoin={() => {
              console.log('Trainer joined meeting for batch:', batch._id);
            }}
            className="min-w-[200px]"
          />
          
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

      {/* Meeting Information */}
      <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-lg bg-blue-600 flex items-center justify-center">
                <Video className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Live Class</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Room: {batch.meeting?.roomName || batch.course?.displayName || batch.course?.name || 'German A1 Sep 2025'}
                </p>
                {(batch.meeting?.roomPassword || '242F281E') && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Password: {batch.meeting?.roomPassword || '242F281E'}
                  </p>
                )}
              </div>
            </div>
            <div className="text-right">
              {batch.meeting?.isActive ? (
                <div className="flex items-center space-x-2 text-green-600">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium">Live</span>
                </div>
              ) : (
                <div className="text-sm text-gray-500">Ready to start</div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

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
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{averageProgress}%</div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Progress</p>
            <Progress value={averageProgress} className="h-2 mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{students.length}</div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Students</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Max: {batch.maxStudents || 'N/A'}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {sessions.filter(s => s.status === 'completed').length}/{sessions.length}
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
                <p className="text-gray-600 dark:text-gray-400">{batch.course?.description || batch.description || 'No description available'}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Start Date:</span>
                  <p className="text-gray-600 dark:text-gray-400">{batch.startDate ? formatDate(batch.startDate) : 'TBD'}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">End Date:</span>
                  <p className="text-gray-600 dark:text-gray-400">{batch.endDate ? formatDate(batch.endDate) : 'TBD'}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Schedule:</span>
                  <p className="text-gray-600 dark:text-gray-400">{batch.schedule || 'TBD'}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Location:</span>
                  <p className="text-gray-600 dark:text-gray-400">{batch.location || 'Online'}</p>
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
