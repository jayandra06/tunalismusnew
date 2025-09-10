"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Video, 
  Clock, 
  Users, 
  Calendar,
  Play,
  CheckCircle,
  AlertCircle,
  BookOpen,
  ExternalLink
} from "lucide-react";
import Link from "next/link";
import JitsiMeetButton from "@/components/ui/jitsi-meet-button";

export default function JoinClassPage() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        // Fetch student's enrolled batches/courses
        const response = await fetch('/api/student/batches', {
          credentials: 'include'
        });
        
        if (response.ok) {
          const data = await response.json();
          setClasses(data.batches || []);
        } else {
          setError('Failed to fetch classes');
        }
      } catch (error) {
        console.error('Error fetching classes:', error);
        setError('Error loading classes');
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'live':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'upcoming':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
      case 'live':
        return <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>;
      case 'upcoming':
        return <Clock className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Join Class</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Access your live classes and join your learning sessions
        </p>
      </div>

      {/* Live Classes Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Video className="h-5 w-5 mr-2 text-green-600" />
            Live Classes
          </CardTitle>
          <CardDescription>
            Classes currently in session
          </CardDescription>
        </CardHeader>
        <CardContent>
          {classes.filter(c => c.status === 'active' || c.meeting?.isActive).length === 0 ? (
            <div className="text-center py-8">
              <Video className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No Live Classes
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                There are no live classes at the moment. Check back later or view your schedule.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {classes
                .filter(c => c.status === 'active' || c.meeting?.isActive)
                .map((classItem) => (
                <div key={classItem._id} className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-full bg-green-600 flex items-center justify-center">
                      <Video className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {classItem.course?.displayName || classItem.course?.name || `${classItem.course?.language} ${classItem.course?.level}`}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        <Clock className="h-4 w-4 inline mr-1" />
                        {classItem.batchType?.charAt(0).toUpperCase() + classItem.batchType?.slice(1)} Batch {classItem.batchNumber}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        <Users className="h-3 w-3 inline mr-1" />
                        {classItem.currentStudents || 0} students online
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <div className="flex items-center space-x-2 text-green-600">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium">Live Now</span>
                    </div>
                    <JitsiMeetButton
                      batchId={classItem._id}
                      batchName={classItem.course?.displayName || classItem.course?.name || `${classItem.course?.language} ${classItem.course?.level}`}
                      meetingUrl={classItem.meeting?.meetingUrl}
                      roomPassword={classItem.meeting?.roomPassword}
                      isActive={classItem.meeting?.isActive || classItem.status === 'active'}
                      userRole="student"
                      onMeetingJoin={() => {
                        console.log('Student joined live class:', classItem.course?.displayName);
                      }}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* All Classes Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BookOpen className="h-5 w-5 mr-2 text-blue-600" />
            All My Classes
          </CardTitle>
          <CardDescription>
            All your enrolled courses and batches
          </CardDescription>
        </CardHeader>
        <CardContent>
          {classes.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No Classes Enrolled
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                You haven't enrolled in any classes yet.
              </p>
              <Link href="/student/courses">
                <Button>Browse Courses</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {classes.map((classItem) => (
                <Card key={classItem._id} className="hover:shadow-lg transition-shadow duration-200">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                          {classItem.course?.displayName || classItem.course?.name || `${classItem.course?.language} ${classItem.course?.level}`}
                        </CardTitle>
                        <CardDescription className="text-gray-600 dark:text-gray-400 mb-3">
                          {classItem.batchType?.charAt(0).toUpperCase() + classItem.batchType?.slice(1)} Batch {classItem.batchNumber}
                        </CardDescription>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(classItem.status)}>
                            <div className="flex items-center gap-1">
                              {getStatusIcon(classItem.status)}
                              {classItem.status?.charAt(0).toUpperCase() + classItem.status?.slice(1)}
                            </div>
                          </Badge>
                        </div>
                      </div>
                      <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                        <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <Users className="h-4 w-4 mr-2" />
                        <span>{classItem.currentStudents || 0} / {classItem.maxStudents || 0} students</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>{classItem.startDate ? new Date(classItem.startDate).toLocaleDateString() : 'N/A'}</span>
                      </div>
                      
                      <div className="pt-2">
                        <JitsiMeetButton
                          batchId={classItem._id}
                          batchName={classItem.course?.displayName || classItem.course?.name || `${classItem.course?.language} ${classItem.course?.level}`}
                          meetingUrl={classItem.meeting?.meetingUrl}
                          roomPassword={classItem.meeting?.roomPassword}
                          isActive={classItem.meeting?.isActive}
                          userRole="student"
                          onMeetingJoin={() => {
                            console.log('Student joined class:', classItem.course?.displayName);
                          }}
                          className="w-full"
                        />
                      </div>
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
            Common tasks and shortcuts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Link href="/student/schedule">
              <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center">
                <Calendar className="h-6 w-6 mb-2" />
                <span>View Schedule</span>
              </Button>
            </Link>
            <Link href="/student/courses">
              <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center">
                <BookOpen className="h-6 w-6 mb-2" />
                <span>My Courses</span>
              </Button>
            </Link>
            <Link href="/student/materials">
              <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center">
                <ExternalLink className="h-6 w-6 mb-2" />
                <span>Materials</span>
              </Button>
            </Link>
            <Link href="/student/dashboard">
              <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center">
                <CheckCircle className="h-6 w-6 mb-2" />
                <span>Dashboard</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
