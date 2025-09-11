"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Save, Eye } from "lucide-react";
import { toast } from "sonner";

export default function EditAdPage() {
  const router = useRouter();
  const params = useParams();
  const adId = params.id;
  
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [formData, setFormData] = useState({
    course_id: '',
    ad_type: 'popup',
    special_note: '',
    media_url: '',
    cta_text: '',
    cta_link: '',
    timer: '',
    closable: true,
    frequency: 'per_session',
    target_audience: 'all',
    target_roles: [],
    start_date: '',
    end_date: '',
    status: 'draft',
    position: 'center',
    priority: 1,
    background_color: '',
    text_color: '',
    border_radius: 8,
    animation_type: 'fade_in',
    animation_duration: 300
  });

  useEffect(() => {
    if (adId) {
      fetchAd();
      fetchCourses();
    }
  }, [adId]);

  const fetchAd = async () => {
    try {
      setInitialLoading(true);
      const response = await fetch(`/api/admin/homepage-ads/${adId}`);
      if (!response.ok) throw new Error('Failed to fetch ad');
      
      const data = await response.json();
      const ad = data.ad;
      
      // Format dates for datetime-local input
      const startDate = new Date(ad.start_date);
      const endDate = new Date(ad.end_date);
      
      setFormData({
        course_id: ad.course_id?._id || ad.course_id || '',
        ad_type: ad.ad_type || 'popup',
        special_note: ad.special_note || '',
        media_url: ad.media_url || '',
        cta_text: ad.cta_text || '',
        cta_link: ad.cta_link || '',
        timer: ad.timer || '',
        closable: ad.closable !== undefined ? ad.closable : true,
        frequency: ad.frequency || 'per_session',
        target_audience: ad.target_audience || 'all',
        target_roles: ad.target_roles || [],
        start_date: startDate.toISOString().slice(0, 16),
        end_date: endDate.toISOString().slice(0, 16),
        status: ad.status || 'draft',
        position: ad.position || 'center',
        priority: ad.priority || 1,
        background_color: ad.background_color || '',
        text_color: ad.text_color || '',
        border_radius: ad.border_radius || 8,
        animation_type: ad.animation_type || 'fade_in',
        animation_duration: ad.animation_duration || 300
      });
    } catch (error) {
      console.error('Error fetching ad:', error);
      toast.error('Failed to load ad');
      router.push('/admin/marketing/homepage-ads');
    } finally {
      setInitialLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await fetch('/api/courses');
      if (!response.ok) throw new Error('Failed to fetch courses');
      
      const data = await response.json();
      setCourses(data.courses || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast.error('Failed to load courses');
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTargetRolesChange = (role, checked) => {
    setFormData(prev => ({
      ...prev,
      target_roles: checked 
        ? [...prev.target_roles, role]
        : prev.target_roles.filter(r => r !== role)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setLoading(true);

    try {
      console.log('Form submitted with data:', formData);
      
      // Prepare data for submission
      const submitData = {
        ...formData,
        timer: formData.timer ? parseInt(formData.timer) : null,
        priority: parseInt(formData.priority),
        border_radius: parseInt(formData.border_radius),
        animation_duration: parseInt(formData.animation_duration),
        start_date: new Date(formData.start_date).toISOString(),
        end_date: new Date(formData.end_date).toISOString()
      };

      console.log('Submitting data:', submitData);

      const response = await fetch(`/api/admin/homepage-ads/${adId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      console.log('Response status:', response.status);
      const responseData = await response.json();
      console.log('Response data:', responseData);

      if (!response.ok) {
        throw new Error(responseData.message || responseData.error || 'Failed to update ad');
      }

      toast.success('Ad updated successfully!');
      router.push('/admin/marketing/homepage-ads');
    } catch (error) {
      console.error('Error updating ad:', error);
      toast.error(error.message || 'Failed to update ad');
    } finally {
      setLoading(false);
    }
  };

  const adTypeOptions = [
    { value: 'popup', label: 'Popup', description: 'Center modal with fade-in effect' },
    { value: 'banner', label: 'Banner', description: 'Top sticky strip, closable' },
    { value: 'toast', label: 'Toast', description: 'Bottom-right slide-in notification' },
    { value: 'badge', label: 'Badge', description: 'Small glowing dot near hero section' },
    { value: 'flyer', label: 'Flyer', description: 'Image card in sidebar' },
    { value: 'floating_button', label: 'Floating Button', description: 'Pulsating button bottom-right' }
  ];

  const frequencyOptions = [
    { value: 'per_session', label: 'Per Session', description: 'Show once per browser session' },
    { value: 'per_day', label: 'Per Day', description: 'Show once per day' },
    { value: 'always', label: 'Always', description: 'Show every time' }
  ];

  const targetAudienceOptions = [
    { value: 'all', label: 'All Visitors', description: 'Show to everyone' },
    { value: 'guest', label: 'Guests Only', description: 'Show only to non-logged-in users' },
    { value: 'logged_in', label: 'Logged-in Users', description: 'Show only to authenticated users' },
    { value: 'role_based', label: 'Role-based', description: 'Show to specific user roles' }
  ];

  const animationOptions = [
    { value: 'fade_in', label: 'Fade In' },
    { value: 'slide_in', label: 'Slide In' },
    { value: 'bounce', label: 'Bounce' },
    { value: 'zoom_in', label: 'Zoom In' },
    { value: 'none', label: 'None' }
  ];

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Edit Ad</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Update your homepage advertisement settings
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Essential details for your advertisement
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="course_id">Course *</Label>
                <Select value={formData.course_id} onValueChange={(value) => handleInputChange('course_id', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((course) => (
                      <SelectItem key={course._id} value={course._id}>
                        {course.name || course.displayName} - {course.language} {course.level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="ad_type">Ad Type *</Label>
                <Select value={formData.ad_type} onValueChange={(value) => handleInputChange('ad_type', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {adTypeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div>
                          <div className="font-medium">{option.label}</div>
                          <div className="text-xs text-gray-500">{option.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="special_note">Special Note *</Label>
                <Textarea
                  id="special_note"
                  value={formData.special_note}
                  onChange={(e) => handleInputChange('special_note', e.target.value)}
                  placeholder="Enter your advertisement message..."
                  rows={4}
                  required
                />
              </div>

              <div>
                <Label htmlFor="media_url">Media URL (Optional)</Label>
                <Input
                  id="media_url"
                  type="url"
                  value={formData.media_url}
                  onChange={(e) => handleInputChange('media_url', e.target.value)}
                  placeholder="https://example.com/image.jpg"
                />
                <p className="text-xs text-gray-500 mt-1">
                  URL to an image or video for your ad
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Call-to-Action */}
          <Card>
            <CardHeader>
              <CardTitle>Call-to-Action</CardTitle>
              <CardDescription>
                Optional button and link for user interaction
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="cta_text">CTA Button Text</Label>
                <Input
                  id="cta_text"
                  value={formData.cta_text}
                  onChange={(e) => handleInputChange('cta_text', e.target.value)}
                  placeholder="e.g., Enroll Now, Learn More"
                />
              </div>

              <div>
                <Label htmlFor="cta_link">CTA Link</Label>
                <Input
                  id="cta_link"
                  type="url"
                  value={formData.cta_link}
                  onChange={(e) => handleInputChange('cta_link', e.target.value)}
                  placeholder="https://example.com/enroll"
                />
              </div>

              <div>
                <Label htmlFor="timer">Auto-close Timer (seconds)</Label>
                <Input
                  id="timer"
                  type="number"
                  min="1"
                  max="300"
                  value={formData.timer}
                  onChange={(e) => handleInputChange('timer', e.target.value)}
                  placeholder="Leave empty for no auto-close"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Ad will automatically close after this many seconds (1-300)
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="closable"
                  checked={formData.closable}
                  onCheckedChange={(checked) => handleInputChange('closable', checked)}
                />
                <Label htmlFor="closable">Show close button (❌)</Label>
              </div>
            </CardContent>
          </Card>

          {/* Targeting & Schedule */}
          <Card>
            <CardHeader>
              <CardTitle>Targeting & Schedule</CardTitle>
              <CardDescription>
                Control who sees your ad and when
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="frequency">Frequency *</Label>
                <Select value={formData.frequency} onValueChange={(value) => handleInputChange('frequency', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {frequencyOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div>
                          <div className="font-medium">{option.label}</div>
                          <div className="text-xs text-gray-500">{option.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="target_audience">Target Audience *</Label>
                <Select value={formData.target_audience} onValueChange={(value) => handleInputChange('target_audience', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {targetAudienceOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div>
                          <div className="font-medium">{option.label}</div>
                          <div className="text-xs text-gray-500">{option.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {formData.target_audience === 'role_based' && (
                <div>
                  <Label>Target Roles</Label>
                  <div className="space-y-2 mt-2">
                    {['admin', 'trainer', 'student'].map((role) => (
                      <div key={role} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`role-${role}`}
                          checked={formData.target_roles.includes(role)}
                          onChange={(e) => handleTargetRolesChange(role, e.target.checked)}
                          className="rounded border-gray-300"
                        />
                        <Label htmlFor={`role-${role}`} className="capitalize">
                          {role}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <Label htmlFor="start_date">Start Date *</Label>
                <Input
                  id="start_date"
                  type="datetime-local"
                  value={formData.start_date}
                  onChange={(e) => handleInputChange('start_date', e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="end_date">End Date *</Label>
                <Input
                  id="end_date"
                  type="datetime-local"
                  value={formData.end_date}
                  onChange={(e) => handleInputChange('end_date', e.target.value)}
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Appearance & Animation */}
          <Card>
            <CardHeader>
              <CardTitle>Appearance & Animation</CardTitle>
              <CardDescription>
                Customize the look and feel of your ad
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="position">Position</Label>
                <Select value={formData.position} onValueChange={(value) => handleInputChange('position', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="center">Center</SelectItem>
                    <SelectItem value="top">Top</SelectItem>
                    <SelectItem value="bottom">Bottom</SelectItem>
                    <SelectItem value="left">Left</SelectItem>
                    <SelectItem value="right">Right</SelectItem>
                    <SelectItem value="top_left">Top Left</SelectItem>
                    <SelectItem value="top_right">Top Right</SelectItem>
                    <SelectItem value="bottom_left">Bottom Left</SelectItem>
                    <SelectItem value="bottom_right">Bottom Right</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="priority">Priority</Label>
                <Input
                  id="priority"
                  type="number"
                  min="1"
                  max="10"
                  value={formData.priority}
                  onChange={(e) => handleInputChange('priority', e.target.value)}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Higher numbers = higher priority (1-10)
                </p>
              </div>

              <div>
                <Label htmlFor="background_color">Background Color</Label>
                <Input
                  id="background_color"
                  value={formData.background_color}
                  onChange={(e) => handleInputChange('background_color', e.target.value)}
                  placeholder="#ffffff or transparent"
                />
              </div>

              <div>
                <Label htmlFor="text_color">Text Color</Label>
                <Input
                  id="text_color"
                  value={formData.text_color}
                  onChange={(e) => handleInputChange('text_color', e.target.value)}
                  placeholder="#000000"
                />
              </div>

              <div>
                <Label htmlFor="border_radius">Border Radius</Label>
                <Input
                  id="border_radius"
                  type="number"
                  min="0"
                  max="50"
                  value={formData.border_radius}
                  onChange={(e) => handleInputChange('border_radius', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="animation_type">Animation Type</Label>
                <Select value={formData.animation_type} onValueChange={(value) => handleInputChange('animation_type', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {animationOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="animation_duration">Animation Duration (ms)</Label>
                <Input
                  id="animation_duration"
                  type="number"
                  min="100"
                  max="2000"
                  value={formData.animation_duration}
                  onChange={(e) => handleInputChange('animation_duration', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Status & Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Status & Actions</CardTitle>
            <CardDescription>
              Update the status of your ad
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 mt-1">
                  Draft ads won't be shown to users until published
                </p>
              </div>
              
              <div className="flex space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-red-600 hover:bg-red-700"
                  onClick={(e) => {
                    console.log('Update button clicked');
                    e.preventDefault();
                    e.stopPropagation();
                    handleSubmit(e);
                  }}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Update Ad
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}

