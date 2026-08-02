// lib/storage.ts
// Centralized, typed access to the app's localStorage state.

export interface ReadingStats {
  streakDays?: number;
  dailyGoal?: number;
  totalReads?: number;
  totalVerses?: number;
  totalSurahs?: number;
  totalMinutes?: number;
  lastReadDate?: number | null;
  activity?: Record<string, number>;
  weekData?: { date: string; verses: number }[];
  favoriteSurahs?: { number: number; name: string; count: number }[];
}

export interface RecentSurahEntry {
  surah: {
    number: number;
    name: string;
    englishName: string;
    englishNameTranslation: string;
    banglaName?: string;
    numberOfAyahs: number;
    revelationType: string;
  };
  lastRead: number;
  lastAyah?: number;
}

export interface AudioSettings {
  reciterId?: string;
  playbackRate?: number;
  repeatMode?: 'none' | 'verse' | 'range';
  repeatCount?: number;
  /** Volume 0–1 (0 when muted). */
  volume?: number;
  /** Stop playback after the current ayah instead of auto-advancing. */
  singleAyah?: boolean;
}

const STORAGE_PREFIX = 'alquran_';
const STATS_KEY = `${STORAGE_PREFIX}reading_stats`;
const RECENT_KEY = `${STORAGE_PREFIX}recent_surahs`;
const AUDIO_KEY = `${STORAGE_PREFIX}audio_settings`;
const PRESERVED_KEYS = new Set([`${STORAGE_PREFIX}theme`, `${STORAGE_PREFIX}locale`]);

export function readAudioSettings(): AudioSettings {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(AUDIO_KEY);
    return raw ? (JSON.parse(raw) as AudioSettings) : {};
  } catch {
    return {};
  }
}

export function saveAudioSettings(settings: AudioSettings): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(AUDIO_KEY, JSON.stringify(settings));
  } catch {
    /* storage full or unavailable — non-critical */
  }
}

export function readStats(): ReadingStats {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STATS_KEY);
    return raw ? (JSON.parse(raw) as ReadingStats) : {};
  } catch {
    return {};
  }
}

export function readRecentSurahs(): RecentSurahEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    return raw ? (JSON.parse(raw) as RecentSurahEntry[]) : [];
  } catch {
    return [];
  }
}

/** Prepend a surah to the "recently opened" list (deduped, capped). */
export function recordRecentSurah(entry: RecentSurahEntry, limit = 5): void {
  if (typeof window === 'undefined') return;
  const next = [
    entry,
    ...readRecentSurahs().filter((r) => r.surah.number !== entry.surah.number),
  ].slice(0, limit);
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch {
    /* storage full or unavailable — non-critical */
  }
}

export function clearAppKeys(keys: string[]): void {
  if (typeof window === 'undefined') return;
  keys.forEach((key) => localStorage.removeItem(key));
}

export function clearAppData(preservePrefs = true): void {
  if (typeof window === 'undefined') return;
  const kept: Record<string, string> = {};
  if (preservePrefs) {
    PRESERVED_KEYS.forEach((key) => {
      const value = localStorage.getItem(key);
      if (value) kept[key] = value;
    });
  }
  Object.keys(localStorage)
    .filter((key) => key.startsWith(STORAGE_PREFIX))
    .forEach((key) => localStorage.removeItem(key));
  Object.entries(kept).forEach(([key, value]) => localStorage.setItem(key, value));
}
