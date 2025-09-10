"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  BookOpen, 
  Users, 
  Calendar, 
  TrendingUp, 
  Clock,
  CheckCircle,
  Plus,
  Eye
} from "lucide-react";
import Link from "next/link";

export default function TrainerDashboard() {
  const [stats, setStats] = useState({
    totalBatches: 0,
    totalStudents: 0,
    upcomingSessions: 0,
    completedSessions: 0,
    averageRating: 0,
    totalHours: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch trainer dashboard stats
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/trainer/stats', {
          credentials: 'include'
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
      title: "Active Batches",
      value: stats.totalBatches,
      icon: BookOpen,
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900/20",
      description: "Currently teaching"
    },
    {
      title: "Total Students",
      value: stats.totalStudents,
      icon: Users,
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900/20",
      description: "Enrolled students"
    },
    {
      title: "Upcoming Sessions",
      value: stats.upcomingSessions,
      icon: Calendar,
      color: "text-purple-600",
      bgColor: "bg-purple-100 dark:bg-purple-900/20",
      description: "Scheduled this week"
    },
    {
      title: "Completed Sessions",
      value: stats.completedSessions,
      icon: CheckCircle,
      color: "text-emerald-600",
      bgColor: "bg-emerald-100 dark:bg-emerald-900/20",
      description: "This month"
    },
    {
      title: "Average Rating",
      value: `${stats.averageRating}/5`,
      icon: TrendingUp,
      color: "text-orange-600",
      bgColor: "bg-orange-100 dark:bg-orange-900/20",
      description: "Student feedback"
    },
    {
      title: "Total Hours",
      value: `${stats.totalHours}h`,
      icon: Clock,
      color: "text-cyan-600",
      bgColor: "bg-cyan-100 dark:bg-cyan-900/20",
      description: "Teaching time"
    }
  ];

  const quickActions = [
    {
      title: "Create New Batch",
      description: "Start a new training batch",
      icon: Plus,
      href: "/trainer/batches/new",
      color: "bg-blue-600 hover:bg-blue-700"
    },
    {
      title: "View Students",
      description: "Manage your students",
      icon: Users,
      href: "/trainer/students",
      color: "bg-green-600 hover:bg-green-700"
    },
    {
      title: "Schedule Session",
      description: "Plan upcoming sessions",
      icon: Calendar,
      href: "/trainer/schedule",
      color: "bg-purple-600 hover:bg-purple-700"
    },
    {
      title: "Upload Materials",
      description: "Add course materials",
      icon: BookOpen,
      href: "/trainer/materials",
      color: "bg-orange-600 hover:bg-orange-700"
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Trainer Dashboard</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Welcome back! Here&apos;s your teaching overview.
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
              <Calendar className="h-5 w-5 mr-2 text-blue-600" />
              Upcoming Sessions
            </CardTitle>
            <CardDescription>
              Your next scheduled sessions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">React Fundamentals</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Batch A - 25 students</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-blue-600">Today, 2:00 PM</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">2 hours</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">JavaScript Advanced</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Batch B - 18 students</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-green-600">Tomorrow, 10:00 AM</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">3 hours</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2 text-green-600" />
              Recent Student Activity
            </CardTitle>
            <CardDescription>
              Latest student interactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                  <span className="text-blue-600 dark:text-blue-400 font-semibold text-sm">A</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Alex Johnson</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Completed assignment • 1 hour ago</p>
                </div>
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                  <span className="text-green-600 dark:text-green-400 font-semibold text-sm">M</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Maria Garcia</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Asked question • 3 hours ago</p>
                </div>
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

