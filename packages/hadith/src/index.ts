// ── Hadith Domain Types ──────────────────────────────────────

export interface HadithCollection {
  id: string;
  slug: string;
  nameArabic: string;
  nameEnglish: string;
  nameBangla?: string;
  description?: string;
  totalHadith?: number;
}

export interface HadithBook {
  id: string;
  collectionId: string;
  number: number;
  nameArabic: string;
  nameEnglish: string;
  nameBangla?: string;
  totalHadith?: number;
}

export interface HadithChapter {
  id: string;
  bookId: string;
  number: number;
  nameArabic: string;
  nameEnglish: string;
  nameBangla?: string;
}

export interface HadithEntry {
  id: string;
  collectionId: string;
  bookId: string;
  chapterId?: string;
  numberInBook: number;
  arabic: string;
  bangla?: string;
  english?: string;
  narrator?: string;
  grade?: string;
  gradeSource?: string;
  references?: Record<string, string>;
}

export interface HadithGrade {
  grade: string;
  source?: string;
}

// ── Well-known collections ───────────────────────────────────

export const HADITH_COLLECTIONS: HadithCollection[] = [
  {
    id: 'bukhari',
    slug: 'bukhari',
    nameArabic: 'صحيح البخاري',
    nameEnglish: 'Sahih al-Bukhari',
    nameBangla: 'সহীহ আল-বুখারী',
    description: 'The most authentic collection of Hadith, compiled by Imam Bukhari.',
    totalHadith: 7563
  },
  {
    id: 'muslim',
    slug: 'muslim',
    nameArabic: 'صحيح مسلم',
    nameEnglish: 'Sahih Muslim',
    nameBangla: 'সহীহ মুসলিম',
    description: 'The second most authentic collection, compiled by Imam Muslim.',
    totalHadith: 7500
  },
  {
    id: 'abu-dawud',
    slug: 'abu-dawud',
    nameArabic: 'سنن أبي داود',
    nameEnglish: 'Sunan Abu Dawud',
    nameBangla: 'সুনান আবু দাউদ',
    description: 'Focused on legal hadith, compiled by Abu Dawud.',
    totalHadith: 5274
  },
  {
    id: 'tirmidhi',
    slug: 'tirmidhi',
    nameArabic: 'جامع الترمذي',
    nameEnglish: 'Jami at-Tirmidhi',
    nameBangla: 'জামে আত-তিরমিযী',
    description: 'Known for grading hadith, compiled by at-Tirmidhi.',
    totalHadith: 3956
  },
  {
    id: 'nasai',
    slug: 'nasai',
    nameArabic: 'سنن النسائي',
    nameEnglish: 'Sunan an-Nasai',
    nameBangla: 'সুনান আন-নাসায়ী',
    description: 'Collection focusing on rituals and worship, compiled by an-Nasai.',
    totalHadith: 5761
  },
  {
    id: 'ibn-majah',
    slug: 'ibn-majah',
    nameArabic: 'سنن ابن ماجه',
    nameEnglish: 'Sunan Ibn Majah',
    nameBangla: 'সুনান ইবনে মাজাহ',
    description: 'The sixth major collection, compiled by Ibn Majah.',
    totalHadith: 4341
  }
];

// ── Helpers ──────────────────────────────────────────────────

export function getCollectionBySlug(slug: string): HadithCollection | undefined {
  return HADITH_COLLECTIONS.find(c => c.slug === slug);
}

export function formatHadithReference(collection: string, book: number, number: number): string {
  return `${collection}:${book}:${number}`;
}

export function getGradeColor(grade?: string): string {
  if (!grade) return '#8d9aa2';
  const lower = grade.toLowerCase();
  if (lower.includes('sahih') || lower.includes('authentic')) return '#1f8a5b';
  if (lower.includes('hasan') || lower.includes('good')) return '#c89a2b';
  if (lower.includes('daif') || lower.includes('weak')) return '#c64f4f';
  return '#8d9aa2';
}
