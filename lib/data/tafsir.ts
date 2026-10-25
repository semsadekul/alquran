// lib/data/tafsir.ts
// Authentic scholarly Tafsir provider with local offline caching.

export interface TafsirSource {
  id: number;
  name: string;
  banglaName: string;
  authorName: string;
  language: 'bn' | 'en';
}

export const TAFSIR_SOURCES: TafsirSource[] = [
  {
    id: 166,
    name: 'Tafsir Abu Bakr Zakaria',
    banglaName: 'তাফসীর ড. আবু বকর মুহাম্মাদ যাকারিয়া',
    authorName: 'King Fahd Quran Printing Complex',
    language: 'bn',
  },
  {
    id: 165,
    name: 'Tafsir Ahsanul Bayaan',
    banglaName: 'তাফসীর আহসানুল বায়ান',
    authorName: 'Bayaan Foundation',
    language: 'bn',
  },
  {
    id: 164,
    name: 'Tafseer Ibn Kathir',
    banglaName: 'তাফসীর ইবনে কাসীর (তাওহীদ পাবলিকেশন)',
    authorName: 'Tawheed Publication',
    language: 'bn',
  },
  {
    id: 169,
    name: 'Tafsir Ibn Kathir (Abridged)',
    banglaName: 'তাফসীর ইবনে কাসীর (ইংরেজি)',
    authorName: 'Hafiz Ibn Kathir',
    language: 'en',
  },
  {
    id: 168,
    name: "Ma'arif al-Qur'an",
    banglaName: 'মাআরিফুল কুরআন (ইংরেজি)',
    authorName: 'Mufti Muhammad Shafi',
    language: 'en',
  },
];

export const DEFAULT_BN_TAFSIR_ID = 166;
export const DEFAULT_EN_TAFSIR_ID = 169;

const memCache = new Map<string, string>();

function cacheKey(tafsirId: number, surah: number, ayah: number): string {
  return `alquran_tafsir_${tafsirId}_${surah}_${ayah}`;
}

export function getTafsirSource(id: number): TafsirSource | undefined {
  return TAFSIR_SOURCES.find((t) => t.id === id);
}

/**
 * Fetches scholarly tafsir for a specific ayah.
 * First checks in-memory cache, then localStorage, and falls back to Quran.com API v4.
 */
export async function fetchTafsir(
  tafsirId: number,
  surah: number,
  ayah: number,
): Promise<{ text: string; error?: string }> {
  const key = cacheKey(tafsirId, surah, ayah);

  // 1. In-memory cache
  if (memCache.has(key)) {
    return { text: memCache.get(key)! };
  }

  // 2. LocalStorage cache
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        memCache.set(key, stored);
        return { text: stored };
      }
    } catch {
      /* storage unavailable — continue */
    }
  }

  // 3. Network fetch
  try {
    const url = `https://api.quran.com/api/v4/tafsirs/${tafsirId}/by_ayah/${surah}:${ayah}`;
    const res = await fetch(url, {
      headers: {
        Accept: 'application/json',
      },
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const data = await res.json();
    const rawText = data?.tafsir?.text;

    if (!rawText) {
      return { text: '', error: 'No tafsir available for this ayah.' };
    }

    // Cache in memory and localStorage
    memCache.set(key, rawText);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(key, rawText);
      } catch {
        /* storage full — non critical */
      }
    }

    return { text: rawText };
  } catch (err) {
    console.error(`[Tafsir] Failed to fetch tafsir ${tafsirId} for ${surah}:${ayah}:`, err);
    return {
      text: '',
      error: 'Unable to load tafsir text. Please check your internet connection and try again.',
    };
  }
}
