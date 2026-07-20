/**
 * Resolves audio playback URL: local file if downloaded, else remote.
 */

import { isNative, getFilesystem, getDirectory, ayahPath } from './platform';
import { getCompletedSurahKeys, getAudioRecord } from './audioStore';

// Remote URL pattern from everyayah.com
function getRemoteUrl(surah: number, ayah: number, reciterId: string): string {
  const s = String(surah).padStart(3, '0');
  const a = String(ayah).padStart(3, '0');
  return `https://everyayah.com/data/${reciterId}/${s}${a}.mp3`;
}

// Cache of completed surah keys per reciter
const completedCache = new Map<string, Set<string>>();

async function ensureCache(reciterId: string): Promise<Set<string>> {
  let cache = completedCache.get(reciterId);
  if (!cache) {
    cache = await getCompletedSurahKeys(reciterId);
    completedCache.set(reciterId, cache);
  }
  return cache;
}

/**
 * Invalidate the cache for a reciter (call after download/delete).
 */
export function invalidateCache(reciterId?: string): void {
  if (reciterId) {
    completedCache.delete(reciterId);
  } else {
    completedCache.clear();
  }
}

/**
 * Check if a specific ayah is available locally.
 */
async function isAyahDownloaded(
  reciterId: string,
  surah: number,
  ayah: number,
): Promise<boolean> {
  if (!(await isNative())) return false;

  // Fast path: check if the whole surah is complete
  const cache = await ensureCache(reciterId);
  const surahKey = `${reciterId}:${surah}`;
  if (cache.has(surahKey)) return true;

  // Slow path: check if this specific ayah exists (partial download)
  try {
    const FS = await getFilesystem();
    const Dir = await getDirectory();
    const path = ayahPath(reciterId, surah, ayah);
    const stat = await FS.stat({ path, directory: Dir.Data });
    return (stat.size ?? 0) > 1024; // Must be > 1KB (everyayah error pages are tiny)
  } catch {
    return false;
  }
}

/**
 * Get the playback source URL for an ayah.
 * Returns local file URI if downloaded, else remote URL.
 */
export async function getAyahSrc(
  surah: number,
  ayah: number,
  reciterId: string,
): Promise<string> {
  if (await isAyahDownloaded(reciterId, surah, ayah)) {
    try {
      const FS = await getFilesystem();
      const Dir = await getDirectory();
      const path = ayahPath(reciterId, surah, ayah);
      const { uri } = await FS.getUri({ path, directory: Dir.Data });
      // Convert file:// URI to Capacitor's localhost proxy
      const { Capacitor } = await import('@capacitor/core');
      return Capacitor.convertFileSrc(uri);
    } catch {
      // Fall through to remote URL
    }
  }
  return getRemoteUrl(surah, ayah, reciterId);
}

/**
 * Get the remote URL directly (for streaming).
 */
export { getRemoteUrl };
