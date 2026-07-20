export type SurahDownloadStatus =
  | 'none'
  | 'queued'
  | 'downloading'
  | 'paused'
  | 'complete'
  | 'error';

export interface SurahAudioRecord {
  key: string; // "Alafasy_128kbps:2"
  reciterId: string;
  surah: number;
  totalAyahs: number;
  downloadedAyahs: number;
  bytes: number;
  status: SurahDownloadStatus;
  updatedAt: number;
  errorMessage?: string;
}

export interface DownloadJob {
  reciterId: string;
  surah: number;
}

export interface ReciterInfo {
  id: string;
  name: string;
  bitrate: string;
}

export const RECITERS: ReciterInfo[] = [
  { id: 'Alafasy_128kbps', name: 'Mishary Alafasy', bitrate: '128 kbps' },
  { id: 'Ghamadi_40kbps', name: 'Ahmed Al-Ghamdi', bitrate: '40 kbps' },
  { id: 'Husary_128kbps', name: 'Mahmoud Khalil Al-Husary', bitrate: '128 kbps' },
];

export interface DownloadProgressEvent {
  key: string;
  reciterId: string;
  surah: number;
  downloadedAyahs: number;
  totalAyahs: number;
  bytes: number;
  status: SurahDownloadStatus;
  errorMessage?: string;
}

export interface GlobalDownloadProgress {
  totalSurahs: number;
  completedSurahs: number;
  totalAyahs: number;
  downloadedAyahs: number;
  totalBytes: number;
  isDownloading: boolean;
}
