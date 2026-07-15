import type { ReaderAyah } from './types';

export const RECITERS = [
  { id: 'Alafasy_128kbps', name: 'Mishary Rashid Alafasy' },
  { id: 'Ghamadi_40kbps', name: 'Saad Al-Ghamdi' },
  { id: 'Husary_128kbps', name: 'Mahmoud Khalil Al-Husary' }
];

export function formatThreeDigit(value: number): string {
  return String(value).padStart(3, '0');
}

export function getEveryAyahUrl(surah: number, ayah: number, reciterId: string = 'Alafasy_128kbps'): string {
  return `https://everyayah.com/data/${reciterId}/${formatThreeDigit(surah)}${formatThreeDigit(ayah)}.mp3`;
}

export function formatAudioTime(secs: number): string {
  if (!Number.isFinite(secs) || secs < 0) return '0:00';
  const minutes = Math.floor(secs / 60);
  const seconds = Math.floor(secs % 60);
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

export function createVerseReference(ayah: ReaderAyah): string {
  return `${ayah.surah}:${ayah.ayah}`;
}
