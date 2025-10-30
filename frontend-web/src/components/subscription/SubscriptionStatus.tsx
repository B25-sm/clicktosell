'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { LoadingSpinner } from '../ui/LoadingSpinner';

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

interface SubscriptionStatusProps {
  onUpgrade?: () => void;
  onManage?: () => void;
}

const SubscriptionStatus: React.FC<SubscriptionStatusProps> = ({
  onUpgrade,
  onManage
}) => {
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubscriptionStatus();
  }, []);

  const fetchSubscriptionStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/v1/subscriptions/current', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSubscription(data.data);
      }
    } catch (error) {
      console.error('Error fetching subscription status:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      case 'suspended':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'basic':
        return 'bg-gray-100 text-gray-800';
      case 'premium':
        return 'bg-yellow-100 text-yellow-800';
      case 'unlimited':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getUsagePercentage = (used: number, limit: number) => {
    if (limit === -1) return 0; // Unlimited
    return Math.min((used / limit) * 100, 100);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Unable to load subscription status</p>
        <Button onClick={fetchSubscriptionStatus} className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Subscription Status</h2>
        <div className="flex space-x-2">
          <Badge className={getPlanColor(subscription.currentPlan)}>
            {subscription.currentPlan.charAt(0).toUpperCase() + subscription.currentPlan.slice(1)}
          </Badge>
          <Badge className={getStatusColor(subscription.subscriptionStatus)}>
            {subscription.subscriptionStatus.charAt(0).toUpperCase() + subscription.subscriptionStatus.slice(1)}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Plan Details</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Current Plan:</span>
              <span className="font-medium">{subscription.currentPlan.charAt(0).toUpperCase() + subscription.currentPlan.slice(1)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <span className="font-medium">{subscription.subscriptionStatus.charAt(0).toUpperCase() + subscription.subscriptionStatus.slice(1)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Expires:</span>
              <span className="font-medium">{formatDate(subscription.subscriptionExpiresAt)}</span>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Usage This Month</h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Listings Created</span>
                <span className="font-medium">{subscription.monthlyUsage.listingsCreated}/10</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${getUsagePercentage(subscription.monthlyUsage.listingsCreated, 10)}%`
                  }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Ads Posted</span>
                <span className="font-medium">{subscription.monthlyUsage.adsPosted}/10</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${getUsagePercentage(subscription.monthlyUsage.adsPosted, 10)}%`
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Permissions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center">
            <div className={`w-3 h-3 rounded-full mr-3 ${subscription.canCreateListing ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-gray-700">
              {subscription.canCreateListing ? 'Can create listings' : 'Cannot create listings'}
            </span>
          </div>
          <div className="flex items-center">
            <div className={`w-3 h-3 rounded-full mr-3 ${subscription.canPostAd ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-gray-700">
              {subscription.canPostAd ? 'Can post ads' : 'Cannot post ads'}
            </span>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-3 mt-6">
        {onManage && (
          <Button variant="outline" onClick={onManage}>
            Manage Subscription
          </Button>
        )}
        {onUpgrade && subscription.currentPlan !== 'unlimited' && (
          <Button onClick={onUpgrade}>
            Upgrade Plan
          </Button>
        )}
      </div>
    </div>
  );
};

export default SubscriptionStatus;

