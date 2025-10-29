import { useState, useEffect, useCallback } from 'react';

interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

interface Listing {
  id: string;
  title: string;
  price: number;
  location: string;
  image?: string;
  isNegotiable?: boolean;
  featured?: boolean;
  timeAgo?: string;
}

export const useHomeData = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredListings, setFeaturedListings] = useState<Listing[]>([]);
  const [recentListings, setRecentListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Mock data for now
      const mockCategories: Category[] = [
        { id: '1', name: 'Electronics', icon: 'devices', color: '#3b82f6' },
        { id: '2', name: 'Furniture', icon: 'home', color: '#8b5cf6' },
        { id: '3', name: 'Vehicles', icon: 'directions-car', color: '#ef4444' },
        { id: '4', name: 'Real Estate', icon: 'apartment', color: '#f59e0b' },
        { id: '5', name: 'Fashion', icon: 'checkroom', color: '#ec4899' },
        { id: '6', name: 'Sports', icon: 'sports-soccer', color: '#22c55e' },
        { id: '7', name: 'Books', icon: 'menu-book', color: '#06b6d4' },
        { id: '8', name: 'Services', icon: 'build', color: '#6366f1' },
      ];

      const mockFeaturedListings: Listing[] = [
        {
          id: '1',
          title: 'iPhone 14 Pro Max 256GB',
          price: 95000,
          location: 'Mumbai',
          featured: true,
          isNegotiable: true,
        },
        {
          id: '2',
          title: 'MacBook Pro M2 16GB',
          price: 150000,
          location: 'Delhi',
          featured: true,
          isNegotiable: false,
        },
      ];

      const mockRecentListings: Listing[] = [
        {
          id: '3',
          title: 'Samsung 55" 4K Smart TV',
          price: 45000,
          location: 'Bangalore',
          timeAgo: '2h ago',
          isNegotiable: true,
        },
        {
          id: '4',
          title: 'Sofa Set (3+2+1)',
          price: 35000,
          location: 'Pune',
          timeAgo: '5h ago',
          isNegotiable: true,
        },
        {
          id: '5',
          title: '2020 Honda City',
          price: 850000,
          location: 'Hyderabad',
          timeAgo: '1d ago',
          isNegotiable: true,
        },
        {
          id: '6',
          title: 'Branded Watches',
          price: 15000,
          location: 'Chennai',
          timeAgo: '2d ago',
          isNegotiable: false,
        },
      ];

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      setCategories(mockCategories);
      setFeaturedListings(mockFeaturedListings);
      setRecentListings(mockRecentListings);
    } catch (err) {
      setError('Failed to load data');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refreshData = useCallback(() => {
    return fetchData();
  }, [fetchData]);

  return {
    categories,
    featuredListings,
    recentListings,
    isLoading,
    error,
    refreshData,
  };
};

