"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  BookOpen, 
  CreditCard,
  Download,
  Calendar,
  ArrowLeft,
  Loader2
} from "lucide-react";
import Link from "next/link";

export default function ReportsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [reports, setReports] = useState({
    userStats: null,
    courseStats: null,
    revenueStats: null,
    enrollmentStats: null
  });
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState("30");
  const [selectedReport, setSelectedReport] = useState("overview");

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    } else if (status === 'authenticated' && session?.user?.role !== 'admin') {
      router.push('/unauthorized');
    }
  }, [status, session, router]);

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role === 'admin') {
      fetchReports();
    }
  }, [status, session, selectedPeriod]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      // Fetch different types of reports
      const [userStats, courseStats, revenueStats, enrollmentStats] = await Promise.all([
        fetch('/api/admin/stats?type=users', { credentials: 'include' }),
        fetch('/api/admin/stats?type=courses', { credentials: 'include' }),
        fetch('/api/admin/stats?type=revenue', { credentials: 'include' }),
        fetch('/api/admin/stats?type=enrollments', { credentials: 'include' })
      ]);

      const reportsData = {
        userStats: userStats.ok ? await userStats.json() : null,
        courseStats: courseStats.ok ? await courseStats.json() : null,
        revenueStats: revenueStats.ok ? await revenueStats.json() : null,
        enrollmentStats: enrollmentStats.ok ? await enrollmentStats.json() : null
      };

      setReports(reportsData);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = (type) => {
    // This would typically generate and download a CSV/PDF report
    console.log(`Exporting ${type} report for period: ${selectedPeriod}`);
    // Implementation would depend on your export requirements
  };

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
      </div>
    );
  }

  const reportTypes = [
    {
      id: "overview",
      name: "Overview",
      description: "General statistics and key metrics",
      icon: BarChart3
    },
    {
      id: "users",
      name: "User Analytics",
      description: "User registration and activity trends",
      icon: Users
    },
    {
      id: "courses",
      name: "Course Performance",
      description: "Course enrollment and completion rates",
      icon: BookOpen
    },
    {
      id: "revenue",
      name: "Revenue Reports",
      description: "Financial performance and payment analytics",
      icon: CreditCard
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link 
          href="/admin/dashboard" 
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Reports & Analytics</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          View detailed analytics and generate reports
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-4">
        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-gray-500" />
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <BarChart3 className="w-4 h-4 text-gray-500" />
          <Select value={selectedReport} onValueChange={setSelectedReport}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {reportTypes.map((type) => (
                <SelectItem key={type.id} value={type.id}>
                  {type.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button 
          onClick={() => exportReport(selectedReport)}
          variant="outline"
          className="ml-auto"
        >
          <Download className="w-4 h-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Report Type Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {reportTypes.map((type) => {
          const Icon = type.icon;
          return (
            <Card 
              key={type.id} 
              className={`cursor-pointer transition-all ${
                selectedReport === type.id 
                  ? 'ring-2 ring-red-600 bg-red-50 dark:bg-red-900/20' 
                  : 'hover:shadow-md'
              }`}
              onClick={() => setSelectedReport(type.id)}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {type.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {type.description}
                    </p>
                  </div>
                  <Icon className="w-8 h-8 text-red-600" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Report Content */}
      <div className="space-y-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-red-600" />
            <span className="ml-2 text-gray-600">Loading reports...</span>
          </div>
        ) : (
          <>
            {selectedReport === "overview" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {reports.userStats?.totalUsers || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      +20.1% from last month
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {reports.courseStats?.totalCourses || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      +5.2% from last month
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      ₹{reports.revenueStats?.totalRevenue || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      +12.5% from last month
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Students</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {reports.enrollmentStats?.activeStudents || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      +8.3% from last month
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}

            {selectedReport === "users" && (
              <Card>
                <CardHeader>
                  <CardTitle>User Analytics</CardTitle>
                  <CardDescription>
                    User registration and activity trends for the last {selectedPeriod} days
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12 text-gray-500">
                    User analytics chart would be displayed here
                  </div>
                </CardContent>
              </Card>
            )}

            {selectedReport === "courses" && (
              <Card>
                <CardHeader>
                  <CardTitle>Course Performance</CardTitle>
                  <CardDescription>
                    Course enrollment and completion rates for the last {selectedPeriod} days
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12 text-gray-500">
                    Course performance chart would be displayed here
                  </div>
                </CardContent>
              </Card>
            )}

            {selectedReport === "revenue" && (
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Reports</CardTitle>
                  <CardDescription>
                    Financial performance and payment analytics for the last {selectedPeriod} days
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12 text-gray-500">
                    Revenue chart would be displayed here
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}
