'use client';

import { ReactNode } from 'react';
import MobileHeader from './MobileHeader';
import MobileNavigation from './MobileNavigation';

interface MobileLayoutProps {
  children: ReactNode;
  title?: string;
  showBackButton?: boolean;
  showSearch?: boolean;
  showPostButton?: boolean;
  className?: string;
}

export default function MobileLayout({ 
  children, 
  title,
  showBackButton = false,
  showSearch = true,
  showPostButton = true,
  className = ""
}: MobileLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-light to-brand-white">
      {/* Mobile Header */}
      <MobileHeader
        title={title}
        showBackButton={showBackButton}
        showSearch={showSearch}
        showPostButton={showPostButton}
      />

      {/* Main Content */}
      <main className={`pb-20 lg:pb-0 ${className}`}>
        {children}
      </main>

      {/* Mobile Navigation */}
      <MobileNavigation />
    </div>
  );
}
