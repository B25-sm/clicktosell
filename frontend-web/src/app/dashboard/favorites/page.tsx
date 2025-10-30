'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  HeartIcon,
  EyeIcon,
  MapPinIcon,
  CalendarIcon,
  FunnelIcon,
  TrashIcon,
  ShareIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { PlaceholderImage } from '@/components/PlaceholderImage';
import { FavoriteButton } from '@/components/favorites/FavoriteButton';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useFavorites } from '@/contexts/FavoritesContext';
import { formatCurrency } from '@/lib/utils';
import toast from 'react-hot-toast';
import axios from 'axios';

interface FavoriteListing {
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
  views: {
    total: number;
  };
  createdAt: string;
  seller: {
    firstName: string;
    lastName: string;
    profilePicture?: { url: string };
    rating: number;
  };
  status: string;
}

const sortOptions = [
  { value: 'recent', label: 'Recently Added' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'price_low', label: 'Price: Low to High' },
  { value: 'price_high', label: 'Price: High to Low' },
  { value: 'views', label: 'Most Views' }
];

const filterOptions = [
  { value: 'all', label: 'All Items' },
  { value: 'active', label: 'Active' },
  { value: 'sold', label: 'Sold' },
  { value: 'expired', label: 'Expired' }
];

export default function FavoritesPage() {
  const [listings, setListings] = useState<FavoriteListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('recent');
  const [filter, setFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const router = useRouter();
  const { favorites, removeFromFavorites } = useFavorites();

  useEffect(() => {
    fetchFavorites();
  }, [sortBy, filter]);

  const fetchFavorites = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('sortBy', sortBy);
      if (filter !== 'all') {
        params.append('status', filter);
      }
      
      const response = await axios.get(`/users/favorites/listings?${params.toString()}`);
      setListings(response.data.data.listings);
    } catch (error) {
      console.error('Error fetching favorites:', error);
      toast.error('Failed to load favorites');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (listingId: string) => {
    try {
      await removeFromFavorites(listingId);
      setListings(prev => prev.filter(listing => listing._id !== listingId));
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
  };

  const handleBulkRemove = async () => {
    if (selectedItems.size === 0) {
      toast.error('Please select items to remove');
      return;
    }

    try {
      await Promise.all(
        Array.from(selectedItems).map(id => removeFromFavorites(id))
      );
      setListings(prev => prev.filter(listing => !selectedItems.has(listing._id)));
      setSelectedItems(new Set());
      toast.success(`${selectedItems.size} items removed from favorites`);
    } catch (error) {
      console.error('Error removing favorites:', error);
      toast.error('Failed to remove selected items');
    }
  };

  const handleSelectAll = () => {
    if (selectedItems.size === listings.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(listings.map(listing => listing._id)));
    }
  };

  const handleSelectItem = (listingId: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(listingId)) {
      newSelected.delete(listingId);
    } else {
      newSelected.add(listingId);
    }
    setSelectedItems(newSelected);
  };

  const handleShare = async (listing: FavoriteListing) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: listing.title,
          text: listing.title,
          url: `${window.location.origin}/listings/${listing._id}`,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(`${window.location.origin}/listings/${listing._id}`);
      toast.success('Link copied to clipboard');
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 168) { // 7 days
      return `${Math.floor(diffInHours / 24)}d ago`;
    } else {
      return date.toLocaleDateString();
    }
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
              <h1 className="text-2xl font-bold text-[#0A0F2C]">My Favorites</h1>
              <div></div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats and Controls */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <HeartSolidIcon className="h-6 w-6 text-red-500 mr-2" />
                  <span className="text-lg font-semibold text-gray-900">
                    {listings.length} Favorite{listings.length !== 1 ? 's' : ''}
                  </span>
                </div>
                
                {selectedItems.size > 0 && (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">
                      {selectedItems.size} selected
                    </span>
                    <Button
                      onClick={handleBulkRemove}
                      className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      Remove Selected
                    </Button>
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <FunnelIcon className="h-5 w-5 text-gray-400" />
                  <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#0A0F2C] focus:border-[#0A0F2C]"
                  >
                    {filterOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

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
            </div>
          </div>

          {/* Favorites Grid */}
          {listings.length > 0 ? (
            <div className="space-y-6">
              {/* Select All */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selectedItems.size === listings.length && listings.length > 0}
                  onChange={handleSelectAll}
                  className="h-4 w-4 text-[#0A0F2C] focus:ring-[#0A0F2C] border-gray-300 rounded"
                />
                <label className="text-sm text-gray-700">
                  Select all ({listings.length} items)
                </label>
              </div>

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
                      
                      <div className="absolute top-2 left-2">
                        <input
                          type="checkbox"
                          checked={selectedItems.has(listing._id)}
                          onChange={() => handleSelectItem(listing._id)}
                          className="h-4 w-4 text-[#0A0F2C] focus:ring-[#0A0F2C] border-gray-300 rounded"
                        />
                      </div>
                      
                      <div className="absolute top-2 right-2 flex space-x-1">
                        <FavoriteButton
                          listingId={listing._id}
                          size="md"
                        />
                        <button
                          onClick={() => handleShare(listing)}
                          className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50"
                        >
                          <ShareIcon className="h-4 w-4 text-gray-600" />
                        </button>
                      </div>
                      
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
                      
                      <div className="flex items-center justify-between text-gray-500 text-sm mb-3">
                        <div className="flex items-center">
                          <CalendarIcon className="h-4 w-4 mr-1" />
                          <span>{formatTime(listing.createdAt)}</span>
                        </div>
                        <div className="flex items-center">
                          <EyeIcon className="h-4 w-4 mr-1" />
                          <span>{listing.views.total}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-sm text-gray-600">
                          <span>by {listing.seller.firstName} {listing.seller.lastName}</span>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          listing.status === 'active' ? 'bg-green-100 text-green-800' :
                          listing.status === 'sold' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {listing.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <HeartIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No favorites yet</h3>
              <p className="text-gray-600 mb-4">
                Start adding items to your favorites by clicking the heart icon on any listing.
              </p>
              <Link
                href="/listings"
                className="bg-[#0A0F2C] text-white px-6 py-2 rounded-md hover:opacity-90"
              >
                Browse Listings
              </Link>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}

