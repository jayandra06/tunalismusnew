"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  BookOpen, 
  Calendar, 
  TrendingUp, 
  Clock,
  CheckCircle,
  Play,
  Eye,
  Download,
  Video,
  Users
} from "lucide-react";
import Link from "next/link";
import JitsiMeetButton from "@/components/ui/jitsi-meet-button";

export default function StudentDashboard() {
  const [stats, setStats] = useState({
    enrolledCourses: 0,
    completedCourses: 0,
    upcomingSessions: 0,
    totalHours: 0,
    averageProgress: 0,
    certificates: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch student dashboard stats
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/student/stats', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      title: "Enrolled Courses",
      value: stats.enrolledCourses,
      icon: BookOpen,
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900/20",
      description: "Active courses"
    },
    {
      title: "Completed Courses",
      value: stats.completedCourses,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900/20",
      description: "Finished courses"
    },
    {
      title: "Upcoming Sessions",
      value: stats.upcomingSessions,
      icon: Calendar,
      color: "text-purple-600",
      bgColor: "bg-purple-100 dark:bg-purple-900/20",
      description: "This week"
    },
    {
      title: "Learning Hours",
      value: `${stats.totalHours}h`,
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-100 dark:bg-orange-900/20",
      description: "Total time spent"
    },
    {
      title: "Average Progress",
      value: `${stats.averageProgress}%`,
      icon: TrendingUp,
      color: "text-cyan-600",
      bgColor: "bg-cyan-100 dark:bg-cyan-900/20",
      description: "Overall completion"
    },
    {
      title: "Certificates",
      value: stats.certificates,
      icon: CheckCircle,
      color: "text-emerald-600",
      bgColor: "bg-emerald-100 dark:bg-emerald-900/20",
      description: "Earned certificates"
    }
  ];

  const quickActions = [
    {
      title: "Continue Learning",
      description: "Resume your courses",
      icon: Play,
      href: "/student/courses",
      color: "bg-blue-600 hover:bg-blue-700"
    },
    {
      title: "View Schedule",
      description: "Upcoming sessions",
      icon: Calendar,
      href: "/student/schedule",
      color: "bg-green-600 hover:bg-green-700"
    },
    {
      title: "Download Materials",
      description: "Course resources",
      icon: Download,
      href: "/student/materials",
      color: "bg-purple-600 hover:bg-purple-700"
    },
    {
      title: "View Progress",
      description: "Track your learning",
      icon: TrendingUp,
      href: "/student/progress",
      color: "bg-orange-600 hover:bg-orange-700"
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Student Dashboard</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Welcome back! Continue your learning journey.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stat.value}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Link key={index} href={action.href}>
                <Card className="hover:shadow-lg transition-all duration-200 hover:scale-105 cursor-pointer">
                  <CardHeader className="pb-3">
                    <div className={`w-12 h-12 rounded-lg ${action.color} flex items-center justify-center mb-3`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                      {action.title}
                    </CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-400">
                      {action.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BookOpen className="h-5 w-5 mr-2 text-blue-600" />
              My Courses
            </CardTitle>
            <CardDescription>
              Your enrolled courses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* German A1 Course */}
              <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
                    <BookOpen className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">German A1</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Progress: 75%</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <JitsiMeetButton
                    batchId="german-a1-batch-1"
                    batchName="German A1 - Batch 1"
                    userRole="student"
                    onMeetingJoin={() => console.log('Joined German A1 class')}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  />
                  <Button variant="outline" size="sm">
                    <Play className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {/* German B1 Course */}
              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-lg bg-green-600 flex items-center justify-center">
                    <BookOpen className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">German B1</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Progress: 45%</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <JitsiMeetButton
                    batchId="german-b1-batch-1"
                    batchName="German B1 - Batch 1"
                    userRole="student"
                    onMeetingJoin={() => console.log('Joined German B1 class')}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  />
                  <Button variant="outline" size="sm">
                    <Play className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {/* English Course */}
              <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-600 flex items-center justify-center">
                    <BookOpen className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">English Intermediate</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Progress: 60%</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <JitsiMeetButton
                    batchId="english-intermediate-batch-1"
                    batchName="English Intermediate - Batch 1"
                    userRole="student"
                    onMeetingJoin={() => console.log('Joined English class')}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  />
                  <Button variant="outline" size="sm">
                    <Play className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-green-600" />
              Upcoming Sessions
            </CardTitle>
            <CardDescription>
              Your next learning sessions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">React Components</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">React Fundamentals</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-purple-600">Today, 2:00 PM</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">2 hours</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Async JavaScript</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">JavaScript Advanced</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-orange-600">Tomorrow, 10:00 AM</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">3 hours</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Today's Classes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Video className="h-5 w-5 mr-2 text-green-600" />
            Today's Classes
          </CardTitle>
          <CardDescription>
            Your live classes for today
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* German A1 Class */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full bg-green-600 flex items-center justify-center">
                  <Video className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">German A1 - Live Class</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <Clock className="h-4 w-4 inline mr-1" />
                    10:00 AM - 11:30 AM
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    <Users className="h-3 w-3 inline mr-1" />
                    Instructor: Maria Schmidt
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-end space-y-2">
                <div className="flex items-center space-x-2 text-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium">Live Now</span>
                </div>
                <JitsiMeetButton
                  batchId="german-a1-batch-1"
                  batchName="German A1 - Live Class"
                  userRole="student"
                  isActive={true}
                  onMeetingJoin={() => console.log('Joined German A1 live class')}
                  className="bg-green-600 hover:bg-green-700 text-white"
                />
              </div>
            </div>

            {/* English Class */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center">
                  <Video className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">English Intermediate - Live Class</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <Clock className="h-4 w-4 inline mr-1" />
                    2:00 PM - 3:30 PM
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    <Users className="h-3 w-3 inline mr-1" />
                    Instructor: John Smith
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-end space-y-2">
                <div className="flex items-center space-x-2 text-blue-600">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm font-medium">Starting Soon</span>
                </div>
                <JitsiMeetButton
                  batchId="english-intermediate-batch-1"
                  batchName="English Intermediate - Live Class"
                  userRole="student"
                  isActive={false}
                  onMeetingJoin={() => console.log('Joined English live class')}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

