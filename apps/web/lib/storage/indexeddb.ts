'use client';

const DB_NAME = 'AlQuranOfflineDB';
const DB_VERSION = 1;

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
    };
  });
}

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
      data.forEach(item => store.put(item));
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

export async function getBookmarks(): Promise<LegacyBookmark[]> {
  return getAllFromStore<LegacyBookmark>('bookmarks');
}

export async function getLastRead(): Promise<LegacyReadingPosition | undefined> {
  const result = await getFromStore<{ key: string; value: LegacyReadingPosition }>('settings', 'last_read');
  return result?.value;
}

export async function getSettings(): Promise<LegacySettings | undefined> {
  const result = await getFromStore<{ key: string; value: LegacySettings }>('settings', 'app_config');
  return result?.value;
}

export async function getRecentSearches(): Promise<string[]> {
  const result = await getFromStore<{ key: string; value: string[] }>('settings', 'recent_searches');
  return result?.value || [];
}

export async function getRecentSurahs(): Promise<Array<{ number: number; englishName: string; name: string; timestamp: number }>> {
  const result = await getFromStore<{ key: string; value: Array<{ number: number; englishName: string; name: string; timestamp: number }> }>('settings', 'recent_surahs');
  return result?.value || [];
}
