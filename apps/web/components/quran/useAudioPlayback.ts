'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getAyahSrc } from '@/lib/audio/audioSource';
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
  const resolvedUrlRef = useRef<string | null>(null);

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

  // Create the Audio element once
  useEffect(() => {
    isMountedRef.current = true;
    const audio = new Audio();
    audio.volume = DEFAULT_VOLUME;
    audioRef.current = audio;

    const handleEnded = () => {
      if (!isMountedRef.current) return;
      setState((prev) => {
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
      setState((prev) => ({
        ...prev,
        currentTime: audio.currentTime,
        duration: audio.duration || 0,
      }));
    };

    const handleLoadedMetadata = () => {
      if (!isMountedRef.current) return;
      setState((prev) => ({ ...prev, duration: audio.duration || 0 }));
    };

    const handleError = () => {
      if (!isMountedRef.current) return;
      // Don't wipe the whole playlist — just show an error for the current ayah
      setState((prev) => ({
        ...prev,
        isPlaying: false,
        errorMessage:
          !navigator.onLine
            ? 'This surah isn\'t downloaded. Download it from the Offline page to listen offline.'
            : 'Could not play this verse. Skipping to next...',
      }));
      // Auto-skip to next after a brief delay
      setTimeout(() => {
        if (!isMountedRef.current) return;
        setState((prev) => {
          if (prev.currentIndex + 1 < prev.playlist.length) {
            return { ...prev, currentIndex: prev.currentIndex + 1, currentTime: 0, duration: 0, errorMessage: null };
          }
          return { ...prev, isPlaying: false, errorMessage: null };
        });
      }, 2000);
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

  // Update Media Session metadata
  const updateMediaSession = useCallback(
    (ayah: ReaderAyah) => {
      if (!('mediaSession' in navigator)) return;
      const surahName = currentSurah?.englishName ?? `Surah ${ayah.surah}`;
      navigator.mediaSession.metadata = new MediaMetadata({
        title: `Verse ${ayah.surah}:${ayah.ayah}`,
        artist: surahName,
        album: 'Al Quran',
      });
    },
    [currentSurah],
  );

  // Load and play whenever currentAyah changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentAyah) return;

    let cancelled = false;

    async function resolveAndPlay() {
      // Resolve URL: local file if downloaded, else remote
      const url = await getAyahSrc(
        currentAyah!.surah,
        currentAyah!.ayah,
        state.reciterId,
      );

      if (cancelled || !audioRef.current) return;
      const audio = audioRef.current;

      // Skip if already playing this URL
      if (resolvedUrlRef.current === url) return;
      resolvedUrlRef.current = url;

      audio.src = url;
      audio.playbackRate = state.playbackRate;

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            if (!isMountedRef.current) return;
            setState((prev) => ({
              ...prev,
              isPlaying: true,
              activeAyahKey: `${currentAyah!.surah}-${currentAyah!.ayah}`,
              errorMessage: null,
            }));
            updateMediaSession(currentAyah!);
          })
          .catch(() => {
            if (!isMountedRef.current) return;
            setState((prev) => ({
              ...prev,
              isPlaying: false,
              errorMessage: !navigator.onLine
                ? 'This surah isn\'t downloaded. Download it from the Offline page to listen offline.'
                : 'Could not stream audio. Check your internet connection.',
            }));
          });
      }
    }

    resolveAndPlay();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentAyah, state.reciterId, state.playbackRate, updateMediaSession]);

  const stop = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
    }
    resolvedUrlRef.current = null;
    setState((prev) => ({
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

  const playSurah = useCallback(
    async (playlist: ReaderAyah[], startAyah?: number | null) => {
      if (!playlist.length) return;
      const startIndex = startAyah
        ? Math.max(0, playlist.findIndex((item) => item.ayah === startAyah))
        : 0;
      resolvedUrlRef.current = null; // Force re-resolve
      setState((prev) => ({
        ...prev,
        mode: 'reader',
        playlist,
        currentIndex: startIndex,
        currentTime: 0,
        duration: 0,
        errorMessage: null,
      }));
    },
    [],
  );

  const playCurrentSurahFromStart = useCallback(
    async (playlist: ReaderAyah[]) => {
      await playSurah(playlist, 1);
    },
    [playSurah],
  );

  const playAyah = useCallback(
    async (ayah: ReaderAyah, playlist: ReaderAyah[]) => {
      const list = playlist.length ? playlist : [ayah];
      const startIndex = list.findIndex(
        (item) => item.surah === ayah.surah && item.ayah === ayah.ayah,
      );
      if (startIndex < 0) return;
      resolvedUrlRef.current = null;
      setState((prev) => ({
        ...prev,
        mode: 'reader',
        playlist: list,
        currentIndex: startIndex,
        currentTime: 0,
        duration: 0,
        errorMessage: null,
      }));
    },
    [],
  );

  const playNext = useCallback(() => {
    resolvedUrlRef.current = null;
    setState((prev) => {
      if (prev.currentIndex + 1 < prev.playlist.length) {
        return { ...prev, currentIndex: prev.currentIndex + 1, currentTime: 0, duration: 0 };
      }
      return prev;
    });
  }, []);

  const playPrev = useCallback(() => {
    resolvedUrlRef.current = null;
    setState((prev) => {
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
      setState((prev) => ({ ...prev, isPlaying: false }));
      return;
    }

    try {
      await audio.play();
      if (isMountedRef.current) {
        setState((prev) => ({ ...prev, isPlaying: true, errorMessage: null }));
      }
    } catch {
      if (isMountedRef.current) {
        setState((prev) => ({ ...prev, errorMessage: 'Could not resume playback.' }));
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
    setState((prev) => ({ ...prev, volume: safe }));
  }, []);

  const setReciter = useCallback((id: string) => {
    setState((prev) => ({ ...prev, reciterId: id }));
    // Force re-resolve for the current ayah
    resolvedUrlRef.current = null;
  }, []);

  const setPlaybackRate = useCallback((rate: number) => {
    const audio = audioRef.current;
    if (audio) audio.playbackRate = rate;
    setState((prev) => ({ ...prev, playbackRate: rate }));
  }, []);

  const stopForModeSwitch = useCallback(
    (nextMode: 'reader' | 'hifz') => {
      if (state.mode && state.mode !== nextMode) {
        stop();
      }
    },
    [state.mode, stop],
  );

  // Media Session action handlers (lock-screen controls on Android)
  useEffect(() => {
    if (!('mediaSession' in navigator)) return;

    navigator.mediaSession.setActionHandler('play', () => {
      togglePlayPause();
    });
    navigator.mediaSession.setActionHandler('pause', () => {
      togglePlayPause();
    });
    navigator.mediaSession.setActionHandler('previoustrack', () => {
      playPrev();
    });
    navigator.mediaSession.setActionHandler('nexttrack', () => {
      playNext();
    });

    return () => {
      navigator.mediaSession.setActionHandler('play', null);
      navigator.mediaSession.setActionHandler('pause', null);
      navigator.mediaSession.setActionHandler('previoustrack', null);
      navigator.mediaSession.setActionHandler('nexttrack', null);
    };
  }, [togglePlayPause, playPrev, playNext]);

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
