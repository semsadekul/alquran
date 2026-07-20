/**
 * Singleton download manager for Quran audio files.
 * Processes one surah at a time with concurrency 3 for ayah files.
 * Supports pause/resume/cancel/delete.
 */

import type { DownloadProgressEvent, SurahAudioRecord, SurahDownloadStatus } from './types';
import { getOrCreateRecord, updateRecordStatus, getAudioRecord } from './audioStore';
import { isNative, getFilesystem, getDirectory, ayahPath, surahFolderPath, onNetworkChange, getNetworkStatus } from './platform';
import { invalidateCache } from './audioSource';

type Listener = (event: DownloadProgressEvent) => void;

class DownloadManager {
  private listeners: Set<Listener> = new Set();
  private queue: Array<{ reciterId: string; surah: number }> = [];
  private activeSurahKey: string | null = null;
  private pausedKeys: Set<string> = new Set();
  private cancelledKeys: Set<string> = new Set();
  private isProcessing = false;
  private wifiOnly = true;
  private networkUnsub: (() => void) | null = null;

  constructor() {
    this.initNetworkListener();
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private emit(event: DownloadProgressEvent) {
    this.listeners.forEach((l) => l(event));
  }

  private async initNetworkListener() {
    this.networkUnsub = await onNetworkChange(async (status) => {
      if (!status.connected || (this.wifiOnly && status.connectionType !== 'wifi')) {
        // Auto-pause all downloading surahs
        if (this.activeSurahKey) {
          this.pausedKeys.add(this.activeSurahKey);
          await updateRecordStatus(this.activeSurahKey, { status: 'paused' });
          const record = await getAudioRecord(this.activeSurahKey);
          if (record) {
            this.emit({
              key: this.activeSurahKey,
              reciterId: record.reciterId,
              surah: record.surah,
              downloadedAyahs: record.downloadedAyahs,
              totalAyahs: record.totalAyahs,
              bytes: record.bytes,
              status: 'paused',
            });
          }
        }
      }
    });
  }

  setWifiOnly(enabled: boolean) {
    this.wifiOnly = enabled;
  }

  /**
   * Enqueue a single surah for download.
   */
  async enqueueSurah(reciterId: string, surah: number, totalAyahs: number) {
    const key = `${reciterId}:${surah}`;
    const record = await getOrCreateRecord(reciterId, surah, totalAyahs);

    if (record.status === 'complete' || record.status === 'downloading') return;
    if (this.activeSurahKey === key) return;

    this.pausedKeys.delete(key);
    this.cancelledKeys.delete(key);

    await updateRecordStatus(key, { status: 'queued' });
    this.queue.push({ reciterId, surah });
    this.emit({
      key, reciterId, surah,
      downloadedAyahs: record.downloadedAyahs,
      totalAyahs: record.totalAyahs,
      bytes: record.bytes,
      status: 'queued',
    });

    this.processQueue();
  }

  /**
   * Enqueue all 114 surahs for download.
   */
  async enqueueAll(reciterId: string, surahMeta: Array<{ number: number; numberOfAyahs: number }>) {
    for (const s of surahMeta) {
      const record = await getAudioRecord(`${reciterId}:${s.number}`);
      if (record?.status === 'complete') continue;
      await this.enqueueSurah(reciterId, s.number, s.numberOfAyahs);
    }
  }

  /**
   * Pause a downloading surah.
   */
  async pause(key: string) {
    this.pausedKeys.add(key);
    await updateRecordStatus(key, { status: 'paused' });
    const record = await getAudioRecord(key);
    if (record) {
      this.emit({
        key, reciterId: record.reciterId, surah: record.surah,
        downloadedAyahs: record.downloadedAyahs,
        totalAyahs: record.totalAyahs,
        bytes: record.bytes,
        status: 'paused',
      });
    }
  }

  /**
   * Resume a paused surah.
   */
  async resume(key: string) {
    this.pausedKeys.delete(key);
    const record = await getAudioRecord(key);
    if (!record) return;

    await updateRecordStatus(key, { status: 'queued' });
    this.queue.push({ reciterId: record.reciterId, surah: record.surah });
    this.emit({
      key, reciterId: record.reciterId, surah: record.surah,
      downloadedAyahs: record.downloadedAyahs,
      totalAyahs: record.totalAyahs,
      bytes: record.bytes,
      status: 'queued',
    });

    this.processQueue();
  }

  /**
   * Cancel a download (pause + reset to none).
   */
  async cancel(key: string) {
    this.pausedKeys.add(key);
    this.cancelledKeys.add(key);
    this.queue = this.queue.filter((j) => `${j.reciterId}:${j.surah}` !== key);
    await updateRecordStatus(key, { status: 'none', downloadedAyahs: 0 });
    invalidateCache(key.split(':')[0]);
  }

  /**
   * Delete downloaded files for a surah.
   */
  async deleteSurah(reciterId: string, surah: number) {
    const key = `${reciterId}:${surah}`;
    this.pausedKeys.add(key);
    this.cancelledKeys.add(key);

    if (await isNative()) {
      try {
        const FS = await getFilesystem();
        const Dir = await getDirectory();
        const folder = surahFolderPath(reciterId, surah);
        await FS.rmdir({ path: folder, directory: Dir.Data, recursive: true });
      } catch {
        // Folder may not exist
      }
    }

    await updateRecordStatus(key, { status: 'none', downloadedAyahs: 0, bytes: 0 });
    invalidateCache(reciterId);
    this.emit({
      key, reciterId, surah,
      downloadedAyahs: 0, totalAyahs: 0, bytes: 0,
      status: 'none',
    });
  }

  private async processQueue() {
    if (this.isProcessing) return;
    this.isProcessing = true;

    while (this.queue.length > 0) {
      const job = this.queue.shift()!;
      const key = `${job.reciterId}:${job.surah}`;

      if (this.pausedKeys.has(key) || this.cancelledKeys.has(key)) continue;

      this.activeSurahKey = key;
      await this.downloadSurah(job.reciterId, job.surah);
      this.activeSurahKey = null;
    }

    this.isProcessing = false;
  }

  private async downloadSurah(reciterId: string, surah: number) {
    const key = `${reciterId}:${surah}`;
    const record = await getAudioRecord(key);
    if (!record) return;

    // Check network
    const net = await getNetworkStatus();
    if (!net.connected || (this.wifiOnly && net.connectionType !== 'wifi')) {
      await updateRecordStatus(key, { status: 'paused', errorMessage: 'No Wi-Fi connection' });
      this.emit({
        key, reciterId, surah,
        downloadedAyahs: record.downloadedAyahs,
        totalAyahs: record.totalAyahs,
        bytes: record.bytes,
        status: 'paused',
        errorMessage: 'No Wi-Fi connection',
      });
      return;
    }

    await updateRecordStatus(key, { status: 'downloading' });

    const totalAyahs = record.totalAyahs;
    let downloaded = record.downloadedAyahs;
    let bytes = record.bytes;
    let lastPersistTime = 0;

    // Process ayahs with concurrency 3
    const CONCURRENCY = 3;
    const ayahQueue: number[] = [];
    for (let a = 1; a <= totalAyahs; a++) {
      ayahQueue.push(a);
    }

    const worker = async () => {
      while (ayahQueue.length > 0) {
        if (this.pausedKeys.has(key) || this.cancelledKeys.has(key)) return;

        const ayah = ayahQueue.shift()!;
        const success = await this.downloadAyah(reciterId, surah, ayah);

        if (this.pausedKeys.has(key) || this.cancelledKeys.has(key)) return;

        if (success) {
          downloaded++;
          // Estimate bytes (we don't have exact sizes without stat calls)
          bytes += 190 * 1024; // ~190KB average per ayah

          // Throttle persist to once per second
          const now = Date.now();
          if (now - lastPersistTime > 1000) {
            await updateRecordStatus(key, { downloadedAyahs: downloaded, bytes });
            lastPersistTime = now;
          }

          this.emit({
            key, reciterId, surah,
            downloadedAyahs: downloaded,
            totalAyahs,
            bytes,
            status: 'downloading',
          });
        } else {
          // Single ayah failed - mark surah as error
          await updateRecordStatus(key, {
            status: 'error',
            downloadedAyahs: downloaded,
            bytes,
            errorMessage: `Failed to download ayah ${ayah}`,
          });
          this.emit({
            key, reciterId, surah,
            downloadedAyahs: downloaded,
            totalAyahs,
            bytes,
            status: 'error',
            errorMessage: `Failed to download ayah ${ayah}`,
          });
          return;
        }
      }
    };

    // Start workers
    const workers = Array.from({ length: CONCURRENCY }, () => worker());
    await Promise.all(workers);

    // Check final state
    if (this.cancelledKeys.has(key)) return;

    if (this.pausedKeys.has(key)) {
      await updateRecordStatus(key, { status: 'paused', downloadedAyahs: downloaded, bytes });
    } else if (downloaded >= totalAyahs) {
      await updateRecordStatus(key, { status: 'complete', downloadedAyahs: totalAyahs, bytes });
      invalidateCache(reciterId);
      this.emit({
        key, reciterId, surah,
        downloadedAyahs: totalAyahs,
        totalAyahs,
        bytes,
        status: 'complete',
      });
    }
  }

  private async downloadAyah(reciterId: string, surah: number, ayah: number): Promise<boolean> {
    if (!(await isNative())) return false;

    const MAX_RETRIES = 3;
    const BACKOFF = [1000, 3000, 9000];

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        const FS = await getFilesystem();
        const Dir = await getDirectory();
        const path = ayahPath(reciterId, surah, ayah);

        // Skip if file already exists with valid size
        try {
          const stat = await FS.stat({ path, directory: Dir.Data });
          if ((stat.size ?? 0) > 1024) return true;
        } catch {
          // File doesn't exist, proceed with download
        }

        const s = String(surah).padStart(3, '0');
        const a = String(ayah).padStart(3, '0');
        const url = `https://everyayah.com/data/${reciterId}/${s}${a}.mp3`;

        await FS.downloadFile({
          url,
          path,
          directory: Dir.Data,
          recursive: true,
        });

        // Validate downloaded file
        try {
          const stat = await FS.stat({ path, directory: Dir.Data });
          if ((stat.size ?? 0) < 1024) {
            // Too small - likely an error page
            await FS.deleteFile({ path, directory: Dir.Data });
            continue; // Retry
          }
        } catch {
          continue;
        }

        return true;
      } catch {
        // Retry with backoff
        if (attempt < MAX_RETRIES - 1) {
          await new Promise((r) => setTimeout(r, BACKOFF[attempt]));
        }
      }
    }

    return false;
  }
}

// Singleton
let instance: DownloadManager | null = null;

export function getDownloadManager(): DownloadManager {
  if (!instance) {
    instance = new DownloadManager();
  }
  return instance;
}
