import { promises as fs } from 'fs';
import path from 'path';
import SurahReader from './SurahReader';
import { getSurah } from '@/lib/data/quran';
import { breadcrumbJsonLd, buildSurahMetadata } from '@/lib/seo';

export function generateStaticParams() {
  return Array.from({ length: 114 }, (_, i) => ({
    surahNumber: String(i + 1),
  }));
}

export async function generateMetadata({ params }: { params: { surahNumber: string } }) {
  const surah = getSurah(parseInt(params.surahNumber, 10));
  if (!surah) return { title: 'Surah — Al Quran' };
  return buildSurahMetadata(surah);
}

interface VerseData {
  number: number;
  arabic: string;
  transliteration?: string;
  banglaTransliteration?: string;
  bangla: string;
  english: string;
}

interface CorpusPayload {
  ayahs?: VerseData[];
}

async function readCorpus(surahNumber: string): Promise<CorpusPayload | null> {
  try {
    const raw = await fs.readFile(
      path.join(process.cwd(), 'public', 'data', 'verses', `${surahNumber}.json`),
      'utf8'
    );
    return JSON.parse(raw) as CorpusPayload;
  } catch {
    return null;
  }
}

/**
 * Reads the generated per-surah corpus (public/data/verses/{n}.json) so the
 * verse content is server-rendered — fast LCP, indexed content, no fetch
 * flash. Returns null when the file is missing (corpus not generated yet) and
 * the client then fetches it, showing an explicit error if that fails too.
 */
async function loadVerses(surahNumber: string): Promise<VerseData[] | null> {
  const payload = await readCorpus(surahNumber);
  return Array.isArray(payload?.ayahs) ? payload.ayahs : null;
}

/**
 * The Bismillah is Quran text, so it is never typed into the source. It is
 * verse 1 of Al-Fatiha in the verified corpus; every surah except At-Tawbah
 * opens with it.
 */
async function loadBismillah(): Promise<string | null> {
  const payload = await readCorpus('1');
  const first = payload?.ayahs?.[0]?.arabic;
  return typeof first === 'string' && first.length > 0 ? first : null;
}

export default async function SurahReaderPage({ params }: { params: { surahNumber: string } }) {
  const surahNumber = parseInt(params.surahNumber, 10);
  // Only two surahs must never show the standalone banner: Al-Fatiha, where
  // the Bismillah is ayah 1, and At-Tawbah, which does not open with it.
  const needsBismillah = surahNumber !== 1 && surahNumber !== 9;
  const [initialVerses, bismillah] = await Promise.all([
    loadVerses(params.surahNumber),
    needsBismillah ? loadBismillah() : Promise.resolve(null),
  ]);
  const surah = getSurah(surahNumber);
  const breadcrumbs = surah
    ? breadcrumbJsonLd([
        { name: 'Surahs', path: '/quran/library' },
        { name: surah.englishName, path: `/quran/surahs/${surah.number}` },
      ])
    : null;
  return (
    <>
      {breadcrumbs && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
        />
      )}
      <SurahReader
        // key remounts the reader per surah so client-side navigation between
        // surahs resets verse state cleanly.
        key={params.surahNumber}
        surahNumber={params.surahNumber}
        initialVerses={initialVerses}
        bismillah={bismillah}
      />
    </>
  );
}
