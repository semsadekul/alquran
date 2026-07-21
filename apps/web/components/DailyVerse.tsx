'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { Calendar, Share2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { IconButton } from '@/components/ui/IconButton';
import { cn } from '@/lib/cn';

interface DailyVerseData {
  surah: number;
  ayah: number;
  arabic: string;
  bangla: string;
  english: string;
  surahName: string;
}

/**
 * Daily Verse component - shows a different verse each day based on date.
 * Fetches verse data from a pre-built JSON file to avoid server-side imports in client components.
 */
export function DailyVerse() {
  const [verseData, setVerseData] = useState<DailyVerseData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDailyVerse() {
      try {
        const date = new Date();
        const daysSinceEpoch = Math.floor(date.getTime() / 86400000);
        const verseIndex = daysSinceEpoch % 300;

        // Fetch pre-built daily verses data
        const res = await fetch('/data/daily-verses.json');
        if (!res.ok) throw new Error('Failed to fetch daily verses');

        const verses = await res.json() as DailyVerseData[];
        setVerseData(verses[verseIndex] || verses[0]);
      } catch (error) {
        console.error('Error loading daily verse:', error);
        // Fallback verse
        setVerseData({
          surah: 20,
          ayah: 114,
          arabic: 'وَقُل رَّ بِّ زِدْنِي عِلْمًا',
          bangla: 'এবং বলুন, "হে আমার পালনকর্তা, আমার জ্ঞান বৃদ্ধি করুন।"',
          english: 'And say, "My Lord, increase me in knowledge."',
          surahName: 'Taha',
        });
      }
      setLoading(false);
    }

    loadDailyVerse();
  }, []);

  if (loading || !verseData) {
    return (
      <Card className="mb-6 border-l-4 border-l-warm">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-[var(--border)] rounded-md w-1/3"></div>
          <div className="h-8 bg-[var(--border)] rounded-md w-3/4"></div>
          <div className="h-4 bg-[var(--border)] rounded-md w-2/3"></div>
        </div>
      </Card>
    );
  }

  const handleShare = async () => {
    const text = `📖 Daily Verse\n\n${verseData.arabic}\n\n${verseData.bangla}\n\n${verseData.english}\n\n— Surah ${verseData.surah}:${verseData.ayah}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Daily Verse - Al Quran',
          text,
        });
      } catch {
        // user cancelled
      }
    } else {
      navigator.clipboard.writeText(text).catch(console.error);
    }
  };

  return (
    <Card className="mb-6 border-l-4 border-l-warm relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute inset-0 bg-gradient-to-r from-warm-subtle to-transparent opacity-50 pointer-events-none" />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-ink-3">
            <Calendar size={18} />
            <span className="font-semibold text-sm uppercase tracking-wider">
              Daily Verse
            </span>
          </div>
          <div className="flex items-center gap-1">
            <IconButton ariaLabel="Share verse" onClick={handleShare} className="w-9 h-9">
              <Share2 size={14} />
            </IconButton>
          </div>
        </div>

        <p
          dir="rtl"
          lang="ar"
          className="font-arabic text-2xl md:text-3xl text-ink leading-[2] mb-4 text-right"
        >
          {verseData.arabic}
        </p>

        <p className="text-ink-2 text-base md:text-lg leading-relaxed mb-4" style={{ fontFamily: 'var(--font-bengali-ui)' }}>
          {verseData.bangla}
        </p>

        <p className="text-ink-3 text-sm leading-relaxed mb-5">
          {verseData.english}
        </p>

        <Link
          href={`/quran/surahs/${verseData.surah}#verse-${verseData.ayah}`}
          className={cn(
            'inline-flex items-center gap-2 text-accent font-semibold text-sm min-h-[44px]',
            'hover:underline transition-colors'
          )}
        >
          <span>
            Surah {verseData.surahName}, Verse {verseData.ayah}
          </span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </Link>
      </div>
    </Card>
  );
}
