// ── Search Contracts ─────────────────────────────────────────

export type SearchMode = 'all' | 'arabic' | 'bangla' | 'english' | 'transliteration';

export type SearchResultSource = 'quran' | 'hadith' | 'book' | 'topic';

export interface SearchQuery {
  q: string;
  mode?: SearchMode;
  source?: SearchResultSource;
  limit?: number;
  page?: number;
}

export interface SearchResultItem {
  source: SearchResultSource;
  sourceId: string;
  surah?: number;
  ayah?: number;
  collection?: string;
  bookNumber?: number;
  hadithNumber?: number;
  arabic?: string;
  bangla?: string;
  english?: string;
  transliteration?: string;
  narrator?: string;
  grade?: string;
  highlight?: string;
}

export interface SearchResponse {
  results: SearchResultItem[];
  query: string;
  mode: SearchMode;
  total: number;
  page: number;
  totalPages: number;
}

// ── Normalization helpers ────────────────────────────────────

export function normalizeArabic(text: string): string {
  return text
    .replace(/[\u064B-\u065F\u0670]/g, '') // remove diacritics
    .replace(/[إأآا]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/\s+/g, ' ')
    .trim();
}

export function normalizeBangla(text: string): string {
  return text
    .replace(/\s+/g, ' ')
    .trim();
}

export function normalizeEnglish(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function highlightMatch(text: string, query: string): string {
  if (!query) return text;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return text.replace(new RegExp(`(${escaped})`, 'gi'), '<mark>$1</mark>');
}
