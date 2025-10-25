'use client';

import { useEffect, useState } from 'react';

/**
 * Custom hook to handle hydration warnings from browser extensions
 * This prevents warnings about extra attributes added by extensions like Grammarly
 */
export function useHydration() {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  return { isHydrated };
}

/**
 * Hook to suppress hydration warnings for specific elements
 * Use this when you know an element will have different content on server vs client
 */
export function useSuppressHydrationWarning() {
  const { isHydrated } = useHydration();
  
  return {
    suppressHydrationWarning: !isHydrated,
  };
}
