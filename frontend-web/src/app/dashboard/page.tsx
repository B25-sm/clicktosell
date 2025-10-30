'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  UserIcon, 
  PlusIcon, 
  EyeIcon, 
  HeartIcon,
  ChatBubbleLeftRightIcon,
  Cog6ToothIcon,
  BellIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { formatCurrency } from '@/lib/utils';
import MobileLayout from '@/components/layout/MobileLayout';
import toast from 'react-hot-toast';
import axios from 'axios';

interface DashboardStats {
  totalListings: number;
  activeListings: number;
  soldItems: number;
  totalViews: number;
  totalFavorites: number;
  totalMessages: number;
  monthlyEarnings: number;
  responseRate: number;
}

interface RecentListing {
  _id: string;
  title: string;
  price: { amount: number; currency: string };
  images: Array<{ url: string; isPrimary: boolean }>;
  views: { total: number };
  favorites: number;
  status: string;
  createdAt: string;
}

interface RecentActivity {
  _id: string;
  type: string;
  message: string;
  timestamp: string;
  listingId?: string;
  listingTitle?: string;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentListings, setRecentListings] = useState<RecentListing[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsResponse, listingsResponse, activityResponse] = await Promise.all([
        axios.get('/users/dashboard/stats'),
        axios.get('/users/listings?limit=5'),
        axios.get('/users/activity?limit=10')
      ]);

      setStats(statsResponse.data.data);
      setRecentListings(listingsResponse.data.data.listings);
      setRecentActivity(activityResponse.data.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleListingAction = async (listingId: string, action: string) => {
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
            fetchDashboardData();
          }
          break;
        case 'mark_sold':
          await axios.post(`/listings/${listingId}/mark-sold`);
          toast.success('Listing marked as sold');
          fetchDashboardData();
          break;
        case 'bump':
          await axios.post(`/listings/${listingId}/bump`);
          toast.success('Listing bumped to top');
          fetchDashboardData();
          break;
      }
    } catch (error) {
      console.error('Error performing action:', error);
      toast.error('Failed to perform action');
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
      <MobileLayout title="Dashboard" showBackButton={false}>
        <div className="min-h-screen bg-gradient-to-br from-brand-light to-brand-white">
        {/* Modern Header */}
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100 shadow-soft">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-20">
              <Link href="/" className="flex items-center space-x-3 group">
                <div className="w-12 h-12 bg-gradient-to-br from-brand-primary to-green-600 rounded-2xl flex items-center justify-center group-hover:scale-105 transition-transform duration-200 shadow-lg">
                  <span className="text-white font-bold text-xl">O</span>
                </div>
                <h1 className="text-2xl font-bold gradient-text">OLX Classifieds</h1>
              </Link>
              <div className="flex items-center space-x-4">
                <Link href="/listings" className="text-brand-muted hover:text-brand-primary transition-colors duration-200 font-medium">
                  Browse
                </Link>
                <Link href="/listings/create" className="btn-gradient px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
                  Post Ad
                </Link>
                <div className="relative">
                  <button className="p-3 text-brand-muted hover:text-brand-primary hover:bg-green-50 rounded-xl transition-all duration-200 group">
                    <BellIcon className="h-6 w-6 group-hover:scale-110 transition-transform duration-200" />
                    <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  </button>
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-bounce">
                    3
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Modern Sidebar */}
            <div className="lg:col-span-1">
              <div className="card-gradient p-8">
                {/* Modern User Profile */}
                <div className="text-center mb-8">
                  <div className="relative inline-block">
                    {user?.profilePicture ? (
                      <img
                        src={user.profilePicture.url}
                        alt={`${user.firstName} ${user.lastName}`}
                        className="w-20 h-20 rounded-full object-cover ring-4 ring-brand-primary/20 shadow-lg"
                      />
                    ) : (
                      <div className="w-20 h-20 bg-gradient-to-br from-brand-primary to-green-600 rounded-full flex items-center justify-center shadow-lg">
                        <UserIcon className="h-10 w-10 text-white" />
                      </div>
                    )}
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  </div>
                  <h2 className="text-xl font-bold text-brand-dark mt-4 mb-1">
                    {user?.firstName} {user?.lastName}
                  </h2>
                  <p className="text-brand-muted text-sm">
                    {user?.location?.city}, {user?.location?.state}
                  </p>
                  <div className="mt-3">
                    <div className="badge-primary">Verified Seller</div>
                  </div>
                </div>

                {/* Modern Navigation */}
                <nav className="space-y-3">
                  <button
                    onClick={() => setActiveTab('overview')}
                    className={`w-full flex items-center px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-200 group ${
                      activeTab === 'overview'
                        ? 'bg-brand-primary text-brand-white shadow-lg transform scale-105'
                        : 'text-brand-muted hover:text-brand-primary hover:bg-green-50 hover:scale-105'
                    }`}
                  >
                    <ChartBarIcon className={`h-5 w-5 mr-3 ${activeTab === 'overview' ? 'text-brand-white' : 'text-brand-muted group-hover:text-brand-primary'}`} />
                    Overview
                  </button>
                  <button
                    onClick={() => setActiveTab('listings')}
                    className={`w-full flex items-center px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-200 group ${
                      activeTab === 'listings'
                        ? 'bg-brand-primary text-brand-white shadow-lg transform scale-105'
                        : 'text-brand-muted hover:text-brand-primary hover:bg-green-50 hover:scale-105'
                    }`}
                  >
                    <PlusIcon className={`h-5 w-5 mr-3 ${activeTab === 'listings' ? 'text-brand-white' : 'text-brand-muted group-hover:text-brand-primary'}`} />
                    My Listings
                  </button>
                  <button
                    onClick={() => setActiveTab('favorites')}
                    className={`w-full flex items-center px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-200 group ${
                      activeTab === 'favorites'
                        ? 'bg-brand-primary text-brand-white shadow-lg transform scale-105'
                        : 'text-brand-muted hover:text-brand-primary hover:bg-green-50 hover:scale-105'
                    }`}
                  >
                    <HeartIcon className={`h-5 w-5 mr-3 ${activeTab === 'favorites' ? 'text-brand-white' : 'text-brand-muted group-hover:text-brand-primary'}`} />
                    Favorites
                  </button>
                  <button
                    onClick={() => setActiveTab('messages')}
                    className={`w-full flex items-center px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-200 group ${
                      activeTab === 'messages'
                        ? 'bg-brand-primary text-brand-white shadow-lg transform scale-105'
                        : 'text-brand-muted hover:text-brand-primary hover:bg-green-50 hover:scale-105'
                    }`}
                  >
                    <ChatBubbleLeftRightIcon className={`h-5 w-5 mr-3 ${activeTab === 'messages' ? 'text-brand-white' : 'text-brand-muted group-hover:text-brand-primary'}`} />
                    Messages
                  </button>
                  <button
                    onClick={() => setActiveTab('settings')}
                    className={`w-full flex items-center px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-200 group ${
                      activeTab === 'settings'
                        ? 'bg-brand-primary text-brand-white shadow-lg transform scale-105'
                        : 'text-brand-muted hover:text-brand-primary hover:bg-green-50 hover:scale-105'
                    }`}
                  >
                    <Cog6ToothIcon className={`h-5 w-5 mr-3 ${activeTab === 'settings' ? 'text-brand-white' : 'text-brand-muted group-hover:text-brand-primary'}`} />
                    Settings
                  </button>
                </nav>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {/* Modern Overview Tab */}
              {activeTab === 'overview' && (
                <div className="space-y-8">
                  {/* Welcome Section */}
                  <div className="bg-gradient-to-r from-brand-primary to-green-600 rounded-2xl p-8 text-white">
                    <h2 className="text-3xl font-bold mb-2">Welcome back, {user?.firstName}! 👋</h2>
                    <p className="text-green-100 text-lg">Here's what's happening with your listings today.</p>
                  </div>

                  {/* Modern Stats Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="card-hover p-6 group">
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-200">
                          <PlusIcon className="h-6 w-6 text-white" />
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-brand-muted">Total Listings</p>
                          <p className="text-3xl font-bold text-brand-dark">
                            {stats?.totalListings || 0}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center text-sm text-green-600">
                        <span className="font-semibold">+12%</span>
                        <span className="ml-1">from last month</span>
                      </div>
                    </div>

                    <div className="card-hover p-6 group">
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-200">
                          <EyeIcon className="h-6 w-6 text-white" />
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-brand-muted">Total Views</p>
                          <p className="text-3xl font-bold text-brand-dark">
                            {stats?.totalViews || 0}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center text-sm text-green-600">
                        <span className="font-semibold">+8%</span>
                        <span className="ml-1">from last week</span>
                      </div>
                    </div>

                    <div className="card-hover p-6 group">
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-200">
                          <HeartSolidIcon className="h-6 w-6 text-white" />
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-brand-muted">Favorites</p>
                          <p className="text-3xl font-bold text-brand-dark">
                            {stats?.totalFavorites || 0}
                          </p>
                        </div>
                      </div>
                      </div>
                      <div className="flex items-center text-sm text-green-600">
                        <span className="font-semibold">+5%</span>
                        <span className="ml-1">from last week</span>
                      </div>
                    </div>

                    <div className="card-hover p-6 group">
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-200">
                          <CurrencyDollarIcon className="h-6 w-6 text-white" />
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-brand-muted">Sold Items</p>
                          <p className="text-3xl font-bold text-brand-dark">
                            {stats?.soldItems || 0}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center text-sm text-green-600">
                        <span className="font-semibold">+15%</span>
                        <span className="ml-1">from last month</span>
                      </div>
                    </div>
                  </div>

                  {/* Modern Recent Listings */}
                  <div className="card p-8">
                    <div className="flex justify-between items-center mb-8">
                      <h3 className="text-2xl font-bold text-brand-dark">Recent Listings</h3>
                      <Link
                        href="/listings/create"
                        className="btn-gradient px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center"
                      >
                        <PlusIcon className="h-5 w-5 mr-2" />
                        New Listing
                      </Link>
                    </div>

                    {recentListings.length > 0 ? (
                      <div className="space-y-6">
                        {recentListings.map((listing, index) => (
                          <div key={listing._id} className="card-hover p-6 group animate-fade-in-up" style={{animationDelay: `${index * 0.1}s`}}>
                            <div className="flex items-center space-x-6">
                              <div className="w-20 h-20 flex-shrink-0 rounded-2xl overflow-hidden shadow-lg group-hover:scale-105 transition-transform duration-200">
                                <img
                                  src={listing.images[0]?.url}
                                  alt={listing.title}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="text-lg font-bold text-brand-dark group-hover:text-brand-primary transition-colors duration-200 truncate">{listing.title}</h4>
                                <p className="text-2xl font-bold text-brand-primary mb-3">
                                  {formatCurrency(listing.price.amount, listing.price.currency, 'en-IN')}
                                </p>
                                <div className="flex items-center space-x-6 text-sm text-brand-muted mb-4">
                                  <span className="flex items-center">
                                    <EyeIcon className="h-4 w-4 mr-2 text-brand-primary" />
                                    {listing.views.total} views
                                  </span>
                                  <span className="flex items-center">
                                    <HeartIcon className="h-4 w-4 mr-2 text-red-500" />
                                    {listing.favorites} favorites
                                  </span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <div className={`badge ${
                                    listing.status === 'active' ? 'badge-primary' :
                                    listing.status === 'sold' ? 'badge-secondary' :
                                    'badge-outline'
                                  }`}>
                                    {listing.status.toUpperCase()}
                                  </div>
                                  <div className="flex space-x-2">
                                    <button
                                      onClick={() => handleListingAction(listing._id, 'view')}
                                      className="btn-ghost px-4 py-2 text-sm rounded-xl"
                                    >
                                      View
                                    </button>
                                    <button
                                      onClick={() => handleListingAction(listing._id, 'edit')}
                                      className="btn-secondary px-4 py-2 text-sm rounded-xl"
                                    >
                                      Edit
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-16">
                        <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-brand-primary/10 to-green-100 rounded-full flex items-center justify-center">
                          <PlusIcon className="h-12 w-12 text-brand-primary" />
                        </div>
                        <h3 className="text-2xl font-bold text-brand-dark mb-2">No listings yet</h3>
                        <p className="text-brand-muted text-lg mb-8">Get started by creating your first listing and start selling today!</p>
                        <Link
                          href="/listings/create"
                          className="btn-gradient px-8 py-4 text-lg font-semibold rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                        >
                          Create Your First Listing
                        </Link>
                      </div>
                    )}
                  </div>

                  {/* Modern Recent Activity */}
                  <div className="card p-8">
                    <h3 className="text-2xl font-bold text-brand-dark mb-8">Recent Activity</h3>
                    {recentActivity.length > 0 ? (
                      <div className="space-y-4">
                        {recentActivity.map((activity) => (
                          <div key={activity._id} className="flex items-start space-x-3">
                            <div className="flex-shrink-0">
                              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                                <CalendarIcon className="h-4 w-4 text-gray-600" />
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-gray-900">{activity.message}</p>
                              <p className="text-xs text-gray-500">
                                {new Date(activity.timestamp).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-4">No recent activity</p>
                    )}
                  </div>
                </div>
              )}

              {/* Other tabs would be implemented here */}
              {activeTab === 'listings' && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">My Listings</h3>
                  <p className="text-gray-500">Listings management coming soon...</p>
                </div>
              )}

              {activeTab === 'favorites' && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">My Favorites</h3>
                  <p className="text-gray-500">Favorites management coming soon...</p>
                </div>
              )}

              {activeTab === 'messages' && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Messages</h3>
                  <p className="text-gray-500">Messages coming soon...</p>
                </div>
              )}

              {activeTab === 'settings' && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Account Settings</h3>
                  <p className="text-gray-500">Settings management coming soon...</p>
                </div>
              )}
            </div>
          </div>
        </div>
        </div>
      </MobileLayout>
    </ProtectedRoute>
  );
}
