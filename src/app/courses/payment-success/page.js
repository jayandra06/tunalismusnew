"use client";
import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Mail, Download, ArrowRight } from 'lucide-react';
import Navbar from '@/components/system/navbar';

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const paymentId = searchParams.get('payment_id');
  const orderId = searchParams.get('order_id');
  
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (paymentId && orderId) {
      verifyPayment();
    } else {
      setError('Invalid payment information');
      setLoading(false);
    }
  }, [paymentId, orderId]);

  const verifyPayment = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/payments/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          payment_id: paymentId,
          order_id: orderId,
        }),
      });

      if (!response.ok) {
        throw new Error('Payment verification failed');
      }

      const data = await response.json();
      setPaymentDetails(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(price);
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-800 pt-20">
          <div className="container mx-auto px-4 py-12 max-w-4xl">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-dusty-rose)] mx-auto mb-4"></div>
              <h1 className="text-2xl font-semibold text-zinc-900 dark:text-white">
                Verifying your payment...
              </h1>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-800 pt-20">
          <div className="container mx-auto px-4 py-12 max-w-4xl">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-4">
                Payment Verification Failed
              </h1>
              <p className="text-zinc-600 dark:text-zinc-300 mb-8">{error}</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button onClick={() => router.push('/courses')} variant="outline">
                  Back to Courses
                </Button>
                <Button onClick={() => window.location.reload()}>
                  Try Again
                </Button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-800 pt-20">
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          {/* Success Header */}
          <div className="text-center mb-12">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
            </div>
            <h1 className="text-4xl font-bold text-zinc-900 dark:text-white mb-4">
              Payment Successful!
            </h1>
            <p className="text-xl text-zinc-600 dark:text-zinc-300">
              Welcome to Tunalismus! Your enrollment has been confirmed.
            </p>
          </div>

          {/* Payment Details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  Course Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">
                    {paymentDetails?.course?.displayName || paymentDetails?.course?.name}
                  </h3>
                  <div className="flex gap-2 mt-2">
                    <Badge className="bg-[var(--color-dusty-rose)] text-white">
                      {paymentDetails?.course?.level}
                    </Badge>
                    <Badge variant="outline">
                      {paymentDetails?.course?.language}
                    </Badge>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-zinc-600 dark:text-zinc-300">Duration:</span>
                    <span>{paymentDetails?.course?.courseDuration} months</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-600 dark:text-zinc-300">Batch Type:</span>
                    <span className="capitalize">{paymentDetails?.enrollment?.batchType}</span>
                  </div>
                  {paymentDetails?.enrollment?.offlineMaterials && (
                    <div className="flex justify-between">
                      <span className="text-zinc-600 dark:text-zinc-300">Offline Materials:</span>
                      <span className="text-green-600 dark:text-green-400">Included</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-zinc-600 dark:text-zinc-300">Payment ID:</span>
                    <span className="font-mono text-xs">{paymentId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-600 dark:text-zinc-300">Order ID:</span>
                    <span className="font-mono text-xs">{orderId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-600 dark:text-zinc-300">Amount Paid:</span>
                    <span className="font-semibold text-[var(--color-dusty-rose)]">
                      {formatPrice(paymentDetails?.payment?.amount)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-600 dark:text-zinc-300">Payment Date:</span>
                    <span>{new Date(paymentDetails?.payment?.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Next Steps */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>What's Next?</CardTitle>
              <CardDescription>
                Here's what happens after your successful enrollment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-[var(--color-dusty-rose)] text-white rounded-full flex items-center justify-center text-sm font-semibold">
                    1
                  </div>
                  <div>
                    <h3 className="font-semibold">Email Confirmation</h3>
                    <p className="text-sm text-zinc-600 dark:text-zinc-300">
                      You'll receive a detailed confirmation email with course information and next steps.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-[var(--color-dusty-rose)] text-white rounded-full flex items-center justify-center text-sm font-semibold">
                    2
                  </div>
                  <div>
                    <h3 className="font-semibold">Course Access</h3>
                    <p className="text-sm text-zinc-600 dark:text-zinc-300">
                      Your course access will be activated within 24 hours. You'll receive login credentials via email.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-[var(--color-dusty-rose)] text-white rounded-full flex items-center justify-center text-sm font-semibold">
                    3
                  </div>
                  <div>
                    <h3 className="font-semibold">Welcome Session</h3>
                    <p className="text-sm text-zinc-600 dark:text-zinc-300">
                      Join our welcome session to meet your instructor and fellow students.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => router.push('/student/login')}
              className="bg-[var(--color-dusty-rose)] hover:bg-[var(--color-dusty-rose)]/90 text-white"
            >
              Access Student Portal
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button variant="outline" onClick={() => router.push('/courses')}>
              Browse More Courses
            </Button>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Download Receipt
            </Button>
          </div>

          {/* Support Information */}
          <div className="text-center mt-12">
            <p className="text-sm text-zinc-600 dark:text-zinc-300 mb-4">
              Need help? Our support team is here to assist you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center text-sm">
              <a href="mailto:contact@tunalismus.com" className="text-[var(--color-dusty-rose)] hover:underline">
                contact@tunalismus.com
              </a>
              <span className="hidden sm:block text-zinc-400">•</span>
              <a href="tel:+919876543210" className="text-[var(--color-dusty-rose)] hover:underline">
                +91 98765 43210
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
