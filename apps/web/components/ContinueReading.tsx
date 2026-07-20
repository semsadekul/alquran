'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BookOpen } from 'lucide-react';
import { ReadingPosition } from '@alquran/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';

export function ContinueReading() {
  const [position, setPosition] = useState<ReadingPosition | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('alquran_last_read');
    if (saved) {
      try {
        setPosition(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse last read position');
      }
    }
  }, []);

  if (!position) {
    return (
      <EmptyState
        icon={<BookOpen size={32} />}
        title="No reading history yet"
        hint="Start reading the Quran to track your progress."
        action={
          <Button variant="primary" href="/quran/surahs/1">
            Start Reading Al-Fatiha
          </Button>
        }
        className="border border-dashed border-line rounded-2xl bg-surface"
      />
    );
  }

  return (
    <Card className="mb-6">
      <div className="flex items-center gap-2 text-ink-3 mb-4">
        <BookOpen size={20} />
        <span className="text-sm font-semibold uppercase tracking-wider">Continue Reading</span>
      </div>

      <div className="flex justify-between items-end">
        <div>
          <h3 className="text-2xl font-bold text-ink mb-1">{position.surahName}</h3>
          <p className="text-ink-2 text-[0.95rem]">Ayah {position.ayah}</p>
        </div>
        <Button
          variant="primary"
          size="sm"
          href={`/quran/surahs/${position.surah}#ayah-${position.ayah}`}
        >
          Resume
        </Button>
      </div>
    </Card>
  );
}
