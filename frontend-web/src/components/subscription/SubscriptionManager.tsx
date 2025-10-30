'use client';

import React, { useState, useEffect } from 'react';
import SubscriptionPlans from './SubscriptionPlans';
import SubscriptionStatus from './SubscriptionStatus';
import PaymentModal from './PaymentModal';
import { Button } from '../ui/Button';

interface SubscriptionManagerProps {
  onClose?: () => void;
}

const SubscriptionManager: React.FC<SubscriptionManagerProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'plans' | 'status' | 'history'>('plans');
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [currentPlan, setCurrentPlan] = useState('basic');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCurrentSubscription();
  }, []);

  const fetchCurrentSubscription = async () => {
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
        setCurrentPlan(data.data.currentPlan);
      }
    } catch (error) {
      console.error('Error fetching current subscription:', error);
    }
  };

  const handleSelectPlan = (plan: string) => {
    if (plan === 'basic') {
      // Basic plan is free, activate directly
      activateBasicPlan();
    } else {
      setSelectedPlan(plan);
      setShowPaymentModal(true);
    }
  };

  const activateBasicPlan = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/v1/subscriptions/purchase', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          plan: 'basic',
          paymentMethod: 'free'
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setCurrentPlan('basic');
        // Show success message or refresh data
        alert('Basic plan activated successfully!');
      } else {
        alert(data.message || 'Failed to activate basic plan');
      }
    } catch (error) {
      console.error('Error activating basic plan:', error);
      alert('An error occurred while activating the plan');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = () => {
    setShowPaymentModal(false);
    setSelectedPlan(null);
    fetchCurrentSubscription();
    alert('Subscription activated successfully!');
  };

  const handleUpgrade = () => {
    setActiveTab('plans');
  };

  const handleManage = () => {
    setActiveTab('status');
  };

  const getPlanPrice = (plan: string) => {
    const prices = {
      basic: 0,
      premium: 999,
      unlimited: 1999
    };
    return prices[plan as keyof typeof prices] || 0;
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Subscription Management</h1>
        {onClose && (
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'plans', name: 'Plans & Pricing' },
            { id: 'status', name: 'Current Status' },
            { id: 'history', name: 'History' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'plans' && (
        <div>
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Choose Your Plan
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Select the perfect plan for your selling needs. Upgrade or downgrade at any time.
            </p>
          </div>
          
          <SubscriptionPlans
            currentPlan={currentPlan}
            onSelectPlan={handleSelectPlan}
            loading={loading}
          />
        </div>
      )}

      {activeTab === 'status' && (
        <div>
          <SubscriptionStatus
            onUpgrade={handleUpgrade}
            onManage={handleManage}
          />
        </div>
      )}

      {activeTab === 'history' && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Subscription History</h2>
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-gray-600 text-center py-8">
              Subscription history will be displayed here.
            </p>
            {/* TODO: Implement subscription history component */}
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && selectedPlan && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedPlan(null);
          }}
          plan={selectedPlan}
          amount={getPlanPrice(selectedPlan)}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
};

export default SubscriptionManager;

