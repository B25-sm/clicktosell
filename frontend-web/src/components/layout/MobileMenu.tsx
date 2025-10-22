'use client';

import React from 'react';
import Link from 'next/link';

export function MobileMenu({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/30">
      <div className="absolute right-0 top-0 h-full w-64 bg-white shadow-xl p-4">
        <div className="font-semibold mb-4">Menu</div>
        <nav className="flex flex-col space-y-2">
          <Link href="/" onClick={onClose}>Home</Link>
          <Link href="/search" onClick={onClose}>Search</Link>
          <Link href="/post-ad" onClick={onClose}>Post Ad</Link>
        </nav>
        <button className="mt-4 text-primary-600" onClick={onClose}>Close</button>
      </div>
    </div>
  );
}


