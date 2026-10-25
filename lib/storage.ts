// lib/storage.ts
// Centralized, typed access to the app's localStorage state.

export type GoalUnit = 'ayahs' | 'minutes' | 'pages';

export interface ReadingStats {
  streakDays?: number;
  graceShields?: number;
  lastShieldUsedDate?: string | null;
  dailyGoal?: number;
  dailyGoalUnit?: GoalUnit;
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

export const STORAGE_PREFIX = 'alquran_';
const STATS_KEY = `${STORAGE_PREFIX}reading_stats`;
const RECENT_KEY = `${STORAGE_PREFIX}recent_surahs`;
const AUDIO_KEY = `${STORAGE_PREFIX}audio_settings`;
const PRESERVED_KEYS = new Set([`${STORAGE_PREFIX}theme`, `${STORAGE_PREFIX}locale`]);

export const GOAL_REACHED_EVENT = 'alquran_goal_reached';
export const SHIELD_USED_EVENT = 'alquran_shield_used';

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

export const STATS_UPDATED_EVENT = 'alquran_stats_updated';
export const STORAGE_SYNC_EVENT = 'alquran_storage_changed';

export function notifyStorageChanged(key: string): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(STORAGE_SYNC_EVENT, { detail: { key } }));
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

export function saveStats(stats: ReadingStats): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
    window.dispatchEvent(new CustomEvent(STATS_UPDATED_EVENT, { detail: stats }));
    notifyStorageChanged(STATS_KEY);
  } catch {
    /* storage full or unavailable — non-critical */
  }
}

export function setDailyGoal(goal: number, unit: GoalUnit = 'ayahs'): void {
  if (typeof window === 'undefined') return;
  const stats = readStats();
  saveStats({
    ...stats,
    dailyGoal: Math.max(1, goal),
    dailyGoalUnit: unit,
  });
}

export function addReadingMinutes(minutes: number): void {
  if (typeof window === 'undefined' || minutes <= 0) return;
  const stats = readStats();
  saveStats({
    ...stats,
    totalMinutes: (stats.totalMinutes || 0) + minutes,
  });
}

/** Record that an ayah was read (called after hovering/lingering on the ayah). */
export function recordAyahRead(surahNumber: number, surahName?: string): void {
  if (typeof window === 'undefined') return;
  const stats = readStats();
  const now = new Date();
  const todayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  const activity = { ...(stats.activity || {}) };
  activity[todayKey] = (activity[todayKey] || 0) + 1;

  let streakDays = stats.streakDays || 1;
  let graceShields = stats.graceShields !== undefined ? stats.graceShields : 1;
  let lastShieldUsedDate = stats.lastShieldUsedDate || null;

  if (stats.lastReadDate) {
    const lastDate = new Date(stats.lastReadDate);
    const lastKey = `${lastDate.getFullYear()}-${String(lastDate.getMonth() + 1).padStart(2, '0')}-${String(lastDate.getDate()).padStart(2, '0')}`;
    if (lastKey !== todayKey) {
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayKey = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
      if (lastKey === yesterdayKey) {
        streakDays += 1;
        // Award 1 grace shield every 7 streak days, up to a maximum of 3
        if (streakDays % 7 === 0 && graceShields < 3) {
          graceShields += 1;
        }
      } else {
        // User missed at least 1 day. Check if Grace Shield can protect the streak!
        if (graceShields > 0) {
          graceShields -= 1;
          lastShieldUsedDate = todayKey;
          streakDays += 1;
          if (typeof window !== 'undefined') {
            window.dispatchEvent(
              new CustomEvent(SHIELD_USED_EVENT, {
                detail: { streakDays, remainingShields: graceShields },
              })
            );
          }
        } else {
          streakDays = 1;
        }
      }
    }
  }

  // Check if daily goal reached
  const prevTodayCount = (stats.activity || {})[todayKey] || 0;
  const goalTarget = stats.dailyGoal || 5;
  if (prevTodayCount < goalTarget && prevTodayCount + 1 >= goalTarget) {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent(GOAL_REACHED_EVENT, {
          detail: { goal: goalTarget, unit: stats.dailyGoalUnit || 'ayahs', streakDays },
        })
      );
    }
  }

  const weekData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (6 - i));
    const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    return { date: k, verses: activity[k] || 0 };
  });

  const favoriteSurahs = [...(stats.favoriteSurahs || [])];
  if (surahName) {
    const idx = favoriteSurahs.findIndex((s) => s.number === surahNumber);
    if (idx >= 0) {
      favoriteSurahs[idx] = { ...favoriteSurahs[idx], count: favoriteSurahs[idx].count + 1 };
    } else {
      favoriteSurahs.push({ number: surahNumber, name: surahName, count: 1 });
    }
    favoriteSurahs.sort((a, b) => b.count - a.count);
  }

  const updated: ReadingStats = {
    ...stats,
    totalVerses: (stats.totalVerses || 0) + 1,
    totalReads: (stats.totalReads || 0) + 1,
    streakDays,
    graceShields,
    lastShieldUsedDate,
    dailyGoal: stats.dailyGoal || 5,
    dailyGoalUnit: stats.dailyGoalUnit || 'ayahs',
    lastReadDate: Date.now(),
    activity,
    weekData,
    favoriteSurahs: favoriteSurahs.slice(0, 5),
  };

  saveStats(updated);
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
    notifyStorageChanged(RECENT_KEY);
  } catch {
    /* storage full or unavailable — non-critical */
  }
}

export interface BookmarkEntry {
  surah: number;
  ayah: number;
  surahName?: string;
  addedAt: number;
  /** Folder the ayah is filed under; null or absent means unfiled. */
  folderId?: string | null;
  note?: string;
  /** Last local change, used to resolve conflicts when syncing. */
  updatedAt?: number;
}

export interface BookmarkFolder {
  id: string;
  name: string;
  color?: string;
  position: number;
  createdAt: number;
  updatedAt: number;
}

const BOOKMARKS_KEY = `${STORAGE_PREFIX}bookmarks`;
const FOLDERS_KEY = `${STORAGE_PREFIX}bookmark_folders`;

export const FOLDER_NAME_MAX_LENGTH = 60;

function writeJson(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage full or unavailable — non-critical */
  }
}

export function readBookmarks(): BookmarkEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(BOOKMARKS_KEY);
    return raw ? (JSON.parse(raw) as BookmarkEntry[]) : [];
  } catch {
    return [];
  }
}

export function saveBookmarks(entries: BookmarkEntry[]): void {
  if (typeof window === 'undefined') return;
  writeJson(BOOKMARKS_KEY, entries);
  notifyStorageChanged(BOOKMARKS_KEY);
}

function folderNameKey(name: string): string {
  return name.trim().toLowerCase();
}

export function readBookmarkFolders(): BookmarkFolder[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(FOLDERS_KEY);
    const folders = raw ? (JSON.parse(raw) as BookmarkFolder[]) : [];
    return [...folders].sort((a, b) => a.position - b.position || a.createdAt - b.createdAt);
  } catch {
    return [];
  }
}

export function saveBookmarkFolders(folders: BookmarkFolder[]): void {
  if (typeof window === 'undefined') return;
  writeJson(FOLDERS_KEY, folders);
  notifyStorageChanged(FOLDERS_KEY);
}

function makeFolderId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `f_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Creates a folder. Returns the existing folder instead when the name is
 * already taken, mirroring the unique (user_id, name) constraint in the
 * database so a later sync push cannot collide.
 */
export function createBookmarkFolder(
  name: string,
  options: { color?: string } = {},
): BookmarkFolder | null {
  if (typeof window === 'undefined') return null;
  const trimmed = name.trim();
  if (!trimmed || trimmed.length > FOLDER_NAME_MAX_LENGTH) return null;

  const folders = readBookmarkFolders();
  const existing = folders.find((f) => folderNameKey(f.name) === folderNameKey(trimmed));
  if (existing) return existing;

  const now = Date.now();
  const folder: BookmarkFolder = {
    id: makeFolderId(),
    name: trimmed,
    color: options.color,
    position: folders.length,
    createdAt: now,
    updatedAt: now,
  };
  saveBookmarkFolders([...folders, folder]);
  return folder;
}

/** Renames or recolours a folder. Invalid or duplicate names are ignored. */
export function updateBookmarkFolder(
  id: string,
  patch: { name?: string; color?: string },
): BookmarkFolder[] {
  const folders = readBookmarkFolders();
  const target = folders.find((f) => f.id === id);
  if (!target) return folders;

  const nextName = patch.name === undefined ? target.name : patch.name.trim();
  if (patch.name !== undefined) {
    if (!nextName || nextName.length > FOLDER_NAME_MAX_LENGTH) return folders;
    const clash = folders.some(
      (f) => f.id !== id && folderNameKey(f.name) === folderNameKey(nextName),
    );
    if (clash) return folders;
  }

  const next = folders.map((f) =>
    f.id === id
      ? { ...f, name: nextName, color: patch.color === undefined ? f.color : patch.color, updatedAt: Date.now() }
      : f,
  );
  saveBookmarkFolders(next);
  return next;
}

/** Removes a folder; its bookmarks are unfiled rather than deleted. */
export function deleteBookmarkFolder(id: string): BookmarkFolder[] {
  const folders = readBookmarkFolders();
  const next = folders.filter((f) => f.id !== id);
  if (next.length === folders.length) return folders;
  saveBookmarkFolders(next);

  const now = Date.now();
  const bookmarks = readBookmarks();
  if (bookmarks.some((b) => b.folderId === id)) {
    saveBookmarks(
      bookmarks.map((b) => (b.folderId === id ? { ...b, folderId: null, updatedAt: now } : b)),
    );
  }
  return next;
}

/** Files a bookmark under a folder, or unfiles it when folderId is null. */
export function moveBookmark(surah: number, ayah: number, folderId: string | null): void {
  if (typeof window === 'undefined') return;
  const now = Date.now();
  saveBookmarks(
    readBookmarks().map((b) =>
      b.surah === surah && b.ayah === ayah ? { ...b, folderId, updatedAt: now } : b,
    ),
  );
}

/** Sets (or clears) the note on one bookmark. */
export function setBookmarkNote(surah: number, ayah: number, note: string): void {
  if (typeof window === 'undefined') return;
  const trimmed = note.trim();
  const now = Date.now();
  saveBookmarks(
    readBookmarks().map((b) =>
      b.surah === surah && b.ayah === ayah
        ? { ...b, note: trimmed || undefined, updatedAt: now }
        : b,
    ),
  );
}

export function bookmarkKey(entry: { surah: number; ayah: number }): string {
  return `${entry.surah}:${entry.ayah}`;
}

/**
 * Last-write-wins union of two bookmark sets, keyed by surah:ayah. Absence is
 * not a deletion — removing a bookmark on one device needs a tombstone before
 * a merge can drop the other device's copy.
 */
export function mergeBookmarks(local: BookmarkEntry[], remote: BookmarkEntry[]): BookmarkEntry[] {
  const merged = new Map<string, BookmarkEntry>();
  const consider = (entry: BookmarkEntry) => {
    const key = bookmarkKey(entry);
    const current = merged.get(key);
    const time = entry.updatedAt ?? entry.addedAt;
    const currentTime = current ? (current.updatedAt ?? current.addedAt) : -Infinity;
    if (!current || time >= currentTime) merged.set(key, entry);
  };
  local.forEach(consider);
  remote.forEach(consider);
  return [...merged.values()].sort((a, b) => b.addedAt - a.addedAt);
}

/** Last-write-wins union of two folder lists, keyed by folder id. */
export function mergeBookmarkFolders(
  local: BookmarkFolder[],
  remote: BookmarkFolder[],
): BookmarkFolder[] {
  const merged = new Map<string, BookmarkFolder>();
  const consider = (folder: BookmarkFolder) => {
    const current = merged.get(folder.id);
    if (!current || folder.updatedAt >= current.updatedAt) merged.set(folder.id, folder);
  };
  local.forEach(consider);
  remote.forEach(consider);
  return [...merged.values()].sort((a, b) => a.position - b.position || a.createdAt - b.createdAt);
}

/** Adds or removes a bookmark for one ayah. Returns true when it is now bookmarked. */
export function toggleBookmark(surah: number, ayah: number, surahName?: string): boolean {
  if (typeof window === 'undefined') return false;
  const current = readBookmarks();
  const exists = current.some((b) => b.surah === surah && b.ayah === ayah);
  const next = exists
    ? current.filter((b) => !(b.surah === surah && b.ayah === ayah))
    : [...current, { surah, ayah, surahName, addedAt: Date.now(), updatedAt: Date.now() }];
  try {
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(next));
    notifyStorageChanged(BOOKMARKS_KEY);
  } catch {
    /* storage full or unavailable — non-critical */
  }
  return !exists;
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
