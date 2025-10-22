'use client';

import React from 'react';

export function NotificationDropdown({ onClose }: { onClose?: () => void }) {
  return (
    <div className="absolute right-0 mt-2 w-64 bg-white border rounded-lg shadow-lg p-3 text-sm">
      <div className="font-medium mb-2">Notifications</div>
      <div className="text-gray-500">No new notifications</div>
      <button className="mt-3 text-primary-600" onClick={onClose}>Close</button>
    </div>
  );
}


