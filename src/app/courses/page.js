"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Search, 
  Filter, 
  SortAsc, 
  SortDesc, 
  X,
  SlidersHorizontal,
  Clock,
  DollarSign,
  Globe,
  BookOpen
} from 'lucide-react';
import Navbar from '@/components/system/navbar';
import Head from 'next/head';

export const metadata = {
  title: "Language Courses - German, Turkish & English Classes",
  description: "Discover our comprehensive language learning programs in German, Turkish, and English. Expert-led courses designed to help you achieve fluency and connect with cultures around the world.",
  keywords: [
    "German courses",
    "Turkish courses", 
    "English courses",
    "Language classes Hyderabad",
    "Online language learning",
    "Language tutor",
    "German A1 A2 B1 B2",
    "Turkish language classes",
    "English conversation classes",
    "Language immersion",
    "Cultural learning"
  ],
  openGraph: {
    title: "Language Courses - German, Turkish & English Classes | Tunalismus",
    description: "Expert-led language courses in German, Turkish, and English. Achieve fluency through personalized learning experiences in Hyderabad, India.",
    url: "https://tunalismus.in/courses",
    images: [
      {
        url: "/og-courses.png",
        width: 1200,
        height: 630,
        alt: "Language Courses - Tunalismus",
      },
    ],
  },
  alternates: {
    canonical: "https://tunalismus.in/courses",
  },
};

export default function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Structured data for courses
  const coursesStructuredData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Language Courses",
    "description": "Comprehensive language learning programs in German, Turkish, and English",
    "url": "https://tunalismus.in/courses",
    "numberOfItems": courses.length,
    "itemListElement": courses.map((course, index) => ({
      "@type": "Course",
      "position": index + 1,
      "name": course.name || course.displayName,
      "description": course.description,
      "provider": {
        "@type": "EducationalOrganization",
        "name": "Tunalismus",
        "url": "https://tunalismus.in"
      },
      "courseMode": "blended",
      "educationalLevel": course.level,
      "inLanguage": course.language,
      "offers": {
        "@type": "Offer",
        "price": course.price,
        "priceCurrency": "INR",
        "availability": course.status === 'active' ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
      }
    }))
  };
  
  // Filter and search state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 100000 });
  const [durationFilter, setDurationFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [showFilters, setShowFilters] = useState(false);
  
  // Available filter options
  const [availableLanguages, setAvailableLanguages] = useState([]);
  const [availableLevels, setAvailableLevels] = useState([]);
  const [availableDurations, setAvailableDurations] = useState([]);

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
      const coursesData = data.courses || [];
      setCourses(coursesData);
      
      // Extract filter options
      const languages = [...new Set(coursesData.map(course => course.language))].sort();
      const levels = [...new Set(coursesData.map(course => course.level))].sort();
      const durations = [...new Set(coursesData.map(course => course.courseDuration))].sort((a, b) => a - b);
      
      setAvailableLanguages(languages);
      setAvailableLevels(levels);
      setAvailableDurations(durations);
      
      // Set price range based on actual course prices
      const prices = coursesData.map(course => course.pricing?.regular?.totalPrice || course.price || 0);
      if (prices.length > 0) {
        setPriceRange({
          min: Math.min(...prices),
          max: Math.max(...prices)
        });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    // Handle NaN, undefined, or null values
    const validPrice = isNaN(price) || price === null || price === undefined ? 0 : price;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(validPrice);
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

  // Filter and sort courses
  const getFilteredAndSortedCourses = () => {
    let filtered = courses.filter(course => {
      // Search filter
      const matchesSearch = searchTerm === '' || 
        course.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.language?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description?.toLowerCase().includes(searchTerm.toLowerCase());

      // Language filter
      const matchesLanguage = selectedLanguage === 'all' || course.language === selectedLanguage;

      // Level filter
      const matchesLevel = selectedLevel === 'all' || course.level === selectedLevel;

      // Price filter
      const coursePrice = course.pricing?.regular?.totalPrice || course.price || 0;
      const matchesPrice = coursePrice >= priceRange.min && coursePrice <= priceRange.max;

      // Duration filter
      const matchesDuration = durationFilter === 'all' || course.courseDuration.toString() === durationFilter;

      return matchesSearch && matchesLanguage && matchesLevel && matchesPrice && matchesDuration;
    });

    // Sort courses
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'price':
          aValue = a.pricing?.regular?.totalPrice || a.price || 0;
          bValue = b.pricing?.regular?.totalPrice || b.price || 0;
          break;
        case 'duration':
          aValue = a.courseDuration || 0;
          bValue = b.courseDuration || 0;
          break;
        case 'level':
          const levelOrder = { 'A1': 1, 'A2': 2, 'B1': 3, 'B2': 4, 'C1': 5, 'C2': 6, 'Beginner': 1, 'Intermediate': 2, 'Advanced': 3 };
          aValue = levelOrder[a.level] || 0;
          bValue = levelOrder[b.level] || 0;
          break;
        case 'name':
        default:
          aValue = (a.displayName || a.name || '').toLowerCase();
          bValue = (b.displayName || b.name || '').toLowerCase();
          break;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedLanguage('all');
    setSelectedLevel('all');
    setDurationFilter('all');
    setPriceRange({ min: 0, max: 100000 });
    setSortBy('name');
    setSortOrder('asc');
  };

  const filteredCourses = getFilteredAndSortedCourses();

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
      <Head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(coursesStructuredData) }}
        />
      </Head>
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

          {/* Search and Filter Bar */}
          <div className="bg-white dark:bg-zinc-800 rounded-2xl p-6 shadow-lg mb-8">
            <div className="flex flex-col lg:flex-row gap-4 items-center">
              {/* Search */}
              <div className="relative flex-1 w-full lg:w-auto">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 h-4 w-4" />
                <Input
                  placeholder="Search courses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Filter Toggle */}
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filters
                {showFilters ? <X className="h-4 w-4" /> : <Filter className="h-4 w-4" />}
              </Button>

              {/* Sort */}
              <div className="flex items-center gap-2">
                <Label className="text-sm font-medium">Sort by:</Label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-800 text-sm"
                >
                  <option value="name">Name</option>
                  <option value="price">Price</option>
                  <option value="duration">Duration</option>
                  <option value="level">Level</option>
                </select>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                >
                  {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="mt-6 pt-6 border-t border-zinc-200 dark:border-zinc-700">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Language Filter */}
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Language</Label>
                    <select
                      value={selectedLanguage}
                      onChange={(e) => setSelectedLanguage(e.target.value)}
                      className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-800 text-sm"
                    >
                      <option value="all">All Languages</option>
                      {availableLanguages.map(lang => (
                        <option key={lang} value={lang}>{lang}</option>
                      ))}
                    </select>
                  </div>

                  {/* Level Filter */}
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Level</Label>
                    <select
                      value={selectedLevel}
                      onChange={(e) => setSelectedLevel(e.target.value)}
                      className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-800 text-sm"
                    >
                      <option value="all">All Levels</option>
                      {availableLevels.map(level => (
                        <option key={level} value={level}>{level}</option>
                      ))}
                    </select>
                  </div>

                  {/* Duration Filter */}
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Duration</Label>
                    <select
                      value={durationFilter}
                      onChange={(e) => setDurationFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-800 text-sm"
                    >
                      <option value="all">All Durations</option>
                      {availableDurations.map(duration => (
                        <option key={duration} value={duration}>{duration} months</option>
                      ))}
                    </select>
                  </div>

                  {/* Price Range */}
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Price Range</Label>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-zinc-400" />
                        <Input
                          type="number"
                          placeholder="Min"
                          value={priceRange.min}
                          onChange={(e) => setPriceRange(prev => ({ ...prev, min: parseInt(e.target.value) || 0 }))}
                          className="text-sm"
                        />
                        <span className="text-zinc-400">-</span>
                        <Input
                          type="number"
                          placeholder="Max"
                          value={priceRange.max}
                          onChange={(e) => setPriceRange(prev => ({ ...prev, max: parseInt(e.target.value) || 100000 }))}
                          className="text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Clear Filters */}
                <div className="mt-4 flex justify-end">
                  <Button variant="outline" onClick={clearFilters} className="text-sm">
                    Clear All Filters
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Results Summary */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-zinc-600 dark:text-zinc-300">
              Showing {filteredCourses.length} of {courses.length} courses
            </p>
            {(searchTerm || selectedLanguage !== 'all' || selectedLevel !== 'all' || durationFilter !== 'all') && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-zinc-500">Active filters:</span>
                {searchTerm && (
                  <Badge variant="secondary" className="text-xs">
                    Search: "{searchTerm}"
                  </Badge>
                )}
                {selectedLanguage !== 'all' && (
                  <Badge variant="secondary" className="text-xs">
                    <Globe className="h-3 w-3 mr-1" />
                    {selectedLanguage}
                  </Badge>
                )}
                {selectedLevel !== 'all' && (
                  <Badge variant="secondary" className="text-xs">
                    <BookOpen className="h-3 w-3 mr-1" />
                    {selectedLevel}
                  </Badge>
                )}
                {durationFilter !== 'all' && (
                  <Badge variant="secondary" className="text-xs">
                    <Clock className="h-3 w-3 mr-1" />
                    {durationFilter} months
                  </Badge>
                )}
              </div>
            )}
          </div>

          {/* Courses Grid */}
          {filteredCourses.length === 0 ? (
            <div className="text-center py-12">
              <h2 className="text-2xl font-semibold text-zinc-900 dark:text-white mb-4">
                {courses.length === 0 ? 'No Courses Available' : 'No Courses Match Your Filters'}
              </h2>
              <p className="text-zinc-600 dark:text-zinc-300 mb-6">
                {courses.length === 0 
                  ? "We're working on adding new courses. Please check back soon!"
                  : "Try adjusting your search criteria or clearing the filters to see more courses."
                }
              </p>
              {courses.length > 0 && (
                <Button onClick={clearFilters} variant="outline">
                  Clear All Filters
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredCourses.map((course) => (
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
                      {course.pricing?.revision && course.pricing.revision.totalPrice > 0 && (
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
                        course.status === 'active' || course.status === 'published'
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
                        disabled={course.status !== 'active' && course.status !== 'published' || course.availableSlots <= 0}
                      >
                        {course.status !== 'active' && course.status !== 'published' ? 'Coming Soon' : 
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
