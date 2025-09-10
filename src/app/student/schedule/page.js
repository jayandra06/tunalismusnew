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
  Video,
  CheckCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Filter,
  Download
} from "lucide-react";
import JitsiMeetButton from "@/components/ui/jitsi-meet-button";

export default function StudentSchedulePage() {
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('week'); // 'day', 'week', 'month'
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'upcoming', 'completed', 'cancelled'

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/student/schedule', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setSchedule(data.sessions || []);
        } else {
          // Mock data for now
          setSchedule([
            {
              _id: '1',
              title: 'React Components Deep Dive',
              course: 'React Fundamentals',
              batch: 'Batch A',
              type: 'lecture',
              date: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
              startTime: '10:00',
              endTime: '12:00',
              duration: 120,
              location: 'Online - Zoom',
              instructor: 'John Doe',
              status: 'upcoming',
              description: 'Learn about React components, props, and state management'
            },
            {
              _id: '2',
              title: 'JavaScript Async Programming',
              course: 'JavaScript Advanced',
              batch: 'Batch B',
              type: 'workshop',
              date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Day after tomorrow
              startTime: '14:00',
              endTime: '17:00',
              duration: 180,
              location: 'Classroom 101',
              instructor: 'Jane Smith',
              status: 'upcoming',
              description: 'Hands-on workshop on promises, async/await, and error handling'
            },
            {
              _id: '3',
              title: 'Project Review Session',
              course: 'React Fundamentals',
              batch: 'Batch A',
              type: 'review',
              date: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
              startTime: '15:00',
              endTime: '16:30',
              duration: 90,
              location: 'Online - Zoom',
              instructor: 'John Doe',
              status: 'completed',
              description: 'Review of student projects and feedback session'
            }
          ]);
        }
      } catch (error) {
        console.error('Error fetching schedule:', error);
        setError('Error loading schedule');
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'upcoming':
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

  const filteredSchedule = schedule.filter(session => {
    if (filterStatus === 'all') return true;
    return session.status === filterStatus;
  });

  const upcomingSessions = schedule.filter(session => 
    session.status === 'upcoming' && new Date(session.date) >= new Date()
  );

  const todaySessions = schedule.filter(session => {
    const sessionDate = new Date(session.date);
    const today = new Date();
    return sessionDate.toDateString() === today.toDateString();
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Schedule</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          View your upcoming sessions, classes, and important dates
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
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
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Upcoming</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{upcomingSessions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {schedule.filter(s => s.status === 'completed').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Schedule</CardTitle>
              <CardDescription>
                {formatDate(currentDate)}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFilterStatus(filterStatus === 'all' ? 'upcoming' : 'all')}
              >
                <Filter className="h-4 w-4 mr-2" />
                {filterStatus === 'all' ? 'Show Upcoming' : 'Show All'}
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredSchedule.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No Sessions Found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {filterStatus === 'all' 
                  ? "You don't have any sessions scheduled yet."
                  : `No ${filterStatus} sessions found.`
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredSchedule.map((session) => (
                <Card key={session._id} className="hover:shadow-md transition-shadow duration-200">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
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
                        
                        <p className="text-gray-600 dark:text-gray-400 mb-3">
                          {session.description}
                        </p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                          <div className="flex items-center text-gray-600 dark:text-gray-400">
                            <BookOpen className="h-4 w-4 mr-2" />
                            <span>{session.course}</span>
                          </div>
                          <div className="flex items-center text-gray-600 dark:text-gray-400">
                            <Users className="h-4 w-4 mr-2" />
                            <span>{session.batch}</span>
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
                        
                        <div className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                          Instructor: {session.instructor} • Duration: {session.duration} minutes
                        </div>
                      </div>
                      
                      <div className="ml-4 flex flex-col gap-2">
                        <JitsiMeetButton
                          batchId={session.batchId || session._id}
                          batchName={session.title || session.course}
                          meetingUrl={session.meetingUrl}
                          roomPassword={session.roomPassword}
                          isActive={session.isActive || session.status === 'active'}
                          userRole="student"
                          onMeetingJoin={() => {
                            console.log('Student joined meeting for session:', session._id);
                          }}
                          className="min-w-[120px]"
                        />
                        <Button variant="outline" size="sm">
                          View Details
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

      {/* Today's Sessions (if any) */}
      {todaySessions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="h-5 w-5 mr-2 text-green-600" />
              Today's Sessions
            </CardTitle>
            <CardDescription>
              Your sessions for today
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {todaySessions.map((session) => (
                <div key={session._id} className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-green-600 flex items-center justify-center">
                      {getTypeIcon(session.type)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{session.title}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {session.course} • {formatTime(session.startTime)} - {formatTime(session.endTime)}
                      </p>
                    </div>
                  </div>
                  <JitsiMeetButton
                    batchId={session.batchId || session._id}
                    batchName={session.title || session.course}
                    meetingUrl={session.meetingUrl}
                    roomPassword={session.roomPassword}
                    isActive={session.isActive || true} // Assume active for today's sessions
                    userRole="student"
                    onMeetingJoin={() => {
                      console.log('Student joined meeting for session:', session._id);
                    }}
                    className="min-w-[120px]"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
