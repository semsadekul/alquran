'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

/**
 * NativeProvider handles Capacitor-specific behavior on Android:
 * - Status bar styling
 * - Back button handling (sheets → history → home → exit)
 * - Splash screen hide after first paint
 * - App state change hooks
 */
export function NativeProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const exitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Only run on native platform
    if (typeof window === 'undefined') return;

    async function initNative() {
      try {
        const { Capacitor } = await import('@capacitor/core');
        if (!Capacitor.isNativePlatform()) return;

        // Status bar
        try {
          const { StatusBar, Style } = await import('@capacitor/status-bar');
          await StatusBar.setStyle({ style: Style.Dark });
          await StatusBar.setBackgroundColor({ color: '#0a3622' });
        } catch {
          // Status bar plugin not available
        }

        // Splash screen
        try {
          const { SplashScreen } = await import('@capacitor/splash-screen');
          await SplashScreen.hide();
        } catch {
          // Splash plugin not available
        }

        // Back button
        try {
          const { App } = await import('@capacitor/app');
          App.addListener('backButton', ({ canGoBack }) => {
            // Check if any sheet/modal is open
            const sheets = document.querySelectorAll('[role="dialog"]');
            if (sheets.length > 0) {
              // Close the topmost sheet by dispatching Escape
              const event = new KeyboardEvent('keydown', { key: 'Escape' });
              document.dispatchEvent(event);
              return;
            }

            if (canGoBack && window.history.length > 1) {
              window.history.back();
            } else if (window.location.pathname !== '/') {
              router.push('/');
            } else {
              // Double-press to exit
              if (exitTimerRef.current) {
                // Second press within 2 seconds — exit
                App.exitApp();
              } else {
                exitTimerRef.current = setTimeout(() => {
                  exitTimerRef.current = null;
                }, 2000);
              }
            }
          });
        } catch {
          // App plugin not available
        }
      } catch {
        // Capacitor not available (web)
      }
    }

    initNative();

    return () => {
      if (exitTimerRef.current) {
        clearTimeout(exitTimerRef.current);
      }
    };
  }, [router]);

  return <>{children}</>;
}
