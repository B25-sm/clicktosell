'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { LoadingSpinner } from '../ui/LoadingSpinner';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: string;
  amount: number;
  onSuccess: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  plan,
  amount,
  onSuccess
}) => {
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setError(null);
    }
  }, [isOpen]);

  const handlePayment = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      
      // Create payment order
      const response = await fetch('/api/v1/subscriptions/purchase', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          plan,
          paymentMethod
        })
      });

      const data = await response.json();

      if (data.success) {
        // Initialize Razorpay
        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: data.data.order.amount,
          currency: data.data.order.currency,
          name: 'OLX Classifieds',
          description: `${plan.charAt(0).toUpperCase() + plan.slice(1)} Subscription`,
          order_id: data.data.order.id,
          handler: async (response: any) => {
            // Verify payment
            await verifyPayment(response);
          },
          prefill: {
            name: 'User Name', // You can get this from user context
            email: 'user@example.com', // You can get this from user context
            contact: '+91 98765 43210' // You can get this from user context
          },
          theme: {
            color: '#0A0F2C'
          }
        };

        const razorpay = new (window as any).Razorpay(options);
        razorpay.open();
      } else {
        setError(data.message || 'Failed to create payment order');
      }
    } catch (error) {
      console.error('Payment error:', error);
      setError('An error occurred while processing payment');
    } finally {
      setLoading(false);
    }
  };

  const verifyPayment = async (paymentResponse: any) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch('/api/v1/subscriptions/verify', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          orderId: paymentResponse.razorpay_order_id,
          paymentId: paymentResponse.razorpay_payment_id,
          signature: paymentResponse.razorpay_signature
        })
      });

      const data = await response.json();

      if (data.success) {
        onSuccess();
        onClose();
      } else {
        setError(data.message || 'Payment verification failed');
      }
    } catch (error) {
      console.error('Verification error:', error);
      setError('Payment verification failed');
    }
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  useEffect(() => {
    if (isOpen) {
      loadRazorpayScript();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Complete Payment</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">Plan:</span>
              <span className="font-semibold text-gray-900">
                {plan.charAt(0).toUpperCase() + plan.slice(1)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Amount:</span>
              <span className="font-bold text-lg text-gray-900">₹{amount.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Payment Method
          </label>
          <div className="space-y-2">
            {[
              { value: 'card', label: 'Credit/Debit Card' },
              { value: 'netbanking', label: 'Net Banking' },
              { value: 'upi', label: 'UPI' },
              { value: 'wallet', label: 'Wallet' }
            ].map((method) => (
              <label key={method.value} className="flex items-center">
                <input
                  type="radio"
                  name="paymentMethod"
                  value={method.value}
                  checked={paymentMethod === method.value}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="mr-3"
                />
                <span className="text-gray-700">{method.label}</span>
              </label>
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handlePayment}
            disabled={loading}
            className="flex-1"
          >
            {loading ? (
              <LoadingSpinner size="sm" />
            ) : (
              `Pay ₹${amount.toLocaleString()}`
            )}
          </Button>
        </div>

        <div className="mt-4 text-xs text-gray-500 text-center">
          <p>Secure payment powered by Razorpay</p>
          <p>Your payment information is encrypted and secure</p>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;

