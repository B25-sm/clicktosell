'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface SubscriptionData {
  currentPlan: string;
  subscriptionStatus: string;
  subscriptionExpiresAt: string | null;
  monthlyUsage: {
    listingsCreated: number;
    adsPosted: number;
    lastResetDate: string;
  };
  canCreateListing: boolean;
  canPostAd: boolean;
}

interface SubscriptionContextType {
  subscription: SubscriptionData | null;
  loading: boolean;
  error: string | null;
  refreshSubscription: () => Promise<void>;
  checkListingLimit: () => boolean;
  checkAdLimit: () => boolean;
  incrementListingUsage: () => void;
  incrementAdUsage: () => void;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

interface SubscriptionProviderProps {
  children: ReactNode;
}

export const SubscriptionProvider: React.FC<SubscriptionProviderProps> = ({ children }) => {
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscription = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await fetch('/api/v1/subscriptions/current', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        setSubscription(data.data);
      } else {
        setError(data.message || 'Failed to fetch subscription data');
      }
    } catch (err) {
      console.error('Error fetching subscription:', err);
      setError('An error occurred while fetching subscription data');
    } finally {
      setLoading(false);
    }
  };

  const refreshSubscription = async () => {
    await fetchSubscription();
  };

  const checkListingLimit = (): boolean => {
    if (!subscription) return false;
    return subscription.canCreateListing;
  };

  const checkAdLimit = (): boolean => {
    if (!subscription) return false;
    return subscription.canPostAd;
  };

  const incrementListingUsage = () => {
    if (subscription) {
      setSubscription(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          monthlyUsage: {
            ...prev.monthlyUsage,
            listingsCreated: prev.monthlyUsage.listingsCreated + 1
          }
        };
      });
    }
  };

  const incrementAdUsage = () => {
    if (subscription) {
      setSubscription(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          monthlyUsage: {
            ...prev.monthlyUsage,
            adsPosted: prev.monthlyUsage.adsPosted + 1
          }
        };
      });
    }
  };

  useEffect(() => {
    fetchSubscription();
  }, []);

  const value: SubscriptionContextType = {
    subscription,
    loading,
    error,
    refreshSubscription,
    checkListingLimit,
    checkAdLimit,
    incrementListingUsage,
    incrementAdUsage
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = (): SubscriptionContextType => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};

