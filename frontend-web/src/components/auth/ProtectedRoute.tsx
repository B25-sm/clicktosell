'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireEmailVerification?: boolean;
  requirePhoneVerification?: boolean;
  redirectTo?: string;
}

export function ProtectedRoute({
  children,
  requireAuth = true,
  requireEmailVerification = false,
  requirePhoneVerification = false,
  redirectTo = '/auth/login'
}: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (requireAuth && !isAuthenticated) {
      router.push(redirectTo);
      return;
    }

    if (isAuthenticated && user) {
      if (requireEmailVerification && !user.isEmailVerified) {
        router.push('/auth/verify-email');
        return;
      }

      if (requirePhoneVerification && !user.isPhoneVerified) {
        router.push('/auth/verify-phone');
        return;
      }
    }
  }, [isAuthenticated, isLoading, user, requireAuth, requireEmailVerification, requirePhoneVerification, redirectTo, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (requireAuth && !isAuthenticated) {
    return null;
  }

  if (isAuthenticated && user) {
    if (requireEmailVerification && !user.isEmailVerified) {
      return null;
    }

    if (requirePhoneVerification && !user.isPhoneVerified) {
      return null;
    }
  }

  return <>{children}</>;
}

