'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { 
  PhotoIcon, 
  XMarkIcon,
  MapPinIcon,
  TagIcon,
  WrenchScrewdriverIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';
import axios from 'axios';

const createListingSchema = yup.object({
  title: yup.string().min(10, 'Title must be at least 10 characters').max(100, 'Title must be less than 100 characters').required('Title is required'),
  description: yup.string().min(20, 'Description must be at least 20 characters').max(2000, 'Description must be less than 2000 characters').required('Description is required'),
  category: yup.string().required('Category is required'),
  subcategory: yup.string().required('Subcategory is required'),
  price: yup.object({
    amount: yup.number().min(0, 'Price must be positive').required('Price is required'),
    currency: yup.string().default('INR'),
    negotiable: yup.boolean().default(true)
  }),
  condition: yup.string().oneOf(['new', 'like_new', 'good', 'fair', 'poor']).required('Condition is required'),
  location: yup.object({
    address: yup.string().min(10, 'Address must be at least 10 characters').max(200, 'Address must be less than 200 characters').required('Address is required'),
    city: yup.string().min(2, 'City is required').max(50, 'City must be less than 50 characters').required('City is required'),
    state: yup.string().min(2, 'State is required').max(50, 'State must be less than 50 characters').required('State is required'),
    pincode: yup.string().matches(/^[1-9][0-9]{5}$/, 'Invalid pincode format').required('Pincode is required')
  }),
  brand: yup.string().optional(),
  model: yup.string().optional(),
  yearOfPurchase: yup.number().min(1900).max(new Date().getFullYear()).optional(),
  warranty: yup.object({
    hasWarranty: yup.boolean().default(false),
    warrantyPeriod: yup.string().optional(),
    warrantyExpires: yup.string().optional()
  }).optional(),
  features: yup.array().of(yup.string()).optional(),
  tags: yup.string().optional(),
  delivery: yup.object({
    available: yup.boolean().default(false),
    cost: yup.number().min(0).optional(),
    areas: yup.string().optional()
  }).optional()
});

type CreateListingFormData = yup.InferType<typeof createListingSchema>;

const categories = {
  electronics: {
    name: 'Electronics',
    icon: '📱',
    subcategories: ['mobile', 'laptop', 'tv', 'camera', 'tablet', 'gaming', 'audio', 'accessories']
  },
  furniture: {
    name: 'Furniture',
    icon: '🪑',
    subcategories: ['sofa', 'bed', 'table', 'chair', 'wardrobe', 'decor', 'kitchen', 'office']
  },
  vehicles: {
    name: 'Vehicles',
    icon: '🚗',
    subcategories: ['car', 'bike', 'scooter', 'bicycle', 'commercial', 'parts', 'accessories']
  },
  real_estate: {
    name: 'Real Estate',
    icon: '🏠',
    subcategories: ['house', 'apartment', 'plot', 'commercial', 'pg', 'office', 'warehouse']
  },
  fashion: {
    name: 'Fashion',
    icon: '👕',
    subcategories: ['men', 'women', 'kids', 'shoes', 'bags', 'watches', 'jewelry', 'accessories']
  },
  sports: {
    name: 'Sports',
    icon: '⚽',
    subcategories: ['fitness', 'outdoor', 'cycling', 'cricket', 'football', 'badminton', 'gym']
  },
  books: {
    name: 'Books',
    icon: '📚',
    subcategories: ['academic', 'fiction', 'non_fiction', 'children', 'comics', 'magazines']
  },
  pets: {
    name: 'Pets',
    icon: '🐕',
    subcategories: ['dogs', 'cats', 'birds', 'fish', 'accessories', 'food', 'care']
  },
  services: {
    name: 'Services',
    icon: '🔧',
    subcategories: ['home', 'education', 'health', 'business', 'repair', 'beauty', 'events']
  },
  others: {
    name: 'Others',
    icon: '📦',
    subcategories: ['collectibles', 'art', 'music', 'toys', 'baby', 'health', 'miscellaneous']
  }
};

const conditions = [
  { value: 'new', label: 'New', description: 'Brand new, never used' },
  { value: 'like_new', label: 'Like New', description: 'Used very little, looks new' },
  { value: 'good', label: 'Good', description: 'Used but in good condition' },
  { value: 'fair', label: 'Fair', description: 'Used with some wear' },
  { value: 'poor', label: 'Poor', description: 'Heavily used, needs repair' }
];

export default function CreateListingPage() {
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { user } = useAuth();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm<CreateListingFormData>({
    resolver: yupResolver(createListingSchema),
    defaultValues: {
      price: {
        currency: 'INR',
        negotiable: true
      },
      condition: 'good',
      warranty: {
        hasWarranty: false
      },
      delivery: {
        available: false
      }
    }
  });

  const watchedCategory = watch('category');
  const watchedWarranty = watch('warranty');
  const watchedDelivery = watch('delivery');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (validFiles.length === 0) {
      toast.error('Please select valid image files');
      return;
    }

    if (images.length + validFiles.length > 10) {
      toast.error('Maximum 10 images allowed');
      return;
    }

    setImages(prev => [...prev, ...validFiles]);
    
    // Create previews
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreviews(prev => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: CreateListingFormData) => {
    if (images.length === 0) {
      toast.error('Please upload at least one image');
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      
      // Add form data
      Object.entries(data).forEach(([key, value]) => {
        if (key === 'price' || key === 'location' || key === 'warranty' || key === 'delivery') {
          formData.append(key, JSON.stringify(value));
        } else if (key === 'features' && value) {
          formData.append(key, JSON.stringify(value));
        } else if (key === 'tags' && value) {
          formData.append(key, value);
        } else if (value !== undefined && value !== '') {
          formData.append(key, String(value));
        }
      });

      // Add images
      images.forEach((image, index) => {
        formData.append('images', image);
      });

      const response = await axios.post('/listings', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success('Listing created successfully!');
      router.push(`/listings/${response.data.data.listing._id}`);
    } catch (error: any) {
      console.error('Error creating listing:', error);
      toast.error(error.response?.data?.message || 'Failed to create listing');
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <ProtectedRoute requireAuth requireEmailVerification>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <button onClick={() => router.back()} className="text-gray-700 hover:text-[#0A0F2C]">
                ← Back
              </button>
              <h1 className="text-2xl font-bold text-[#0A0F2C]">Create New Listing</h1>
              <div></div>
            </div>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-center space-x-8">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step <= currentStep 
                      ? 'bg-[#0A0F2C] text-white' 
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {step}
                  </div>
                  {step < 3 && (
                    <div className={`w-16 h-1 ml-4 ${
                      step < currentStep ? 'bg-[#0A0F2C]' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-center space-x-8 mt-2">
              <span className={`text-sm ${currentStep >= 1 ? 'text-[#0A0F2C] font-medium' : 'text-gray-500'}`}>
                Basic Info
              </span>
              <span className={`text-sm ${currentStep >= 2 ? 'text-[#0A0F2C] font-medium' : 'text-gray-500'}`}>
                Details
              </span>
              <span className={`text-sm ${currentStep >= 3 ? 'text-[#0A0F2C] font-medium' : 'text-gray-500'}`}>
                Images
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-6">Basic Information</h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Title *
                    </label>
                    <input
                      {...register('title')}
                      type="text"
                      placeholder="Enter a descriptive title for your item"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#0A0F2C] focus:border-[#0A0F2C]"
                    />
                    {errors.title && (
                      <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description *
                    </label>
                    <textarea
                      {...register('description')}
                      rows={4}
                      placeholder="Describe your item in detail..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#0A0F2C] focus:border-[#0A0F2C]"
                    />
                    {errors.description && (
                      <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category *
                      </label>
                      <select
                        {...register('category')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#0A0F2C] focus:border-[#0A0F2C]"
                      >
                        <option value="">Select Category</option>
                        {Object.entries(categories).map(([key, category]) => (
                          <option key={key} value={key}>
                            {category.icon} {category.name}
                          </option>
                        ))}
                      </select>
                      {errors.category && (
                        <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Subcategory *
                      </label>
                      <select
                        {...register('subcategory')}
                        disabled={!watchedCategory}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#0A0F2C] focus:border-[#0A0F2C] disabled:bg-gray-100"
                      >
                        <option value="">Select Subcategory</option>
                        {watchedCategory && categories[watchedCategory as keyof typeof categories]?.subcategories.map(sub => (
                          <option key={sub} value={sub}>
                            {sub.replace('_', ' ').toUpperCase()}
                          </option>
                        ))}
                      </select>
                      {errors.subcategory && (
                        <p className="mt-1 text-sm text-red-600">{errors.subcategory.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Price *
                      </label>
                      <div className="flex">
                        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                          ₹
                        </span>
                        <input
                          {...register('price.amount')}
                          type="number"
                          placeholder="0"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-r-md focus:outline-none focus:ring-[#0A0F2C] focus:border-[#0A0F2C]"
                        />
                      </div>
                      {errors.price?.amount && (
                        <p className="mt-1 text-sm text-red-600">{errors.price.amount.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Condition *
                      </label>
                      <select
                        {...register('condition')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#0A0F2C] focus:border-[#0A0F2C]"
                      >
                        {conditions.map(condition => (
                          <option key={condition.value} value={condition.value}>
                            {condition.label} - {condition.description}
                          </option>
                        ))}
                      </select>
                      {errors.condition && (
                        <p className="mt-1 text-sm text-red-600">{errors.condition.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center">
                    <input
                      {...register('price.negotiable')}
                      type="checkbox"
                      className="h-4 w-4 text-[#0A0F2C] focus:ring-[#0A0F2C] border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-900">
                      Price is negotiable
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Location and Additional Details */}
            {currentStep === 2 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-6">Location & Details</h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address *
                    </label>
                    <input
                      {...register('location.address')}
                      type="text"
                      placeholder="Enter your full address"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#0A0F2C] focus:border-[#0A0F2C]"
                    />
                    {errors.location?.address && (
                      <p className="mt-1 text-sm text-red-600">{errors.location.address.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City *
                      </label>
                      <input
                        {...register('location.city')}
                        type="text"
                        placeholder="City"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#0A0F2C] focus:border-[#0A0F2C]"
                      />
                      {errors.location?.city && (
                        <p className="mt-1 text-sm text-red-600">{errors.location.city.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        State *
                      </label>
                      <input
                        {...register('location.state')}
                        type="text"
                        placeholder="State"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#0A0F2C] focus:border-[#0A0F2C]"
                      />
                      {errors.location?.state && (
                        <p className="mt-1 text-sm text-red-600">{errors.location.state.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Pincode *
                      </label>
                      <input
                        {...register('location.pincode')}
                        type="text"
                        placeholder="123456"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#0A0F2C] focus:border-[#0A0F2C]"
                      />
                      {errors.location?.pincode && (
                        <p className="mt-1 text-sm text-red-600">{errors.location.pincode.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Brand (Optional)
                      </label>
                      <input
                        {...register('brand')}
                        type="text"
                        placeholder="e.g., Apple, Samsung"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#0A0F2C] focus:border-[#0A0F2C]"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Model (Optional)
                      </label>
                      <input
                        {...register('model')}
                        type="text"
                        placeholder="e.g., iPhone 13, Galaxy S21"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#0A0F2C] focus:border-[#0A0F2C]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Year of Purchase (Optional)
                    </label>
                    <input
                      {...register('yearOfPurchase')}
                      type="number"
                      min="1900"
                      max={new Date().getFullYear()}
                      placeholder="2023"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#0A0F2C] focus:border-[#0A0F2C]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Features (Optional)
                    </label>
                    <input
                      {...register('features')}
                      type="text"
                      placeholder="Enter features separated by commas"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#0A0F2C] focus:border-[#0A0F2C]"
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      e.g., Wireless charging, Water resistant, 5G enabled
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tags (Optional)
                    </label>
                    <input
                      {...register('tags')}
                      type="text"
                      placeholder="Enter tags separated by commas"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#0A0F2C] focus:border-[#0A0F2C]"
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      e.g., urgent, best price, original
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Images */}
            {currentStep === 3 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-6">Upload Images</h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Photos * (Max 10 images)
                    </label>
                    
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="mt-4">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="bg-[#0A0F2C] text-white px-4 py-2 rounded-md hover:opacity-90"
                        >
                          Choose Images
                        </button>
                        <p className="mt-2 text-sm text-gray-600">
                          PNG, JPG, JPEG up to 5MB each
                        </p>
                      </div>
                    </div>
                    
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </div>

                  {imagePreviews.length > 0 && (
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Selected Images</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {imagePreviews.map((preview, index) => (
                          <div key={index} className="relative">
                            <img
                              src={preview}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-32 object-cover rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                            >
                              <XMarkIcon className="h-4 w-4" />
                            </button>
                            {index === 0 && (
                              <div className="absolute bottom-2 left-2 bg-[#0A0F2C] text-white px-2 py-1 rounded text-xs">
                                Primary
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between">
              <Button
                type="button"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </Button>

              {currentStep < 3 ? (
                <Button
                  type="button"
                  onClick={nextStep}
                  className="px-6 py-2 bg-[#0A0F2C] text-white rounded-md hover:opacity-90"
                >
                  Next
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={isSubmitting || images.length === 0}
                  className="px-6 py-2 bg-[#FFD100] text-black rounded-md hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    'Create Listing'
                  )}
                </Button>
              )}
            </div>
          </form>
        </div>
      </div>
    </ProtectedRoute>
  );
}

