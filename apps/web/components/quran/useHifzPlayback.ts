'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getEveryAyahUrl } from './audio-utils';
import type { ReaderAyah } from './types';

export interface HifzPlaybackState {
  isPlaying: boolean;
  isPaused: boolean;
  playlist: ReaderAyah[];
  currentIndex: number;
  currentRepeatCount: number;
  currentLoopCount: number;
  verseRepeatsLimit: number;
  loopRepeatsLimit: number | 'infinite';
  delaySeconds: number | 'auto';
  errorMessage: string | null;
  completed: boolean;
}

export function useHifzPlayback() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timeoutRef = useRef<number | null>(null);
  const pausedDuringDelayRef = useRef<number | null>(null);
  const [state, setState] = useState<HifzPlaybackState>({
    isPlaying: false,
    isPaused: false,
    playlist: [],
    currentIndex: 0,
    currentRepeatCount: 1,
    currentLoopCount: 1,
    verseRepeatsLimit: 1,
    loopRepeatsLimit: 1,
    delaySeconds: 0,
    errorMessage: null,
    completed: false
  });

  const currentAyah = useMemo(() => state.playlist[state.currentIndex] ?? null, [state.currentIndex, state.playlist]);

  const clearDelay = useCallback(() => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const hardStop = useCallback((completed = false) => {
    clearDelay();
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
    }
    pausedDuringDelayRef.current = null;
    setState(prev => ({
      ...prev,
      isPlaying: false,
      isPaused: false,
      playlist: [],
      currentIndex: 0,
      currentRepeatCount: 1,
      currentLoopCount: 1,
      errorMessage: null,
      completed
    }));
  }, [clearDelay]);

  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;

    const handleEnded = () => {
      setState(prev => {
        if (!prev.isPlaying || prev.isPaused) return prev;

        let nextRepeat = prev.currentRepeatCount;
        let nextLoop = prev.currentLoopCount;
        let nextIndex = prev.currentIndex;
        let done = false;

        if (prev.currentRepeatCount < prev.verseRepeatsLimit) {
          nextRepeat = prev.currentRepeatCount + 1;
        } else {
          nextRepeat = 1;
          if (prev.currentIndex + 1 < prev.playlist.length) {
            nextIndex = prev.currentIndex + 1;
          } else {
            nextIndex = 0;
            if (prev.loopRepeatsLimit === 'infinite') {
              nextLoop = prev.currentLoopCount + 1;
            } else if (prev.currentLoopCount < prev.loopRepeatsLimit) {
              nextLoop = prev.currentLoopCount + 1;
            } else {
              done = true;
            }
          }
        }

        if (done) {
          window.setTimeout(() => hardStop(true), 0);
          return prev;
        }

        const delayMs = prev.delaySeconds === 'auto'
          ? Math.max(300, Math.round((audio.duration || 3) * 1000))
          : Math.max(0, Number(prev.delaySeconds) * 1000);

        const indexChanged = nextIndex !== prev.currentIndex;

        clearDelay();
        timeoutRef.current = window.setTimeout(() => {
          timeoutRef.current = null;
          setState(current => ({
            ...current,
            currentIndex: nextIndex,
            currentRepeatCount: nextRepeat,
            currentLoopCount: nextLoop
          }));
          // If the ayah index didn't change (verse-repeat within the same ayah),
          // the play effect won't re-fire — restart audio directly.
          if (!indexChanged) {
            const a = audioRef.current;
            if (a) {
              try { a.currentTime = 0; } catch { /* noop */ }
              a.play().catch(() => {
                setState(p => ({ ...p, errorMessage: 'Could not resume Hifz playback.' }));
              });
            }
          }
        }, delayMs);

        // Do NOT apply the next index here — only schedule it via the timeout.
        // Returning `prev` prevents the playback effect from firing early
        // and returning-out on `timeoutRef.current`, which would leave
        // the timeout's setState as a no-op and stall playback.
        return prev;
      });
    };

    const handleError = () => {
      setState(prev => ({
        ...prev,
        errorMessage: 'Hifz recitation streaming requires an internet connection.'
      }));
      hardStop(false);
    };

    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.pause();
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audioRef.current = null;
      clearDelay();
    };
  }, [clearDelay, hardStop]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !state.isPlaying || state.isPaused || !currentAyah) return;

    if (timeoutRef.current) return;

    const nextUrl = getEveryAyahUrl(currentAyah.surah, currentAyah.ayah);
    if (audio.src !== nextUrl) {
      audio.src = nextUrl;
    }

    audio.play().catch(() => {
      setState(prev => ({
        ...prev,
        errorMessage: 'Could not stream recitation audio. Verify your internet connection.'
      }));
      hardStop(false);
    });
  }, [currentAyah, hardStop, state.isPaused, state.isPlaying]);

  const start = useCallback((config: {
    playlist: ReaderAyah[];
    verseRepeats: number;
    loopRepeats: number | 'infinite';
    delay: number | 'auto';
  }) => {
    hardStop(false);
    if (!config.playlist.length) return;

    setState({
      isPlaying: true,
      isPaused: false,
      playlist: config.playlist,
      currentIndex: 0,
      currentRepeatCount: 1,
      currentLoopCount: 1,
      verseRepeatsLimit: config.verseRepeats,
      loopRepeatsLimit: config.loopRepeats,
      delaySeconds: config.delay,
      errorMessage: null,
      completed: false
    });
  }, [hardStop]);

  const togglePauseResume = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio || !state.isPlaying) return;

    if (state.isPaused) {
      setState(prev => ({ ...prev, isPaused: false }));
      if (pausedDuringDelayRef.current) {
        const remaining = pausedDuringDelayRef.current;
        pausedDuringDelayRef.current = null;
        timeoutRef.current = window.setTimeout(() => {
          timeoutRef.current = null;
          setState(prev => ({ ...prev }));
        }, remaining);
      } else {
        try {
          await audio.play();
        } catch {
          setState(prev => ({ ...prev, errorMessage: 'Could not resume Hifz playback.' }));
        }
      }
      return;
    }

    setState(prev => ({ ...prev, isPaused: true }));
    audio.pause();
    if (timeoutRef.current) {
      pausedDuringDelayRef.current = 500;
      clearDelay();
    }
  }, [clearDelay, state.isPaused, state.isPlaying]);

  return {
    state,
    currentAyah,
    start,
    togglePauseResume,
    stop: hardStop
  };
}
