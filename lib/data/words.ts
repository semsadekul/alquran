// lib/data/words.ts
// Word-by-Word data fetching, caching, and single-word pronunciation audio for Al Quran.

export interface WordItem {
  id: number;
  position: number;
  arabic: string;
  transliteration?: string;
  translation?: string;
  audioUrl?: string;
  charType: 'word' | 'end';
  location: string;
}

const memoryCache = new Map<number, Record<number, WordItem[]>>();
const STORAGE_PREFIX = 'alquran_wbw_v1_';

let singleWordAudio: HTMLAudioElement | null = null;

/**
 * Plays a single word's pronunciation audio.
 */
export function playWordAudio(audioPath?: string): Promise<void> {
  if (typeof window === 'undefined' || !audioPath) return Promise.resolve();

  const fullUrl = audioPath.startsWith('http')
    ? audioPath
    : `https://audio.qurancdn.com/${audioPath.replace(/^\//, '')}`;

  if (!singleWordAudio) {
    singleWordAudio = new Audio();
  } else {
    singleWordAudio.pause();
    singleWordAudio.currentTime = 0;
  }

  singleWordAudio.src = fullUrl;
  return singleWordAudio.play().catch((err) => {
    console.warn('[WordAudio] playback failed:', err);
  });
}

/**
 * Fetches word-by-word tokenized verses for a surah.
 * Returns a map of ayah number -> array of WordItems.
 */
export async function getSurahWords(
  surahNumber: number,
  fallbackVerses?: { number: number; arabic: string; bangla?: string; english?: string }[],
): Promise<Record<number, WordItem[]>> {
  if (memoryCache.has(surahNumber)) {
    return memoryCache.get(surahNumber)!;
  }

  // Check localStorage cache
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(`${STORAGE_PREFIX}${surahNumber}`);
      if (stored) {
        const parsed = JSON.parse(stored) as Record<number, WordItem[]>;
        memoryCache.set(surahNumber, parsed);
        return parsed;
      }
    } catch {
      // Storage access or parse error
    }
  }

  try {
    const res = await fetch(
      `https://api.quran.com/api/v4/verses/by_chapter/${surahNumber}?words=true&word_fields=text_uthmani,location,audio_url&per_page=300`,
      { mode: 'cors' },
    );

    if (res.ok) {
      const data = await res.json();
      const result: Record<number, WordItem[]> = {};

      if (Array.isArray(data.verses)) {
        for (const v of data.verses) {
          const ayahNum = v.verse_number;
          if (!ayahNum || !Array.isArray(v.words)) continue;

          result[ayahNum] = v.words.map((w: {
            id: number;
            position: number;
            text_uthmani?: string;
            text?: string;
            audio_url?: string;
            char_type_name?: string;
            location?: string;
            translation?: { text?: string };
            transliteration?: { text?: string };
          }) => ({
            id: w.id,
            position: w.position,
            arabic: w.text_uthmani || w.text || '',
            transliteration: w.transliteration?.text,
            translation: w.translation?.text,
            audioUrl: w.audio_url,
            charType: (w.char_type_name === 'end' ? 'end' : 'word') as 'word' | 'end',
            location: w.location || `${surahNumber}:${ayahNum}:${w.position}`,
          }));
        }
      }

      // Cache result
      memoryCache.set(surahNumber, result);
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(`${STORAGE_PREFIX}${surahNumber}`, JSON.stringify(result));
        } catch {
          // LocalStorage quota might be full
        }
      }
      return result;
    }
  } catch (err) {
    console.warn('[WordByWord] Failed to fetch remote words, using fallback:', err);
  }

  // Fallback: tokenize provided verses if remote fetch failed or offline
  const fallbackResult: Record<number, WordItem[]> = {};
  if (fallbackVerses) {
    for (const v of fallbackVerses) {
      const tokens = v.arabic.trim().split(/\s+/);
      fallbackResult[v.number] = tokens.map((token, idx) => ({
        id: idx + 1,
        position: idx + 1,
        arabic: token,
        transliteration: undefined,
        translation: undefined,
        charType: 'word',
        location: `${surahNumber}:${v.number}:${idx + 1}`,
      }));
    }
  }

  return fallbackResult;
}
