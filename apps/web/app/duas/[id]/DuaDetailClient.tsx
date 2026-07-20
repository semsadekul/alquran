'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { VerseCard } from '@/components/ui/VerseCard';
import { Play, ArrowLeft } from 'lucide-react';

interface DuaVerse {
  surah: number;
  ayah: number;
  arabic: string;
  bangla: string;
  english: string;
  transliteration: string;
}

interface DuaRef {
  surah: number;
  ayahStart: number;
  ayahEnd: number;
}

interface Dua {
  id: number;
  titleEn: string;
  titleBn: string;
  refs: DuaRef[];
  surahNameEn?: string;
  surahNameBn?: string;
  verses: DuaVerse[];
}

export function DuaDetailClient({ dua }: { dua: Dua }) {
  const [bookmarked, setBookmarked] = useState(false);

  const handleCopy = useCallback(() => {
    const text = dua.verses.map((v) => v.arabic).join('\n\n');
    navigator.clipboard.writeText(text);
  }, [dua.verses]);

  const handleShare = useCallback(async () => {
    const text = dua.verses.map((v) => `${v.arabic}\n${v.bangla}`).join('\n\n');
    if (navigator.share) {
      try { await navigator.share({ text }); } catch { /* cancelled */ }
    } else {
      navigator.clipboard.writeText(text);
    }
  }, [dua.verses]);

  const handleBookmark = useCallback(() => {
    setBookmarked((prev) => !prev);
  }, []);

  const firstRef = dua.refs[0];

  return (
    <div className="max-w-3xl mx-auto">
      <Link href="/duas" className="inline-flex items-center gap-2 text-sm text-ink-2 hover:text-accent transition-colors min-h-[44px] mb-6">
        <ArrowLeft size={16} />
        সব দু'আ
      </Link>

      <Card className="mb-6 text-center">
        <h2 className="text-xl font-bold text-ink mb-1" style={{ fontFamily: 'var(--font-bengali-ui)' }}>{dua.titleBn}</h2>
        <p className="text-sm text-ink-3 mb-3">{dua.titleEn}</p>
        <div className="flex justify-center gap-2 flex-wrap">
          {dua.refs.map((ref, i) => (
            <Badge key={i} tone="gold">
              {dua.surahNameEn || `Surah ${ref.surah}`} {ref.surah}:{ref.ayahStart}
              {ref.ayahEnd !== ref.ayahStart ? `-${ref.ayahEnd}` : ''}
            </Badge>
          ))}
        </div>
        <div className="flex justify-center gap-3 mt-4">
          {firstRef && (
            <Button variant="gold" href={`/quran/surahs/${firstRef.surah}#verse-${firstRef.ayahStart}`} className="rounded-full">
              <Play size={16} /> Play in Reader
            </Button>
          )}
          <Button variant="ghost" onClick={handleBookmark} className="rounded-full">
            {bookmarked ? '★ Bookmarked' : '☆ Bookmark'}
          </Button>
          <Button variant="ghost" onClick={handleCopy} className="rounded-full">Copy</Button>
          <Button variant="ghost" onClick={handleShare} className="rounded-full">Share</Button>
        </div>
      </Card>

      <div className="space-y-2">
        {dua.verses.map((verse) => (
          <VerseCard
            key={`${verse.surah}-${verse.ayah}`}
            verseNumber={verse.ayah}
            arabic={verse.arabic}
            bangla={verse.bangla}
            english={verse.english}
            transliteration={verse.transliteration}
            showBangla={true}
            showEnglish={true}
            showTransliteration={true}
          />
        ))}
      </div>

      {firstRef && (
        <div className="mt-8 text-center">
          <Link href={`/quran/tafsir/${firstRef.surah}/${firstRef.ayahStart}`} className="text-sm text-accent hover:underline min-h-[44px] inline-flex items-center">
            View Tafsir for this verse →
          </Link>
        </div>
      )}
    </div>
  );
}
