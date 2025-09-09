"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  BookOpen, 
  CheckCircle, 
  Clock, 
  Award,
  Target,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  Star,
  Trophy,
  Users,
  FileText
} from "lucide-react";

export default function StudentProgressPage() {
  const [progress, setProgress] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('all'); // 'week', 'month', 'all'

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/progress', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setProgress(data.progress || []);
          
          // Calculate stats
          const totalCourses = data.progress.length;
          const completedCourses = data.progress.filter(p => p.percentage >= 100).length;
          const averageProgress = totalCourses > 0 
            ? Math.round(data.progress.reduce((acc, p) => acc + p.percentage, 0) / totalCourses)
            : 0;
          const totalLessons = data.progress.reduce((acc, p) => acc + p.totalLessons, 0);
          const completedLessons = data.progress.reduce((acc, p) => acc + p.completedLessons, 0);
          
          setStats({
            totalCourses,
            completedCourses,
            averageProgress,
            totalLessons,
            completedLessons,
            certificates: completedCourses
          });
        } else {
          // Mock data for now
          const mockProgress = [
            {
              _id: '1',
              course: {
                _id: 'course1',
                title: 'React Fundamentals'
              },
              completedLessons: 15,
              totalLessons: 20,
              percentage: 75,
              lastAccessed: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
            },
            {
              _id: '2',
              course: {
                _id: 'course2',
                title: 'JavaScript Advanced'
              },
              completedLessons: 8,
              totalLessons: 15,
              percentage: 53,
              lastAccessed: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
            },
            {
              _id: '3',
              course: {
                _id: 'course3',
                title: 'Node.js Backend'
              },
              completedLessons: 12,
              totalLessons: 12,
              percentage: 100,
              lastAccessed: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
            }
          ];
          
          setProgress(mockProgress);
          
          const totalCourses = mockProgress.length;
          const completedCourses = mockProgress.filter(p => p.percentage >= 100).length;
          const averageProgress = Math.round(mockProgress.reduce((acc, p) => acc + p.percentage, 0) / totalCourses);
          const totalLessons = mockProgress.reduce((acc, p) => acc + p.totalLessons, 0);
          const completedLessons = mockProgress.reduce((acc, p) => acc + p.completedLessons, 0);
          
          setStats({
            totalCourses,
            completedCourses,
            averageProgress,
            totalLessons,
            completedLessons,
            certificates: completedCourses
          });
        }
      } catch (error) {
        console.error('Error fetching progress:', error);
        setError('Error loading progress data');
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, []);

  const getProgressColor = (percentage) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-blue-600';
    if (percentage >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getProgressBarColor = (percentage) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-blue-500';
    if (percentage >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getStatusBadge = (percentage) => {
    if (percentage >= 100) {
      return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">Completed</Badge>;
    } else if (percentage >= 80) {
      return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">Almost Done</Badge>;
    } else if (percentage >= 50) {
      return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">In Progress</Badge>;
    } else {
      return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400">Getting Started</Badge>;
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
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return `${Math.ceil(diffDays / 30)} months ago`;
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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Learning Progress</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Track your learning journey and achievements
        </p>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Courses</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalCourses}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.completedCourses}</p>
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
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.averageProgress}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Award className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Certificates</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.certificates}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
              Overall Progress
            </CardTitle>
            <CardDescription>
              Your learning progress across all courses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Lessons Completed
                </span>
                <span className="text-sm font-bold text-gray-900 dark:text-white">
                  {stats.completedLessons} / {stats.totalLessons}
                </span>
              </div>
              <Progress 
                value={(stats.completedLessons / stats.totalLessons) * 100} 
                className="h-3"
              />
              <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                <span>Course Completion Rate</span>
                <span className="font-semibold">{stats.averageProgress}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Trophy className="h-5 w-5 mr-2 text-yellow-600" />
              Achievements
            </CardTitle>
            <CardDescription>
              Your learning milestones and badges
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {stats.completedCourses} Course{stats.completedCourses !== 1 ? 's' : ''} Completed
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Great job on finishing your courses!
                  </p>
                </div>
              </div>
              
              {stats.completedLessons >= 10 && (
                <div className="flex items-center space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
                    <Star className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Dedicated Learner
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Completed {stats.completedLessons} lessons
                    </p>
                  </div>
                </div>
              )}
              
              {stats.averageProgress >= 80 && (
                <div className="flex items-center space-x-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center">
                    <Target className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      High Achiever
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {stats.averageProgress}% average progress
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Course Progress Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="h-5 w-5 mr-2 text-green-600" />
            Course Progress
          </CardTitle>
          <CardDescription>
            Detailed progress for each of your courses
          </CardDescription>
        </CardHeader>
        <CardContent>
          {progress.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No Progress Data
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                You haven't started any courses yet. Enroll in a course to begin tracking your progress.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {progress.map((courseProgress) => (
                <Card key={courseProgress._id} className="hover:shadow-md transition-shadow duration-200">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                            <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                              {courseProgress.course.title}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                              {getStatusBadge(courseProgress.percentage)}
                              <span className="text-sm text-gray-500 dark:text-gray-400">
                                Last accessed: {getTimeAgo(courseProgress.lastAccessed)}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              Progress
                            </span>
                            <span className={`text-sm font-bold ${getProgressColor(courseProgress.percentage)}`}>
                              {courseProgress.percentage}%
                            </span>
                          </div>
                          <Progress 
                            value={courseProgress.percentage} 
                            className="h-2"
                          />
                          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                            <span>{courseProgress.completedLessons} of {courseProgress.totalLessons} lessons completed</span>
                            <span>{courseProgress.totalLessons - courseProgress.completedLessons} remaining</span>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center text-gray-600 dark:text-gray-400">
                            <Clock className="h-4 w-4 mr-2" />
                            <span>Started: {formatDate(courseProgress.lastAccessed)}</span>
                          </div>
                          <div className="flex items-center text-gray-600 dark:text-gray-400">
                            <Calendar className="h-4 w-4 mr-2" />
                            <span>Last activity: {getTimeAgo(courseProgress.lastAccessed)}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="ml-4 flex flex-col gap-2">
                        <Button 
                          size="sm" 
                          className="bg-blue-600 hover:bg-blue-700"
                          disabled={courseProgress.percentage >= 100}
                        >
                          {courseProgress.percentage >= 100 ? 'Completed' : 'Continue Learning'}
                        </Button>
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

      {/* Learning Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <PieChart className="h-5 w-5 mr-2 text-purple-600" />
            Learning Insights
          </CardTitle>
          <CardDescription>
            Your learning patterns and recommendations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900 dark:text-white">Learning Streak</h4>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center">
                  <span className="text-white text-sm font-bold">7</span>
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400">days in a row</span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Keep up the great work! Consistent learning leads to better retention.
              </p>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900 dark:text-white">Next Steps</h4>
              <div className="space-y-2">
                {progress.filter(p => p.percentage < 100).slice(0, 2).map((course) => (
                  <div key={course._id} className="flex items-center space-x-2 text-sm">
                    <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                    <span className="text-gray-600 dark:text-gray-400">
                      Complete {course.course.title} ({100 - course.percentage}% remaining)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
