// lib/hadith-storage.ts
// Dedicated, client-safe storage helper for bookmarked Hadiths

export interface SavedHadithEntry {
  book: string;
  bookTitleBn: string;
  bookTitleEn: string;
  chapter: number;
  chapterNameBn: string;
  chapterNameEn: string;
  hadithNumber: number;
  arabic?: string;
  bangla: string;
  english?: string;
  grades?: Array<{ name: string; grade: string }>;
  addedAt: number;
}

const STORAGE_KEY = 'alquran_saved_hadiths';

export function readSavedHadiths(): SavedHadithEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SavedHadithEntry[]) : [];
  } catch {
    return [];
  }
}

export function isHadithSaved(book: string, hadithNumber: number): boolean {
  if (typeof window === 'undefined') return false;
  return readSavedHadiths().some(
    (h) => h.book.toLowerCase() === book.toLowerCase() && h.hadithNumber === hadithNumber
  );
}

export function toggleSavedHadith(entry: Omit<SavedHadithEntry, 'addedAt'>): boolean {
  if (typeof window === 'undefined') return false;
  const current = readSavedHadiths();
  const exists = current.some(
    (h) => h.book.toLowerCase() === entry.book.toLowerCase() && h.hadithNumber === entry.hadithNumber
  );
  const next = exists
    ? current.filter(
        (h) => !(h.book.toLowerCase() === entry.book.toLowerCase() && h.hadithNumber === entry.hadithNumber)
      )
    : [{ ...entry, addedAt: Date.now() }, ...current];
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event('storage'));
  } catch {
    /* non-critical */
  }
  return !exists;
}
