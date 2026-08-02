import { promises as fs } from 'fs';
import path from 'path';
import SurahReader from './SurahReader';
import { getSurah } from '@/lib/data/quran';

export function generateStaticParams() {
  return Array.from({ length: 114 }, (_, i) => ({
    surahNumber: String(i + 1),
  }));
}

export async function generateMetadata({ params }: { params: { surahNumber: string } }) {
  const surah = getSurah(parseInt(params.surahNumber, 10));
  return {
    title: surah ? `${surah.englishName} — Al Quran` : 'Surah — Al Quran',
  };
}

interface VerseData {
  number: number;
  arabic: string;
  transliteration?: string;
  banglaTransliteration?: string;
  bangla: string;
  english: string;
}

/**
 * Reads the generated per-surah corpus (public/data/verses/{n}.json) so the
 * verse content is server-rendered — fast LCP, indexed content, no fetch
 * flash. When the files are missing (corpus not generated yet), returns null
 * and the client falls back to fetching.
 */
async function loadVerses(surahNumber: string): Promise<VerseData[] | null> {
  try {
    const raw = await fs.readFile(
      path.join(process.cwd(), 'public', 'data', 'verses', `${surahNumber}.json`),
      'utf8'
    );
    const payload = JSON.parse(raw);
    return Array.isArray(payload?.ayahs) ? (payload.ayahs as VerseData[]) : null;
  } catch {
    return null;
  }
}

export default async function SurahReaderPage({ params }: { params: { surahNumber: string } }) {
  const initialVerses = await loadVerses(params.surahNumber);
  return (
    <SurahReader
      // key remounts the reader per surah so client-side navigation between
      // surahs resets verse state cleanly.
      key={params.surahNumber}
      surahNumber={params.surahNumber}
      initialVerses={initialVerses}
    />
  );
}
