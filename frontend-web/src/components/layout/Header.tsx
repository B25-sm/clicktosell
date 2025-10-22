'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { 
  MagnifyingGlassIcon,
  PlusIcon,
  UserIcon,
  HeartIcon,
  ChatBubbleLeftIcon,
  BellIcon,
  Bars3Icon,
  XMarkIcon,
  MapPinIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';
import { useSocket } from '@/contexts/SocketContext';
import { SearchBar } from '@/components/search/SearchBar';
import { LocationSelector } from '@/components/common/LocationSelector';
import { NotificationDropdown } from '@/components/notifications/NotificationDropdown';
import { UserMenu } from '@/components/user/UserMenu';
import { MobileMenu } from '@/components/layout/MobileMenu';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

export function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const { unreadCount } = useSocket();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [currentLocation, setCurrentLocation] = useState('Mumbai, Maharashtra');
  
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handlePostAd = () => {
    if (!isAuthenticated) {
      router.push('/auth/login?redirect=/post-ad');
    } else {
      router.push('/post-ad');
    }
  };

  const handleFavorites = () => {
    if (!isAuthenticated) {
      router.push('/auth/login?redirect=/favorites');
    } else {
      router.push('/favorites');
    }
  };

  const handleChat = () => {
    if (!isAuthenticated) {
      router.push('/auth/login?redirect=/chat');
    } else {
      router.push('/chat');
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="container-custom">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-primary-900 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">O</span>
              </div>
              <span className="hidden sm:block text-xl font-bold text-primary-900">
                OLX Classifieds
              </span>
            </Link>

            {/* Location Selector - Hidden on mobile */}
            <div className="hidden lg:block">
              <LocationSelector
                value={currentLocation}
                onChange={setCurrentLocation}
                className="w-48"
              />
            </div>
          </div>

          {/* Search Bar - Hidden on mobile */}
          <div className="hidden md:block flex-1 max-w-2xl mx-8">
            <SearchBar />
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-2">
            {/* Mobile search icon */}
            <button
              className="md:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
              onClick={() => router.push('/search')}
            >
              <MagnifyingGlassIcon className="w-6 h-6" />
            </button>

            {/* Post Ad Button */}
            <Button
              onClick={handlePostAd}
              className="hidden sm:flex items-center space-x-2"
            >
              <PlusIcon className="w-4 h-4" />
              <span>Sell</span>
            </Button>

            {isAuthenticated ? (
              <>
                {/* Favorites */}
                <button
                  onClick={handleFavorites}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg relative"
                  title="Favorites"
                >
                  <HeartIcon className="w-6 h-6" />
                </button>

                {/* Chat */}
                <button
                  onClick={handleChat}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg relative"
                  title="Messages"
                >
                  <ChatBubbleLeftIcon className="w-6 h-6" />
                  {unreadCount > 0 && (
                    <Badge
                      variant="error"
                      size="sm"
                      className="absolute -top-1 -right-1 min-w-[1.25rem] h-5 flex items-center justify-center"
                    >
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </Badge>
                  )}
                </button>

                {/* Notifications */}
                <div className="relative" ref={notificationRef}>
                  <button
                    onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg relative"
                    title="Notifications"
                  >
                    <BellIcon className="w-6 h-6" />
                    <div className="absolute top-1 right-1 w-2 h-2 bg-error-500 rounded-full"></div>
                  </button>

                  {isNotificationOpen && (
                    <NotificationDropdown
                      onClose={() => setIsNotificationOpen(false)}
                    />
                  )}
                </div>

                {/* User Menu */}
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-2 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                  >
                    {user?.profilePicture?.url ? (
                      <Image
                        src={user.profilePicture.url}
                        alt={user.firstName}
                        width={32}
                        height={32}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                        <UserIcon className="w-5 h-5 text-primary-600" />
                      </div>
                    )}
                    <ChevronDownIcon className="hidden sm:block w-4 h-4" />
                  </button>

                  {isUserMenuOpen && (
                    <UserMenu
                      user={user}
                      onClose={() => setIsUserMenuOpen(false)}
                      onLogout={logout}
                    />
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  href="/auth/login"
                  className="hidden sm:block px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  Login
                </Link>
                <Link href="/auth/register">
                  <Button>Sign Up</Button>
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
            >
              <Bars3Icon className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden pb-4">
          <SearchBar />
        </div>
      </div>

      {/* Mobile Menu */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />
    </header>
  );
}



