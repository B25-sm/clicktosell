'use client';

import React from 'react';
import { Button } from '../ui/Button';
import { useSubscription } from '../../contexts/SubscriptionContext';

interface SubscriptionLimitWarningProps {
  type: 'listing' | 'ad';
  onUpgrade: () => void;
  onClose: () => void;
}

const SubscriptionLimitWarning: React.FC<SubscriptionLimitWarningProps> = ({
  type,
  onUpgrade,
  onClose
}) => {
  const { subscription } = useSubscription();

  if (!subscription) return null;

  const isListingLimit = type === 'listing';
  const limitReached = isListingLimit ? !subscription.canCreateListing : !subscription.canPostAd;
  const usage = isListingLimit ? subscription.monthlyUsage.listingsCreated : subscription.monthlyUsage.adsPosted;
  const limit = 10; // This should come from the plan details
  const planName = subscription.currentPlan.charAt(0).toUpperCase() + subscription.currentPlan.slice(1);

  if (!limitReached) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 mb-4">
            <svg className="h-6 w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {isListingLimit ? 'Listing Limit Reached' : 'Ad Limit Reached'}
          </h3>
          
          <p className="text-sm text-gray-600 mb-4">
            You've reached your monthly limit of {limit} {isListingLimit ? 'listings' : 'ads'} on the {planName} plan.
            You've used {usage} out of {limit} this month.
          </p>

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h4 className="font-medium text-gray-900 mb-2">Upgrade to get more:</h4>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Premium Plan:</span>
                <span className="font-medium">Unlimited listings + 10 ads</span>
              </div>
              <div className="flex justify-between">
                <span>Unlimited Plan:</span>
                <span className="font-medium">Unlimited everything</span>
              </div>
            </div>
          </div>

          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Maybe Later
            </Button>
            <Button
              onClick={onUpgrade}
              className="flex-1"
            >
              Upgrade Now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionLimitWarning;

