// lib/data/mushaf.ts
// Standard 604-page Madani Mushaf data structures, page mapping, and caching.

export interface MushafVerse {
  id: number;
  surahNumber: number;
  verseNumber: number;
  arabic: string;
  juz: number;
  page: number;
  hizb?: number;
  rubElHizb?: number;
}

export interface MushafPageData {
  pageNumber: number;
  juzNumber: number;
  surahNumbers: number[];
  verses: MushafVerse[];
}

/**
 * Verified starting page for each of the 114 Surahs in the 15-line Madani Mushaf (1-indexed).
 */
export const SURAH_START_PAGES: number[] = [
  1, 2, 50, 77, 106, 128, 151, 177, 187, 208, 221, 235, 249, 255, 262, 267, 282, 293, 305, 312,
  322, 332, 342, 350, 359, 367, 377, 385, 396, 404, 411, 415, 418, 428, 434, 440, 446, 453, 458, 467,
  477, 483, 489, 496, 499, 502, 507, 511, 515, 518, 520, 523, 526, 528, 531, 534, 537, 542, 545, 549,
  551, 553, 554, 556, 558, 560, 562, 564, 566, 568, 570, 572, 574, 575, 577, 578, 580, 582, 583, 585,
  586, 587, 587, 589, 590, 591, 591, 592, 593, 594, 595, 595, 596, 596, 597, 597, 598, 598, 599, 599,
  600, 600, 601, 601, 601, 602, 602, 602, 603, 603, 603, 604, 604, 604,
];

/**
 * Verified starting page for each of the 30 Juz (1-indexed).
 */
export const JUZ_START_PAGES: number[] = [
  1, 22, 42, 62, 82, 102, 121, 142, 162, 182, 201, 222, 242, 262, 282,
  302, 322, 342, 362, 382, 402, 422, 442, 462, 482, 502, 522, 542, 562, 582,
];

/** Returns the start page for a given Surah number (1-114). */
export function getSurahStartPage(surahNumber: number): number {
  if (surahNumber < 1 || surahNumber > 114) return 1;
  return SURAH_START_PAGES[surahNumber - 1];
}

/** Returns the Juz number (1-30) that a given page (1-604) belongs to. */
export function getJuzForPage(pageNumber: number): number {
  if (pageNumber < 1) return 1;
  if (pageNumber > 604) return 30;

  for (let i = JUZ_START_PAGES.length - 1; i >= 0; i--) {
    if (pageNumber >= JUZ_START_PAGES[i]) {
      return i + 1;
    }
  }
  return 1;
}

const pageMemoryCache = new Map<number, MushafPageData>();
const MUSHAF_STORAGE_PREFIX = 'alquran_mushaf_p_';

/**
 * Fetches the verses and metadata for a specific 15-line Madani Mushaf page (1 to 604).
 */
export async function fetchMushafPage(pageNumber: number): Promise<MushafPageData | null> {
  if (pageNumber < 1 || pageNumber > 604) return null;

  if (pageMemoryCache.has(pageNumber)) {
    return pageMemoryCache.get(pageNumber)!;
  }

  // Check localStorage
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(`${MUSHAF_STORAGE_PREFIX}${pageNumber}`);
      if (stored) {
        const parsed = JSON.parse(stored) as MushafPageData;
        pageMemoryCache.set(pageNumber, parsed);
        return parsed;
      }
    } catch {
      // Local storage read error
    }
  }

  try {
    const res = await fetch(
      `https://api.quran.com/api/v4/verses/by_page/${pageNumber}?words=false&fields=text_uthmani,chapter_id`,
      { mode: 'cors' },
    );

    if (res.ok) {
      const data = await res.json();
      const rawVerses = Array.isArray(data.verses) ? data.verses : [];

      const verses: MushafVerse[] = rawVerses.map((v: {
        id: number;
        chapter_id: number;
        verse_number: number;
        text_uthmani?: string;
        juz_number?: number;
        page_number?: number;
        hizb_number?: number;
        rub_el_hizb_number?: number;
      }) => ({
        id: v.id,
        surahNumber: v.chapter_id,
        verseNumber: v.verse_number,
        arabic: v.text_uthmani || '',
        juz: v.juz_number || getJuzForPage(pageNumber),
        page: v.page_number || pageNumber,
        hizb: v.hizb_number,
        rubElHizb: v.rub_el_hizb_number,
      }));

      const surahNumbers = Array.from(new Set(verses.map((v) => v.surahNumber)));
      const juzNumber = verses[0]?.juz ?? getJuzForPage(pageNumber);

      const pageData: MushafPageData = {
        pageNumber,
        juzNumber,
        surahNumbers,
        verses,
      };

      pageMemoryCache.set(pageNumber, pageData);
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(`${MUSHAF_STORAGE_PREFIX}${pageNumber}`, JSON.stringify(pageData));
        } catch {
          // LocalStorage quota may be reached
        }
      }

      return pageData;
    }
  } catch (err) {
    console.error(`[Mushaf] Failed to fetch page ${pageNumber}:`, err);
  }

  return null;
}
