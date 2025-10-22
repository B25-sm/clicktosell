'use client';

import React from 'react';

export function UserMenu({ user, onClose, onLogout }: { user?: any; onClose?: () => void; onLogout?: () => void }) {
  return (
    <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg p-2 text-sm">
      <div className="px-3 py-2 border-b">{user?.firstName || 'Guest'}</div>
      <button className="w-full text-left px-3 py-2 hover:bg-gray-100" onClick={onLogout}>Logout</button>
      <button className="w-full text-left px-3 py-2 hover:bg-gray-100" onClick={onClose}>Close</button>
    </div>
  );
}


