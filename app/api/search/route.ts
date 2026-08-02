import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { searchSurahs } from '@/lib/data/quran';

interface CorpusAyah {
  number: number;
  arabic: string;
  bangla: string;
  english: string;
}

interface CorpusSurah {
  surah: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  revelationType: string;
  numberOfAyahs: number;
  ayahs: CorpusAyah[];
}

// Lazy, process-wide cache of the generated corpus (public/data/verses/*.json).
// Regenerate the corpus with: node scripts/fetch-quran.mjs
// Cold first request reads ~4.8 MB from disk; the cache keeps subsequent
// requests cheap. Swap for a pre-built index (or Algolia) at scale.
let corpusCache: CorpusSurah[] | null = null;

async function loadCorpus(): Promise<CorpusSurah[]> {
  if (corpusCache) return corpusCache;
  const dir = path.join(process.cwd(), 'public', 'data', 'verses');
  try {
    const files = (await fs.readdir(dir)).filter((f) => f.endsWith('.json'));
    const docs = await Promise.all(
      files.map(async (f) =>
        JSON.parse(await fs.readFile(path.join(dir, f), 'utf8')) as CorpusSurah
      )
    );
    corpusCache = docs;
  } catch {
    corpusCache = []; // corpus not generated yet — degrade gracefully
  }
  return corpusCache;
}

/**
 * Full-text search API for the Quran web app.
 * Searches across:
 * 1. Verse content (Arabic, Bangla, English)
 * 2. Surah metadata (name, translation, Bangla name, number)
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') || '';
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '10', 10)));

  if (!q.trim()) {
    return NextResponse.json({ results: [], query: '', total: 0, page: 1, totalPages: 0 });
  }

  const trimmedQuery = q.trim();
  const queryLower = trimmedQuery.toLowerCase();
  const corpus = await loadCorpus();

  // 1. Search verses across the full corpus
  const verseResults = corpus.flatMap((surah) =>
    surah.ayahs
      .filter(
        (ayah) =>
          ayah.arabic.includes(trimmedQuery) ||
          ayah.bangla.toLowerCase().includes(queryLower) ||
          ayah.english.toLowerCase().includes(queryLower)
      )
      .map((ayah) => ({
        type: 'verse' as const,
        surah: surah.surah,
        ayah: ayah.number,
        arabic: ayah.arabic,
        bangla: ayah.bangla,
        english: ayah.english,
        surahName: surah.englishName,
        score: 2, // higher priority for direct content match
      }))
  );

  // 2. Search surah metadata
  const surahResults = searchSurahs(trimmedQuery).map((surah) => ({
    type: 'surah' as const,
    number: surah.number,
    name: surah.name,
    englishName: surah.englishName,
    englishNameTranslation: surah.englishNameTranslation,
    banglaName: surah.banglaName,
    numberOfAyahs: surah.numberOfAyahs,
    revelationType: surah.revelationType,
    juzCount: surah.juzCount,
    score: 1,
  }));

  // 3. Combine and sort by relevance score
  const allResults = [...verseResults, ...surahResults].sort((a, b) => b.score - a.score);
  const total = allResults.length;
  const totalPages = total === 0 ? 0 : Math.ceil(total / limit);
  const startIndex = (page - 1) * limit;
  const paginatedResults = allResults.slice(startIndex, startIndex + limit);

  // Search suggestions for the first page
  const suggestions =
    page === 1
      ? allResults
          .slice(0, 5)
          .map((r) => {
            if (r.type === 'surah') {
              return { text: r.englishName, type: 'surah' as const };
            }
            return null;
          })
          .filter(Boolean)
      : [];

  return NextResponse.json({
    results: paginatedResults,
    suggestions,
    query: trimmedQuery,
    total,
    page,
    totalPages,
  });
}
