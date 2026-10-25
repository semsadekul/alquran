// lib/sync.ts
// Offline-first bidirectional sync engine connecting localStorage to InsForge Postgres.

import { getInsForgeClient, isInsForgeConfigured } from './insforge';
import {
  readBookmarks,
  saveBookmarks,
  readBookmarkFolders,
  saveBookmarkFolders,
  mergeBookmarks,
  mergeBookmarkFolders,
  readStats,
  saveStats,
  readRecentSurahs,
  recordRecentSurah,
  type BookmarkEntry,
  type BookmarkFolder,
  type ReadingStats,
  type RecentSurahEntry,
} from './storage';
import {
  readReviewStates,
  saveReviewStates,
  mergeReviewStates,
  type ReviewState,
} from './srs';
import { getSurahs } from './data/quran';

export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error' | 'offline';

type SyncListener = (status: SyncStatus) => void;

let currentStatus: SyncStatus = 'idle';
let lastSyncTimestamp: number | null = null;
const listeners = new Set<SyncListener>();
let debounceTimer: ReturnType<typeof setTimeout> | null = null;

export function getSyncStatus(): SyncStatus {
  return currentStatus;
}

export function getLastSyncTime(): number | null {
  return lastSyncTimestamp;
}

export function subscribeSyncStatus(listener: SyncListener): () => void {
  listeners.add(listener);
  listener(currentStatus);
  return () => {
    listeners.delete(listener);
  };
}

function setSyncStatus(status: SyncStatus): void {
  currentStatus = status;
  listeners.forEach((cb) => {
    try {
      cb(status);
    } catch (e) {
      console.error('[Sync] listener error:', e);
    }
  });
}

// ─── Database Row Types ──────────────────────────────────────────────

interface RemoteFolderRow {
  id: string;
  name: string;
  color: string | null;
  position: number;
  created_at: string;
  updated_at: string;
}

interface RemoteBookmarkRow {
  id?: string;
  surah: number;
  ayah: number;
  surah_name: string | null;
  folder_id: string | null;
  note: string | null;
  added_at: string;
  updated_at: string;
}

interface RemoteReadingStatsRow {
  total_reads: number;
  total_verses: number;
  total_surahs: number;
  total_minutes: number;
  last_read_date: number | null;
  activity: Record<string, number> | null;
  favorite_surahs: { number: number; name: string; count: number }[] | null;
  streak_days: number;
  daily_goal: number;
  updated_at: string;
}

interface RemoteRecentSurahRow {
  surah: number;
  last_read: string;
  last_ayah: number | null;
}

interface RemoteHifzProgressRow {
  surah: number;
  ayah: number;
  ease_factor: number;
  interval_days: number;
  repetitions: number;
  due_date: string | null;
  last_reviewed: string | null;
}

// ─── Cloud Pull & Push Operations ───────────────────────────────────

/**
 * Pulls remote user data from InsForge, merges it into local storage with
 * last-write-wins semantics, and returns the merged datasets.
 */
export async function pullFromCloud(token: string) {
  const client = getInsForgeClient(token);

  // 1. Folders
  const { data: folderRows, error: folderErr } = await client.database
    .from('bookmark_folders')
    .select('*');

  if (folderErr) throw folderErr;

  const remoteFolders: BookmarkFolder[] = ((folderRows as RemoteFolderRow[]) || []).map((row) => ({
    id: row.id,
    name: row.name,
    color: row.color ?? undefined,
    position: row.position ?? 0,
    createdAt: new Date(row.created_at).getTime(),
    updatedAt: new Date(row.updated_at).getTime(),
  }));

  const localFolders = readBookmarkFolders();
  const mergedFolders = mergeBookmarkFolders(localFolders, remoteFolders);
  saveBookmarkFolders(mergedFolders);

  // 2. Bookmarks
  const { data: bookmarkRows, error: bmarkErr } = await client.database
    .from('bookmarks')
    .select('*');

  if (bmarkErr) throw bmarkErr;

  const remoteBookmarks: BookmarkEntry[] = ((bookmarkRows as RemoteBookmarkRow[]) || []).map(
    (row) => ({
      surah: row.surah,
      ayah: row.ayah,
      surahName: row.surah_name ?? undefined,
      folderId: row.folder_id ?? null,
      note: row.note ?? undefined,
      addedAt: new Date(row.added_at).getTime(),
      updatedAt: new Date(row.updated_at).getTime(),
    }),
  );

  const localBookmarks = readBookmarks();
  const mergedBookmarks = mergeBookmarks(localBookmarks, remoteBookmarks);
  saveBookmarks(mergedBookmarks);

  // 3. Reading Stats
  const { data: statsData, error: statsErr } = await client.database
    .from('reading_stats')
    .select('*')
    .maybeSingle();

  if (statsErr) throw statsErr;

  const localStats = readStats();
  if (statsData) {
    const remote = statsData as RemoteReadingStatsRow;
    const mergedActivity = { ...(localStats.activity || {}) };
    if (remote.activity) {
      for (const [day, count] of Object.entries(remote.activity)) {
        mergedActivity[day] = Math.max(mergedActivity[day] || 0, count);
      }
    }

    const favMap = new Map<number, { number: number; name: string; count: number }>();
    (localStats.favoriteSurahs || []).forEach((f) => favMap.set(f.number, f));
    (remote.favorite_surahs || []).forEach((f) => {
      const cur = favMap.get(f.number);
      favMap.set(f.number, {
        number: f.number,
        name: f.name || cur?.name || '',
        count: Math.max(cur?.count || 0, f.count),
      });
    });

    const mergedStats: ReadingStats = {
      totalReads: Math.max(localStats.totalReads || 0, remote.total_reads || 0),
      totalVerses: Math.max(localStats.totalVerses || 0, remote.total_verses || 0),
      totalSurahs: Math.max(localStats.totalSurahs || 0, remote.total_surahs || 0),
      totalMinutes: Math.max(localStats.totalMinutes || 0, remote.total_minutes || 0),
      lastReadDate: Math.max(localStats.lastReadDate || 0, remote.last_read_date || 0) || null,
      streakDays: Math.max(localStats.streakDays || 0, remote.streak_days || 0),
      dailyGoal: remote.daily_goal || localStats.dailyGoal || 5,
      activity: mergedActivity,
      favoriteSurahs: [...favMap.values()].sort((a, b) => b.count - a.count).slice(0, 5),
    };
    saveStats(mergedStats);
  }

  // 4. Recent Surahs
  const { data: recentRows, error: recentErr } = await client.database
    .from('recent_surahs')
    .select('*')
    .order('last_read', { ascending: false })
    .limit(10);

  if (recentErr) throw recentErr;

  if (recentRows && recentRows.length > 0) {
    const surahDict = new Map(getSurahs().map((s) => [s.number, s]));
    const localRecents = readRecentSurahs();
    const mergedMap = new Map<number, RecentSurahEntry>();

    localRecents.forEach((r) => mergedMap.set(r.surah.number, r));
    ((recentRows as RemoteRecentSurahRow[]) || []).forEach((row) => {
      const surahMeta = surahDict.get(row.surah);
      if (!surahMeta) return;
      const remoteMs = new Date(row.last_read).getTime();
      const existing = mergedMap.get(row.surah);
      if (!existing || remoteMs >= existing.lastRead) {
        mergedMap.set(row.surah, {
          surah: {
            number: surahMeta.number,
            name: surahMeta.name,
            englishName: surahMeta.englishName,
            englishNameTranslation: surahMeta.englishNameTranslation,
            banglaName: surahMeta.banglaName,
            numberOfAyahs: surahMeta.numberOfAyahs,
            revelationType: surahMeta.revelationType,
          },
          lastRead: remoteMs,
          lastAyah: row.last_ayah ?? undefined,
        });
      }
    });

    const sortedRecents = [...mergedMap.values()]
      .sort((a, b) => b.lastRead - a.lastRead)
      .slice(0, 5);
    sortedRecents.reverse().forEach((r) => recordRecentSurah(r, 5));
  }

  // 5. Hifz SRS Spaced Repetition Progress
  const { data: hifzRows, error: hifzErr } = await client.database
    .from('hifz_ayah_progress')
    .select('*');

  if (hifzErr) throw hifzErr;

  const remoteHifz: Record<string, ReviewState> = {};
  ((hifzRows as RemoteHifzProgressRow[]) || []).forEach((row) => {
    remoteHifz[`${row.surah}:${row.ayah}`] = {
      easeFactor: row.ease_factor,
      intervalDays: row.interval_days,
      repetitions: row.repetitions,
      dueDate: row.due_date,
      lastReviewed: row.last_reviewed ? new Date(row.last_reviewed).getTime() : null,
    };
  });

  const localHifz = readReviewStates();
  const mergedHifz = mergeReviewStates(localHifz, remoteHifz);
  saveReviewStates(mergedHifz);
}

/**
 * Pushes all current local data up to InsForge tables.
 */
export async function pushToCloud(token: string) {
  const client = getInsForgeClient(token);

  // 1. Folders (must be pushed before bookmarks for foreign key reference)
  const folders = readBookmarkFolders();
  if (folders.length > 0) {
    const folderPayload = folders.map((f) => ({
      id: f.id,
      name: f.name,
      color: f.color || null,
      position: f.position,
      created_at: new Date(f.createdAt).toISOString(),
      updated_at: new Date(f.updatedAt).toISOString(),
    }));
    const { error: fErr } = await client.database
      .from('bookmark_folders')
      .upsert(folderPayload, { onConflict: 'id' });
    if (fErr) throw fErr;
  }

  // 2. Bookmarks
  const bookmarks = readBookmarks();
  if (bookmarks.length > 0) {
    const bookmarkPayload = bookmarks.map((b) => ({
      surah: b.surah,
      ayah: b.ayah,
      surah_name: b.surahName || null,
      folder_id: b.folderId || null,
      note: b.note || null,
      added_at: new Date(b.addedAt).toISOString(),
      updated_at: new Date(b.updatedAt || b.addedAt).toISOString(),
    }));
    const { error: bErr } = await client.database
      .from('bookmarks')
      .upsert(bookmarkPayload, { onConflict: 'user_id,surah,ayah' });
    if (bErr) throw bErr;
  }

  // 3. Reading Stats
  const stats = readStats();
  const statsPayload = [
    {
      total_reads: stats.totalReads || 0,
      total_verses: stats.totalVerses || 0,
      total_surahs: stats.totalSurahs || 0,
      total_minutes: stats.totalMinutes || 0,
      last_read_date: stats.lastReadDate || null,
      activity: stats.activity || {},
      favorite_surahs: stats.favoriteSurahs || [],
      streak_days: stats.streakDays || 0,
      daily_goal: stats.dailyGoal || 5,
      updated_at: new Date().toISOString(),
    },
  ];
  const { error: sErr } = await client.database
    .from('reading_stats')
    .upsert(statsPayload, { onConflict: 'user_id' });
  if (sErr) throw sErr;

  // 4. Recent Surahs
  const recents = readRecentSurahs();
  if (recents.length > 0) {
    const recentPayload = recents.map((r) => ({
      surah: r.surah.number,
      last_read: new Date(r.lastRead).toISOString(),
      last_ayah: r.lastAyah || null,
    }));
    const { error: rErr } = await client.database
      .from('recent_surahs')
      .upsert(recentPayload, { onConflict: 'user_id,surah' });
    if (rErr) throw rErr;
  }

  // 5. Hifz SRS Spaced Repetition Progress
  const hifz = readReviewStates();
  const hifzEntries = Object.entries(hifz);
  if (hifzEntries.length > 0) {
    const hifzPayload = hifzEntries.map(([key, s]) => {
      const [surah, ayah] = key.split(':').map(Number);
      return {
        surah,
        ayah,
        ease_factor: s.easeFactor,
        interval_days: s.intervalDays,
        repetitions: s.repetitions,
        due_date: s.dueDate,
        last_reviewed: s.lastReviewed ? new Date(s.lastReviewed).toISOString() : null,
      };
    });
    const { error: hErr } = await client.database
      .from('hifz_ayah_progress')
      .upsert(hifzPayload, { onConflict: 'user_id,surah,ayah' });
    if (hErr) throw hErr;
  }
}

// ─── Orchestrated Sync Cycle ────────────────────────────────────────

let activeSyncPromise: Promise<void> | null = null;

/**
 * Full bidirectional synchronization:
 * 1. Verifies network and credentials.
 * 2. Pulls remote state and merges locally (last-write-wins).
 * 3. Pushes the merged state back to InsForge so both ends are identical.
 */
export async function syncAll(getToken: () => Promise<string | null>): Promise<void> {
  if (typeof window === 'undefined') return;

  if (!navigator.onLine) {
    setSyncStatus('offline');
    return;
  }

  if (!isInsForgeConfigured()) {
    setSyncStatus('idle');
    return;
  }

  if (activeSyncPromise) {
    return activeSyncPromise;
  }

  activeSyncPromise = (async () => {
    try {
      setSyncStatus('syncing');
      const token = await getToken();

      if (!token) {
        setSyncStatus('idle');
        return;
      }

      await pullFromCloud(token);
      await pushToCloud(token);

      lastSyncTimestamp = Date.now();
      setSyncStatus('synced');
    } catch (err) {
      console.error('[Sync] Error during bidirectional sync:', err);
      setSyncStatus('error');
    } finally {
      activeSyncPromise = null;
    }
  })();

  return activeSyncPromise;
}

/**
 * Schedules a debounced push of local mutations to InsForge without blocking UI.
 */
export function triggerDebouncedPush(
  getToken: () => Promise<string | null>,
  delayMs = 2500,
): void {
  if (typeof window === 'undefined' || !navigator.onLine) return;
  if (!isInsForgeConfigured()) return;

  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }

  debounceTimer = setTimeout(async () => {
    debounceTimer = null;
    try {
      setSyncStatus('syncing');
      const token = await getToken();
      if (!token) {
        setSyncStatus('idle');
        return;
      }
      await pushToCloud(token);
      lastSyncTimestamp = Date.now();
      setSyncStatus('synced');
    } catch (err) {
      console.error('[Sync] Error during debounced push:', err);
      setSyncStatus('error');
    }
  }, delayMs);
}
