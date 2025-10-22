'use client';

import React from 'react';

export function SearchBar() {
  return (
    <div className="w-full">
      <div className="flex items-center border rounded-lg px-3 py-2 text-sm text-gray-600">
        <input placeholder="Search listings..." className="w-full outline-none" />
      </div>
    </div>
  );
}


