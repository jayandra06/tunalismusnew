"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  BookOpen,
  Plus,
  Edit,
  Eye,
  Video,
  CheckCircle,
  AlertCircle,
  Filter,
  ChevronLeft,
  ChevronRight,
  Download,
  Bell
} from "lucide-react";
import Link from "next/link";

export default function TrainerSchedulePage() {
  const [sessions, setSessions] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('week'); // 'day', 'week', 'month'
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'upcoming', 'completed', 'cancelled'
  const [filterBatch, setFilterBatch] = useState('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch sessions and batches
        const [sessionsResponse, batchesResponse] = await Promise.all([
          fetch('/api/trainer/sessions', {
            credentials: 'include'
          }),
          fetch('/api/trainer/batches', {
            credentials: 'include'
          })
        ]);
        
        if (sessionsResponse.ok) {
          const sessionsData = await sessionsResponse.json();
          setSessions(sessionsData.sessions || []);
        } else {
          console.error('Failed to fetch sessions:', sessionsResponse.status, sessionsResponse.statusText);
          setSessions([]);
        }
        
        if (batchesResponse.ok) {
          const batchesData = await batchesResponse.json();
          setBatches(batchesData.batches || []);
        } else {
          console.error('Failed to fetch batches:', batchesResponse.status, batchesResponse.statusText);
          setBatches([]);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Error loading schedule data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'lecture':
        return <BookOpen className="h-4 w-4" />;
      case 'workshop':
        return <Users className="h-4 w-4" />;
      case 'review':
        return <CheckCircle className="h-4 w-4" />;
      case 'exam':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Video className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'lecture':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'workshop':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'review':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      case 'exam':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  const formatTime = (time) => {
    return time;
  };

  const getTimeAgo = (date) => {
    const now = new Date();
    const diffTime = Math.abs(now - new Date(date));
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays < 7) return `In ${diffDays} days`;
    return formatDate(date);
  };

  const filteredSessions = sessions.filter(session => {
    const matchesStatus = filterStatus === 'all' || session.status === filterStatus;
    const matchesBatch = filterBatch === 'all' || session.batch._id === filterBatch;
    
    return matchesStatus && matchesBatch;
  });

  const upcomingSessions = sessions.filter(session => 
    session.status === 'scheduled' && new Date(session.date) >= new Date()
  );

  const todaySessions = sessions.filter(session => {
    const sessionDate = new Date(session.date);
    const today = new Date();
    return sessionDate.toDateString() === today.toDateString();
  });

  const thisWeekSessions = sessions.filter(session => {
    const sessionDate = new Date(session.date);
    const now = new Date();
    const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
    const weekEnd = new Date(now.setDate(now.getDate() - now.getDay() + 6));
    return sessionDate >= weekStart && sessionDate <= weekEnd;
  });

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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Schedule</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage your training sessions and classes
          </p>
        </div>
        <Link href="/trainer/sessions/new">
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Schedule Session
          </Button>
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Today's Sessions</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{todaySessions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">This Week</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{thisWeekSessions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Upcoming</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{upcomingSessions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Students</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {sessions.reduce((acc, s) => acc + s.students, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Today's Sessions (if any) */}
      {todaySessions.length > 0 && (
        <Card className="border-blue-200 bg-blue-50 dark:bg-blue-900/10">
          <CardHeader>
            <CardTitle className="flex items-center text-blue-800 dark:text-blue-400">
              <Bell className="h-5 w-5 mr-2" />
              Today's Sessions
            </CardTitle>
            <CardDescription className="text-blue-700 dark:text-blue-300">
              Your sessions for today
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {todaySessions.map((session) => (
                <div key={session._id} className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-lg bg-blue-600 flex items-center justify-center">
                      {getTypeIcon(session.type)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{session.title}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {session.batch.name} • {formatTime(session.startTime)} - {formatTime(session.endTime)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                      <Video className="h-4 w-4 mr-2" />
                      Start Session
                    </Button>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Schedule Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Schedule Management</CardTitle>
              <CardDescription>
                {formatDate(currentDate)}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
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
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredSessions.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No Sessions Found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {filterStatus !== 'all' || filterBatch !== 'all'
                  ? "No sessions match your current filters."
                  : "You don't have any sessions scheduled yet."
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredSessions.map((session) => (
                <Card key={session._id} className="hover:shadow-md transition-shadow duration-200">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="flex items-center gap-2">
                            {getTypeIcon(session.type)}
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                              {session.title}
                            </h3>
                          </div>
                          <Badge className={getStatusColor(session.status)}>
                            {session.status?.charAt(0).toUpperCase() + session.status?.slice(1)}
                          </Badge>
                          <Badge variant="outline" className={getTypeColor(session.type)}>
                            {session.type?.charAt(0).toUpperCase() + session.type?.slice(1)}
                          </Badge>
                        </div>
                        
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                          {session.description}
                        </p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm mb-4">
                          <div className="flex items-center text-gray-600 dark:text-gray-400">
                            <BookOpen className="h-4 w-4 mr-2" />
                            <span>{session.batch.name}</span>
                          </div>
                          <div className="flex items-center text-gray-600 dark:text-gray-400">
                            <Users className="h-4 w-4 mr-2" />
                            <span>{session.students} students</span>
                          </div>
                          <div className="flex items-center text-gray-600 dark:text-gray-400">
                            <Clock className="h-4 w-4 mr-2" />
                            <span>{formatTime(session.startTime)} - {formatTime(session.endTime)}</span>
                          </div>
                          <div className="flex items-center text-gray-600 dark:text-gray-400">
                            <MapPin className="h-4 w-4 mr-2" />
                            <span>{session.location}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center text-gray-500 dark:text-gray-400">
                            <Calendar className="h-4 w-4 mr-2" />
                            <span>{getTimeAgo(session.date)} • Duration: {session.duration} minutes</span>
                          </div>
                          {session.materials && session.materials.length > 0 && (
                            <div className="flex items-center text-gray-500 dark:text-gray-400">
                              <span>{session.materials.length} materials</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="ml-4 flex flex-col gap-2">
                        {session.status === 'scheduled' ? (
                          <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                            <Video className="h-4 w-4 mr-2" />
                            Start Session
                          </Button>
                        ) : (
                          <Button size="sm" variant="outline">
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Completed
                          </Button>
                        )}
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          View
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
    </div>
  );
}
