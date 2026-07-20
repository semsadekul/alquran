/**
 * Platform detection and Capacitor plugin wrappers.
 * All calls are guarded so the code works on web (no-ops) and native.
 */

let _isNative: boolean | null = null;

export async function isNative(): Promise<boolean> {
  if (_isNative !== null) return _isNative;
  try {
    const { Capacitor } = await import('@capacitor/core');
    _isNative = Capacitor.isNativePlatform();
  } catch {
    _isNative = false;
  }
  return _isNative;
}

export async function getFilesystem() {
  const mod = await import('@capacitor/filesystem');
  return mod.Filesystem;
}

export async function getDirectory() {
  const mod = await import('@capacitor/filesystem');
  return mod.Directory;
}

export async function getNetworkStatus(): Promise<{ connected: boolean; connectionType: string }> {
  try {
    if (!(await isNative())) {
      return {
        connected: typeof navigator !== 'undefined' ? navigator.onLine : true,
        connectionType: 'wifi',
      };
    }
    const { Network } = await import('@capacitor/network');
    const status = await Network.getStatus();
    return {
      connected: status.connected,
      connectionType: status.connectionType,
    };
  } catch {
    return { connected: true, connectionType: 'unknown' };
  }
}

export async function onNetworkChange(
  callback: (status: { connected: boolean; connectionType: string }) => void,
): Promise<() => void> {
  try {
    if (!(await isNative())) {
      const handler = () => {
        callback({ connected: navigator.onLine, connectionType: 'wifi' });
      };
      window.addEventListener('online', handler);
      window.addEventListener('offline', handler);
      return () => {
        window.removeEventListener('online', handler);
        window.removeEventListener('offline', handler);
      };
    }
    const { Network } = await import('@capacitor/network');
    const listener = await Network.addListener('networkStatusChange', (status) => {
      callback({
        connected: status.connected,
        connectionType: status.connectionType,
      });
    });
    return () => listener.remove();
  } catch {
    return () => {};
  }
}

/**
 * Build the file path for an ayah audio file.
 * Format: audio/{reciterId}/{surah3}/{surah3}{ayah3}.mp3
 */
export function ayahPath(reciterId: string, surah: number, ayah: number): string {
  const s = String(surah).padStart(3, '0');
  const a = String(ayah).padStart(3, '0');
  return `audio/${reciterId}/${s}/${s}${a}.mp3`;
}

/**
 * Build the folder path for a surah.
 */
export function surahFolderPath(reciterId: string, surah: number): string {
  const s = String(surah).padStart(3, '0');
  return `audio/${reciterId}/${s}`;
}

/**
 * Format bytes to human-readable string.
 */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}
