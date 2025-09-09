"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import Navbar from '@/components/system/navbar';

export default function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/courses');
      if (!response.ok) {
        throw new Error('Failed to fetch courses');
      }
      const data = await response.json();
      setCourses(data.courses || []);
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

  const getLevelColor = (level) => {
    const colors = {
      'A1': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      'A2': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      'B1': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      'B2': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
      'C1': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      'C2': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      'Beginner': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      'Intermediate': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      'Advanced': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    };
    return colors[level] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-800 pt-20">
          <div className="container mx-auto px-4 py-12">
            <div className="text-center mb-12">
              <Skeleton className="h-12 w-64 mx-auto mb-4" />
              <Skeleton className="h-6 w-96 mx-auto" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="overflow-hidden">
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-20 w-full mb-4" />
                    <div className="flex gap-2 mb-4">
                      <Skeleton className="h-6 w-16" />
                      <Skeleton className="h-6 w-20" />
                    </div>
                    <Skeleton className="h-8 w-full" />
                  </CardContent>
                </Card>
              ))}
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
          <div className="container mx-auto px-4 py-12">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-zinc-900 dark:text-white mb-4">Error Loading Courses</h1>
              <p className="text-zinc-600 dark:text-zinc-300 mb-8">{error}</p>
              <Button onClick={fetchCourses} variant="outline">
                Try Again
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
        <div className="container mx-auto px-4 py-12">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold text-zinc-900 dark:text-white mb-4">
              Language Courses
            </h1>
            <p className="text-xl text-zinc-600 dark:text-zinc-300 max-w-3xl mx-auto">
              Discover our comprehensive language learning programs designed to help you achieve fluency and connect with cultures around the world.
            </p>
          </div>

          {/* Courses Grid */}
          {courses.length === 0 ? (
            <div className="text-center py-12">
              <h2 className="text-2xl font-semibold text-zinc-900 dark:text-white mb-4">No Courses Available</h2>
              <p className="text-zinc-600 dark:text-zinc-300">
                We're working on adding new courses. Please check back soon!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {courses.map((course) => (
                <Card key={course._id} className="overflow-hidden hover:shadow-xl transition-all duration-300 group">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between mb-2">
                      <Badge className={getLevelColor(course.level)}>
                        {course.level}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {course.language}
                      </Badge>
                    </div>
                    <CardTitle className="text-xl group-hover:text-[var(--color-dusty-rose)] transition-colors">
                      {course.displayName || course.name}
                    </CardTitle>
                    <CardDescription className="text-sm">
                      {course.courseDuration} months • {course.totalCapacity} students max
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="pb-4">
                    <p className="text-zinc-600 dark:text-zinc-300 text-sm mb-4 line-clamp-3">
                      {course.description || `Learn ${course.language} at ${course.level} level with our comprehensive course designed for ${course.courseDuration} months.`}
                    </p>

                    {/* Pricing */}
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-zinc-600 dark:text-zinc-300">Regular Course:</span>
                        <span className="font-semibold text-zinc-900 dark:text-white">
                          {formatPrice(course.pricing?.regular?.totalPrice || course.price)}
                        </span>
                      </div>
                      {course.pricing?.revision && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-zinc-600 dark:text-zinc-300">With Revision:</span>
                          <span className="font-semibold text-zinc-900 dark:text-white">
                            {formatPrice(course.pricing.revision.totalPrice)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Availability */}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-zinc-600 dark:text-zinc-300">
                        {course.availableSlots} spots left
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        course.status === 'active' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
                      }`}>
                        {course.status}
                      </span>
                    </div>
                  </CardContent>

                  <CardFooter className="pt-0">
                    <Link href={`/courses/enroll/${course._id}`} className="w-full">
                      <Button 
                        className="w-full bg-[var(--color-dusty-rose)] hover:bg-[var(--color-dusty-rose)]/90 text-white"
                        disabled={course.status !== 'active' || course.availableSlots <= 0}
                      >
                        {course.status !== 'active' ? 'Coming Soon' : 
                         course.availableSlots <= 0 ? 'Fully Booked' : 'Enroll Now'}
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}

          {/* Call to Action */}
          <div className="text-center mt-16">
            <div className="bg-white dark:bg-zinc-800 rounded-2xl p-8 shadow-lg">
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-4">
                Need Help Choosing?
              </h2>
              <p className="text-zinc-600 dark:text-zinc-300 mb-6">
                Our language experts are here to help you find the perfect course for your learning goals.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="outline" size="lg">
                  Book Free Consultation
                </Button>
                <Button size="lg" className="bg-[var(--color-dusty-rose)] hover:bg-[var(--color-dusty-rose)]/90">
                  Contact Us
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
