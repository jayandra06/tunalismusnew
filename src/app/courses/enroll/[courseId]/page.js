"use client";
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Navbar from '@/components/system/navbar';

export default function CourseEnrollmentPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId;

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);

  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isNewUser, setIsNewUser] = useState(false);
  const [revisionBatch, setRevisionBatch] = useState(false);
  const [offlineMaterials, setOfflineMaterials] = useState(false);

  // Price calculation
  const [totalPrice, setTotalPrice] = useState(0);
  const [priceBreakdown, setPriceBreakdown] = useState({});

  useEffect(() => {
    if (courseId) {
      fetchCourse();
    }
  }, [courseId]);

  useEffect(() => {
    calculatePrice();
  }, [course, revisionBatch, offlineMaterials]);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/courses/${courseId}`);
      if (!response.ok) {
        throw new Error('Course not found');
      }
      const data = await response.json();
      setCourse(data.course);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const calculatePrice = () => {
    if (!course) return;

    const batchType = revisionBatch ? 'revision' : 'regular';
    const pricing = course.pricing?.[batchType] || { basePrice: course.price, offlineMaterialCost: 0 };
    
    let basePrice = pricing.basePrice || course.price;
    let materialCost = 0;

    if (offlineMaterials && course.offlineMaterials?.enabled) {
      materialCost = pricing.offlineMaterialCost || course.offlineMaterials.totalCost || 0;
    }

    const total = basePrice + materialCost;

    setPriceBreakdown({
      basePrice,
      materialCost,
      total
    });

    setTotalPrice(total);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(price);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setError('Email is required');
      return;
    }

    if (!isNewUser && !password) {
      setError('Password is required for existing users');
      return;
    }

    if (isNewUser && password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      // Create payment order
      const response = await fetch('/api/payments/order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          courseId: course._id,
          email,
          password,
          isNewUser,
          revisionBatch,
          offlineMaterials,
          amount: totalPrice,
          batchType: revisionBatch ? 'revision' : 'regular'
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create payment order');
      }

      const data = await response.json();
      
      // Redirect to Razorpay payment page
      if (data.razorpayOrderId) {
        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_zoIIpcKimwlQ4w',
          amount: data.amount,
          currency: 'INR',
          name: 'Tunalismus',
          description: `Payment for ${course.displayName || course.name}`,
          order_id: data.razorpayOrderId,
          handler: function (response) {
            // Payment successful
            router.push(`/courses/payment-success?payment_id=${response.razorpay_payment_id}&order_id=${response.razorpay_order_id}`);
          },
          prefill: {
            email: email,
          },
          theme: {
            color: '#E91E63'
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-800 pt-20">
          <div className="container mx-auto px-4 py-12 max-w-4xl">
            <Skeleton className="h-8 w-64 mb-8" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Skeleton className="h-96" />
              <Skeleton className="h-96" />
            </div>
          </div>
        </div>
      </>
    );
  }

  if (error && !course) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-800 pt-20">
          <div className="container mx-auto px-4 py-12 max-w-4xl">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-zinc-900 dark:text-white mb-4">Course Not Found</h1>
              <p className="text-zinc-600 dark:text-zinc-300 mb-8">{error}</p>
              <Button onClick={() => router.push('/courses')} variant="outline">
                Back to Courses
              </Button>
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
        <div className="container mx-auto px-4 py-12 max-w-6xl">
          <div className="mb-8">
            <Button 
              variant="outline" 
              onClick={() => router.push('/courses')}
              className="mb-4"
            >
              ← Back to Courses
            </Button>
            <h1 className="text-3xl md:text-4xl font-bold text-zinc-900 dark:text-white">
              Enroll in {course?.displayName || course?.name}
            </h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Course Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Course Details
                  <Badge className="bg-[var(--color-dusty-rose)] text-white">
                    {course?.level}
                  </Badge>
                </CardTitle>
                <CardDescription>
                  {course?.language} • {course?.courseDuration} months
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Course Description</h3>
                  <p className="text-zinc-600 dark:text-zinc-300 text-sm">
                    {course?.description || `Learn ${course?.language} at ${course?.level} level with our comprehensive course designed for ${course?.courseDuration} months.`}
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Course Features</h3>
                  <ul className="text-sm text-zinc-600 dark:text-zinc-300 space-y-1">
                    <li>• Interactive online sessions</li>
                    <li>• Experienced native instructors</li>
                    <li>• Small batch sizes (max {course?.batchSizeLimit} students)</li>
                    <li>• Progress tracking and assessments</li>
                    <li>• Certificate of completion</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Availability</h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-300">
                    {course?.availableSlots} spots remaining out of {course?.totalCapacity} total capacity
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Enrollment Form */}
            <Card>
              <CardHeader>
                <CardTitle>Complete Your Enrollment</CardTitle>
                <CardDescription>
                  Fill in your details and select your preferred options
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  {/* Add-on Options */}
                  <div className="space-y-4">
                    <h3 className="font-semibold">Add-on Options</h3>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="revision-batch" 
                        checked={revisionBatch}
                        onCheckedChange={setRevisionBatch}
                        disabled={!course?.batchTypes?.revision?.enabled}
                      />
                      <Label htmlFor="revision-batch" className="flex-1">
                        <div className="flex justify-between items-center">
                          <span>Revision Batch Access</span>
                          <span className="text-sm text-zinc-600 dark:text-zinc-300">
                            +{formatPrice((course?.pricing?.revision?.basePrice || 0) - (course?.pricing?.regular?.basePrice || course?.price || 0))}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                          Additional revision sessions for better retention
                        </p>
                      </Label>
                    </div>

                    {course?.offlineMaterials?.enabled && (
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="offline-materials" 
                          checked={offlineMaterials}
                          onCheckedChange={setOfflineMaterials}
                        />
                        <Label htmlFor="offline-materials" className="flex-1">
                          <div className="flex justify-between items-center">
                            <span>Offline Materials</span>
                            <span className="text-sm text-zinc-600 dark:text-zinc-300">
                              +{formatPrice(course?.offlineMaterials?.totalCost || 0)}
                            </span>
                          </div>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400">
                            Physical books and study materials
                          </p>
                        </Label>
                      </div>
                    )}
                  </div>

                  {/* User Account */}
                  <div className="space-y-4">
                    <h3 className="font-semibold">Account Information</h3>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="new-user" 
                        checked={isNewUser}
                        onCheckedChange={setIsNewUser}
                      />
                      <Label htmlFor="new-user">I'm a new user</Label>
                    </div>

                    <div>
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        required
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="password">
                        Password {isNewUser ? '*' : '(for existing users)'}
                      </Label>
                      <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder={isNewUser ? "Create a password" : "Enter your password"}
                        required={!isNewUser}
                        className="mt-1"
                      />
                      {isNewUser && (
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                          Password must be at least 6 characters long
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Price Summary */}
                  <div className="bg-zinc-50 dark:bg-zinc-800 rounded-lg p-4 space-y-2">
                    <h3 className="font-semibold">Price Summary</h3>
                    <div className="flex justify-between text-sm">
                      <span>Base Course Fee:</span>
                      <span>{formatPrice(priceBreakdown.basePrice)}</span>
                    </div>
                    {priceBreakdown.materialCost > 0 && (
                      <div className="flex justify-between text-sm">
                        <span>Offline Materials:</span>
                        <span>{formatPrice(priceBreakdown.materialCost)}</span>
                      </div>
                    )}
                    <div className="border-t border-zinc-200 dark:border-zinc-700 pt-2">
                      <div className="flex justify-between font-semibold">
                        <span>Total Amount:</span>
                        <span className="text-[var(--color-dusty-rose)]">
                          {formatPrice(totalPrice)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-[var(--color-dusty-rose)] hover:bg-[var(--color-dusty-rose)]/90 text-white"
                    disabled={processing || course?.availableSlots <= 0}
                    size="lg"
                  >
                    {processing ? 'Processing...' : `Proceed to Pay ${formatPrice(totalPrice)}`}
                  </Button>

                  <p className="text-xs text-zinc-500 dark:text-zinc-400 text-center">
                    By proceeding, you agree to our terms and conditions. 
                    You will be redirected to Razorpay for secure payment processing.
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
