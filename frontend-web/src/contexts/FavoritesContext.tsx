'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';

interface FavoritesContextValue {
  favorites: string[];
  isFavorited: (listingId: string) => boolean;
  toggleFavorite: (listingId: string) => Promise<void>;
  addToFavorites: (listingId: string) => Promise<void>;
  removeFromFavorites: (listingId: string) => Promise<void>;
  isLoading: boolean;
}

const FavoritesContext = createContext<FavoritesContextValue>({
  favorites: [],
  isFavorited: () => false,
  toggleFavorite: async () => {},
  addToFavorites: async () => {},
  removeFromFavorites: async () => {},
  isLoading: false
});

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchFavorites();
    } else {
      setFavorites([]);
    }
  }, [isAuthenticated, user]);

  const fetchFavorites = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('/users/favorites');
      setFavorites(response.data.data.favorites);
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const isFavorited = (listingId: string) => {
    return favorites.includes(listingId);
  };

  const addToFavorites = async (listingId: string) => {
    if (!isAuthenticated) {
      toast.error('Please login to add favorites');
      return;
    }

    try {
      await axios.post(`/listings/${listingId}/favorite`);
      setFavorites(prev => [...prev, listingId]);
      toast.success('Added to favorites');
    } catch (error: any) {
      console.error('Error adding to favorites:', error);
      toast.error(error.response?.data?.message || 'Failed to add to favorites');
    }
  };

  const removeFromFavorites = async (listingId: string) => {
    if (!isAuthenticated) {
      toast.error('Please login to manage favorites');
      return;
    }

    try {
      await axios.delete(`/listings/${listingId}/favorite`);
      setFavorites(prev => prev.filter(id => id !== listingId));
      toast.success('Removed from favorites');
    } catch (error: any) {
      console.error('Error removing from favorites:', error);
      toast.error(error.response?.data?.message || 'Failed to remove from favorites');
    }
  };

  const toggleFavorite = async (listingId: string) => {
    if (isFavorited(listingId)) {
      await removeFromFavorites(listingId);
    } else {
      await addToFavorites(listingId);
    }
  };

  const value: FavoritesContextValue = {
    favorites,
    isFavorited,
    toggleFavorite,
    addToFavorites,
    removeFromFavorites,
    isLoading
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
}

