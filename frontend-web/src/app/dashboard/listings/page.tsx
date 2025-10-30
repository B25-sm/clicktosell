'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  PlusIcon, 
  EyeIcon, 
  HeartIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowUpIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { PlaceholderImage } from '@/components/PlaceholderImage';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { formatCurrency } from '@/lib/utils';
import toast from 'react-hot-toast';
import axios from 'axios';

interface Listing {
  _id: string;
  title: string;
  price: { amount: number; currency: string; negotiable: boolean };
  images: Array<{ url: string; isPrimary: boolean }>;
  category: string;
  subcategory: string;
  condition: string;
  location: { city: string; state: string };
  status: string;
  availability: string;
  views: { total: number };
  favorites: number;
  createdAt: string;
  updatedAt: string;
  lastBumpedAt?: string;
}

const statusOptions = [
  { value: 'all', label: 'All Listings' },
  { value: 'active', label: 'Active' },
  { value: 'sold', label: 'Sold' },
  { value: 'draft', label: 'Draft' },
  { value: 'expired', label: 'Expired' }
];

const sortOptions = [
  { value: 'recent', label: 'Most Recent' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'views', label: 'Most Views' },
  { value: 'favorites', label: 'Most Favorites' },
  { value: 'price_high', label: 'Price: High to Low' },
  { value: 'price_low', label: 'Price: Low to High' }
];

export default function MyListingsPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [showFilters, setShowFilters] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchListings();
  }, [filter, sortBy]);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter !== 'all') params.append('status', filter);
      params.append('sortBy', sortBy);
      
      const response = await axios.get(`/users/listings?${params.toString()}`);
      setListings(response.data.data.listings);
    } catch (error) {
      console.error('Error fetching listings:', error);
      toast.error('Failed to load listings');
    } finally {
      setLoading(false);
    }
  };

  const handleListingAction = async (listingId: string, action: string) => {
    setActionLoading(listingId);
    try {
      switch (action) {
        case 'view':
          router.push(`/listings/${listingId}`);
          break;
        case 'edit':
          router.push(`/listings/${listingId}/edit`);
          break;
        case 'delete':
          if (confirm('Are you sure you want to delete this listing?')) {
            await axios.delete(`/listings/${listingId}`);
            toast.success('Listing deleted successfully');
            fetchListings();
          }
          break;
        case 'mark_sold':
          await axios.post(`/listings/${listingId}/mark-sold`);
          toast.success('Listing marked as sold');
          fetchListings();
          break;
        case 'bump':
          await axios.post(`/listings/${listingId}/bump`);
          toast.success('Listing bumped to top');
          fetchListings();
          break;
        case 'activate':
          await axios.put(`/listings/${listingId}`, { status: 'active' });
          toast.success('Listing activated');
          fetchListings();
          break;
        case 'deactivate':
          await axios.put(`/listings/${listingId}`, { status: 'inactive' });
          toast.success('Listing deactivated');
          fetchListings();
          break;
      }
    } catch (error: any) {
      console.error('Error performing action:', error);
      toast.error(error.response?.data?.message || 'Failed to perform action');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { color: 'bg-green-100 text-green-800', label: 'Active' },
      sold: { color: 'bg-blue-100 text-blue-800', label: 'Sold' },
      draft: { color: 'bg-gray-100 text-gray-800', label: 'Draft' },
      expired: { color: 'bg-red-100 text-red-800', label: 'Expired' },
      inactive: { color: 'bg-yellow-100 text-yellow-800', label: 'Inactive' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const canBump = (listing: Listing) => {
    if (listing.status !== 'active') return false;
    if (!listing.lastBumpedAt) return true;
    
    const lastBumped = new Date(listing.lastBumpedAt);
    const now = new Date();
    const hoursDiff = (now.getTime() - lastBumped.getTime()) / (1000 * 60 * 60);
    
    return hoursDiff >= 24; // Can bump once every 24 hours
  };

  if (loading) {
    return (
      <ProtectedRoute requireAuth>
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requireAuth>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <button onClick={() => router.back()} className="text-gray-700 hover:text-[#0A0F2C]">
                ← Back to Dashboard
              </button>
              <h1 className="text-2xl font-bold text-[#0A0F2C]">My Listings</h1>
              <Link
                href="/listings/create"
                className="bg-[#FFD100] text-black px-4 py-2 rounded-md font-medium hover:opacity-90 flex items-center"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                New Listing
              </Link>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Filters and Search */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <FunnelIcon className="h-5 w-5 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">Filters:</span>
                </div>
                
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#0A0F2C] focus:border-[#0A0F2C]"
                >
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#0A0F2C] focus:border-[#0A0F2C]"
                >
                  {sortOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="text-sm text-gray-600">
                {listings.length} listing{listings.length !== 1 ? 's' : ''} found
              </div>
            </div>
          </div>

          {/* Listings Grid */}
          {listings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                    
                    <div className="absolute top-2 left-2">
                      {getStatusBadge(listing.status)}
                    </div>
                    
                    <div className="absolute top-2 right-2 flex space-x-1">
                      <button
                        onClick={() => handleListingAction(listing._id, 'view')}
                        disabled={actionLoading === listing._id}
                        className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50 disabled:opacity-50"
                      >
                        <EyeIcon className="h-4 w-4 text-gray-600" />
                      </button>
                      <button
                        onClick={() => handleListingAction(listing._id, 'edit')}
                        disabled={actionLoading === listing._id}
                        className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50 disabled:opacity-50"
                      >
                        <PencilIcon className="h-4 w-4 text-gray-600" />
                      </button>
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
                    
                    <div className="flex items-center text-gray-600 text-sm mb-3">
                      <span>{listing.location.city}, {listing.location.state}</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-gray-500 text-sm mb-4">
                      <div className="flex items-center space-x-4">
                        <span className="flex items-center">
                          <EyeIcon className="h-4 w-4 mr-1" />
                          {listing.views.total}
                        </span>
                        <span className="flex items-center">
                          <HeartIcon className="h-4 w-4 mr-1" />
                          {listing.favorites}
                        </span>
                      </div>
                      <span className="text-xs">
                        {new Date(listing.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-2">
                      {listing.status === 'active' && (
                        <>
                          {canBump(listing) && (
                            <Button
                              onClick={() => handleListingAction(listing._id, 'bump')}
                              disabled={actionLoading === listing._id}
                              className="flex-1 text-xs bg-[#0A0F2C] text-white py-1 px-2 rounded hover:opacity-90 disabled:opacity-50"
                            >
                              <ArrowUpIcon className="h-3 w-3 mr-1" />
                              Bump
                            </Button>
                          )}
                          <Button
                            onClick={() => handleListingAction(listing._id, 'mark_sold')}
                            disabled={actionLoading === listing._id}
                            className="flex-1 text-xs bg-green-600 text-white py-1 px-2 rounded hover:opacity-90 disabled:opacity-50"
                          >
                            <CheckCircleIcon className="h-3 w-3 mr-1" />
                            Mark Sold
                          </Button>
                          <Button
                            onClick={() => handleListingAction(listing._id, 'deactivate')}
                            disabled={actionLoading === listing._id}
                            className="flex-1 text-xs bg-yellow-600 text-white py-1 px-2 rounded hover:opacity-90 disabled:opacity-50"
                          >
                            <XCircleIcon className="h-3 w-3 mr-1" />
                            Deactivate
                          </Button>
                        </>
                      )}
                      
                      {listing.status === 'inactive' && (
                        <Button
                          onClick={() => handleListingAction(listing._id, 'activate')}
                          disabled={actionLoading === listing._id}
                          className="flex-1 text-xs bg-green-600 text-white py-1 px-2 rounded hover:opacity-90 disabled:opacity-50"
                        >
                          <CheckCircleIcon className="h-3 w-3 mr-1" />
                          Activate
                        </Button>
                      )}
                      
                      <Button
                        onClick={() => handleListingAction(listing._id, 'delete')}
                        disabled={actionLoading === listing._id}
                        className="flex-1 text-xs bg-red-600 text-white py-1 px-2 rounded hover:opacity-90 disabled:opacity-50"
                      >
                        <TrashIcon className="h-3 w-3 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No listings found</h3>
              <p className="text-gray-600 mb-4">
                {filter === 'all' 
                  ? "You haven't created any listings yet." 
                  : `No ${statusOptions.find(opt => opt.value === filter)?.label.toLowerCase()} listings found.`
                }
              </p>
              <Link
                href="/listings/create"
                className="bg-[#0A0F2C] text-white px-6 py-2 rounded-md hover:opacity-90"
              >
                Create Your First Listing
              </Link>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}

