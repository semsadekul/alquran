'use client';

import { createContext, useContext, useState } from 'react';

interface AnnounceContextValue {
  announce: (message: string) => void;
}

const AnnounceContext = createContext<AnnounceContextValue>({
  announce: () => {},
});

export function useAnnounce(): AnnounceContextValue {
  return useContext(AnnounceContext);
}

/**
 * AnnounceProvider — wraps the app (or a subtree) and provides a centralized
 * announcement mechanism for screen readers.
 *
 * Usage:
 *   const { announce } = useAnnounce();
 *   announce(`Playing verse ${ayah}`);
 */
export function AnnounceProvider({ children }: { children: React.ReactNode }) {
  const [message, setMessage] = useState('');

  return (
    <AnnounceContext.Provider
      value={{
        announce: (msg: string) => setMessage(msg),
      }}
    >
      {children}
      {/* Screen-reader-only live region */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        role="status"
      >
        {message}
      </div>
      {/* Assertive region for time-critical updates like playback errors */}
      <div
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
        role="alert"
      />
    </AnnounceContext.Provider>
  );
}
