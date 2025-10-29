'use client';

import { useState, useEffect } from 'react';
import { apiService } from '@/lib/api';
import { LoadingSpinner } from './ui/LoadingSpinner';

interface ConnectionStatus {
  backend: 'checking' | 'connected' | 'error';
  api: 'checking' | 'connected' | 'error';
  listings: 'checking' | 'connected' | 'error';
  error?: string;
}

export function ConnectionTest() {
  const [status, setStatus] = useState<ConnectionStatus>({
    backend: 'checking',
    api: 'checking',
    listings: 'checking'
  });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    setStatus({
      backend: 'checking',
      api: 'checking',
      listings: 'checking'
    });

    try {
      // Test backend health
      try {
        await apiService.healthCheck();
        setStatus(prev => ({ ...prev, backend: 'connected' }));
      } catch (error) {
        setStatus(prev => ({ 
          ...prev, 
          backend: 'error',
          error: 'Backend server not responding'
        }));
        return;
      }

      // Test API health
      try {
        const response = await fetch(`https://clicktosell.onrender.com/api/health`);
        if (response.ok) {
          setStatus(prev => ({ ...prev, api: 'connected' }));
        } else {
          throw new Error('API health check failed');
        }
      } catch (error) {
        setStatus(prev => ({ 
          ...prev, 
          api: 'error',
          error: 'API endpoint not responding'
        }));
        return;
      }

      // Test listings endpoint
      try {
        const listings = await apiService.getListings();
        if (listings.success && listings.data.listings.length >= 0) {
          setStatus(prev => ({ ...prev, listings: 'connected' }));
        } else {
          throw new Error('Listings data invalid');
        }
      } catch (error) {
        setStatus(prev => ({ 
          ...prev, 
          listings: 'error',
          error: 'Listings API not working'
        }));
      }

    } catch (error) {
      console.error('Connection test failed:', error);
    }
  };

  const getStatusIcon = (status: 'checking' | 'connected' | 'error') => {
    switch (status) {
      case 'checking':
        return <LoadingSpinner size="sm" />;
      case 'connected':
        return <span className="text-green-500">✅</span>;
      case 'error':
        return <span className="text-red-500">❌</span>;
    }
  };

  const getStatusText = (status: 'checking' | 'connected' | 'error') => {
    switch (status) {
      case 'checking':
        return 'Checking...';
      case 'connected':
        return 'Connected';
      case 'error':
        return 'Error';
    }
  };

  const allConnected = status.backend === 'connected' && status.api === 'connected' && status.listings === 'connected';

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 bg-[color:theme(colors.brand.midnight)] text-white px-4 py-2 rounded-lg shadow-lg hover:opacity-90 transition z-50"
      >
        Test Connection
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 w-80 z-50">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-gray-800">Connection Status</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Backend Server</span>
          <div className="flex items-center space-x-2">
            {getStatusIcon(status.backend)}
            <span className="text-sm font-medium">
              {getStatusText(status.backend)}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">API Endpoint</span>
          <div className="flex items-center space-x-2">
            {getStatusIcon(status.api)}
            <span className="text-sm font-medium">
              {getStatusText(status.api)}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Listings API</span>
          <div className="flex items-center space-x-2">
            {getStatusIcon(status.listings)}
            <span className="text-sm font-medium">
              {getStatusText(status.listings)}
            </span>
          </div>
        </div>

        {status.error && (
          <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-600">
            {status.error}
          </div>
        )}

        {allConnected && (
          <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded text-sm text-green-600">
            🎉 All systems connected successfully!
          </div>
        )}

        <div className="flex space-x-2 mt-4">
          <button
            onClick={testConnection}
            className="flex-1 bg-[color:theme(colors.brand.midnight)] text-white px-3 py-2 rounded text-sm hover:opacity-90 transition"
          >
            Retry Test
          </button>
          <button
            onClick={() => window.open(`https://clicktosell.onrender.com/health`, '_blank')}
            className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded text-sm hover:bg-gray-200 transition"
          >
            View API
          </button>
        </div>
      </div>
    </div>
  );
}