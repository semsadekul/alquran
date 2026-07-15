import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getSurahs, getSurahByNumber, getVersesBySurah } from '@/lib/data/quran';
import { QuranReaderClient } from '@/components/quran/QuranReaderClient';

export function generateStaticParams() {
  return getSurahs().map(s => ({ surahNumber: String(s.number) }));
}

export async function generateMetadata({ params }: { params: Promise<{ surahNumber: string }> }): Promise<Metadata> {
  const { surahNumber } = await params;
  const num = parseInt(surahNumber, 10);
  const surah = getSurahByNumber(num);
  if (!surah) return { title: 'Not Found' };
  return {
    title: `${surah.englishName} (${surah.englishNameTranslation}) — Surah ${num}`,
    description: `Read Surah ${surah.englishName} (${surah.englishNameTranslation}) with Arabic, Bengali, and English translations.`
  };
}

export default async function SurahReaderPage({ params }: { params: Promise<{ surahNumber: string }> }) {
  const { surahNumber } = await params;
  const num = parseInt(surahNumber, 10);
  const surah = getSurahByNumber(num);
  if (!surah) notFound();

  const verses = getVersesBySurah(num);
  const showBismillah = num !== 1 && num !== 9;

  return (
    <QuranReaderClient
      surah={surah}
      verses={verses}
      showBismillah={showBismillah}
    />
  );
}
