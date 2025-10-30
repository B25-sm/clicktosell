'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export function UserMenu({ user, onClose, onLogout }: { user?: any; onClose?: () => void; onLogout?: () => void }) {
  const router = useRouter();

  const handleSubscription = () => {
    router.push('/subscription');
    onClose?.();
  };

  return (
    <div className="absolute right-0 mt-2 w-56 bg-white border rounded-lg shadow-lg p-2 text-sm z-50">
      <div className="px-3 py-2 border-b text-gray-900 font-medium">
        {user?.firstName || 'Guest'}
      </div>
      
      <div className="py-1">
        <Link 
          href="/dashboard" 
          className="block px-3 py-2 hover:bg-gray-100 rounded text-gray-700"
          onClick={onClose}
        >
          Dashboard
        </Link>
        
        <Link 
          href="/listings/my" 
          className="block px-3 py-2 hover:bg-gray-100 rounded text-gray-700"
          onClick={onClose}
        >
          My Listings
        </Link>
        
        <button 
          onClick={handleSubscription}
          className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded text-gray-700"
        >
          Subscription
        </button>
        
        <Link 
          href="/profile" 
          className="block px-3 py-2 hover:bg-gray-100 rounded text-gray-700"
          onClick={onClose}
        >
          Profile Settings
        </Link>
      </div>
      
      <div className="border-t pt-1">
        <button 
          className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded text-red-600" 
          onClick={onLogout}
        >
          Logout
        </button>
      </div>
    </div>
  );
}


