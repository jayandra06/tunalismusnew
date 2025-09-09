"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  CreditCard, 
  Search, 
  Filter, 
  Download,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  TrendingUp,
  Users
} from "lucide-react";

export default function PaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const response = await fetch('/api/admin/payments');
      
      if (response.ok) {
        const data = await response.json();
        setPayments(data.payments || []);
      } else {
        // Mock data for now
        setPayments([
          {
            _id: "1",
            paymentId: "PAY_001",
            studentName: "John Doe",
            studentEmail: "john@example.com",
            courseName: "React Fundamentals",
            amount: 2999,
            status: "completed",
            paymentMethod: "Razorpay",
            transactionId: "txn_123456789",
            createdAt: "2024-01-15T10:30:00Z",
            completedAt: "2024-01-15T10:35:00Z"
          },
          {
            _id: "2",
            paymentId: "PAY_002",
            studentName: "Sarah Wilson",
            studentEmail: "sarah@example.com",
            courseName: "Advanced JavaScript",
            amount: 3999,
            status: "completed",
            paymentMethod: "Razorpay",
            transactionId: "txn_123456790",
            createdAt: "2024-01-16T14:20:00Z",
            completedAt: "2024-01-16T14:25:00Z"
          },
          {
            _id: "3",
            paymentId: "PAY_003",
            studentName: "Mike Johnson",
            studentEmail: "mike@example.com",
            courseName: "Python for Data Science",
            amount: 4999,
            status: "pending",
            paymentMethod: "Razorpay",
            transactionId: null,
            createdAt: "2024-01-17T09:15:00Z",
            completedAt: null
          },
          {
            _id: "4",
            paymentId: "PAY_004",
            studentName: "Emily Chen",
            studentEmail: "emily@example.com",
            courseName: "UI/UX Design Basics",
            amount: 2499,
            status: "failed",
            paymentMethod: "Razorpay",
            transactionId: null,
            createdAt: "2024-01-18T16:45:00Z",
            completedAt: null
          },
          {
            _id: "5",
            paymentId: "PAY_005",
            studentName: "Alex Rodriguez",
            studentEmail: "alex@example.com",
            courseName: "Mobile App Development",
            amount: 5999,
            status: "completed",
            paymentMethod: "Razorpay",
            transactionId: "txn_123456791",
            createdAt: "2024-01-19T11:30:00Z",
            completedAt: "2024-01-19T11:35:00Z"
          },
          {
            _id: "6",
            paymentId: "PAY_006",
            studentName: "Lisa Brown",
            studentEmail: "lisa@example.com",
            courseName: "React Fundamentals",
            amount: 2999,
            status: "refunded",
            paymentMethod: "Razorpay",
            transactionId: "txn_123456792",
            createdAt: "2024-01-20T13:20:00Z",
            completedAt: "2024-01-20T13:25:00Z"
          }
        ]);
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.studentEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.paymentId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || payment.status === statusFilter;
    
    // Date filter logic
    let matchesDate = true;
    if (dateFilter !== "all") {
      const paymentDate = new Date(payment.createdAt);
      const now = new Date();
      const daysDiff = Math.floor((now - paymentDate) / (1000 * 60 * 60 * 24));
      
      switch (dateFilter) {
        case "today":
          matchesDate = daysDiff === 0;
          break;
        case "week":
          matchesDate = daysDiff <= 7;
          break;
        case "month":
          matchesDate = daysDiff <= 30;
          break;
        default:
          matchesDate = true;
      }
    }
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'failed': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'refunded': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'failed': return <XCircle className="h-4 w-4" />;
      case 'refunded': return <CreditCard className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Calculate stats
  const totalRevenue = payments
    .filter(p => p.status === 'completed')
    .reduce((sum, payment) => sum + payment.amount, 0);
  
  const pendingAmount = payments
    .filter(p => p.status === 'pending')
    .reduce((sum, payment) => sum + payment.amount, 0);
  
  const refundedAmount = payments
    .filter(p => p.status === 'refunded')
    .reduce((sum, payment) => sum + payment.amount, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Payments Management</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Track and manage all payment transactions
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Total Revenue
            </CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatPrice(totalRevenue)}
            </div>
            <p className="text-xs text-green-600 dark:text-green-400">
              +12.5% from last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Pending Payments
            </CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatPrice(pendingAmount)}
            </div>
            <p className="text-xs text-yellow-600 dark:text-yellow-400">
              {payments.filter(p => p.status === 'pending').length} transactions
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Refunded Amount
            </CardTitle>
            <CreditCard className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatPrice(refundedAmount)}
            </div>
            <p className="text-xs text-blue-600 dark:text-blue-400">
              {payments.filter(p => p.status === 'refunded').length} refunds
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Total Transactions
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {payments.length}
            </div>
            <p className="text-xs text-purple-600 dark:text-purple-400">
              All time transactions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search payments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
            
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
            
            <Button variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Download Report
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Transactions ({filteredPayments.length} payments)</CardTitle>
          <CardDescription>
            View and manage all payment transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Payment ID</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Student</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Course</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Amount</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Date</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((payment) => (
                  <tr key={payment._id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="py-4 px-4">
                      <div className="font-mono text-sm text-gray-900 dark:text-white">
                        {payment.paymentId}
                      </div>
                      {payment.transactionId && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {payment.transactionId}
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">{payment.studentName}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{payment.studentEmail}</div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-gray-900 dark:text-white">
                      {payment.courseName}
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {formatPrice(payment.amount)}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {payment.paymentMethod}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(payment.status)}`}>
                        {getStatusIcon(payment.status)}
                        {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {formatDate(payment.createdAt)}
                      </div>
                      {payment.completedAt && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Completed: {formatDate(payment.completedAt)}
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        {payment.status === 'pending' && (
                          <Button variant="outline" size="sm" className="text-green-600 hover:text-green-700">
                            Approve
                          </Button>
                        )}
                        {payment.status === 'completed' && (
                          <Button variant="outline" size="sm" className="text-blue-600 hover:text-blue-700">
                            Refund
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredPayments.length === 0 && (
            <div className="text-center py-8">
              <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No payments found matching your criteria</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
