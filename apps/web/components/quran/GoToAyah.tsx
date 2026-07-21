'use client';

import { useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { cn } from '@/lib/cn';
import { useAnnounce } from '@/components/ui/Announce';

interface GoToAyahProps {
  surahNumber: number;
  numberOfAyahs: number;
  className?: string;
}

export function GoToAyah({ surahNumber, numberOfAyahs, className }: GoToAyahProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [ayahNumber, setAyahNumber] = useState('');
  const [error, setError] = useState('');
  const { announce } = useAnnounce();

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const num = parseInt(ayahNumber, 10);

    if (isNaN(num) || num < 1 || num > numberOfAyahs) {
      setError(`Enter a number between 1 and ${numberOfAyahs}`);
      return;
    }

    setError('');
    announce(`Going to verse ${num}`);
    router.push(`${pathname}#verse-${num}`);
    // Scroll to the verse
    setTimeout(() => {
      const element = document.getElementById(`verse-${num}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.classList.add('verse-card-active');
        setTimeout(() => element.classList.remove('verse-card-active'), 2000);
      }
    }, 100);
  }, [ayahNumber, numberOfAyahs, pathname, router]);

  return (
    <form onSubmit={handleSubmit} className={cn('flex items-center gap-2', className)}>
      <label htmlFor="go-to-ayah" className="text-xs text-ink-3 font-medium whitespace-nowrap">
        Ayah:
      </label>
      <input
        id="go-to-ayah"
        type="number"
        min={1}
        max={numberOfAyahs}
        value={ayahNumber}
        onChange={(e) => {
          setAyahNumber(e.target.value);
          setError('');
        }}
        placeholder={`1-${numberOfAyahs}`}
        className="bg-[var(--surface)] border border-[var(--border)] text-ink-2 text-sm rounded-xl px-3 py-2 min-h-[40px] w-20 focus:outline-none focus:ring-2 focus:ring-[var(--border-focus)] transition-colors"
        aria-label={`Go to verse number (1-${numberOfAyahs})`}
      />
      <button
        type="submit"
        className="bg-accent text-white rounded-xl px-3 py-2 min-h-[40px] text-sm font-semibold hover:bg-accent-hover transition-colors"
        aria-label="Go to verse"
      >
        Go
      </button>
      {error && (
        <span className="text-xs text-red-500 ml-2">{error}</span>
      )}
    </form>
  );
}
