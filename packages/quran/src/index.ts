import type { Ayah, Bookmark } from '@alquran/types';

export function createBookmarkId(surah: number, ayah: number): string {
  return `${surah}_${ayah}`;
}

export function createAyahReference(surah: number, ayah: number): string {
  return `${surah}:${ayah}`;
}

export function getBanglaPronunciationKey(params: {
  surah: number;
  ayah: number;
  absoluteVerseCount: number;
}): string {
  const { surah, ayah, absoluteVerseCount } = params;
  return ayah === 1 ? `${surah}_1` : `${absoluteVerseCount}_${ayah}`;
}

export function mapLegacyBookmark(input: {
  surah_ayah: string;
  surah: number;
  ayah: number;
  surahName: string;
  textPreview: string;
  timestamp: number;
}): Bookmark {
  return {
    id: input.surah_ayah,
    surah: input.surah,
    ayah: input.ayah,
    surahName: input.surahName,
    textPreview: input.textPreview,
    timestamp: input.timestamp
  };
}

export function normalizeAyah(record: {
  number: number;
  surah: number;
  ayah: number;
  arabic: string;
  bangla: string;
  english: string;
  transliteration: string;
  bangla_transliteration?: string;
}): Ayah {
  return {
    number: record.number,
    surah: record.surah,
    ayah: record.ayah,
    arabic: record.arabic,
    bangla: record.bangla,
    english: record.english,
    transliteration: record.transliteration,
    banglaTransliteration: record.bangla_transliteration
  };
}
