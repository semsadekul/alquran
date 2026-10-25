'use client';

import { createContext, useContext } from 'react';
import type { RefObject } from 'react';

export type RepeatMode = 'none' | 'verse' | 'range';

export interface VerseMeta {
  number: number;
  english?: string;
  arabic?: string;
}

export interface PlayerContextValue {
  // Session state (what's currently playing).
  surahNumber: number | null;
  surahName: string | null;
  currentIndex: number;
  total: number;
  /** The verse currently loaded in the player (for the bar's label/translation). */
  currentVerse: VerseMeta | null;
  isPlaying: boolean;
  isBuffering: boolean;
  error: string | null;
  /** Whether the bottom bar should be visible (playback session started & not dismissed). */
  open: boolean;
  singleMode: boolean;
  repeatMode: RepeatMode;
  repeatCount: number;
  verseRepeatDisplay: number;
  rangeLoopDisplay: number;
  reciterId: string;
  rate: number;
  volume: number;
  muted: boolean;
  /** The shared audio element — the bar attaches its own time listeners. */
  audioRef: RefObject<HTMLAudioElement | null>;
  /** Increments on every play request so the bar can reset its seek position. */
  playNonce: number;
  // Actions
  playFromIndex: (
    surahNumber: number,
    verses: VerseMeta[],
    index: number,
    surahName?: string
  ) => void;
  pauseAtIndex: (index: number) => void;
  toggle: () => void;
  goPrev: () => void;
  goNext: () => void;
  close: () => void;
  setReciterId: (id: string) => void;
  setRate: (r: number) => void;
  setRepeatMode: (m: RepeatMode) => void;
  setRepeatCount: (n: number) => void;
  setSingleMode: (b: boolean) => void;
  setVolume: (v: number) => void;
  setMuted: (b: boolean) => void;
  // Sleep Timer (minutes | 'end-of-surah' | null)
  sleepTimerOption: number | 'end-of-surah' | null;
  sleepTimerEndsAt: number | null;
  setSleepTimer: (option: number | 'end-of-surah' | null) => void;
}

export const PlayerContext = createContext<PlayerContextValue | null>(null);

export function usePlayer(): PlayerContextValue {
  const ctx = useContext(PlayerContext);
  if (!ctx) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return ctx;
}
