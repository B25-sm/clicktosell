'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Bars3Icon, 
  MagnifyingGlassIcon, 
  PlusIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import SearchBar from '@/components/search/SearchBar';
import MobileNavigation from './MobileNavigation';

interface MobileHeaderProps {
  title?: string;
  showBackButton?: boolean;
  showSearch?: boolean;
  showPostButton?: boolean;
  className?: string;
}

export default function MobileHeader({ 
  title = "OLX Classifieds",
  showBackButton = false,
  showSearch = true,
  showPostButton = true,
  className = ""
}: MobileHeaderProps) {
  const [showSearchBar, setShowSearchBar] = useState(false);
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  const handleSearch = (query: string) => {
    router.push(`/search?q=${encodeURIComponent(query)}`);
    setShowSearchBar(false);
  };

  return (
    <>
      <header className={`bg-white/80 backdrop-blur-lg border-b border-gray-100 shadow-soft ${className}`}>
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Left side */}
            <div className="flex items-center space-x-3">
              {showBackButton ? (
                <button
                  onClick={handleBack}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <ArrowLeftIcon className="h-6 w-6 text-gray-600" />
                </button>
              ) : (
                <MobileNavigation />
              )}
              
              <Link href="/" className="flex items-center">
                <h1 className="text-lg font-bold text-brand-dark truncate">
                  {title}
                </h1>
              </Link>
            </div>

            {/* Right side */}
            <div className="flex items-center space-x-2">
              {showSearch && (
                <button
                  onClick={() => setShowSearchBar(!showSearchBar)}
                  className="p-2 hover:bg-green-50 rounded-full"
                >
                  <MagnifyingGlassIcon className="h-6 w-6 text-brand-muted" />
                </button>
              )}
              
              {showPostButton && (
                <Link
                  href="/listings/create"
                  className="btn-gradient px-3 py-2 rounded-full"
                >
                  <PlusIcon className="h-6 w-6 text-white" />
                </Link>
              )}
            </div>
          </div>

          {/* Search Bar */}
          {showSearchBar && (
            <div className="mt-3">
              <SearchBar
                placeholder="Search for anything..."
                className="w-full"
                onSearch={handleSearch}
                showSuggestions={true}
              />
            </div>
          )}
        </div>
      </header>
    </>
  );
}
