'use client';

import { HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { useFavorites } from '@/contexts/FavoritesContext';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface FavoriteButtonProps {
  listingId: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export function FavoriteButton({ 
  listingId, 
  className = '',
  size = 'md',
  showText = false
}: FavoriteButtonProps) {
  const { isFavorited, toggleFavorite, isLoading } = useFavorites();
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error('Please login to add favorites');
      router.push('/auth/login');
      return;
    }

    await toggleFavorite(listingId);
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'h-4 w-4';
      case 'lg':
        return 'h-6 w-6';
      default:
        return 'h-5 w-5';
    }
  };

  const getButtonClasses = () => {
    const baseClasses = 'flex items-center justify-center rounded-full transition-colors';
    const sizeClasses = size === 'sm' ? 'p-1' : size === 'lg' ? 'p-3' : 'p-2';
    return `${baseClasses} ${sizeClasses} ${className}`;
  };

  const isFavoritedValue = isFavorited(listingId);

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className={`${getButtonClasses()} ${
        isFavoritedValue
          ? 'bg-red-500 text-white hover:bg-red-600'
          : 'bg-white text-gray-400 hover:text-red-500 hover:bg-red-50 shadow-md'
      } disabled:opacity-50 disabled:cursor-not-allowed`}
      title={isFavoritedValue ? 'Remove from favorites' : 'Add to favorites'}
    >
      {isFavoritedValue ? (
        <HeartSolidIcon className={getSizeClasses()} />
      ) : (
        <HeartIcon className={getSizeClasses()} />
      )}
      {showText && (
        <span className="ml-1 text-sm">
          {isFavoritedValue ? 'Favorited' : 'Favorite'}
        </span>
      )}
    </button>
  );
}

