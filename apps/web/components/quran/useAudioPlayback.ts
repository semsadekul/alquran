'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getEveryAyahUrl } from './audio-utils';
import type { ReaderAyah, ReaderSurah } from './types';

export interface AudioPlaybackState {
  mode: 'reader' | 'hifz' | null;
  isPlaying: boolean;
  playlist: ReaderAyah[];
  currentIndex: number;
  currentTime: number;
  duration: number;
  volume: number;
  activeAyahKey: string | null;
  errorMessage: string | null;
  reciterId: string;
  playbackRate: number;
}

export interface ReaderPlaybackApi {
  state: AudioPlaybackState;
  currentAyah: ReaderAyah | null;
  playAyah: (ayah: ReaderAyah, playlist: ReaderAyah[]) => Promise<void>;
  playSurah: (playlist: ReaderAyah[], startAyah?: number | null) => Promise<void>;
  playCurrentSurahFromStart: (playlist: ReaderAyah[]) => Promise<void>;
  playNext: () => void;
  playPrev: () => void;
  togglePlayPause: () => Promise<void>;
  stop: () => void;
  seek: (percentage: number) => void;
  setVolume: (value: number) => void;
  setReciter: (id: string) => void;
  setPlaybackRate: (rate: number) => void;
  stopForModeSwitch: (nextMode: 'reader' | 'hifz') => void;
}

const DEFAULT_VOLUME = 0.8;

export function useAudioPlayback(currentSurah: ReaderSurah | null): ReaderPlaybackApi {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isMountedRef = useRef(true);

  const [state, setState] = useState<AudioPlaybackState>({
    mode: null,
    isPlaying: false,
    playlist: [],
    currentIndex: -1,
    currentTime: 0,
    duration: 0,
    volume: DEFAULT_VOLUME,
    activeAyahKey: null,
    errorMessage: null,
    reciterId: 'Alafasy_128kbps',
    playbackRate: 1.0,
  });

  const currentAyah = useMemo(() => {
    if (state.currentIndex < 0) return null;
    return state.playlist[state.currentIndex] ?? null;
  }, [state.currentIndex, state.playlist]);

  // Create the Audio element once; track mounted state for async safety.
  useEffect(() => {
    isMountedRef.current = true;
    const audio = new Audio();
    audio.volume = DEFAULT_VOLUME;
    audioRef.current = audio;

    const handleEnded = () => {
      if (!isMountedRef.current) return;
      setState(prev => {
        if (prev.currentIndex + 1 < prev.playlist.length) {
          return { ...prev, currentIndex: prev.currentIndex + 1, currentTime: 0, duration: 0 };
        }
        return {
          ...prev,
          mode: null,
          isPlaying: false,
          playlist: [],
          currentIndex: -1,
          currentTime: 0,
          duration: 0,
          activeAyahKey: null,
        };
      });
    };

    const handleTimeUpdate = () => {
      if (!isMountedRef.current) return;
      setState(prev => ({ ...prev, currentTime: audio.currentTime, duration: audio.duration || 0 }));
    };

    const handleLoadedMetadata = () => {
      if (!isMountedRef.current) return;
      setState(prev => ({ ...prev, duration: audio.duration || 0 }));
    };

    const handleError = () => {
      if (!isMountedRef.current) return;
      setState(prev => ({
        ...prev,
        mode: null,
        isPlaying: false,
        playlist: [],
        currentIndex: -1,
        currentTime: 0,
        duration: 0,
        activeAyahKey: null,
        errorMessage: 'Recitation streaming requires an internet connection.',
      }));
      try {
        audio.pause();
        audio.removeAttribute('src');
        audio.load();
      } catch {
        // noop
      }
    };

    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('error', handleError);

    return () => {
      isMountedRef.current = false;
      audio.pause();
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('error', handleError);
      audioRef.current = null;
    };
  }, []);

  // Load and play whenever currentAyah changes.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentAyah) return;

    const nextUrl = getEveryAyahUrl(currentAyah.surah, currentAyah.ayah, state.reciterId);
    if (audio.src === nextUrl) return;

    audio.src = nextUrl;
    audio.playbackRate = state.playbackRate;
    // Setting `src` auto-triggers a load; do NOT call audio.load() here —
    // it aborts the pending play() and causes an AbortError.

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          if (!isMountedRef.current) return;
          setState(prev => ({
            ...prev,
            isPlaying: true,
            activeAyahKey: `${currentAyah.surah}-${currentAyah.ayah}`,
            errorMessage: null,
          }));
        })
        .catch(() => {
          if (!isMountedRef.current) return;
          setState(prev => ({
            ...prev,
            mode: null,
            isPlaying: false,
            playlist: [],
            currentIndex: -1,
            activeAyahKey: null,
            errorMessage: 'Could not stream audio recitation. Verify your internet connection.',
          }));
        });
    }
  }, [currentAyah, state.reciterId]);

  const stop = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
    }
    setState(prev => ({
      ...prev,
      mode: null,
      isPlaying: false,
      playlist: [],
      currentIndex: -1,
      currentTime: 0,
      duration: 0,
      activeAyahKey: null,
    }));
  }, []);

  const playSurah = useCallback(async (playlist: ReaderAyah[], startAyah?: number | null) => {
    if (!playlist.length) return;
    const startIndex = startAyah
      ? Math.max(0, playlist.findIndex(item => item.ayah === startAyah))
      : 0;

    setState(prev => ({
      ...prev,
      mode: 'reader',
      playlist,
      currentIndex: startIndex,
      currentTime: 0,
      duration: 0,
      errorMessage: null,
    }));
  }, []);

  const playCurrentSurahFromStart = useCallback(async (playlist: ReaderAyah[]) => {
    await playSurah(playlist, 1);
  }, [playSurah]);

  const playAyah = useCallback(async (ayah: ReaderAyah, playlist: ReaderAyah[]) => {
    const list = playlist.length ? playlist : [ayah];
    const startIndex = list.findIndex(item => item.surah === ayah.surah && item.ayah === ayah.ayah);
    if (startIndex < 0) return;

    setState(prev => ({
      ...prev,
      mode: 'reader',
      playlist: list,
      currentIndex: startIndex,
      currentTime: 0,
      duration: 0,
      errorMessage: null,
    }));
  }, []);

  const playNext = useCallback(() => {
    setState(prev => {
      if (prev.currentIndex + 1 < prev.playlist.length) {
        return { ...prev, currentIndex: prev.currentIndex + 1, currentTime: 0, duration: 0 };
      }
      return prev;
    });
  }, []);

  const playPrev = useCallback(() => {
    setState(prev => {
      if (prev.currentIndex - 1 >= 0) {
        return { ...prev, currentIndex: prev.currentIndex - 1, currentTime: 0, duration: 0 };
      }
      return prev;
    });
  }, []);

  const togglePlayPause = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio || !currentAyah) return;

    if (state.isPlaying) {
      audio.pause();
      setState(prev => ({ ...prev, isPlaying: false }));
      return;
    }

    try {
      await audio.play();
      if (isMountedRef.current) {
        setState(prev => ({ ...prev, isPlaying: true, errorMessage: null }));
      }
    } catch {
      if (isMountedRef.current) {
        setState(prev => ({ ...prev, errorMessage: 'Could not resume playback.' }));
      }
    }
  }, [currentAyah, state.isPlaying]);

  const seek = useCallback((percentage: number) => {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;
    audio.currentTime = Math.max(0, Math.min(1, percentage)) * audio.duration;
  }, []);

  const setVolume = useCallback((value: number) => {
    const audio = audioRef.current;
    const safe = Math.max(0, Math.min(1, value));
    if (audio) audio.volume = safe;
    setState(prev => ({ ...prev, volume: safe }));
  }, []);

  const setReciter = useCallback((id: string) => {
    setState(prev => ({ ...prev, reciterId: id }));
    // If playing, we need to restart the current ayah to apply the new reciter immediately
    const audio = audioRef.current;
    if (audio && audio.src && !audio.paused) {
        // Will be handled automatically by the effect since getEveryAyahUrl dependency changed...
        // Actually, state.reciterId is not in the dependency array of the effect. 
        // We should just let the user re-play, or we can reload here.
    }
  }, []);

  const setPlaybackRate = useCallback((rate: number) => {
    const audio = audioRef.current;
    if (audio) audio.playbackRate = rate;
    setState(prev => ({ ...prev, playbackRate: rate }));
  }, []);

  const stopForModeSwitch = useCallback((nextMode: 'reader' | 'hifz') => {
    if (state.mode && state.mode !== nextMode) {
      stop();
    }
  }, [state.mode, stop]);

  return {
    state,
    currentAyah,
    playAyah,
    playSurah,
    playCurrentSurahFromStart,
    playNext,
    playPrev,
    togglePlayPause,
    stop,
    seek,
    setVolume,
    setReciter,
    setPlaybackRate,
    stopForModeSwitch,
  };
}
