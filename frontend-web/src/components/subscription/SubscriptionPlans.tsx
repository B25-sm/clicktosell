'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { LoadingSpinner } from '../ui/LoadingSpinner';

interface Plan {
  name: string;
  price: number;
  currency: string;
  duration: number;
  maxListings: number;
  maxAds: number;
  features: Array<{
    name: string;
    description: string;
    enabled: boolean;
  }>;
}

interface SubscriptionPlansProps {
  currentPlan?: string;
  onSelectPlan: (plan: string) => void;
  loading?: boolean;
}

const SubscriptionPlans: React.FC<SubscriptionPlansProps> = ({
  currentPlan = 'basic',
  onSelectPlan,
  loading = false
}) => {
  const [plans, setPlans] = useState<Record<string, Plan>>({});
  const [loadingPlans, setLoadingPlans] = useState(true);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await fetch('/api/v1/subscriptions/plans');
      const data = await response.json();
      
      if (data.success) {
        setPlans(data.data.plans);
      }
    } catch (error) {
      console.error('Error fetching plans:', error);
    } finally {
      setLoadingPlans(false);
    }
  };

  const getPlanColor = (planName: string) => {
    switch (planName) {
      case 'basic':
        return 'bg-gray-100 border-gray-300';
      case 'premium':
        return 'bg-yellow-50 border-yellow-300 ring-2 ring-yellow-200';
      case 'unlimited':
        return 'bg-purple-50 border-purple-300 ring-2 ring-purple-200';
      default:
        return 'bg-gray-100 border-gray-300';
    }
  };

  const getPlanBadge = (planName: string) => {
    switch (planName) {
      case 'basic':
        return <Badge variant="secondary">Free</Badge>;
      case 'premium':
        return <Badge variant="default" className="bg-yellow-500">Popular</Badge>;
      case 'unlimited':
        return <Badge variant="default" className="bg-purple-500">Best Value</Badge>;
      default:
        return null;
    }
  };

  const formatPrice = (price: number, currency: string) => {
    if (price === 0) return 'Free';
    return `₹${price.toLocaleString()}`;
  };

  const formatLimit = (limit: number) => {
    if (limit === -1) return 'Unlimited';
    return limit.toString();
  };

  if (loadingPlans) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
      {Object.entries(plans).map(([planKey, plan]) => (
        <div
          key={planKey}
          className={`relative rounded-lg border-2 p-6 ${getPlanColor(planKey)} ${
            currentPlan === planKey ? 'ring-2 ring-blue-500' : ''
          }`}
        >
          {getPlanBadge(planKey)}
          
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
            <div className="text-4xl font-bold text-gray-900 mb-2">
              {formatPrice(plan.price, plan.currency)}
            </div>
            <p className="text-gray-600">per month</p>
          </div>

          <div className="space-y-4 mb-6">
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Listings</span>
              <span className="font-semibold text-gray-900">
                {formatLimit(plan.maxListings)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Ads</span>
              <span className="font-semibold text-gray-900">
                {formatLimit(plan.maxAds)}
              </span>
            </div>
          </div>

          <div className="space-y-3 mb-6">
            {plan.features.map((feature, index) => (
              <div key={index} className="flex items-start">
                <div className="flex-shrink-0">
                  {feature.enabled ? (
                    <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">{feature.name}</p>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>

          <Button
            onClick={() => onSelectPlan(planKey)}
            disabled={loading || currentPlan === planKey}
            className={`w-full ${
              currentPlan === planKey
                ? 'bg-gray-500 cursor-not-allowed'
                : planKey === 'premium'
                ? 'bg-yellow-500 hover:bg-yellow-600'
                : planKey === 'unlimited'
                ? 'bg-purple-500 hover:bg-purple-600'
                : 'bg-blue-500 hover:bg-blue-600'
            }`}
          >
            {loading ? (
              <LoadingSpinner size="sm" />
            ) : currentPlan === planKey ? (
              'Current Plan'
            ) : planKey === 'basic' ? (
              'Get Started'
            ) : (
              'Subscribe Now'
            )}
          </Button>
        </div>
      ))}
    </div>
  );
};

export default SubscriptionPlans;

