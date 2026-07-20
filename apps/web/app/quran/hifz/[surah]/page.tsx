import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getSurahs, getSurahByNumber, getVersesBySurah } from '@/lib/data/quran';
import { HifzClient } from '@/components/quran/HifzClient';
import { PageShell } from '@/components/ui/PageShell';
import { Button } from '@/components/ui/Button';

export function generateStaticParams() {
  return getSurahs().map(s => ({ surah: String(s.number) }));
}

export async function generateMetadata({ params }: { params: Promise<{ surah: string }> }): Promise<Metadata> {
  const { surah } = await params;
  const num = parseInt(surah, 10);
  const surahMeta = getSurahByNumber(num);
  if (!surahMeta) return { title: 'Not Found' };
  return {
    title: `Hifz: ${surahMeta.englishName} — Al Quran Ecosystem`,
    description: `Memorization mode for Surah ${surahMeta.englishName} with ayah range selection, repetition, delays, and hide/reveal study layers.`,
  };
}

export default async function HifzSurahPage({ params }: { params: Promise<{ surah: string }> }) {
  const { surah } = await params;
  const num = parseInt(surah, 10);
  const surahMeta = getSurahByNumber(num);
  if (!surahMeta) notFound();

  const surahs = getSurahs();
  const verses = getVersesBySurah(num);

  return (
    <PageShell
      eyebrow="Hifz"
      title="হিফয (Memorization)"
      lede="Loop a selected ayah range with repeat counts, delays, and hide/reveal study layers."
    >
      <Button href="/quran" variant="ghost" className="mb-6">
        &larr; Quran
      </Button>
      <HifzClient surahs={surahs} initialSurahNumber={num} initialVerses={verses} />
    </PageShell>
  );
}
