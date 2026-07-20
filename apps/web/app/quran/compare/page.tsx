'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { PageShell } from '@/components/ui/PageShell';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';

interface VerseData {
  number: number;
  surah: number;
  surahName: string;
  numberOfAyahs: number;
  ayah: number;
  arabic: string;
  bangla: string;
  english: string;
  transliteration: string;
  banglaTransliteration?: string;
}

function CompareContent() {
  const searchParams = useSearchParams();
  const surahNum = parseInt(searchParams.get('surah') || '1', 10);
  const ayahNum = parseInt(searchParams.get('ayah') || '1', 10);

  const [verse, setVerse] = useState<VerseData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch('/search-index.json')
      .then(res => res.json())
      .then(allVerses => {
        const match = allVerses.find((v: VerseData) => v.surah === surahNum && v.ayah === ayahNum);
        setVerse(match || null);
      })
      .catch(() => setVerse(null))
      .finally(() => setLoading(false));
  }, [surahNum, ayahNum]);

  if (loading) {
    return (
      <PageShell eyebrow="Translation Comparison" title="Loading verse comparison...">
        <div className="space-y-4">
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
        </div>
      </PageShell>
    );
  }

  if (!verse) {
    return (
      <PageShell eyebrow="Translation Comparison" title="No verse selected">
        <EmptyState
          title="Select a verse to compare translations"
          hint="Browse surahs and pick a verse to see translations side by side."
          action={
            <Button href="/quran/surahs" variant="gold">
              Browse Surahs
            </Button>
          }
        />
      </PageShell>
    );
  }

  const translations = [
    { label: 'Bangla (Muhiuddin Khan)', text: verse.bangla, lang: 'bn' as const },
    { label: 'English (Saheeh International)', text: verse.english, lang: 'en' as const },
    { label: 'Transliteration', text: verse.transliteration, lang: 'en' as const },
  ];

  if (verse.banglaTransliteration) {
    translations.push({ label: 'Bangla Pronunciation', text: verse.banglaTransliteration, lang: 'bn' as const });
  }

  return (
    <PageShell
      eyebrow="Translation Comparison"
      title={`${verse.surahName} — ${surahNum}:${ayahNum}`}
    >
      <Button href={`/quran/surahs/${surahNum}`} variant="ghost" className="mb-6">
        &larr; {verse.surahName}
      </Button>

      <div className="bg-accent-subtle rounded-2xl p-6 md:p-8 text-center mb-8">
        <p dir="rtl" lang="ar" className="font-arabic text-2xl md:text-3xl text-ink leading-loose">
          {verse.arabic}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {translations.map(t => (
          <Card key={t.label} className="p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-accent mb-2">
              {t.label}
            </p>
            <p
              dir={t.lang === 'bn' ? 'ltr' : 'ltr'}
              className="text-sm text-ink-2 leading-relaxed"
              style={t.lang === 'bn' ? { fontFamily: 'var(--font-bengali-ui)' } : undefined}
            >
              {t.text}
            </p>
          </Card>
        ))}
      </div>

      <nav className="flex items-center justify-between mt-8">
        {ayahNum > 1 ? (
          <Button
            href={`/quran/compare?surah=${surahNum}&ayah=${ayahNum - 1}`}
            variant="ghost"
          >
            &larr; Previous
          </Button>
        ) : <span />}
        {ayahNum < verse.numberOfAyahs ? (
          <Button
            href={`/quran/compare?surah=${surahNum}&ayah=${ayahNum + 1}`}
            variant="ghost"
          >
            Next &rarr;
          </Button>
        ) : <span />}
      </nav>
    </PageShell>
  );
}

export default function ComparePage() {
  return (
    <Suspense
      fallback={
        <PageShell eyebrow="Translation Comparison" title="Loading...">
          <Skeleton className="h-40 rounded-xl" />
        </PageShell>
      }
    >
      <CompareContent />
    </Suspense>
  );
}
