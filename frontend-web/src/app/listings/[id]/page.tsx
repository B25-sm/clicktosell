'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  HeartIcon, 
  EyeIcon, 
  MapPinIcon, 
  CalendarIcon,
  UserIcon,
  PhoneIcon,
  ChatBubbleLeftRightIcon,
  ShareIcon,
  FlagIcon,
  StarIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { PlaceholderImage } from '@/components/PlaceholderImage';
import { formatCurrency } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useFavorites } from '@/contexts/FavoritesContext';
import { ChatButton } from '@/components/chat/ChatButton';
import toast from 'react-hot-toast';
import axios from 'axios';

interface Listing {
  _id: string;
  title: string;
  description: string;
  price: {
    amount: number;
    currency: string;
    negotiable: boolean;
    priceType: string;
  };
  images: Array<{
    url: string;
    isPrimary: boolean;
    order: number;
  }>;
  category: string;
  subcategory: string;
  condition: string;
  location: {
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
  createdAt: string;
  views: {
    total: number;
  };
  isFavorited?: boolean;
  isOwner?: boolean;
  seller: {
    _id: string;
    firstName: string;
    lastName: string;
    profilePicture?: { url: string };
    rating: number;
    location: {
      city: string;
      state: string;
    };
    verification: {
      email: { isVerified: boolean };
      phone: { isVerified: boolean };
    };
    activity: {
      totalListings: number;
      activeListings: number;
      soldItems: number;
    };
  };
  brand?: string;
  model?: string;
  yearOfPurchase?: number;
  warranty?: {
    hasWarranty: boolean;
    warrantyPeriod?: string;
    warrantyExpires?: string;
  };
  features?: string[];
  tags?: string[];
  delivery: {
    available: boolean;
    cost?: number;
    areas?: string[];
  };
  relatedListings?: Array<{
    _id: string;
    title: string;
    images: Array<{ url: string }>;
    price: { amount: number; currency: string };
    location: { city: string; state: string };
    createdAt: string;
  }>;
}

export default function ListingDetailsPage() {
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showContactInfo, setShowContactInfo] = useState(false);
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { isFavorited, toggleFavorite } = useFavorites();

  const listingId = params.id as string;

  useEffect(() => {
    fetchListing();
  }, [listingId]);

  const fetchListing = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/listings/${listingId}`);
      const data = response.data.data;
      setListing(data.listing);
    } catch (error) {
      console.error('Error fetching listing:', error);
      toast.error('Failed to load listing');
      router.push('/listings');
    } finally {
      setLoading(false);
    }
  };


  const handleContactSeller = () => {
    if (!isAuthenticated) {
      toast.error('Please login to contact seller');
      return;
    }
    setShowContactInfo(true);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: listing?.title,
          text: listing?.description,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard');
    }
  };

  const handleReport = () => {
    // TODO: Implement report functionality
    toast.info('Report functionality coming soon');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Listing not found</h2>
          <Link href="/listings" className="text-[#0A0F2C] hover:underline">
            Browse all listings
          </Link>
        </div>
      </div>
    );
  }

  const sortedImages = listing.images.sort((a, b) => a.order - b.order);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center">
              <h1 className="text-2xl font-bold text-[#0A0F2C]">OLX Classifieds</h1>
            </Link>
            <div className="flex items-center space-x-4">
              <Link href="/listings" className="text-gray-700 hover:text-[#0A0F2C]">
                Browse Listings
              </Link>
              {isAuthenticated ? (
                <Link href="/dashboard" className="text-gray-700 hover:text-[#0A0F2C]">
                  Dashboard
                </Link>
              ) : (
                <Link href="/auth/login" className="text-gray-700 hover:text-[#0A0F2C]">
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Images */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="relative">
                <div className="aspect-w-16 aspect-h-9 mb-4">
                  <PlaceholderImage
                    src={sortedImages[currentImageIndex]?.url}
                    alt={listing.title}
                    className="w-full h-96 object-cover rounded-lg"
                    fallbackText="No Image"
                  />
                </div>
                
                {sortedImages.length > 1 && (
                  <>
                    <button
                      onClick={() => setCurrentImageIndex(Math.max(0, currentImageIndex - 1))}
                      disabled={currentImageIndex === 0}
                      className="absolute left-2 top-1/2 transform -translate-y-1/2 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-75 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeftIcon className="h-6 w-6" />
                    </button>
                    <button
                      onClick={() => setCurrentImageIndex(Math.min(sortedImages.length - 1, currentImageIndex + 1))}
                      disabled={currentImageIndex === sortedImages.length - 1}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-75 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRightIcon className="h-6 w-6" />
                    </button>
                  </>
                )}
              </div>
              
              {/* Thumbnail Images */}
              {sortedImages.length > 1 && (
                <div className="flex space-x-2 overflow-x-auto">
                  {sortedImages.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                        index === currentImageIndex ? 'border-[#0A0F2C]' : 'border-gray-200'
                      }`}
                    >
                      <PlaceholderImage
                        src={image.url}
                        alt={`${listing.title} ${index + 1}`}
                        className="w-full h-full object-cover"
                        fallbackText=""
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Listing Details */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="flex justify-between items-start mb-4">
                <h1 className="text-3xl font-bold text-gray-900">{listing.title}</h1>
                <div className="flex space-x-2">
                  <button
                    onClick={() => toggleFavorite(listing._id)}
                    className="p-2 rounded-full hover:bg-gray-100"
                  >
                    {isFavorited(listing._id) ? (
                      <HeartSolidIcon className="h-6 w-6 text-red-500" />
                    ) : (
                      <HeartIcon className="h-6 w-6 text-gray-400" />
                    )}
                  </button>
                  <button
                    onClick={handleShare}
                    className="p-2 rounded-full hover:bg-gray-100"
                  >
                    <ShareIcon className="h-6 w-6 text-gray-400" />
                  </button>
                  <button
                    onClick={handleReport}
                    className="p-2 rounded-full hover:bg-gray-100"
                  >
                    <FlagIcon className="h-6 w-6 text-gray-400" />
                  </button>
                </div>
              </div>

              <div className="flex items-center space-x-4 mb-6">
                <span className="text-3xl font-bold text-[#0A0F2C]">
                  {formatCurrency(listing.price.amount, listing.price.currency, 'en-IN')}
                </span>
                {listing.price.negotiable && (
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                    Negotiable
                  </span>
                )}
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  {listing.condition.replace('_', ' ').toUpperCase()}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="flex items-center text-gray-600">
                  <MapPinIcon className="h-5 w-5 mr-2" />
                  <span>{listing.location.city}, {listing.location.state}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <CalendarIcon className="h-5 w-5 mr-2" />
                  <span>Posted {new Date(listing.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <EyeIcon className="h-5 w-5 mr-2" />
                  <span>{listing.views.total} views</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <span className="font-medium">Category:</span>
                  <span className="ml-2">{listing.category.replace('_', ' ').toUpperCase()}</span>
                </div>
              </div>

              <div className="prose max-w-none">
                <h3 className="text-xl font-semibold mb-3">Description</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{listing.description}</p>
              </div>

              {/* Additional Details */}
              {(listing.brand || listing.model || listing.yearOfPurchase) && (
                <div className="mt-6 pt-6 border-t">
                  <h3 className="text-xl font-semibold mb-3">Product Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {listing.brand && (
                      <div>
                        <span className="font-medium text-gray-700">Brand:</span>
                        <span className="ml-2">{listing.brand}</span>
                      </div>
                    )}
                    {listing.model && (
                      <div>
                        <span className="font-medium text-gray-700">Model:</span>
                        <span className="ml-2">{listing.model}</span>
                      </div>
                    )}
                    {listing.yearOfPurchase && (
                      <div>
                        <span className="font-medium text-gray-700">Year of Purchase:</span>
                        <span className="ml-2">{listing.yearOfPurchase}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Features */}
              {listing.features && listing.features.length > 0 && (
                <div className="mt-6 pt-6 border-t">
                  <h3 className="text-xl font-semibold mb-3">Features</h3>
                  <ul className="grid grid-cols-2 gap-2">
                    {listing.features.map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <span className="text-green-500 mr-2">✓</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Tags */}
              {listing.tags && listing.tags.length > 0 && (
                <div className="mt-6 pt-6 border-t">
                  <h3 className="text-xl font-semibold mb-3">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {listing.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Related Listings */}
            {listing.relatedListings && listing.relatedListings.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-xl font-semibold mb-4">Similar Listings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {listing.relatedListings.map((relatedListing) => (
                    <Link
                      key={relatedListing._id}
                      href={`/listings/${relatedListing._id}`}
                      className="flex space-x-4 p-3 rounded-lg hover:bg-gray-50 border border-gray-200"
                    >
                      <div className="w-20 h-20 flex-shrink-0">
                        <PlaceholderImage
                          src={relatedListing.images[0]?.url}
                          alt={relatedListing.title}
                          className="w-full h-full object-cover rounded"
                          fallbackText="No Image"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 truncate">{relatedListing.title}</h4>
                        <p className="text-[#0A0F2C] font-semibold">
                          {formatCurrency(relatedListing.price.amount, relatedListing.price.currency, 'en-IN')}
                        </p>
                        <p className="text-sm text-gray-600">
                          {relatedListing.location.city}, {relatedListing.location.state}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Seller Info */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4">Seller Information</h3>
              
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                  {listing.seller.profilePicture ? (
                    <img
                      src={listing.seller.profilePicture.url}
                      alt={`${listing.seller.firstName} ${listing.seller.lastName}`}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <UserIcon className="h-6 w-6 text-gray-400" />
                  )}
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">
                    {listing.seller.firstName} {listing.seller.lastName}
                  </h4>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center">
                      <StarIcon className="h-4 w-4 text-yellow-400" />
                      <span className="text-sm text-gray-600 ml-1">
                        {listing.seller.rating.toFixed(1)}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {listing.seller.location.city}, {listing.seller.location.state}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-4 text-center">
                <div>
                  <div className="text-lg font-semibold text-gray-900">
                    {listing.seller.activity.totalListings}
                  </div>
                  <div className="text-sm text-gray-600">Total Ads</div>
                </div>
                <div>
                  <div className="text-lg font-semibold text-gray-900">
                    {listing.seller.activity.activeListings}
                  </div>
                  <div className="text-sm text-gray-600">Active</div>
                </div>
                <div>
                  <div className="text-lg font-semibold text-gray-900">
                    {listing.seller.activity.soldItems}
                  </div>
                  <div className="text-sm text-gray-600">Sold</div>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm">
                  <span className="text-gray-600">Email:</span>
                  <span className={`ml-2 ${listing.seller.verification.email.isVerified ? 'text-green-600' : 'text-gray-400'}`}>
                    {listing.seller.verification.email.isVerified ? 'Verified' : 'Not Verified'}
                  </span>
                </div>
                <div className="flex items-center text-sm">
                  <span className="text-gray-600">Phone:</span>
                  <span className={`ml-2 ${listing.seller.verification.phone.isVerified ? 'text-green-600' : 'text-gray-400'}`}>
                    {listing.seller.verification.phone.isVerified ? 'Verified' : 'Not Verified'}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={handleContactSeller}
                  className="w-full bg-[#0A0F2C] text-white py-3 rounded-md hover:opacity-90 flex items-center justify-center"
                >
                  <PhoneIcon className="h-5 w-5 mr-2" />
                  Contact Seller
                </Button>
                
                <ChatButton
                  listingId={listing._id}
                  sellerId={listing.seller._id}
                  className="w-full py-3"
                />
              </div>
            </div>

            {/* Contact Info Modal */}
            {showContactInfo && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                  <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="font-medium text-gray-700">Name:</span>
                      <span className="ml-2">{listing.seller.firstName} {listing.seller.lastName}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Location:</span>
                      <span className="ml-2">{listing.seller.location.city}, {listing.seller.location.state}</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      Contact details will be shown here. This is a placeholder for the actual contact information.
                    </div>
                  </div>
                  <div className="flex space-x-3 mt-6">
                    <Button
                      onClick={() => setShowContactInfo(false)}
                      className="flex-1 bg-gray-500 text-white py-2 rounded-md hover:opacity-90"
                    >
                      Close
                    </Button>
                    <Button
                      className="flex-1 bg-[#0A0F2C] text-white py-2 rounded-md hover:opacity-90"
                    >
                      Start Chat
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Safety Tips */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-medium text-yellow-800 mb-2">Safety Tips</h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Meet in a public place</li>
                <li>• Check the item before paying</li>
                <li>• Don't pay in advance</li>
                <li>• Trust your instincts</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
