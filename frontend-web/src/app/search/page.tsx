'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { 
  MagnifyingGlassIcon, 
  FunnelIcon, 
  MapPinIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  TagIcon,
  XMarkIcon,
  AdjustmentsHorizontalIcon,
  HeartIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { PlaceholderImage } from '@/components/PlaceholderImage';
import { formatCurrency } from '@/lib/utils';
import { useFavorites } from '@/contexts/FavoritesContext';
import MobileLayout from '@/components/layout/MobileLayout';
import toast from 'react-hot-toast';
import axios from 'axios';

const searchSchema = yup.object({
  search: yup.string(),
  category: yup.string(),
  subcategory: yup.string(),
  city: yup.string(),
  state: yup.string(),
  minPrice: yup.number().min(0),
  maxPrice: yup.number().min(0),
  condition: yup.string(),
  sortBy: yup.string(),
  dateRange: yup.string(),
  negotiable: yup.boolean(),
  hasImages: yup.boolean(),
  verifiedSeller: yup.boolean()
});

type SearchFormData = yup.InferType<typeof searchSchema>;

interface SearchResult {
  _id: string;
  title: string;
  price: {
    amount: number;
    currency: string;
    negotiable: boolean;
  };
  images: Array<{
    url: string;
    isPrimary: boolean;
  }>;
  category: string;
  subcategory: string;
  condition: string;
  location: {
    city: string;
    state: string;
  };
  createdAt: string;
  views: {
    total: number;
  };
  seller: {
    firstName: string;
    lastName: string;
    profilePicture?: { url: string };
    verification: {
      email: { isVerified: boolean };
      phone: { isVerified: boolean };
    };
  };
}

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
  { value: 'new', label: 'New' },
  { value: 'like_new', label: 'Like New' },
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' },
  { value: 'poor', label: 'Poor' }
];

const sortOptions = [
  { value: 'recent', label: 'Most Recent' },
  { value: 'price_low', label: 'Price: Low to High' },
  { value: 'price_high', label: 'Price: High to Low' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'views', label: 'Most Views' },
  { value: 'distance', label: 'Nearest First' }
];

const dateRanges = [
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'year', label: 'This Year' }
];

const popularCities = [
  'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad',
  'Jaipur', 'Surat', 'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Thane', 'Bhopal'
];

export default function SearchPage() {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [totalResults, setTotalResults] = useState(0);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isFavorited, toggleFavorite } = useFavorites();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors }
  } = useForm<SearchFormData>({
    resolver: yupResolver(searchSchema),
    defaultValues: {
      search: searchParams.get('q') || '',
      category: searchParams.get('category') || '',
      subcategory: searchParams.get('subcategory') || '',
      city: searchParams.get('city') || '',
      state: searchParams.get('state') || '',
      minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined,
      maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
      condition: searchParams.get('condition') || '',
      sortBy: searchParams.get('sortBy') || 'recent',
      dateRange: searchParams.get('dateRange') || '',
      negotiable: searchParams.get('negotiable') === 'true',
      hasImages: searchParams.get('hasImages') === 'true',
      verifiedSeller: searchParams.get('verifiedSeller') === 'true'
    }
  });

  const watchedValues = watch();
  const watchedCategory = watch('category');

  useEffect(() => {
    const params = {
      search: searchParams.get('q') || '',
      category: searchParams.get('category') || '',
      subcategory: searchParams.get('subcategory') || '',
      city: searchParams.get('city') || '',
      state: searchParams.get('state') || '',
      minPrice: searchParams.get('minPrice') || '',
      maxPrice: searchParams.get('maxPrice') || '',
      condition: searchParams.get('condition') || '',
      sortBy: searchParams.get('sortBy') || 'recent',
      dateRange: searchParams.get('dateRange') || '',
      negotiable: searchParams.get('negotiable') || '',
      hasImages: searchParams.get('hasImages') || '',
      verifiedSeller: searchParams.get('verifiedSeller') || ''
    };
    
    if (Object.values(params).some(value => value !== '')) {
      performSearch(params);
    }
  }, [searchParams]);

  const performSearch = async (params: any) => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          queryParams.append(key, String(value));
        }
      });

      const response = await axios.get(`/listings?${queryParams.toString()}`);
      const data = response.data.data;
      
      setResults(data.listings || []);
      setTotalResults(data.pagination?.totalItems || 0);
      
      // Update URL
      const newUrl = `/search?${queryParams.toString()}`;
      router.replace(newUrl);
    } catch (error) {
      console.error('Error performing search:', error);
      toast.error('Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = (data: SearchFormData) => {
    performSearch(data);
  };

  const handleSearchInput = async (value: string) => {
    if (value.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      const response = await axios.get(`/listings/suggestions?q=${encodeURIComponent(value)}`);
      setSuggestions(response.data.data.suggestions || []);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    }
  };

  const clearFilters = () => {
    reset();
    setResults([]);
    setTotalResults(0);
    router.push('/search');
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (watchedValues.category) count++;
    if (watchedValues.city) count++;
    if (watchedValues.minPrice || watchedValues.maxPrice) count++;
    if (watchedValues.condition) count++;
    if (watchedValues.dateRange) count++;
    if (watchedValues.negotiable) count++;
    if (watchedValues.hasImages) count++;
    if (watchedValues.verifiedSeller) count++;
    return count;
  };

  return (
    <MobileLayout title="Search" showSearch={true} showBackButton={true}>
      <div className="min-h-screen bg-gray-50">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Form */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Main Search Bar */}
            <div className="relative">
              <div className="flex">
                <div className="relative flex-1">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    {...register('search')}
                    type="text"
                    placeholder="Search for anything..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-l-md focus:outline-none focus:ring-[#0A0F2C] focus:border-[#0A0F2C] text-lg"
                    onChange={(e) => handleSearchInput(e.target.value)}
                  />
                  
                  {/* Search Suggestions */}
                  {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-b-md shadow-lg z-10">
                      {suggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => {
                            setValue('search', suggestion);
                            setShowSuggestions(false);
                            handleSubmit(onSubmit)();
                          }}
                          className="w-full px-4 py-2 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-3 bg-[#0A0F2C] text-white rounded-r-md hover:opacity-90 disabled:opacity-50"
                >
                  {loading ? <LoadingSpinner size="sm" /> : 'Search'}
                </Button>
              </div>
            </div>

            {/* Quick Filters */}
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-64">
                <select
                  {...register('category')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#0A0F2C] focus:border-[#0A0F2C]"
                >
                  <option value="">All Categories</option>
                  {Object.entries(categories).map(([key, category]) => (
                    <option key={key} value={key}>
                      {category.icon} {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex-1 min-w-48">
                <select
                  {...register('subcategory')}
                  disabled={!watchedCategory}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#0A0F2C] focus:border-[#0A0F2C] disabled:bg-gray-100"
                >
                  <option value="">All Subcategories</option>
                  {watchedCategory && categories[watchedCategory as keyof typeof categories]?.subcategories.map(sub => (
                    <option key={sub} value={sub}>
                      {sub.replace('_', ' ').toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex-1 min-w-48">
                <input
                  {...register('city')}
                  type="text"
                  placeholder="City"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#0A0F2C] focus:border-[#0A0F2C]"
                />
              </div>

              <div className="flex-1 min-w-32">
                <select
                  {...register('sortBy')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#0A0F2C] focus:border-[#0A0F2C]"
                >
                  {sortOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Advanced Filters Toggle */}
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="flex items-center text-[#0A0F2C] hover:text-[#0A0F2C]/80"
              >
                <AdjustmentsHorizontalIcon className="h-5 w-5 mr-2" />
                Advanced Filters
                {getActiveFiltersCount() > 0 && (
                  <span className="ml-2 bg-[#0A0F2C] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {getActiveFiltersCount()}
                  </span>
                )}
              </button>

              {getActiveFiltersCount() > 0 && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-gray-600 hover:text-gray-800 flex items-center"
                >
                  <XMarkIcon className="h-4 w-4 mr-1" />
                  Clear All
                </button>
              )}
            </div>

            {/* Advanced Filters */}
            {showAdvancedFilters && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price Range</label>
                  <div className="flex space-x-2">
                    <input
                      {...register('minPrice')}
                      type="number"
                      placeholder="Min"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#0A0F2C] focus:border-[#0A0F2C]"
                    />
                    <input
                      {...register('maxPrice')}
                      type="number"
                      placeholder="Max"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#0A0F2C] focus:border-[#0A0F2C]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
                  <select
                    {...register('condition')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#0A0F2C] focus:border-[#0A0F2C]"
                  >
                    <option value="">All Conditions</option>
                    {conditions.map(condition => (
                      <option key={condition.value} value={condition.value}>
                        {condition.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date Posted</label>
                  <select
                    {...register('dateRange')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#0A0F2C] focus:border-[#0A0F2C]"
                  >
                    <option value="">Any Time</option>
                    {dateRanges.map(range => (
                      <option key={range.value} value={range.value}>
                        {range.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                  <input
                    {...register('state')}
                    type="text"
                    placeholder="State"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#0A0F2C] focus:border-[#0A0F2C]"
                  />
                </div>

                <div className="md:col-span-2 lg:col-span-4">
                  <div className="flex flex-wrap gap-4">
                    <label className="flex items-center">
                      <input
                        {...register('negotiable')}
                        type="checkbox"
                        className="h-4 w-4 text-[#0A0F2C] focus:ring-[#0A0F2C] border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">Negotiable Price</span>
                    </label>

                    <label className="flex items-center">
                      <input
                        {...register('hasImages')}
                        type="checkbox"
                        className="h-4 w-4 text-[#0A0F2C] focus:ring-[#0A0F2C] border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">Has Images</span>
                    </label>

                    <label className="flex items-center">
                      <input
                        {...register('verifiedSeller')}
                        type="checkbox"
                        className="h-4 w-4 text-[#0A0F2C] focus:ring-[#0A0F2C] border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">Verified Sellers Only</span>
                    </label>
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Popular Cities */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Popular Cities</h3>
          <div className="flex flex-wrap gap-2">
            {popularCities.map(city => (
              <button
                key={city}
                onClick={() => {
                  setValue('city', city);
                  handleSubmit(onSubmit)();
                }}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full hover:bg-[#0A0F2C] hover:text-white transition"
              >
                {city}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        <div className="space-y-6">
          {/* Results Header */}
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {totalResults > 0 ? `${totalResults} results found` : 'No results found'}
              </h2>
              {totalResults > 0 && (
                <p className="text-gray-600">
                  {watchedValues.search && `for "${watchedValues.search}"`}
                </p>
              )}
            </div>
          </div>

          {/* Results Grid */}
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : results.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {results.map((listing) => (
                <div key={listing._id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition border border-gray-200">
                  <div className="relative">
                    <Link href={`/listings/${listing._id}`}>
                      <div className="aspect-w-16 aspect-h-9">
                        <PlaceholderImage
                          src={listing.images[0]?.url}
                          alt={listing.title}
                          className="w-full h-48 object-cover rounded-t-lg"
                          fallbackText="No Image"
                        />
                      </div>
                    </Link>
                    
                    <button
                      onClick={() => toggleFavorite(listing._id)}
                      className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-50"
                    >
                      {isFavorited(listing._id) ? (
                        <HeartSolidIcon className="h-5 w-5 text-red-500" />
                      ) : (
                        <HeartIcon className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                    
                    <div className="absolute bottom-2 left-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-sm">
                      {listing.condition.replace('_', ' ').toUpperCase()}
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <Link href={`/listings/${listing._id}`}>
                      <h3 className="font-semibold text-lg mb-2 line-clamp-2 hover:text-[#0A0F2C]">
                        {listing.title}
                      </h3>
                    </Link>
                    
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[#0A0F2C] font-bold text-xl">
                        {formatCurrency(listing.price.amount, listing.price.currency, 'en-IN')}
                        {listing.price.negotiable && (
                          <span className="text-sm text-gray-500 ml-1">(Negotiable)</span>
                        )}
                      </p>
                    </div>
                    
                    <div className="flex items-center text-gray-600 text-sm mb-2">
                      <MapPinIcon className="h-4 w-4 mr-1" />
                      <span>{listing.location.city}, {listing.location.state}</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-gray-500 text-sm">
                      <div className="flex items-center">
                        <CalendarIcon className="h-4 w-4 mr-1" />
                        <span>{new Date(listing.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center">
                        <EyeIcon className="h-4 w-4 mr-1" />
                        <span>{listing.views.total}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center text-sm text-gray-600">
                        <span>by {listing.seller.firstName} {listing.seller.lastName}</span>
                        {(listing.seller.verification.email.isVerified || listing.seller.verification.phone.isVerified) && (
                          <span className="ml-2 text-green-600 text-xs">✓ Verified</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <MagnifyingGlassIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
              <p className="text-gray-600 mb-4">
                Try adjusting your search criteria or browse all categories
              </p>
              <Button
                onClick={clearFilters}
                className="bg-[#0A0F2C] text-white px-6 py-2 rounded-md hover:opacity-90"
              >
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </div>
      </div>
    </MobileLayout>
  );
}
