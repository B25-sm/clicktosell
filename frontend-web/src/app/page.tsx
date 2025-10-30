'use client';

import { Metadata } from 'next';
import { useListings, useCategories } from '@/hooks/useApi';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { PlaceholderImage } from '@/components/PlaceholderImage';
import { ConnectionTest } from '@/components/ConnectionTest';
import { formatCurrency } from '@/lib/utils';
import MobileLayout from '@/components/layout/MobileLayout';

export default function HomePage() {
  const { data: listingsData, loading, error } = useListings({ limit: 6 });
  const { data: categoriesData } = useCategories();
  
  // Mock data for when API is not available
  const mockListings = {
    listings: [
      {
        id: '1',
        title: 'iPhone 13 Pro Max',
        price: 75000,
        location: 'Mumbai, Maharashtra',
        image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400',
        category: 'Electronics'
      },
      {
        id: '2',
        title: 'MacBook Pro M2',
        price: 120000,
        location: 'Delhi, NCR',
        image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400',
        category: 'Electronics'
      },
      {
        id: '3',
        title: 'Samsung Galaxy S23',
        price: 65000,
        location: 'Bangalore, Karnataka',
        image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400',
        category: 'Electronics'
      }
    ]
  };
  return (
    <MobileLayout title="ClicktoSell">
      <div className="min-h-screen bg-gradient-to-br from-brand-light to-brand-white">
      {/* Modern Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100 shadow-soft">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-brand-primary to-green-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">C</span>
              </div>
              <h1 className="text-2xl font-bold gradient-text">ClicktoSell</h1>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="/listings" className="text-brand-muted hover:text-brand-primary transition-colors duration-200 font-medium">Browse</a>
              <a href="/listings/create" className="text-brand-muted hover:text-brand-primary transition-colors duration-200 font-medium">Sell</a>
              <a href="/dashboard" className="text-brand-muted hover:text-brand-primary transition-colors duration-200 font-medium">My Account</a>
            </nav>
            <div className="flex items-center space-x-4">
              <a href="/auth/login" className="text-brand-muted hover:text-brand-primary transition-colors duration-200 font-medium">Sign In</a>
              <a href="/auth/register" className="btn-gradient px-6 py-3 rounded-xl font-semibold">Sign Up</a>
            </div>
          </div>
        </div>
      </header>

      {/* Modern Hero Section */}
      <section className="relative py-24 lg:py-32 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/5 via-transparent to-green-100/30"></div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-brand-primary/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-green-200/20 rounded-full blur-3xl animate-float" style={{animationDelay: '2s'}}></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-fade-in-up">
            <h1 className="text-5xl md:text-7xl font-bold mb-8 text-brand-dark leading-tight">
              Buy & Sell
              <span className="block gradient-text">Anything Locally</span>
            </h1>
            <p className="text-xl md:text-2xl mb-12 text-brand-muted max-w-3xl mx-auto leading-relaxed">
              Discover amazing deals on electronics, furniture, vehicles, and more in your local community
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <a href="/auth/register" className="btn-gradient px-8 py-4 text-lg font-semibold rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
                Start Selling Now
              </a>
              <a href="/listings" className="btn-secondary px-8 py-4 text-lg font-semibold rounded-2xl border-2 border-brand-primary hover:bg-brand-primary hover:text-brand-white transition-all duration-300">
                Browse Listings
              </a>
            </div>
          </div>
          
          {/* Stats */}
          <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center animate-fade-in-up" style={{animationDelay: '0.2s'}}>
              <div className="text-4xl font-bold text-brand-primary mb-2">10K+</div>
              <div className="text-brand-muted">Active Listings</div>
            </div>
            <div className="text-center animate-fade-in-up" style={{animationDelay: '0.4s'}}>
              <div className="text-4xl font-bold text-brand-primary mb-2">50K+</div>
              <div className="text-brand-muted">Happy Users</div>
            </div>
            <div className="text-center animate-fade-in-up" style={{animationDelay: '0.6s'}}>
              <div className="text-4xl font-bold text-brand-primary mb-2">100+</div>
              <div className="text-brand-muted">Cities</div>
            </div>
          </div>
        </div>
      </section>

      {/* Modern Categories */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-brand-dark">Popular Categories</h2>
            <p className="text-xl text-brand-muted max-w-2xl mx-auto">Explore thousands of items across different categories</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {(categoriesData || [
              { name: 'Electronics', icon: '📱', count: 1250, color: 'from-blue-500 to-blue-600' },
              { name: 'Furniture', icon: '🪑', count: 890, color: 'from-amber-500 to-amber-600' },
              { name: 'Vehicles', icon: '🚗', count: 2100, color: 'from-red-500 to-red-600' },
              { name: 'Fashion', icon: '👕', count: 3200, color: 'from-pink-500 to-pink-600' },
              { name: 'Home & Garden', icon: '🏠', count: 1800, color: 'from-green-500 to-green-600' },
              { name: 'Sports', icon: '⚽', count: 750, color: 'from-purple-500 to-purple-600' },
            ]).slice(0, 6).map((category, index) => (
              <div 
                key={category.name} 
                className="group card-hover p-6 text-center animate-fade-in-up"
                style={{animationDelay: `${index * 0.1}s`}}
              >
                <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${category.color} flex items-center justify-center text-2xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  {category.icon}
                </div>
                <div className="text-lg font-semibold text-brand-dark mb-2 group-hover:text-brand-primary transition-colors duration-200">
                  {category.name}
                </div>
                <div className="text-sm text-brand-muted">
                  {category.count.toLocaleString()} items
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Modern Featured Listings */}
      <section className="py-20 bg-gradient-to-br from-brand-light to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-brand-dark">Featured Listings</h2>
            <p className="text-xl text-brand-muted max-w-2xl mx-auto">Discover the best deals from our community</p>
          </div>
          
          {loading && (
            <div className="flex justify-center items-center py-20">
              <div className="loading-shimmer w-32 h-32 rounded-2xl bg-gray-200"></div>
            </div>
          )}
          
          {error && (
            <div className="text-center py-20">
              <div className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-red-500 text-2xl">⚠️</span>
              </div>
              <p className="text-red-600 mb-6 text-lg">Failed to load listings: {error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="btn-primary px-6 py-3 rounded-xl"
              >
                Try Again
              </button>
            </div>
          )}
          
          {(listingsData || mockListings) && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {(listingsData || mockListings).listings.map((item, index) => (
                <div 
                  key={item.id} 
                  className="group card-hover overflow-hidden animate-fade-in-up"
                  style={{animationDelay: `${index * 0.1}s`}}
                >
                  <div className="relative">
                    <PlaceholderImage 
                      src={item.image}
                      alt={item.title}
                      className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500"
                      fallbackText="No Image"
                    />
                    <div className="absolute top-4 right-4">
                      <div className="badge-primary">Featured</div>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-xl font-bold text-brand-dark group-hover:text-brand-primary transition-colors duration-200 line-clamp-2">
                        {item.title}
                      </h3>
                    </div>
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-2xl font-bold text-brand-primary">{formatCurrency(item.price, 'INR', 'en-IN')}</p>
                      <div className="badge-secondary">{item.category}</div>
                    </div>
                    <div className="flex items-center text-brand-muted">
                      <span className="text-sm">📍 {item.location}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {!loading && !error && (listingsData || mockListings) && (listingsData || mockListings).listings.length === 0 && (
            <div className="text-center py-20">
              <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                <span className="text-gray-400 text-2xl">📦</span>
              </div>
              <p className="text-brand-muted text-lg">No listings available at the moment.</p>
            </div>
          )}
        </div>
      </section>

      {/* Modern Footer */}
      <footer className="bg-gradient-to-br from-brand-dark to-gray-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="md:col-span-1">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-brand-primary to-green-600 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-lg">C</span>
                </div>
                <h3 className="text-2xl font-bold gradient-text-white">ClicktoSell</h3>
              </div>
              <p className="text-gray-300 mb-6 leading-relaxed">Buy and sell anything locally with confidence. Join our community of trusted users.</p>
              <div className="flex space-x-4">
                <a href="#" className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-brand-primary transition-colors duration-200">
                  <span className="text-sm">📘</span>
                </a>
                <a href="#" className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-brand-primary transition-colors duration-200">
                  <span className="text-sm">🐦</span>
                </a>
                <a href="#" className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-brand-primary transition-colors duration-200">
                  <span className="text-sm">📷</span>
                </a>
              </div>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-6 text-white">Quick Links</h4>
              <ul className="space-y-3">
                <li><a href="/listings" className="text-gray-300 hover:text-brand-primary transition-colors duration-200">Browse Categories</a></li>
                <li><a href="/listings/create" className="text-gray-300 hover:text-brand-primary transition-colors duration-200">Post an Ad</a></li>
                <li><a href="#" className="text-gray-300 hover:text-brand-primary transition-colors duration-200">Safety Tips</a></li>
                <li><a href="#" className="text-gray-300 hover:text-brand-primary transition-colors duration-200">How it Works</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-6 text-white">Support</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-300 hover:text-brand-primary transition-colors duration-200">Help Center</a></li>
                <li><a href="#" className="text-gray-300 hover:text-brand-primary transition-colors duration-200">Contact Us</a></li>
                <li><a href="#" className="text-gray-300 hover:text-brand-primary transition-colors duration-200">Report Issue</a></li>
                <li><a href="#" className="text-gray-300 hover:text-brand-primary transition-colors duration-200">Community Guidelines</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-6 text-white">Company</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-300 hover:text-brand-primary transition-colors duration-200">About Us</a></li>
                <li><a href="#" className="text-gray-300 hover:text-brand-primary transition-colors duration-200">Careers</a></li>
                <li><a href="#" className="text-gray-300 hover:text-brand-primary transition-colors duration-200">Privacy Policy</a></li>
                <li><a href="#" className="text-gray-300 hover:text-brand-primary transition-colors duration-200">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 mt-12 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-300 text-sm">&copy; 2024 ClicktoSell. All rights reserved.</p>
              <div className="flex items-center space-x-6 mt-4 md:mt-0">
                <span className="text-gray-400 text-sm">Made with ❤️ for the community</span>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Connection Test Component */}
      <ConnectionTest />
      </div>
    </MobileLayout>
  );
}