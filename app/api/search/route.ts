import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { searchSurahs, getSurah } from '@/lib/data/quran';
import { normalizeArabic } from '@/lib/speech/arabic';

interface CorpusAyah {
  number: number;
  arabic: string;
  transliteration?: string;
  banglaTransliteration?: string;
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

const PHONETIC_ALIASES: Record<string, { surah: number; ayah?: number; label: string }> = {
  'ayatul kursi': { surah: 2, ayah: 255, label: 'Ayatul Kursi (Surah Al-Baqarah 2:255)' },
  'kursi': { surah: 2, ayah: 255, label: 'Ayatul Kursi (Surah Al-Baqarah 2:255)' },
  'আয়াতুল কুরসী': { surah: 2, ayah: 255, label: 'আয়াতুল কুরসী' },
  'আয়াতুল কুরসি': { surah: 2, ayah: 255, label: 'আয়াতুল কুরসী' },
  'kul huwallahu': { surah: 112, label: 'Surah Al-Ikhlas (112)' },
  'qul huwa allahu ahad': { surah: 112, label: 'Surah Al-Ikhlas (112)' },
  'ikhlas': { surah: 112, label: 'Surah Al-Ikhlas (112)' },
  'ইখলাস': { surah: 112, label: 'সূরা আল-ইখলাস' },
  'falak': { surah: 113, label: 'Surah Al-Falaq (113)' },
  'falaq': { surah: 113, label: 'Surah Al-Falaq (113)' },
  'ফালাক': { surah: 113, label: 'সূরা আল-ফালাক' },
  'nas': { surah: 114, label: 'Surah An-Nas (114)' },
  'naas': { surah: 114, label: 'Surah An-Nas (114)' },
  'নাস': { surah: 114, label: 'সূরা আন-নাস' },
  'fatihah': { surah: 1, label: 'Surah Al-Fatihah (1)' },
  'fatiha': { surah: 1, label: 'Surah Al-Fatihah (1)' },
  'ফাতিহা': { surah: 1, label: 'সূরা আল-ফাতিহা' },
  'alhamdu': { surah: 1, label: 'Surah Al-Fatihah (1)' },
  'alhamdulillah': { surah: 1, label: 'Surah Al-Fatihah (1)' },
  'আলহামদু': { surah: 1, label: 'সূরা আল-ফাতিহা' },
  'yaseen': { surah: 36, label: 'Surah Ya-Sin (36)' },
  'yasin': { surah: 36, label: 'Surah Ya-Sin (36)' },
  'ইয়াসীন': { surah: 36, label: 'সূরা ইয়াসীন' },
  'ইয়াসিন': { surah: 36, label: 'সূরা ইয়াসীন' },
  'mulk': { surah: 67, label: 'Surah Al-Mulk (67)' },
  'tabarak': { surah: 67, label: 'Surah Al-Mulk (67)' },
  'মুলক': { surah: 67, label: 'সূরা আল-মুলক' },
  'kahf': { surah: 18, label: 'Surah Al-Kahf (18)' },
  'কাহাফ': { surah: 18, label: 'সূরা আল-কাহাফ' },
  'waqiah': { surah: 56, label: 'Surah Al-Waqi\'ah (56)' },
  'waqia': { surah: 56, label: 'Surah Al-Waqi\'ah (56)' },
  'ওয়াকিয়াহ': { surah: 56, label: 'সূরা আল-ওয়াকিয়াহ' },
  'rahman': { surah: 55, label: 'Surah Ar-Rahman (55)' },
  'ar rahman': { surah: 55, label: 'Surah Ar-Rahman (55)' },
  'রহমান': { surah: 55, label: 'সূরা আর-রহমান' },
  'baqarah': { surah: 2, label: 'Surah Al-Baqarah (2)' },
  'baqara': { surah: 2, label: 'Surah Al-Baqarah (2)' },
  'বাকারা': { surah: 2, label: 'সূরা আল-বাকারা' },
  'amanar rasulu': { surah: 2, ayah: 285, label: 'Amanar Rasool (2:285-286)' },
  'amanar rasul': { surah: 2, ayah: 285, label: 'Amanar Rasool (2:285-286)' },
};

// Lazy, process-wide cache of the generated corpus (public/data/verses/*.json).
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
 * Full-text search API for the Quran web app with phonetic aliases and Arabic diacritic stripping.
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
  const normalizedQueryArabic = normalizeArabic(trimmedQuery);
  const corpus = await loadCorpus();

  // 1. Check for Phonetic & Popular Aliases (High Priority)
  const aliasMatchKey = Object.keys(PHONETIC_ALIASES).find(
    (k) => queryLower === k || queryLower.includes(k) || k.includes(queryLower)
  );

  const aliasResults: Array<{
    type: 'verse' | 'surah';
    surah: number;
    ayah?: number;
    arabic?: string;
    bangla?: string;
    english?: string;
    surahName?: string;
    score: number;
  }> = [];

  if (aliasMatchKey) {
    const alias = PHONETIC_ALIASES[aliasMatchKey];
    const surahDoc = corpus.find((s) => s.surah === alias.surah);
    if (surahDoc) {
      if (alias.ayah) {
        const ayahData = surahDoc.ayahs.find((a) => a.number === alias.ayah);
        if (ayahData) {
          aliasResults.push({
            type: 'verse',
            surah: surahDoc.surah,
            ayah: ayahData.number,
            arabic: ayahData.arabic,
            bangla: ayahData.bangla,
            english: ayahData.english,
            surahName: surahDoc.englishName,
            score: 10, // top score
          });
        }
      } else {
        const surahMeta = getSurah(alias.surah);
        if (surahMeta) {
          aliasResults.push({
            type: 'surah',
            surah: surahMeta.number,
            surahName: surahMeta.englishName,
            score: 10,
          });
        }
      }
    }
  }

  // 2. Search verses across the full corpus
  const verseResults = corpus.flatMap((surah) =>
    surah.ayahs
      .filter((ayah) => {
        // Direct or normalized Arabic match
        const matchesArabic =
          ayah.arabic.includes(trimmedQuery) ||
          (normalizedQueryArabic.length > 2 &&
            normalizeArabic(ayah.arabic).includes(normalizedQueryArabic));
        const matchesTransliteration =
          Boolean(ayah.transliteration?.toLowerCase().includes(queryLower));
        const matchesBanglaPronunciation =
          Boolean(ayah.banglaTransliteration?.toLowerCase().includes(queryLower));

        return (
          matchesArabic ||
          matchesTransliteration ||
          matchesBanglaPronunciation ||
          ayah.bangla.toLowerCase().includes(queryLower) ||
          ayah.english.toLowerCase().includes(queryLower)
        );
      })
      .map((ayah) => ({
        type: 'verse' as const,
        surah: surah.surah,
        ayah: ayah.number,
        arabic: ayah.arabic,
        transliteration: ayah.transliteration,
        banglaTransliteration: ayah.banglaTransliteration,
        bangla: ayah.bangla,
        english: ayah.english,
        surahName: surah.englishName,
        score: 2, // content match
      }))
  );

  // 3. Search surah metadata
  const surahResults = searchSurahs(trimmedQuery).map((surah) => ({
    type: 'surah' as const,
    surah: surah.number,
    number: surah.number,
    name: surah.name,
    englishName: surah.englishName,
    englishNameTranslation: surah.englishNameTranslation,
    banglaName: surah.banglaName,
    numberOfAyahs: surah.numberOfAyahs,
    revelationType: surah.revelationType,
    juzCount: surah.juzCount,
    score: 3,
  }));

  // 4. Combine, deduplicate, and sort by relevance score
  const combinedMap = new Map<string, any>();
  [...aliasResults, ...surahResults, ...verseResults].forEach((item) => {
    const key = item.type === 'surah' ? `surah_${item.surah}` : `verse_${item.surah}_${item.ayah}`;
    if (!combinedMap.has(key) || combinedMap.get(key).score < item.score) {
      combinedMap.set(key, item);
    }
  });

  const allResults = Array.from(combinedMap.values()).sort((a, b) => b.score - a.score);
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
