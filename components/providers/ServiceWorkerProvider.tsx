'use client';

import { useEffect } from 'react';

/**
 * Registers the offline service worker (public/sw.js).
 * Registered in production only — dev-mode caching gets in the way of iteration.
 */
export function ServiceWorkerProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        /* SW unavailable (private mode, unsupported) — app still works online */
      });
    }
  }, []);

  return <>{children}</>;
}
