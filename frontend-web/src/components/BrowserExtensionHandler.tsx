'use client';

import { useEffect } from 'react';

/**
 * Component to handle browser extension attributes that cause hydration warnings
 * This component runs on the client side to clean up extension-added attributes
 */
export function BrowserExtensionHandler() {
  useEffect(() => {
    // Clean up Grammarly and other extension attributes that cause hydration warnings
    const cleanupExtensionAttributes = () => {
      const elements = document.querySelectorAll('[data-new-gr-c-s-check-loaded], [data-gr-ext-installed]');
      elements.forEach(element => {
        element.removeAttribute('data-new-gr-c-s-check-loaded');
        element.removeAttribute('data-gr-ext-installed');
      });
    };

    // Run cleanup after a short delay to ensure extensions have loaded
    const timeoutId = setTimeout(cleanupExtensionAttributes, 100);

    // Also run cleanup on DOM mutations
    const observer = new MutationObserver(cleanupExtensionAttributes);
    observer.observe(document.body, {
      attributes: true,
      subtree: true,
      attributeFilter: ['data-new-gr-c-s-check-loaded', 'data-gr-ext-installed']
    });

    return () => {
      clearTimeout(timeoutId);
      observer.disconnect();
    };
  }, []);

  return null; // This component doesn't render anything
}
