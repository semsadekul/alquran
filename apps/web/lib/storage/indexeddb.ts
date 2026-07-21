'use client';

/**
 * Single shared IndexedDB module for the entire app.
 * DB_NAME: AlQuranOfflineDB
 * DB_VERSION: 2
 *
 * Stores:
 *   v1: surahs, verses, bookmarks, settings
 *   v2: + audioManifest (per-surah+reciter download records)
 *
 * IMPORTANT: Only ONE module should call indexedDB.open() to avoid VersionError.
 */

const DB_NAME = 'AlQuranOfflineDB';
const DB_VERSION = 3;

let dbInstance: IDBDatabase | null = null;

export function openDB(): Promise<IDBDatabase> {
  if (dbInstance) return Promise.resolve(dbInstance);

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(dbInstance);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // v1 stores
      if (!db.objectStoreNames.contains('surahs')) {
        db.createObjectStore('surahs', { keyPath: 'number' });
      }
      if (!db.objectStoreNames.contains('verses')) {
        const store = db.createObjectStore('verses', { keyPath: 'number' });
        store.createIndex('surah', 'surah', { unique: false });
      }
      if (!db.objectStoreNames.contains('bookmarks')) {
        db.createObjectStore('bookmarks', { keyPath: 'surah_ayah' });
      }
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'key' });
      }

      // v2 store: audio download manifest
      if (!db.objectStoreNames.contains('audioManifest')) {
        db.createObjectStore('audioManifest', { keyPath: 'key' });
      }

      // v3 stores: notes and highlights
      if (!db.objectStoreNames.contains('notes')) {
        db.createObjectStore('notes', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('highlights')) {
        db.createObjectStore('highlights', { keyPath: 'id' });
      }
    };
  });
}

/* ─── Generic helpers ─── */

export async function getAllFromStore<T>(storeName: string): Promise<T[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result as T[]);
    request.onerror = () => reject(request.error);
  });
}

export async function getFromStore<T>(storeName: string, key: string): Promise<T | undefined> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const request = store.get(key);
    request.onsuccess = () => resolve(request.result as T | undefined);
    request.onerror = () => reject(request.error);
  });
}

export async function writeToStore<T>(storeName: string, data: T | T[]): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    if (Array.isArray(data)) {
      data.forEach((item) => store.put(item));
    } else {
      store.put(data);
    }
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function deleteFromStore(storeName: string, key: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    store.delete(key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

/* ─── Audio manifest helpers (v2) ─── */

export async function getAudioRecord<T>(key: string): Promise<T | undefined> {
  return getFromStore<T>('audioManifest', key);
}

export async function putAudioRecord<T>(record: T): Promise<void> {
  return writeToStore<T>('audioManifest', record);
}

export async function getAllAudioRecords<T>(): Promise<T[]> {
  return getAllFromStore<T>('audioManifest');
}

export async function deleteAudioRecord(key: string): Promise<void> {
  return deleteFromStore('audioManifest', key);
}

/* ─── Legacy types (kept for compatibility) ─── */

export interface LegacyBookmark {
  surah_ayah: string;
  surah: number;
  ayah: number;
  surahName: string;
  textPreview: string;
  timestamp: number;
}

export interface LegacyReadingPosition {
  surah: number;
  ayah: number;
  surahName: string;
  timestamp: number;
}

export interface LegacySettings {
  theme: 'dark' | 'light';
  arabicFont: 'amiri' | 'scheherazade';
  fontSizeMultiplier: number;
  showArabic: boolean;
  showTransliteration: boolean;
  showBangla: boolean;
  showBanglaTransliteration: boolean;
  showEnglish: boolean;
  sidebarCollapsed: boolean;
}

/* ─── Legacy domain helpers ─── */

export async function getBookmarks(): Promise<LegacyBookmark[]> {
  return getAllFromStore<LegacyBookmark>('bookmarks');
}

export async function getLastRead(): Promise<LegacyReadingPosition | undefined> {
  const result = await getFromStore<{ key: string; value: LegacyReadingPosition }>(
    'settings',
    'last_read',
  );
  return result?.value;
}

export async function getSettings(): Promise<LegacySettings | undefined> {
  const result = await getFromStore<{ key: string; value: LegacySettings }>(
    'settings',
    'app_config',
  );
  return result?.value;
}

export async function getRecentSearches(): Promise<string[]> {
  const result = await getFromStore<{ key: string; value: string[] }>(
    'settings',
    'recent_searches',
  );
  return result?.value || [];
}

export async function getRecentSurahs(): Promise<
  Array<{ number: number; englishName: string; name: string; timestamp: number }>
> {
  const result = await getFromStore<{
    key: string;
    value: Array<{ number: number; englishName: string; name: string; timestamp: number }>;
  }>('settings', 'recent_surahs');
  return result?.value || [];
}

/* ─── Bookmark helpers ─── */

export async function addBookmark(bookmark: LegacyBookmark): Promise<void> {
  return writeToStore<LegacyBookmark>('bookmarks', bookmark);
}

export async function removeBookmark(surah_ayah: string): Promise<void> {
  return deleteFromStore('bookmarks', surah_ayah);
}

export async function isBookmarked(surah_ayah: string): Promise<boolean> {
  const bookmark = await getFromStore<LegacyBookmark>('bookmarks', surah_ayah);
  return !!bookmark;
}

/* ─── Notes helpers ─── */

export interface Note {
  id: string;
  surah_ayah: string;
  surah: number;
  ayah: number;
  text: string;
  color: 'yellow' | 'green' | 'blue' | 'pink';
  timestamp: number;
}

export async function addNote(note: Note): Promise<void> {
  return writeToStore<Note>('notes', note);
}

export async function getNotes(): Promise<Note[]> {
  return getAllFromStore<Note>('notes');
}

export async function removeNote(id: string): Promise<void> {
  return deleteFromStore('notes', id);
}

export async function getNotesForVerse(surah: number, ayah: number): Promise<Note[]> {
  const notes = await getNotes();
  return notes.filter(n => n.surah === surah && n.ayah === ayah);
}

/* ─── Highlights helpers ─── */

export interface Highlight {
  id: string;
  surah_ayah: string;
  surah: number;
  ayah: number;
  color: 'yellow' | 'green' | 'blue' | 'pink';
  timestamp: number;
}

export async function addHighlight(highlight: Highlight): Promise<void> {
  return writeToStore<Highlight>('highlights', highlight);
}

export async function getHighlights(): Promise<Highlight[]> {
  return getAllFromStore<Highlight>('highlights');
}

export async function removeHighlight(id: string): Promise<void> {
  return deleteFromStore('highlights', id);
}

export async function getHighlightsForVerse(surah: number, ayah: number): Promise<Highlight[]> {
  const highlights = await getHighlights();
  return highlights.filter(h => h.surah === surah && h.ayah === ayah);
}
