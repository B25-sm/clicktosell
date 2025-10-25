'use client';

import { useState } from 'react';
import { apiService } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export function ConnectionTest() {
  const [isTesting, setIsTesting] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    details?: any;
  } | null>(null);

  const testConnection = async () => {
    setIsTesting(true);
    setResult(null);

    try {
      const healthResponse = await apiService.healthCheck();
      const listingsResponse = await apiService.getListings();
      
      setResult({
        success: true,
        message: 'Connection successful!',
        details: {
          health: healthResponse,
          listings: listingsResponse,
        }
      });
    } catch (error: any) {
      setResult({
        success: false,
        message: `Connection failed: ${error.message}`,
        details: error.response?.data || error.message,
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold mb-4 text-[color:theme(colors.brand.midnight)]">
        Backend Connection Test
      </h3>
      
      <div className="space-y-4">
        <Button
          onClick={testConnection}
          disabled={isTesting}
          className="w-full"
        >
          {isTesting ? (
            <>
              <LoadingSpinner size="sm" className="mr-2" />
              Testing Connection...
            </>
          ) : (
            'Test Backend Connection'
          )}
        </Button>

        {result && (
          <div className={`p-4 rounded-lg ${
            result.success 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-red-50 border border-red-200'
          }`}>
            <div className={`font-medium ${
              result.success ? 'text-green-800' : 'text-red-800'
            }`}>
              {result.success ? '✅' : '❌'} {result.message}
            </div>
            
            {result.details && (
              <details className="mt-2">
                <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800">
                  View Details
                </summary>
                <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto max-h-40">
                  {JSON.stringify(result.details, null, 2)}
                </pre>
              </details>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
