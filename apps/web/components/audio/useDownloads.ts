'use client';

import { useSyncExternalStore, useCallback, useEffect, useState } from 'react';
import { getDownloadManager } from '@/lib/audio/downloadManager';
import { getAllAudioRecords } from '@/lib/audio/audioStore';
import type { DownloadProgressEvent, SurahAudioRecord } from '@/lib/audio/types';

/**
 * React hook that subscribes to download progress events.
 * Returns the full manifest of audio records + the download manager API.
 */
export function useDownloads() {
  const manager = getDownloadManager();
  const [records, setRecords] = useState<SurahAudioRecord[]>([]);
  const [lastEvent, setLastEvent] = useState<DownloadProgressEvent | null>(null);

  // Load initial records
  useEffect(() => {
    getAllAudioRecords().then(setRecords);
  }, []);

  // Subscribe to progress events
  useEffect(() => {
    const unsub = manager.subscribe((event) => {
      setLastEvent(event);
      // Update the record in our local state
      setRecords((prev) => {
        const idx = prev.findIndex((r) => r.key === event.key);
        const updated: SurahAudioRecord = {
          key: event.key,
          reciterId: event.reciterId,
          surah: event.surah,
          totalAyahs: event.totalAyahs,
          downloadedAyahs: event.downloadedAyahs,
          bytes: event.bytes,
          status: event.status,
          updatedAt: Date.now(),
          errorMessage: event.errorMessage,
        };
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = updated;
          return next;
        }
        return [...prev, updated];
      });
    });
    return unsub;
  }, [manager]);

  const getRecord = useCallback(
    (reciterId: string, surah: number) => {
      return records.find((r) => r.reciterId === reciterId && r.surah === surah);
    },
    [records],
  );

  const completedCount = records.filter((r) => r.status === 'complete').length;
  const totalDownloadedBytes = records
    .filter((r) => r.status === 'complete')
    .reduce((sum, r) => sum + r.bytes, 0);

  return {
    records,
    lastEvent,
    getRecord,
    completedCount,
    totalDownloadedBytes,
    manager,
  };
}
