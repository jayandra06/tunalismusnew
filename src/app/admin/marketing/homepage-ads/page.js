"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Plus, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff,
  Calendar,
  Clock,
  Target,
  BarChart3
} from "lucide-react";
import { toast } from "sonner";

export default function HomepageAdsPage() {
  const router = useRouter();
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, draft, published, active, expired

  useEffect(() => {
    fetchAds();
  }, [filter]);

  const fetchAds = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/homepage-ads?filter=${filter}`);
      if (!response.ok) throw new Error('Failed to fetch ads');
      
      const data = await response.json();
      setAds(data.ads || []);
    } catch (error) {
      console.error('Error fetching ads:', error);
      toast.error('Failed to load ads');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (adId) => {
    if (!confirm('Are you sure you want to delete this ad?')) return;
    
    try {
      const response = await fetch(`/api/admin/homepage-ads/${adId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Failed to delete ad');
      
      toast.success('Ad deleted successfully');
      fetchAds();
    } catch (error) {
      console.error('Error deleting ad:', error);
      toast.error('Failed to delete ad');
    }
  };

  const handleToggleStatus = async (adId, currentStatus) => {
    try {
      const response = await fetch(`/api/admin/homepage-ads/${adId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: currentStatus === 'published' ? 'draft' : 'published'
        }),
      });
      
      if (!response.ok) throw new Error('Failed to update ad status');
      
      toast.success(`Ad ${currentStatus === 'published' ? 'unpublished' : 'published'} successfully`);
      fetchAds();
    } catch (error) {
      console.error('Error updating ad status:', error);
      toast.error('Failed to update ad status');
    }
  };

  const getStatusBadge = (ad) => {
    const now = new Date();
    const isActive = ad.status === 'published' && 
                    new Date(ad.start_date) <= now && 
                    new Date(ad.end_date) >= now;
    
    if (ad.status === 'draft') {
      return <Badge variant="secondary">Draft</Badge>;
    } else if (isActive) {
      return <Badge variant="default" className="bg-green-500">Active</Badge>;
    } else if (new Date(ad.end_date) < now) {
      return <Badge variant="destructive">Expired</Badge>;
    } else {
      return <Badge variant="outline">Scheduled</Badge>;
    }
  };

  const getAdTypeIcon = (adType) => {
    const icons = {
      popup: "🪟",
      banner: "📢",
      toast: "🍞",
      badge: "🏷️",
      flyer: "📄",
      floating_button: "🔘"
    };
    return icons[adType] || "📢";
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTargetAudienceText = (ad) => {
    if (ad.target_audience === 'role_based') {
      return `Roles: ${ad.target_roles?.join(', ') || 'None'}`;
    }
    return ad.target_audience.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Homepage Ads</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage promotional ads and announcements for your homepage
          </p>
        </div>
        <Button 
          onClick={() => router.push('/admin/marketing/homepage-ads/new')}
          className="bg-red-600 hover:bg-red-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create New Ad
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Ads</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ads.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Ads</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {ads.filter(ad => {
                const now = new Date();
                return ad.status === 'published' && 
                       new Date(ad.start_date) <= now && 
                       new Date(ad.end_date) >= now;
              }).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Draft Ads</CardTitle>
            <EyeOff className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {ads.filter(ad => ad.status === 'draft').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Impressions</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {ads.reduce((sum, ad) => sum + (ad.impressions || 0), 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg w-fit">
        {[
          { key: 'all', label: 'All' },
          { key: 'active', label: 'Active' },
          { key: 'draft', label: 'Draft' },
          { key: 'published', label: 'Published' },
          { key: 'expired', label: 'Expired' }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              filter === tab.key
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Ads Table */}
      <Card>
        <CardHeader>
          <CardTitle>Ads Management</CardTitle>
          <CardDescription>
            Manage your homepage advertisements and promotional content
          </CardDescription>
        </CardHeader>
        <CardContent>
          {ads.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📢</div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No ads found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {filter === 'all' 
                  ? "Get started by creating your first homepage ad"
                  : `No ${filter} ads found`
                }
              </p>
              {filter === 'all' && (
                <Button 
                  onClick={() => router.push('/admin/marketing/homepage-ads/new')}
                  className="bg-red-600 hover:bg-red-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Ad
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ad</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Target Audience</TableHead>
                    <TableHead>Schedule</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Analytics</TableHead>
                    <TableHead className="w-[50px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ads.map((ad) => (
                    <TableRow key={ad._id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium text-sm">
                            {ad.special_note?.substring(0, 50)}
                            {ad.special_note?.length > 50 && '...'}
                          </div>
                          <div className="text-xs text-gray-500">
                            {ad.cta_text && `CTA: ${ad.cta_text}`}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {ad.course_id?.name || ad.course_id?.displayName || 'Unknown Course'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {ad.course_id?.language} {ad.course_id?.level}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">{getAdTypeIcon(ad.ad_type)}</span>
                          <span className="text-sm capitalize">
                            {ad.ad_type.replace('_', ' ')}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {getTargetAudienceText(ad)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {ad.frequency.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm space-y-1">
                          <div className="flex items-center text-xs text-gray-500">
                            <Calendar className="h-3 w-3 mr-1" />
                            {formatDate(ad.start_date)}
                          </div>
                          <div className="flex items-center text-xs text-gray-500">
                            <Clock className="h-3 w-3 mr-1" />
                            {formatDate(ad.end_date)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(ad)}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm space-y-1">
                          <div className="text-xs">
                            <span className="font-medium">{ad.impressions || 0}</span> impressions
                          </div>
                          <div className="text-xs">
                            <span className="font-medium">{ad.clicks || 0}</span> clicks
                          </div>
                          <div className="text-xs">
                            <span className="font-medium">{ad.closes || 0}</span> closes
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => router.push(`/admin/marketing/homepage-ads/${ad._id}/edit`)}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleToggleStatus(ad._id, ad.status)}
                            >
                              {ad.status === 'published' ? (
                                <>
                                  <EyeOff className="h-4 w-4 mr-2" />
                                  Unpublish
                                </>
                              ) : (
                                <>
                                  <Eye className="h-4 w-4 mr-2" />
                                  Publish
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(ad._id)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

