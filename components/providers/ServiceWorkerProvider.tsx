'use client';

import { useEffect } from 'react';

/**
 * Registers the offline service worker (public/sw.js).
 * Registered in production only — dev-mode caching gets in the way of iteration.
 */
export function ServiceWorkerProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production' || !('serviceWorker' in navigator)) return;

    // Only reload when a new worker takes over a page that was already
    // controlled — an upgrade, not the first install — and only once.
    const hadController = Boolean(navigator.serviceWorker.controller);
    let reloaded = false;

    const handleControllerChange = () => {
      if (!hadController || reloaded) return;
      reloaded = true;
      window.location.reload();
    };

    navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);
    navigator.serviceWorker.register('/sw.js').catch(() => {
      /* SW unavailable (private mode, unsupported) — app still works online */
    });

    return () => {
      navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
    };
  }, []);

  return <>{children}</>;
}
