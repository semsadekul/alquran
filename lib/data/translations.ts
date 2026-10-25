// lib/data/translations.ts
// Multi-translation registry and fetcher for alternative Quran translations.

export interface TranslationEdition {
  id: string;
  apiId?: number;
  name: string;
  banglaName: string;
  language: 'bn' | 'en';
  isDefault?: boolean;
}

export const BANGLA_TRANSLATIONS: TranslationEdition[] = [
  {
    id: 'muhiuddin',
    name: 'Muhiuddin Khan',
    banglaName: 'মাওলানা মহিউদ্দীন খান (মূল পাঠ)',
    language: 'bn',
    isDefault: true,
  },
  {
    id: 'zakaria',
    apiId: 213,
    name: 'Dr. Abu Bakr Muhammad Zakaria',
    banglaName: 'ড. আবু বকর মুহাম্মাদ যাকারিয়া',
    language: 'bn',
  },
  {
    id: 'taisirul',
    apiId: 161,
    name: 'Taisirul Quran',
    banglaName: 'তাওহীদ পাবলিকেশন (তাইসীরুল কুরআন)',
    language: 'bn',
  },
];

export const ENGLISH_TRANSLATIONS: TranslationEdition[] = [
  {
    id: 'sahih',
    name: 'Sahih International',
    banglaName: 'সহীহ ইন্টারন্যাশনাল (মূল পাঠ)',
    language: 'en',
    isDefault: true,
  },
  {
    id: 'clearquran',
    apiId: 131,
    name: 'Dr. Mustafa Khattab (The Clear Quran)',
    banglaName: 'দ্য ক্লিয়ার কুরআন (মুস্তফা খাত্তাব)',
    language: 'en',
  },
  {
    id: 'usmani',
    apiId: 84,
    name: 'Mufti Taqi Usmani',
    banglaName: 'মুফতী তাকী উসমানী',
    language: 'en',
  },
];

const memCache = new Map<string, Record<number, string>>();

function cacheKey(apiId: number, surahNumber: number): string {
  return `alquran_trans_${apiId}_${surahNumber}`;
}

/**
 * Fetches an entire surah's alternate translation and caches it locally.
 * Returns a mapping from ayah number (1-based) to translated text.
 */
export async function fetchSurahTranslation(
  apiId: number,
  surahNumber: number,
): Promise<Record<number, string>> {
  const key = cacheKey(apiId, surahNumber);

  // 1. In-memory
  if (memCache.has(key)) {
    return memCache.get(key)!;
  }

  // 2. LocalStorage
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        const parsed = JSON.parse(stored) as Record<number, string>;
        memCache.set(key, parsed);
        return parsed;
      }
    } catch {
      /* ignore */
    }
  }

  // 3. Network fetch from Quran.com API v4
  try {
    const url = `https://api.quran.com/api/v4/quran/translations/${apiId}?chapter_number=${surahNumber}`;
    const res = await fetch(url, {
      headers: {
        Accept: 'application/json',
      },
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const data = await res.json();
    const rows = data?.translations || [];
    const mapping: Record<number, string> = {};

    rows.forEach((row: { text: string }, idx: number) => {
      // Clean HTML footnote tags if present e.g. <sup foot_note=1>1</sup>
      const clean = row.text ? row.text.replace(/<[^>]*>/g, '').trim() : '';
      mapping[idx + 1] = clean;
    });

    memCache.set(key, mapping);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(key, JSON.stringify(mapping));
      } catch {
        /* storage full */
      }
    }

    return mapping;
  } catch (err) {
    console.error(`[Translations] Failed to fetch translation ${apiId} for surah ${surahNumber}:`, err);
    return {};
  }
}
