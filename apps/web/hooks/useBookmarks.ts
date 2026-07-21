'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  getBookmarks,
  addBookmark,
  removeBookmark,
  type LegacyBookmark,
} from '@/lib/storage/indexeddb';
import type { ReaderAyah } from '@/components/quran/types';

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getBookmarks()
      .then((bms) => {
        setBookmarks(new Set(bms.map((b) => b.surah_ayah)));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const toggle = useCallback(
    async (surah: number, ayah: number, verse: ReaderAyah, surahName: string) => {
      const key = `${surah}-${ayah}`;
      const surah_ayah = `${surah}_${ayah}`;

      if (bookmarks.has(key)) {
        await removeBookmark(surah_ayah);
        setBookmarks((prev) => {
          const next = new Set(prev);
          next.delete(key);
          return next;
        });
      } else {
        const arabicPreview = verse.arabic.slice(0, 120);
        const bookmark: LegacyBookmark = {
          surah_ayah,
          surah,
          ayah,
          surahName,
          textPreview: arabicPreview,
          timestamp: Date.now(),
        };
        await addBookmark(bookmark);
        setBookmarks((prev) => new Set(prev).add(key));
      }
    },
    [bookmarks],
  );

  const has = useCallback(
    (surah: number, ayah: number) => bookmarks.has(`${surah}-${ayah}`),
    [bookmarks],
  );

  return { bookmarks, toggle, has, loading };
}
