"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  FileText, 
  Upload, 
  Download, 
  Eye, 
  Edit,
  Trash2,
  Search,
  Filter,
  BookOpen,
  Video,
  File,
  Link as LinkIcon,
  Calendar,
  User,
  Folder,
  Plus,
  CheckCircle,
  AlertCircle,
  Users
} from "lucide-react";

export default function TrainerMaterialsPage() {
  const [materials, setMaterials] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterBatch, setFilterBatch] = useState('all');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Upload form state
  const [uploadData, setUploadData] = useState({
    title: '',
    description: '',
    type: 'pdf',
    fileUrl: '',
    batch: '',
    course: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch materials and batches
        const [materialsResponse, batchesResponse] = await Promise.all([
          fetch('/api/trainer/materials', {
            credentials: 'include'
          }),
          fetch('/api/trainer/batches', {
            credentials: 'include'
          })
        ]);
        
        if (materialsResponse.ok) {
          const materialsData = await materialsResponse.json();
          setMaterials(materialsData.materials || []);
        } else {
          // Mock data for now
          setMaterials([
            {
              _id: '1',
              title: 'React Components Guide',
              description: 'Comprehensive guide to React components and their lifecycle methods',
              type: 'pdf',
              fileUrl: '/materials/react-components.pdf',
              batch: {
                _id: 'batch1',
                name: 'React Fundamentals - Batch A',
                course: { title: 'React Fundamentals' }
              },
              uploadedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
              size: '2.5 MB',
              downloads: 45,
              status: 'published'
            },
            {
              _id: '2',
              title: 'JavaScript Async Programming Video',
              description: 'Video tutorial covering promises, async/await, and error handling',
              type: 'video',
              fileUrl: 'https://youtube.com/watch?v=example',
              batch: {
                _id: 'batch2',
                name: 'JavaScript Advanced - Batch B',
                course: { title: 'JavaScript Advanced' }
              },
              uploadedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
              size: '45 min',
              downloads: 32,
              status: 'published'
            },
            {
              _id: '3',
              title: 'Project Requirements Document',
              description: 'Detailed requirements for the final project',
              type: 'doc',
              fileUrl: '/materials/project-requirements.docx',
              batch: {
                _id: 'batch1',
                name: 'React Fundamentals - Batch A',
                course: { title: 'React Fundamentals' }
              },
              uploadedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
              size: '1.2 MB',
              downloads: 28,
              status: 'published'
            },
            {
              _id: '4',
              title: 'Useful Resources and Links',
              description: 'Collection of useful JavaScript resources and documentation',
              type: 'link',
              fileUrl: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript',
              batch: {
                _id: 'batch2',
                name: 'JavaScript Advanced - Batch B',
                course: { title: 'JavaScript Advanced' }
              },
              uploadedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
              size: 'External',
              downloads: 67,
              status: 'published'
            },
            {
              _id: '5',
              title: 'Draft: Advanced React Patterns',
              description: 'Work in progress - advanced React patterns and best practices',
              type: 'pdf',
              fileUrl: '/materials/advanced-react-patterns.pdf',
              batch: {
                _id: 'batch1',
                name: 'React Fundamentals - Batch A',
                course: { title: 'React Fundamentals' }
              },
              uploadedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
              size: '3.1 MB',
              downloads: 0,
              status: 'draft'
            }
          ]);
        }
        
        if (batchesResponse.ok) {
          const batchesData = await batchesResponse.json();
          setBatches(batchesData.batches || []);
        } else {
          setBatches([
            { _id: 'batch1', name: 'React Fundamentals - Batch A', course: { title: 'React Fundamentals' } },
            { _id: 'batch2', name: 'JavaScript Advanced - Batch B', course: { title: 'JavaScript Advanced' } }
          ]);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Error loading materials data');
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'archived':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
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

  const handleUpload = async (e) => {
    e.preventDefault();
    setUploading(true);
    
    try {
      const response = await fetch('/api/materials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(uploadData)
      });

      if (response.ok) {
        const newMaterial = await response.json();
        setMaterials([newMaterial.material, ...materials]);
        setShowUploadModal(false);
        setUploadData({
          title: '',
          description: '',
          type: 'pdf',
          fileUrl: '',
          batch: '',
          course: ''
        });
      } else {
        setError('Failed to upload material');
      }
    } catch (error) {
      console.error('Error uploading material:', error);
      setError('Error uploading material');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (materialId) => {
    if (!confirm('Are you sure you want to delete this material?')) return;
    
    try {
      const response = await fetch(`/api/materials/${materialId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        setMaterials(materials.filter(m => m._id !== materialId));
      } else {
        setError('Failed to delete material');
      }
    } catch (error) {
      console.error('Error deleting material:', error);
      setError('Error deleting material');
    }
  };

  const filteredMaterials = materials.filter(material => {
    const matchesSearch = material.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         material.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || material.type === filterType;
    const matchesBatch = filterBatch === 'all' || material.batch._id === filterBatch;
    
    return matchesSearch && matchesType && matchesBatch;
  });

  const materialsByBatch = filteredMaterials.reduce((acc, material) => {
    const batchName = material.batch.name;
    if (!acc[batchName]) {
      acc[batchName] = [];
    }
    acc[batchName].push(material);
    return acc;
  }, {});

  const publishedMaterials = materials.filter(m => m.status === 'published');
  const draftMaterials = materials.filter(m => m.status === 'draft');
  const totalDownloads = materials.reduce((acc, m) => acc + m.downloads, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Course Materials</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Upload and manage your course materials and resources
          </p>
        </div>
        <Button 
          onClick={() => setShowUploadModal(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Upload className="h-4 w-4 mr-2" />
          Upload Material
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Materials</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{materials.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Published</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{publishedMaterials.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertCircle className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Drafts</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{draftMaterials.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Download className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Downloads</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalDownloads}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Upload New Material</CardTitle>
              <CardDescription>
                Add a new material to your course
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpload} className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={uploadData.title}
                    onChange={(e) => setUploadData({...uploadData, title: e.target.value})}
                    placeholder="Enter material title"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">Description</Label>
                  <textarea
                    id="description"
                    value={uploadData.description}
                    onChange={(e) => setUploadData({...uploadData, description: e.target.value})}
                    placeholder="Enter material description"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <Label htmlFor="type">Type</Label>
                  <select
                    id="type"
                    value={uploadData.type}
                    onChange={(e) => setUploadData({...uploadData, type: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="pdf">PDF</option>
                    <option value="video">Video</option>
                    <option value="doc">Document</option>
                    <option value="link">Link</option>
                  </select>
                </div>
                
                <div>
                  <Label htmlFor="fileUrl">File URL or Link</Label>
                  <Input
                    id="fileUrl"
                    value={uploadData.fileUrl}
                    onChange={(e) => setUploadData({...uploadData, fileUrl: e.target.value})}
                    placeholder="Enter file URL or upload link"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="batch">Batch</Label>
                  <select
                    id="batch"
                    value={uploadData.batch}
                    onChange={(e) => setUploadData({...uploadData, batch: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select a batch</option>
                    {batches.map(batch => (
                      <option key={batch._id} value={batch._id}>
                        {batch.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="flex gap-2 pt-4">
                  <Button 
                    type="submit" 
                    disabled={uploading}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    {uploading ? 'Uploading...' : 'Upload'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => setShowUploadModal(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

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
                value={filterBatch}
                onChange={(e) => setFilterBatch(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="all">All Batches</option>
                {batches.map(batch => (
                  <option key={batch._id} value={batch._id}>
                    {batch.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Materials by Batch */}
          {Object.keys(materialsByBatch).length === 0 ? (
            <div className="text-center py-12">
              <Folder className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No Materials Found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {searchTerm || filterType !== 'all' || filterBatch !== 'all'
                  ? "No materials match your current filters."
                  : "You haven't uploaded any materials yet."
                }
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(materialsByBatch).map(([batchName, batchMaterials]) => (
                <div key={batchName}>
                  <div className="flex items-center mb-4">
                    <BookOpen className="h-5 w-5 text-blue-600 mr-2" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {batchName}
                    </h3>
                    <Badge variant="outline" className="ml-2">
                      {batchMaterials.length} materials
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {batchMaterials.map((material) => (
                      <Card key={material._id} className="hover:shadow-lg transition-shadow duration-200">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center space-x-2">
                              {getTypeIcon(material.type)}
                              <Badge className={getTypeColor(material.type)}>
                                {material.type.toUpperCase()}
                              </Badge>
                              <Badge className={getStatusColor(material.status)}>
                                {material.status}
                              </Badge>
                            </div>
                            <div className="flex space-x-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => window.open(material.fileUrl, '_blank')}
                                className="h-8 w-8 p-0"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(material._id)}
                                className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
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
                          
                          <div className="space-y-2 text-xs text-gray-500 dark:text-gray-400 mb-4">
                            <div className="flex items-center justify-between">
                              <span className="flex items-center">
                                <Calendar className="h-3 w-3 mr-1" />
                                {formatDate(material.uploadedAt)}
                              </span>
                              <span className="flex items-center">
                                <Download className="h-3 w-3 mr-1" />
                                {material.downloads} downloads
                              </span>
                            </div>
                            <div className="flex items-center">
                              <span className="flex items-center">
                                <File className="h-3 w-3 mr-1" />
                                {material.size}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="flex-1"
                              onClick={() => window.open(material.fileUrl, '_blank')}
                            >
                              <Download className="h-4 w-4 mr-2" />
                              {material.type === 'link' ? 'Open' : 'Download'}
                            </Button>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
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
