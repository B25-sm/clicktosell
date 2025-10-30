'use client';

import { useState } from 'react';
import { 
  AdjustmentsHorizontalIcon, 
  XMarkIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  TagIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';

interface SearchFiltersProps {
  filters: {
    category: string;
    subcategory: string;
    city: string;
    state: string;
    minPrice: number | undefined;
    maxPrice: number | undefined;
    condition: string;
    sortBy: string;
    dateRange: string;
    negotiable: boolean;
    hasImages: boolean;
    verifiedSeller: boolean;
  };
  onFilterChange: (filters: any) => void;
  onClearFilters: () => void;
  className?: string;
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

export default function SearchFilters({ 
  filters, 
  onFilterChange, 
  onClearFilters, 
  className = "" 
}: SearchFiltersProps) {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.category) count++;
    if (filters.city) count++;
    if (filters.minPrice || filters.maxPrice) count++;
    if (filters.condition) count++;
    if (filters.dateRange) count++;
    if (filters.negotiable) count++;
    if (filters.hasImages) count++;
    if (filters.verifiedSeller) count++;
    return count;
  };

  const handleFilterChange = (key: string, value: any) => {
    onFilterChange({
      ...filters,
      [key]: value
    });
  };

  const selectedCategory = filters.category as keyof typeof categories;

  return (
    <div className={`bg-white rounded-lg shadow-sm p-6 ${className}`}>
      {/* Quick Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <select
            value={filters.category}
            onChange={(e) => {
              handleFilterChange('category', e.target.value);
              handleFilterChange('subcategory', ''); // Reset subcategory when category changes
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0A0F2C] focus:border-[#0A0F2C]"
          >
            <option value="">All Categories</option>
            {Object.entries(categories).map(([key, category]) => (
              <option key={key} value={key}>
                {category.icon} {category.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Subcategory</label>
          <select
            value={filters.subcategory}
            onChange={(e) => handleFilterChange('subcategory', e.target.value)}
            disabled={!filters.category}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0A0F2C] focus:border-[#0A0F2C] disabled:bg-gray-100"
          >
            <option value="">All Subcategories</option>
            {filters.category && categories[selectedCategory]?.subcategories.map(sub => (
              <option key={sub} value={sub}>
                {sub.replace('_', ' ').toUpperCase()}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
          <input
            type="text"
            value={filters.city}
            onChange={(e) => handleFilterChange('city', e.target.value)}
            placeholder="Enter city"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0A0F2C] focus:border-[#0A0F2C]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
          <select
            value={filters.sortBy}
            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0A0F2C] focus:border-[#0A0F2C]"
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
      <div className="flex items-center justify-between mb-4">
        <button
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
            onClick={onClearFilters}
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
                type="number"
                value={filters.minPrice || ''}
                onChange={(e) => handleFilterChange('minPrice', e.target.value ? Number(e.target.value) : undefined)}
                placeholder="Min"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0A0F2C] focus:border-[#0A0F2C]"
              />
              <input
                type="number"
                value={filters.maxPrice || ''}
                onChange={(e) => handleFilterChange('maxPrice', e.target.value ? Number(e.target.value) : undefined)}
                placeholder="Max"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0A0F2C] focus:border-[#0A0F2C]"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
            <select
              value={filters.condition}
              onChange={(e) => handleFilterChange('condition', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0A0F2C] focus:border-[#0A0F2C]"
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
              value={filters.dateRange}
              onChange={(e) => handleFilterChange('dateRange', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0A0F2C] focus:border-[#0A0F2C]"
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
              type="text"
              value={filters.state}
              onChange={(e) => handleFilterChange('state', e.target.value)}
              placeholder="Enter state"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0A0F2C] focus:border-[#0A0F2C]"
            />
          </div>

          <div className="md:col-span-2 lg:col-span-4">
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.negotiable}
                  onChange={(e) => handleFilterChange('negotiable', e.target.checked)}
                  className="h-4 w-4 text-[#0A0F2C] focus:ring-[#0A0F2C] border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Negotiable Price</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.hasImages}
                  onChange={(e) => handleFilterChange('hasImages', e.target.checked)}
                  className="h-4 w-4 text-[#0A0F2C] focus:ring-[#0A0F2C] border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Has Images</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.verifiedSeller}
                  onChange={(e) => handleFilterChange('verifiedSeller', e.target.checked)}
                  className="h-4 w-4 text-[#0A0F2C] focus:ring-[#0A0F2C] border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Verified Sellers Only</span>
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

