'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';
import axios from 'axios';

interface ChatButtonProps {
  listingId: string;
  sellerId: string;
  className?: string;
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
}

export function ChatButton({ 
  listingId, 
  sellerId, 
  className = '',
  variant = 'primary',
  size = 'md'
}: ChatButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  const handleStartChat = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to start a conversation');
      router.push('/auth/login');
      return;
    }

    if (user?.id === sellerId) {
      toast.error('You cannot chat with yourself');
      return;
    }

    setIsLoading(true);
    try {
      // Find or create chat
      const response = await axios.post('/chat', {
        listingId,
        sellerId
      });

      const chat = response.data.data;
      
      // Redirect to chat page with the specific chat
      router.push(`/chat?chatId=${chat._id}`);
    } catch (error: any) {
      console.error('Error starting chat:', error);
      toast.error(error.response?.data?.message || 'Failed to start conversation');
    } finally {
      setIsLoading(false);
    }
  };

  const getButtonStyles = () => {
    const baseStyles = 'flex items-center justify-center';
    
    if (variant === 'primary') {
      return `${baseStyles} bg-[#0A0F2C] text-white hover:opacity-90`;
    } else {
      return `${baseStyles} border border-[#0A0F2C] text-[#0A0F2C] hover:bg-[#0A0F2C] hover:text-white`;
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return 'px-3 py-1 text-sm';
      case 'lg':
        return 'px-6 py-3 text-lg';
      default:
        return 'px-4 py-2 text-base';
    }
  };

  return (
    <Button
      onClick={handleStartChat}
      disabled={isLoading}
      className={`${getButtonStyles()} ${getSizeStyles()} ${className} disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {isLoading ? (
        <LoadingSpinner size="sm" />
      ) : (
        <>
          <ChatBubbleLeftRightIcon className="h-4 w-4 mr-2" />
          Chat with Seller
        </>
      )}
    </Button>
  );
}

