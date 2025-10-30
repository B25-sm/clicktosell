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
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100 shadow-soft">
      <div className="container-custom">
        <div className="flex items-center justify-between h-20">
          {/* Modern Logo */}
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="w-12 h-12 bg-gradient-to-br from-brand-primary to-green-600 rounded-2xl flex items-center justify-center group-hover:scale-105 transition-transform duration-200 shadow-lg">
                <span className="text-white font-bold text-xl">O</span>
              </div>
              <span className="hidden sm:block text-2xl font-bold gradient-text">
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

          {/* Modern Search Bar - Hidden on mobile */}
          <div className="hidden md:block flex-1 max-w-2xl mx-8">
            <SearchBar />
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-3">
            {/* Mobile search icon */}
            <button
              className="md:hidden p-3 text-brand-muted hover:text-brand-primary hover:bg-green-50 rounded-xl transition-all duration-200"
              onClick={() => router.push('/search')}
            >
              <MagnifyingGlassIcon className="w-6 h-6" />
            </button>

            {/* Modern Post Ad Button */}
            <button
              onClick={handlePostAd}
              className="hidden sm:flex items-center space-x-2 btn-gradient px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              <PlusIcon className="w-5 h-5" />
              <span>Sell</span>
            </button>

            {isAuthenticated ? (
              <>
                {/* Modern Favorites */}
                <button
                  onClick={handleFavorites}
                  className="p-3 text-brand-muted hover:text-brand-primary hover:bg-green-50 rounded-xl relative transition-all duration-200 group"
                  title="Favorites"
                >
                  <HeartIcon className="w-6 h-6 group-hover:scale-110 transition-transform duration-200" />
                </button>

                {/* Modern Chat */}
                <button
                  onClick={handleChat}
                  className="p-3 text-brand-muted hover:text-brand-primary hover:bg-green-50 rounded-xl relative transition-all duration-200 group"
                  title="Messages"
                >
                  <ChatBubbleLeftIcon className="w-6 h-6 group-hover:scale-110 transition-transform duration-200" />
                  {unreadCount > 0 && (
                    <div className="absolute -top-1 -right-1 min-w-[1.25rem] h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-bounce">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </div>
                  )}
                </button>

                {/* Modern Notifications */}
                <div className="relative" ref={notificationRef}>
                  <button
                    onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                    className="p-3 text-brand-muted hover:text-brand-primary hover:bg-green-50 rounded-xl relative transition-all duration-200 group"
                    title="Notifications"
                  >
                    <BellIcon className="w-6 h-6 group-hover:scale-110 transition-transform duration-200" />
                    <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  </button>

                  {isNotificationOpen && (
                    <NotificationDropdown
                      onClose={() => setIsNotificationOpen(false)}
                    />
                  )}
                </div>

                {/* Modern User Menu */}
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-3 p-2 text-brand-muted hover:text-brand-primary hover:bg-green-50 rounded-xl transition-all duration-200 group"
                  >
                    {user?.profilePicture?.url ? (
                      <Image
                        src={user.profilePicture.url}
                        alt={user.firstName}
                        width={36}
                        height={36}
                        className="w-9 h-9 rounded-full object-cover ring-2 ring-brand-primary/20 group-hover:ring-brand-primary/40 transition-all duration-200"
                      />
                    ) : (
                      <div className="w-9 h-9 bg-gradient-to-br from-brand-primary to-green-600 rounded-full flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                        <UserIcon className="w-5 h-5 text-white" />
                      </div>
                    )}
                    <ChevronDownIcon className="hidden sm:block w-4 h-4 group-hover:rotate-180 transition-transform duration-200" />
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
              <div className="flex items-center space-x-3">
                <Link
                  href="/auth/login"
                  className="hidden sm:block px-6 py-3 text-sm font-semibold text-brand-muted hover:text-brand-primary transition-colors duration-200"
                >
                  Login
                </Link>
                <Link href="/auth/register">
                  <button className="btn-primary px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
                    Sign Up
                  </button>
                </Link>
              </div>
            )}

            {/* Modern Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-3 text-brand-muted hover:text-brand-primary hover:bg-green-50 rounded-xl transition-all duration-200"
            >
              <Bars3Icon className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Modern Mobile Search Bar */}
        <div className="md:hidden pb-6 px-4">
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



