"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  FileText, 
  Download, 
  Eye, 
  Search,
  Filter,
  BookOpen,
  Video,
  File,
  Link as LinkIcon,
  Calendar,
  User,
  Folder,
  Star,
  Clock
} from "lucide-react";

export default function StudentMaterialsPage() {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterCourse, setFilterCourse] = useState('all');
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch materials
        const materialsResponse = await fetch('/api/student/materials', {
          credentials: 'include'
        });
        
        // Fetch courses for filtering
        const coursesResponse = await fetch('/api/student/batches', {
          credentials: 'include'
        });
        
        if (materialsResponse.ok) {
          const materialsData = await materialsResponse.json();
          setMaterials(materialsData.materials || []);
        } else {
          // Mock data for now
          setMaterials([
            {
              _id: '1',
              title: 'React Components Guide',
              type: 'pdf',
              course: 'React Fundamentals',
              courseId: 'course1',
              fileUrl: '/materials/react-components.pdf',
              uploadedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
              size: '2.5 MB',
              description: 'Comprehensive guide to React components and their lifecycle methods'
            },
            {
              _id: '2',
              title: 'JavaScript Async Programming Video',
              type: 'video',
              course: 'JavaScript Advanced',
              courseId: 'course2',
              fileUrl: 'https://youtube.com/watch?v=example',
              uploadedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
              size: '45 min',
              description: 'Video tutorial covering promises, async/await, and error handling'
            },
            {
              _id: '3',
              title: 'Project Requirements Document',
              type: 'doc',
              course: 'React Fundamentals',
              courseId: 'course1',
              fileUrl: '/materials/project-requirements.docx',
              uploadedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
              size: '1.2 MB',
              description: 'Detailed requirements for the final project'
            },
            {
              _id: '4',
              title: 'Useful Resources and Links',
              type: 'link',
              course: 'JavaScript Advanced',
              courseId: 'course2',
              fileUrl: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript',
              uploadedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
              size: 'External',
              description: 'Collection of useful JavaScript resources and documentation'
            }
          ]);
        }
        
        if (coursesResponse.ok) {
          const coursesData = await coursesResponse.json();
          setCourses(coursesData.courses || []);
        } else {
          setCourses([
            { _id: 'course1', title: 'React Fundamentals' },
            { _id: 'course2', title: 'JavaScript Advanced' }
          ]);
        }
      } catch (error) {
        console.error('Error fetching materials:', error);
        setError('Error loading materials');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getTypeIcon = (type) => {
    switch (type) {
      case 'pdf':
        return <FileText className="h-5 w-5 text-red-600" />;
      case 'video':
        return <Video className="h-5 w-5 text-blue-600" />;
      case 'doc':
        return <File className="h-5 w-5 text-blue-600" />;
      case 'link':
        return <LinkIcon className="h-5 w-5 text-green-600" />;
      default:
        return <File className="h-5 w-5 text-gray-600" />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'pdf':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'video':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'doc':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'link':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(new Date(date));
  };

  const handleDownload = (material) => {
    if (material.type === 'link') {
      window.open(material.fileUrl, '_blank');
    } else {
      // For actual files, you would implement proper download logic
      console.log('Downloading:', material.title);
      // Create a temporary link and trigger download
      const link = document.createElement('a');
      link.href = material.fileUrl;
      link.download = material.title;
      link.click();
    }
  };

  const handlePreview = (material) => {
    if (material.type === 'link') {
      window.open(material.fileUrl, '_blank');
    } else {
      // For files, you would implement preview logic
      console.log('Previewing:', material.title);
      window.open(material.fileUrl, '_blank');
    }
  };

  const filteredMaterials = materials.filter(material => {
    const matchesSearch = material.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         material.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || material.type === filterType;
    const matchesCourse = filterCourse === 'all' || material.courseId === filterCourse;
    
    return matchesSearch && matchesType && matchesCourse;
  });

  const materialsByCourse = filteredMaterials.reduce((acc, material) => {
    const course = material.course;
    if (!acc[course]) {
      acc[course] = [];
    }
    acc[course].push(material);
    return acc;
  }, {});

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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Course Materials</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Access and download your course materials, resources, and documentation
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">PDFs</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {materials.filter(m => m.type === 'pdf').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Video className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Videos</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {materials.filter(m => m.type === 'video').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <File className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Documents</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {materials.filter(m => m.type === 'doc').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <LinkIcon className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Links</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {materials.filter(m => m.type === 'link').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Materials Library</CardTitle>
          <CardDescription>
            Search and filter your course materials
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search materials..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="all">All Types</option>
                <option value="pdf">PDFs</option>
                <option value="video">Videos</option>
                <option value="doc">Documents</option>
                <option value="link">Links</option>
              </select>
              <select
                value={filterCourse}
                onChange={(e) => setFilterCourse(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="all">All Courses</option>
                {courses.map(course => (
                  <option key={course._id} value={course._id}>
                    {course.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Materials by Course */}
          {Object.keys(materialsByCourse).length === 0 ? (
            <div className="text-center py-12">
              <Folder className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No Materials Found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {searchTerm || filterType !== 'all' || filterCourse !== 'all'
                  ? "No materials match your current filters."
                  : "You don't have any materials available yet."
                }
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(materialsByCourse).map(([courseName, courseMaterials]) => (
                <div key={courseName}>
                  <div className="flex items-center mb-4">
                    <BookOpen className="h-5 w-5 text-blue-600 mr-2" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {courseName}
                    </h3>
                    <Badge variant="outline" className="ml-2">
                      {courseMaterials.length} materials
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {courseMaterials.map((material) => (
                      <Card key={material._id} className="hover:shadow-lg transition-shadow duration-200">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center space-x-2">
                              {getTypeIcon(material.type)}
                              <Badge className={getTypeColor(material.type)}>
                                {material.type.toUpperCase()}
                              </Badge>
                            </div>
                            <div className="flex space-x-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handlePreview(material)}
                                className="h-8 w-8 p-0"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDownload(material)}
                                className="h-8 w-8 p-0"
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <CardTitle className="text-base font-semibold text-gray-900 dark:text-white">
                            {material.title}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <CardDescription className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                            {material.description}
                          </CardDescription>
                          
                          <div className="space-y-2 text-xs text-gray-500 dark:text-gray-400">
                            <div className="flex items-center justify-between">
                              <span className="flex items-center">
                                <Calendar className="h-3 w-3 mr-1" />
                                {formatDate(material.uploadedAt)}
                              </span>
                              <span className="flex items-center">
                                <Clock className="h-3 w-3 mr-1" />
                                {material.size}
                              </span>
                            </div>
                          </div>
                          
                          <div className="mt-4 flex gap-2">
                            <Button
                              size="sm"
                              className="flex-1"
                              onClick={() => handleDownload(material)}
                            >
                              <Download className="h-4 w-4 mr-2" />
                              {material.type === 'link' ? 'Open' : 'Download'}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handlePreview(material)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
