'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { 
  MagnifyingGlassIcon, 
  FunnelIcon, 
  AdjustmentsHorizontalIcon,
  HeartIcon,
  EyeIcon,
  MapPinIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { PlaceholderImage } from '@/components/PlaceholderImage';
import { formatCurrency } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useFavorites } from '@/contexts/FavoritesContext';
import SearchBar from '@/components/search/SearchBar';
import SearchFilters from '@/components/search/SearchFilters';
import MobileLayout from '@/components/layout/MobileLayout';
import toast from 'react-hot-toast';
import axios from 'axios';

const searchSchema = yup.object({
  search: yup.string(),
  category: yup.string(),
  subcategory: yup.string(),
  city: yup.string(),
  minPrice: yup.number().min(0),
  maxPrice: yup.number().min(0),
  condition: yup.string(),
  sortBy: yup.string()
});

type SearchFormData = yup.InferType<typeof searchSchema>;

interface Listing {
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
  isFavorited?: boolean;
  seller: {
    firstName: string;
    lastName: string;
    profilePicture?: { url: string };
    rating: number;
  };
}

interface ListingsResponse {
  listings: Listing[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  filters: any;
}

const categories = [
  { name: 'electronics', displayName: 'Electronics', icon: '📱' },
  { name: 'furniture', displayName: 'Furniture', icon: '🪑' },
  { name: 'vehicles', displayName: 'Vehicles', icon: '🚗' },
  { name: 'real_estate', displayName: 'Real Estate', icon: '🏠' },
  { name: 'fashion', displayName: 'Fashion', icon: '👕' },
  { name: 'sports', displayName: 'Sports', icon: '⚽' },
  { name: 'books', displayName: 'Books', icon: '📚' },
  { name: 'pets', displayName: 'Pets', icon: '🐕' },
  { name: 'services', displayName: 'Services', icon: '🔧' },
  { name: 'others', displayName: 'Others', icon: '📦' }
];

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
  { value: 'popular', label: 'Most Popular' }
];

export default function ListingsPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<any>(null);
  const [showFilters, setShowFilters] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { isFavorited, toggleFavorite } = useFavorites();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset
  } = useForm<SearchFormData>({
    resolver: yupResolver(searchSchema),
    defaultValues: {
      search: searchParams.get('search') || '',
      category: searchParams.get('category') || '',
      subcategory: searchParams.get('subcategory') || '',
      city: searchParams.get('city') || '',
      minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined,
      maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
      condition: searchParams.get('condition') || '',
      sortBy: searchParams.get('sortBy') || 'recent'
    }
  });

  const watchedValues = watch();

  const fetchListings = async (params: any = {}) => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          queryParams.append(key, String(value));
        }
      });

      const response = await axios.get(`/listings?${queryParams.toString()}`);
      const data: ListingsResponse = response.data.data;
      
      setListings(data.listings);
      setPagination(data.pagination);
      
      // Update URL
      const newUrl = `/listings?${queryParams.toString()}`;
      router.replace(newUrl);
    } catch (error) {
      console.error('Error fetching listings:', error);
      toast.error('Failed to load listings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const params = {
      search: searchParams.get('search') || '',
      category: searchParams.get('category') || '',
      subcategory: searchParams.get('subcategory') || '',
      city: searchParams.get('city') || '',
      minPrice: searchParams.get('minPrice') || '',
      maxPrice: searchParams.get('maxPrice') || '',
      condition: searchParams.get('condition') || '',
      sortBy: searchParams.get('sortBy') || 'recent',
      page: searchParams.get('page') || '1'
    };
    
    fetchListings(params);
  }, [searchParams]);

  const onSubmit = (data: SearchFormData) => {
    fetchListings({ ...data, page: 1 });
  };


  const clearFilters = () => {
    reset();
    fetchListings({ page: 1 });
  };

  return (
    <MobileLayout title="Browse Listings" showSearch={true}>
      <div className="min-h-screen bg-gray-50">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <SearchFilters
          filters={{
            category: watchedValues.category || '',
            subcategory: watchedValues.subcategory || '',
            city: watchedValues.city || '',
            state: '',
            minPrice: watchedValues.minPrice,
            maxPrice: watchedValues.maxPrice,
            condition: watchedValues.condition || '',
            sortBy: watchedValues.sortBy || 'recent',
            dateRange: '',
            negotiable: false,
            hasImages: false,
            verifiedSeller: false
          }}
          onFilterChange={(newFilters) => {
            Object.entries(newFilters).forEach(([key, value]) => {
              setValue(key as keyof SearchFormData, value);
            });
            fetchListings({ ...newFilters, page: 1 });
          }}
          onClearFilters={clearFilters}
          className="mb-8"
        />

        {/* Results Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {pagination ? `${pagination.totalItems} listings found` : 'Browse Listings'}
            </h2>
            {pagination && (
              <p className="text-gray-600">
                Page {pagination.currentPage} of {pagination.totalPages}
              </p>
            )}
          </div>
        </div>

        {/* Listings Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : listings.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {listings.map((listing) => (
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
                      {isFavorited(listing._id) || listing.isFavorited ? (
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
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2 mt-8">
                <Button
                  onClick={() => fetchListings({ ...watchedValues, page: pagination.currentPage - 1 })}
                  disabled={!pagination.hasPrevPage}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </Button>
                
                <div className="flex space-x-1">
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <Button
                        key={page}
                        onClick={() => fetchListings({ ...watchedValues, page })}
                        className={`px-4 py-2 rounded-md ${
                          page === pagination.currentPage
                            ? 'bg-[#0A0F2C] text-white'
                            : 'border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </Button>
                    );
                  })}
                </div>
                
                <Button
                  onClick={() => fetchListings({ ...watchedValues, page: pagination.currentPage + 1 })}
                  disabled={!pagination.hasNextPage}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No listings found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your search criteria or browse all categories</p>
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
    </MobileLayout>
  );
}
