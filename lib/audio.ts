// lib/audio.ts
// Quran recitation streaming config.
//
// Source: cdn.islamic.network — free, HTTPS, supports HTTP Range requests
// (seeking works), covers the full corpus for every reciter below.
// URL pattern: /quran/audio/{bitrate}/{reciterId}/{globalAyahNumber}.mp3
//
// Later this module is the single seam for offline downloads: a future
// "download surah" feature can mirror the same keying (reciter + global
// ayah) into Cache Storage and have the player prefer cached blobs.

export interface Reciter {
  id: string; // CDN identifier, e.g. "ar.alafasy"
  name: string; // display name
  shortName: string; // compact label for the player
  description?: string;
}

export const RECITERS: Reciter[] = [
  {
    id: 'ar.alafasy',
    name: 'Mishary Alafasy',
    shortName: 'Alafasy',
    description: 'Smooth, melodic — the most popular reciter',
  },
  {
    id: 'ar.husary',
    name: 'Mahmoud Al-Husary',
    shortName: 'Al-Husary',
    description: 'Classic, precise tajweed — favourite for Hifz',
  },
  {
    id: 'ar.muhammadayyoub',
    name: 'Muhammad Ayyoub',
    shortName: 'M. Ayyoub',
    description: 'Deep, measured recitation',
  },
  {
    id: 'ar.shaatree',
    name: 'Abu Bakr Ash-Shaatree',
    shortName: 'Ash-Shaatree',
    description: 'Warm, unhurried style',
  },
  {
    id: 'ar.minshawi',
    name: 'Mohamed El-Minshawi',
    shortName: 'El-Minshawi',
    description: 'Traditional Egyptian murattal',
  },
];

export const DEFAULT_RECITER_ID = 'ar.alafasy';
export const AUDIO_BITRATE = 128; // kbps — good quality / size balance

/** Playback speeds offered by the player. */
export const PLAYBACK_RATES = [0.75, 1, 1.25, 1.5, 2];

export const DEFAULT_PLAYBACK_RATE = 1;

/** Build the streaming URL for a single global ayah. */
export function getAyahAudioUrl(reciterId: string, globalAyahNumber: number): string {
  return `https://cdn.islamic.network/quran/audio/${AUDIO_BITRATE}/${reciterId}/${globalAyahNumber}.mp3`;
}

export function getReciter(id: string): Reciter {
  return RECITERS.find((r) => r.id === id) ?? RECITERS[0];
}
