'use client';

import { Metadata } from 'next';
import { useListings } from '@/hooks/useApi';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { PlaceholderImage } from '@/components/PlaceholderImage';

export default function HomePage() {
  const { data: listingsData, loading, error } = useListings();
  return (
    <div className="min-h-screen bg-[color:var(--bg,theme(colors.brand.gray))]">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-[color:theme(colors.brand.midnight)]">OLX Classifieds</h1>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#" className="text-gray-700 hover:text-[color:theme(colors.brand.midnight)]">Browse</a>
              <a href="#" className="text-gray-700 hover:text-[color:theme(colors.brand.midnight)]">Sell</a>
              <a href="#" className="text-gray-700 hover:text-[color:theme(colors.brand.midnight)]">My Account</a>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-[color:theme(colors.brand.midnight)] to-black text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Buy & Sell Anything Locally
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-gray-200">
            Discover amazing deals on electronics, furniture, vehicles, and more
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-3 rounded-lg font-semibold transition bg-[color:theme(colors.brand.gold)] text-black hover:opacity-90">
              Start Selling
            </button>
            <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-[color:theme(colors.brand.gold)] hover:text-black transition">
              Browse Listings
            </button>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12 text-[color:theme(colors.brand.midnight)]">Popular Categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {[
              { name: 'Electronics', icon: '📱' },
              { name: 'Furniture', icon: '🪑' },
              { name: 'Vehicles', icon: '🚗' },
              { name: 'Fashion', icon: '👕' },
              { name: 'Home & Garden', icon: '🏠' },
              { name: 'Sports', icon: '⚽' },
            ].map((category) => (
              <div key={category.name} className="text-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition cursor-pointer border border-[color:theme(colors.brand.gray)]">
                <div className="text-3xl mb-2">{category.icon}</div>
                <div className="text-sm font-medium text-gray-700">{category.name}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Listings */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12 text-[color:theme(colors.brand.midnight)]">Featured Listings</h2>
          
          {loading && (
            <div className="flex justify-center items-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          )}
          
          {error && (
            <div className="text-center py-12">
              <p className="text-red-600 mb-4">Failed to load listings: {error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="px-4 py-2 bg-[color:theme(colors.brand.midnight)] text-white rounded hover:opacity-90"
              >
                Retry
              </button>
            </div>
          )}
          
          {listingsData && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {listingsData.listings.map((item) => (
                <div key={item.id} className="bg-white border border-[color:theme(colors.brand.gray)] rounded-lg shadow-sm hover:shadow-md transition">
                  <div className="p-4">
                    <div className="aspect-w-16 aspect-h-9 mb-3">
                      <PlaceholderImage 
                        src={item.image}
                        alt={item.title}
                        className="w-full h-48 object-cover rounded"
                        fallbackText="No Image"
                      />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                    <p className="text-[color:theme(colors.brand.midnight)] font-bold text-xl mb-2">₹{item.price.toLocaleString()}</p>
                    <p className="text-gray-600 text-sm">{item.location}</p>
                    <p className="text-gray-500 text-xs mt-1">{item.category}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {!loading && !error && listingsData && listingsData.listings.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600">No listings available at the moment.</p>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[color:theme(colors.brand.midnight)] text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">OLX Classifieds</h3>
              <p className="text-gray-300">Buy and sell anything locally with confidence.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#" className="hover:text-[color:theme(colors.brand.gold)]">Browse Categories</a></li>
                <li><a href="#" className="hover:text-[color:theme(colors.brand.gold)]">Post an Ad</a></li>
                <li><a href="#" className="hover:text-[color:theme(colors.brand.gold)]">Safety Tips</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#" className="hover:text-[color:theme(colors.brand.gold)]">Help Center</a></li>
                <li><a href="#" className="hover:text-[color:theme(colors.brand.gold)]">Contact Us</a></li>
                <li><a href="#" className="hover:text-[color:theme(colors.brand.gold)]">Report Issue</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Connect</h4>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#" className="hover:text-[color:theme(colors.brand.gold)]">Facebook</a></li>
                <li><a href="#" className="hover:text-[color:theme(colors.brand.gold)]">Twitter</a></li>
                <li><a href="#" className="hover:text-[color:theme(colors.brand.gold)]">Instagram</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 mt-8 pt-8 text-center text-gray-300">
            <p>&copy; 2024 OLX Classifieds. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}