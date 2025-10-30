'use client';

import { ReactNode } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { SocketProvider } from '@/contexts/SocketContext';
import { FavoritesProvider } from '@/contexts/FavoritesContext';
import { SubscriptionProvider } from '@/contexts/SubscriptionContext';
import { ErrorBoundary } from '@/components/ErrorBoundary';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <SocketProvider>
          <FavoritesProvider>
            <SubscriptionProvider>
              {children}
            </SubscriptionProvider>
          </FavoritesProvider>
        </SocketProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}