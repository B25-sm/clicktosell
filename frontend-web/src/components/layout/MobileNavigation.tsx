'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { 
  HomeIcon, 
  MagnifyingGlassIcon, 
  PlusIcon, 
  HeartIcon, 
  ChatBubbleLeftRightIcon,
  UserIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { 
  HomeIcon as HomeSolidIcon,
  MagnifyingGlassIcon as SearchSolidIcon,
  PlusIcon as PlusSolidIcon,
  HeartIcon as HeartSolidIcon,
  ChatBubbleLeftRightIcon as ChatSolidIcon,
  UserIcon as UserSolidIcon
} from '@heroicons/react/24/solid';
import { useAuth } from '@/contexts/AuthContext';
import { useSocket } from '@/contexts/SocketContext';

const navigationItems = [
  { name: 'Home', href: '/', icon: HomeIcon, solidIcon: HomeSolidIcon },
  { name: 'Search', href: '/search', icon: MagnifyingGlassIcon, solidIcon: SearchSolidIcon },
  { name: 'Post Ad', href: '/listings/create', icon: PlusIcon, solidIcon: PlusSolidIcon },
  { name: 'Favorites', href: '/dashboard/favorites', icon: HeartIcon, solidIcon: HeartSolidIcon },
  { name: 'Chat', href: '/chat', icon: ChatBubbleLeftRightIcon, solidIcon: ChatSolidIcon },
  { name: 'Profile', href: '/dashboard', icon: UserIcon, solidIcon: UserSolidIcon }
];

export default function MobileNavigation() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();
  const { unreadCount } = useSocket();

  const handleNavigation = (href: string) => {
    if (href === '/listings/create' || href === '/dashboard/favorites' || href === '/chat' || href === '/dashboard') {
      if (!isAuthenticated) {
        router.push('/auth/login');
        return;
      }
    }
    router.push(href);
    setIsOpen(false);
  };

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed top-4 right-4 z-50 p-2 bg-brand-primary text-white rounded-full shadow-lg"
      >
        <Bars3Icon className="h-6 w-6" />
      </button>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsOpen(false)} />
          
          <div className="fixed top-0 right-0 h-full w-80 max-w-sm bg-white shadow-xl">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold text-brand-dark">Menu</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <nav className="p-4">
              <ul className="space-y-2">
                {navigationItems.map((item) => {
                  const active = isActive(item.href);
                  const Icon = active ? item.solidIcon : item.icon;
                  
                  return (
                    <li key={item.name}>
                      <button
                        onClick={() => handleNavigation(item.href)}
                      className={`w-full flex items-center px-4 py-3 rounded-lg text-left transition ${
                          active
                            ? 'bg-brand-primary text-white'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <Icon className="h-6 w-6 mr-3" />
                        <span className="font-medium">{item.name}</span>
                        {item.name === 'Chat' && unreadCount > 0 && (
                          <span className="ml-auto bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                            {unreadCount > 9 ? '9+' : unreadCount}
                          </span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>

              {!isAuthenticated && (
                <div className="mt-6 pt-6 border-t">
                    <div className="space-y-2">
                    <button
                      onClick={() => handleNavigation('/auth/login')}
                      className="w-full btn-primary px-4 py-3 rounded-lg font-medium"
                    >
                      Sign In
                    </button>
                    <button
                      onClick={() => handleNavigation('/auth/register')}
                      className="w-full btn-secondary px-4 py-3 rounded-lg font-medium"
                    >
                      Sign Up
                    </button>
                  </div>
                </div>
              )}
            </nav>
          </div>
        </div>
      )}

      {/* Bottom Navigation Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
        <div className="grid grid-cols-5 h-16">
          {navigationItems.slice(0, 5).map((item) => {
            const active = isActive(item.href);
            const Icon = active ? item.solidIcon : item.icon;
            
            return (
              <button
                key={item.name}
                onClick={() => handleNavigation(item.href)}
                className={`flex flex-col items-center justify-center space-y-1 ${
                  active ? 'text-brand-primary' : 'text-gray-500'
                }`}
              >
                <div className="relative">
                  <Icon className="h-6 w-6" />
                  {item.name === 'Chat' && unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </div>
                <span className="text-xs font-medium">{item.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
