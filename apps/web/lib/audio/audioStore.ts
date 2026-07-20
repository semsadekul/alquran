/**
 * Audio manifest store — uses the shared IndexedDB module.
 * No independent DB connection to avoid VersionError conflicts.
 */

import type { SurahAudioRecord, SurahDownloadStatus } from './types';
import {
  getAudioRecord as dbGet,
  putAudioRecord as dbPut,
  getAllAudioRecords as dbGetAll,
  deleteAudioRecord as dbDelete,
} from '@/lib/storage/indexeddb';

export async function getAudioRecord(key: string): Promise<SurahAudioRecord | undefined> {
  return dbGet<SurahAudioRecord>(key);
}

export async function putAudioRecord(record: SurahAudioRecord): Promise<void> {
  return dbPut<SurahAudioRecord>(record);
}

export async function getAllAudioRecords(): Promise<SurahAudioRecord[]> {
  return dbGetAll<SurahAudioRecord>();
}

export async function deleteAudioRecord(key: string): Promise<void> {
  return dbDelete(key);
}

/**
 * Get or create a record for a surah+reciter combination.
 */
export async function getOrCreateRecord(
  reciterId: string,
  surah: number,
  totalAyahs: number,
): Promise<SurahAudioRecord> {
  const key = `${reciterId}:${surah}`;
  const existing = await getAudioRecord(key);
  if (existing) return existing;

  const record: SurahAudioRecord = {
    key,
    reciterId,
    surah,
    totalAyahs,
    downloadedAyahs: 0,
    bytes: 0,
    status: 'none',
    updatedAt: Date.now(),
  };
  await putAudioRecord(record);
  return record;
}

/**
 * Update a record's status and progress.
 */
export async function updateRecordStatus(
  key: string,
  updates: Partial<Pick<SurahAudioRecord, 'status' | 'downloadedAyahs' | 'bytes' | 'errorMessage'>>,
): Promise<void> {
  const existing = await getAudioRecord(key);
  if (!existing) return;
  const updated: SurahAudioRecord = {
    ...existing,
    ...updates,
    updatedAt: Date.now(),
  };
  await putAudioRecord(updated);
}

/**
 * Get all completed surah keys for a reciter (for O(1) playback lookup).
 */
export async function getCompletedSurahKeys(reciterId: string): Promise<Set<string>> {
  const records = await getAllAudioRecords();
  const completed = new Set<string>();
  for (const r of records) {
    if (r.reciterId === reciterId && r.status === 'complete') {
      completed.add(`${r.reciterId}:${r.surah}`);
    }
  }
  return completed;
}
