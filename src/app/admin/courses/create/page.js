"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  BookOpen, 
  Save, 
  ArrowLeft,
  Plus,
  Trash2,
  Calculator,
  Package
} from "lucide-react";
import Link from "next/link";

export default function CreateCoursePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    // Basic Information
    name: '',
    language: '',
    level: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    description: '',
    
    // Course Configuration
    totalCapacity: 50,
    courseDuration: 3,
    batchSizeLimit: 25,
    
    // Batch Types
    batchTypes: {
      regular: { enabled: true, studentCount: 0 },
      revision: { enabled: false, studentCount: 0 }
    },
    
    // Pricing
    pricing: {
      regular: {
        basePrice: 0,
        offlineMaterialCost: 0,
        totalPrice: 0
      },
      revision: {
        basePrice: 0,
        offlineMaterialCost: 0,
        totalPrice: 0
      }
    },
    
    // Offline Materials
    offlineMaterials: {
      enabled: false,
      materials: [],
      totalCost: 0
    },
    
    // Instructor
    instructor: '',
    
    // Status
    status: 'draft'
  });

  const [errors, setErrors] = useState({});

  const languages = [
    'English', 'German', 'French', 'Spanish', 'Italian', 
    'Portuguese', 'Russian', 'Chinese', 'Japanese', 'Korean', 'Arabic', 'Hindi'
  ];

  const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'Beginner', 'Intermediate', 'Advanced'];

  const months = [
    { value: 1, name: 'January' },
    { value: 2, name: 'February' },
    { value: 3, name: 'March' },
    { value: 4, name: 'April' },
    { value: 5, name: 'May' },
    { value: 6, name: 'June' },
    { value: 7, name: 'July' },
    { value: 8, name: 'August' },
    { value: 9, name: 'September' },
    { value: 10, name: 'October' },
    { value: 11, name: 'November' },
    { value: 12, name: 'December' }
  ];

  const materialTypes = [
    { value: 'book', label: 'Book' },
    { value: 'workbook', label: 'Workbook' },
    { value: 'cd', label: 'CD' },
    { value: 'dvd', label: 'DVD' },
    { value: 'other', label: 'Other' }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const handleNestedInputChange = (parent, field, value) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value
      }
    }));
  };

  const handleBatchTypeChange = (type, field, value) => {
    setFormData(prev => ({
      ...prev,
      batchTypes: {
        ...prev.batchTypes,
        [type]: {
          ...prev.batchTypes[type],
          [field]: value
        }
      }
    }));
  };

  const handlePricingChange = (batchType, field, value) => {
    const newFormData = {
      ...formData,
      pricing: {
        ...formData.pricing,
        [batchType]: {
          ...formData.pricing[batchType],
          [field]: parseFloat(value) || 0
        }
      }
    };

    // Recalculate total price
    const basePrice = newFormData.pricing[batchType].basePrice;
    const offlineCost = newFormData.offlineMaterials.enabled ? newFormData.offlineMaterials.totalCost : 0;
    newFormData.pricing[batchType].totalPrice = basePrice + offlineCost;

    setFormData(newFormData);
  };

  const addOfflineMaterial = () => {
    setFormData(prev => ({
      ...prev,
      offlineMaterials: {
        ...prev.offlineMaterials,
        materials: [
          ...prev.offlineMaterials.materials,
          {
            name: '',
            description: '',
            type: 'book',
            cost: 0,
            quantity: 1,
            totalCost: 0,
            supplier: '',
            notes: ''
          }
        ]
      }
    }));
  };

  const removeOfflineMaterial = (index) => {
    setFormData(prev => ({
      ...prev,
      offlineMaterials: {
        ...prev.offlineMaterials,
        materials: prev.offlineMaterials.materials.filter((_, i) => i !== index)
      }
    }));
    updateOfflineMaterialsCost();
  };

  const updateOfflineMaterial = (index, field, value) => {
    const newFormData = { ...formData };
    newFormData.offlineMaterials.materials[index][field] = value;
    
    // Recalculate total cost for this material
    if (field === 'cost' || field === 'quantity') {
      const cost = parseFloat(newFormData.offlineMaterials.materials[index].cost) || 0;
      const quantity = parseInt(newFormData.offlineMaterials.materials[index].quantity) || 1;
      newFormData.offlineMaterials.materials[index].totalCost = cost * quantity;
    }
    
    setFormData(newFormData);
    updateOfflineMaterialsCost();
  };

  const updateOfflineMaterialsCost = () => {
    const totalCost = formData.offlineMaterials.materials.reduce((sum, material) => {
      return sum + (material.totalCost || 0);
    }, 0);

    setFormData(prev => ({
      ...prev,
      offlineMaterials: {
        ...prev.offlineMaterials,
        totalCost
      },
      pricing: {
        regular: {
          ...prev.pricing.regular,
          offlineMaterialCost: prev.offlineMaterials.enabled ? totalCost : 0,
          totalPrice: prev.pricing.regular.basePrice + (prev.offlineMaterials.enabled ? totalCost : 0)
        },
        revision: {
          ...prev.pricing.revision,
          offlineMaterialCost: prev.offlineMaterials.enabled ? totalCost : 0,
          totalPrice: prev.pricing.revision.basePrice + (prev.offlineMaterials.enabled ? totalCost : 0)
        }
      }
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.language) newErrors.language = 'Language is required';
    if (!formData.level) newErrors.level = 'Level is required';
    if (!formData.totalCapacity || formData.totalCapacity < 1) newErrors.totalCapacity = 'Total capacity must be at least 1';
    if (!formData.courseDuration || formData.courseDuration < 1) newErrors.courseDuration = 'Course duration must be at least 1 month';
    if (!formData.batchSizeLimit || formData.batchSizeLimit < 1) newErrors.batchSizeLimit = 'Batch size limit must be at least 1';
    
    if (!formData.batchTypes.regular.enabled && !formData.batchTypes.revision.enabled) {
      newErrors.batchTypes = 'At least one batch type must be enabled';
    }

    if (formData.batchTypes.regular.enabled && (!formData.pricing.regular.basePrice || formData.pricing.regular.basePrice < 0)) {
      newErrors.regularPrice = 'Regular batch base price is required';
    }

    if (formData.batchTypes.revision.enabled && (!formData.pricing.revision.basePrice || formData.pricing.revision.basePrice < 0)) {
      newErrors.revisionPrice = 'Revision batch base price is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/courses', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        router.push('/admin/courses');
      } else {
        const error = await response.json();
        setErrors({ submit: error.message || 'Failed to create course' });
      }
    } catch (error) {
      setErrors({ submit: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(price);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/courses">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Courses
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create New Course</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Set up a new course with batch management and pricing
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Basic Information
            </CardTitle>
            <CardDescription>
              Set up the basic course details and configuration
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Course Name (Optional)
                </label>
                <Input
                  placeholder="Leave empty for auto-generated name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Auto-generated: "{formData.language} {formData.level} {months.find(m => m.value === formData.month)?.name} {formData.year}"
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Language *
                </label>
                <select
                  value={formData.language}
                  onChange={(e) => handleInputChange('language', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="">Select Language</option>
                  {languages.map(lang => (
                    <option key={lang} value={lang}>{lang}</option>
                  ))}
                </select>
                {errors.language && <p className="text-red-500 text-sm mt-1">{errors.language}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Level *
                </label>
                <select
                  value={formData.level}
                  onChange={(e) => handleInputChange('level', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="">Select Level</option>
                  {levels.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
                {errors.level && <p className="text-red-500 text-sm mt-1">{errors.level}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Month *
                </label>
                <select
                  value={formData.month}
                  onChange={(e) => handleInputChange('month', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  {months.map(month => (
                    <option key={month.value} value={month.value}>{month.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Year *
                </label>
                <Input
                  type="number"
                  min="2024"
                  max="2030"
                  value={formData.year}
                  onChange={(e) => handleInputChange('year', parseInt(e.target.value))}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Course description..."
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Course Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Course Configuration</CardTitle>
            <CardDescription>
              Set capacity, duration, and batch settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Total Capacity *
                </label>
                <Input
                  type="number"
                  min="1"
                  max="1000"
                  value={formData.totalCapacity}
                  onChange={(e) => handleInputChange('totalCapacity', parseInt(e.target.value))}
                />
                {errors.totalCapacity && <p className="text-red-500 text-sm mt-1">{errors.totalCapacity}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Course Duration (Months) *
                </label>
                <Input
                  type="number"
                  min="1"
                  max="24"
                  value={formData.courseDuration}
                  onChange={(e) => handleInputChange('courseDuration', parseInt(e.target.value))}
                />
                {errors.courseDuration && <p className="text-red-500 text-sm mt-1">{errors.courseDuration}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Batch Size Limit *
                </label>
                <Input
                  type="number"
                  min="1"
                  max="100"
                  value={formData.batchSizeLimit}
                  onChange={(e) => handleInputChange('batchSizeLimit', parseInt(e.target.value))}
                />
                {errors.batchSizeLimit && <p className="text-red-500 text-sm mt-1">{errors.batchSizeLimit}</p>}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Batch Types */}
        <Card>
          <CardHeader>
            <CardTitle>Batch Types</CardTitle>
            <CardDescription>
              Configure which batch types are available for this course
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Regular Batches */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-4">
                  <input
                    type="checkbox"
                    checked={formData.batchTypes.regular.enabled}
                    onChange={(e) => handleBatchTypeChange('regular', 'enabled', e.target.checked)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <h3 className="font-semibold text-gray-900 dark:text-white">Regular Batches</h3>
                </div>
                
                {formData.batchTypes.regular.enabled && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Base Price (₹)
                      </label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.pricing.regular.basePrice}
                        onChange={(e) => handlePricingChange('regular', 'basePrice', e.target.value)}
                      />
                      {errors.regularPrice && <p className="text-red-500 text-sm mt-1">{errors.regularPrice}</p>}
                    </div>
                    
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Total Price:</span>
                        <span className="font-semibold text-blue-600 dark:text-blue-400">
                          {formatPrice(formData.pricing.regular.totalPrice)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Revision Batches */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-4">
                  <input
                    type="checkbox"
                    checked={formData.batchTypes.revision.enabled}
                    onChange={(e) => handleBatchTypeChange('revision', 'enabled', e.target.checked)}
                    className="w-4 h-4 text-purple-600"
                  />
                  <h3 className="font-semibold text-gray-900 dark:text-white">Revision Batches</h3>
                </div>
                
                {formData.batchTypes.revision.enabled && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Base Price (₹)
                      </label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.pricing.revision.basePrice}
                        onChange={(e) => handlePricingChange('revision', 'basePrice', e.target.value)}
                      />
                      {errors.revisionPrice && <p className="text-red-500 text-sm mt-1">{errors.revisionPrice}</p>}
                    </div>
                    
                    <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Total Price:</span>
                        <span className="font-semibold text-purple-600 dark:text-purple-400">
                          {formatPrice(formData.pricing.revision.totalPrice)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {errors.batchTypes && <p className="text-red-500 text-sm">{errors.batchTypes}</p>}
          </CardContent>
        </Card>

        {/* Offline Materials */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Offline Materials
            </CardTitle>
            <CardDescription>
              Add offline materials and their costs to be included in course pricing
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={formData.offlineMaterials.enabled}
                onChange={(e) => handleInputChange('offlineMaterials', {
                  ...formData.offlineMaterials,
                  enabled: e.target.checked
                })}
                className="w-4 h-4 text-green-600"
              />
              <label className="font-medium text-gray-900 dark:text-white">
                Enable Offline Materials
              </label>
            </div>

            {formData.offlineMaterials.enabled && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium text-gray-900 dark:text-white">Materials</h4>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addOfflineMaterial}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Material
                  </Button>
                </div>

                {formData.offlineMaterials.materials.map((material, index) => (
                  <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-4">
                      <h5 className="font-medium text-gray-900 dark:text-white">Material {index + 1}</h5>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeOfflineMaterial(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Name *
                        </label>
                        <Input
                          value={material.name}
                          onChange={(e) => updateOfflineMaterial(index, 'name', e.target.value)}
                          placeholder="e.g., Course Book"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Type *
                        </label>
                        <select
                          value={material.type}
                          onChange={(e) => updateOfflineMaterial(index, 'type', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        >
                          {materialTypes.map(type => (
                            <option key={type.value} value={type.value}>{type.label}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Cost per Unit (₹) *
                        </label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={material.cost}
                          onChange={(e) => updateOfflineMaterial(index, 'cost', e.target.value)}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Quantity *
                        </label>
                        <Input
                          type="number"
                          min="1"
                          value={material.quantity}
                          onChange={(e) => updateOfflineMaterial(index, 'quantity', e.target.value)}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Supplier
                        </label>
                        <Input
                          value={material.supplier}
                          onChange={(e) => updateOfflineMaterial(index, 'supplier', e.target.value)}
                          placeholder="e.g., Amazon, Local Store"
                        />
                      </div>

                      <div className="flex items-end">
                        <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg w-full">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Total Cost:</span>
                            <span className="font-semibold text-green-600 dark:text-green-400">
                              {formatPrice(material.totalCost)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Description
                      </label>
                      <textarea
                        rows={2}
                        value={material.description}
                        onChange={(e) => updateOfflineMaterial(index, 'description', e.target.value)}
                        placeholder="Material description..."
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>
                ))}

                {formData.offlineMaterials.materials.length > 0 && (
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-900 dark:text-white">Total Materials Cost:</span>
                      <span className="text-xl font-bold text-green-600 dark:text-green-400">
                        {formatPrice(formData.offlineMaterials.totalCost)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex justify-end gap-4">
          <Link href="/admin/courses">
            <Button variant="outline">Cancel</Button>
          </Link>
          <Button type="submit" disabled={loading} className="bg-red-600 hover:bg-red-700">
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Creating...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Create Course
              </>
            )}
          </Button>
        </div>

        {errors.submit && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <p className="text-red-600 dark:text-red-400">{errors.submit}</p>
          </div>
        )}
      </form>
    </div>
  );
}
