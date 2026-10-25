'use client';

import { useEffect } from 'react';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="max-w-2xl mx-auto text-center py-20 animate-fade-in">
      <div
        aria-hidden="true"
        className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-6"
        style={{
          background: 'linear-gradient(135deg, var(--gold-light), var(--gold-dark))',
          color: '#fffdf8',
          fontSize: '2rem',
          fontWeight: 700,
          fontFamily: 'var(--font-display)',
        }}
      >
        !
      </div>
      <h1 className="font-display text-2xl font-semibold text-text mb-2">
        Something went wrong
      </h1>
      <p className="text-text-muted mb-8">
        An unexpected error occurred. Please try again.
      </p>
      <button
        onClick={() => reset()}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-gold text-[#1a1814] hover:bg-gold-dark font-medium transition-colors text-sm shadow-soft"
      >
        Try again
      </button>
    </div>
  );
}
