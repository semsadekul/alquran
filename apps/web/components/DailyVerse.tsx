'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Calendar } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/cn';

export function DailyVerse() {
  const [verseData, setVerseData] = useState<{surah: number, ayah: number} | null>(null);

  useEffect(() => {
    // A deterministic algorithm seeded by date to pick a verse.
    // For demo purposes, we'll select a fixed known beautiful verse,
    // but in reality this would map daysSinceEpoch to a verse mapping array.
    const date = new Date();
    const daysSinceEpoch = Math.floor(date.getTime() / 86400000);

    // Fallback static verse if no local database mapping is present in this component
    // Example: Surah Taha (20), Ayah 114: "My Lord, increase me in knowledge."
    setVerseData({
      surah: 20,
      ayah: 114
    });
  }, []);

  if (!verseData) return null;

  return (
    <Card className="mb-8 border-l-4 border-l-gold">
      <div className="flex items-center gap-2 text-ink-3 mb-6">
        <Calendar size={18} />
        <span className="font-semibold text-[0.95rem]">আজকের আয়াত</span>
      </div>
      <div>
        <p
          dir="rtl"
          lang="ar"
          className="font-arabic text-3xl text-ink leading-[2] mb-4 text-right"
        >
          وَقُل رَّبِّ زِدْنِي عِلْمًا
        </p>
        <p className="text-ink-2 text-lg leading-relaxed mb-6">
          এবং বলুন, "হে আমার পালনকর্তা, আমার জ্ঞান বৃদ্ধি করুন।"
        </p>
        <Link
          href={`/quran/surahs/${verseData.surah}#ayah-${verseData.ayah}`}
          className={cn(
            'inline-flex items-center text-accent font-semibold text-[0.95rem] min-h-[44px]',
            'hover:underline transition-colors'
          )}
        >
          সূরা ত্বোয়া-হা, আয়াত ১১৪
        </Link>
      </div>
    </Card>
  );
}
