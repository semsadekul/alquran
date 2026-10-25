'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useIntl } from 'react-intl';
import {
  RECITERS,
  DEFAULT_RECITER_ID,
  DEFAULT_PLAYBACK_RATE,
  PLAYBACK_RATES,
  getAyahAudioUrl,
  getReciter,
} from '@/lib/audio';
import { getGlobalAyahNumber } from '@/lib/data/quran';
import { readAudioSettings, saveAudioSettings } from '@/lib/storage';
import {
  PlayerContext,
  type PlayerContextValue,
  type RepeatMode,
  type VerseMeta,
} from './player-context';
import { QuranAudioPlayer } from './QuranAudioPlayer';

/**
 * Global playback engine + bottom bar host.
 *
 * Implements a dual-buffer audio architecture (<10ms gapless transitions)
 * and an intelligent sleep timer with a gentle 30-second volume fade-out.
 */
export function PlayerProvider({ children }: { children: ReactNode }) {
  const intl = useIntl();

  // Dual-buffer audio architecture
  const audioARef = useRef<HTMLAudioElement | null>(null);
  const audioBRef = useRef<HTMLAudioElement | null>(null);
  const activeSlotRef = useRef<'A' | 'B'>('A');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const totalRef = useRef(0);
  const indexRef = useRef(0);
  const hasStartedRef = useRef(false);
  const repeatCounterRef = useRef(0);

  // Playback session / bar visibility
  const [started, setStarted] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [surahNumber, setSurahNumber] = useState<number | null>(null);
  const [surahName, setSurahName] = useState<string | null>(null);
  const [verses, setVerses] = useState<VerseMeta[]>([]);
  const [reciterId, setReciterId] = useState(DEFAULT_RECITER_ID);
  const [rate, setRate] = useState(DEFAULT_PLAYBACK_RATE);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('none');
  const [repeatCount, setRepeatCount] = useState(1);
  const [verseRepeatDisplay, setVerseRepeatDisplay] = useState(1);
  const [rangeLoopDisplay, setRangeLoopDisplay] = useState(1);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [singleMode, setSingleMode] = useState(false);
  const [playNonce, setPlayNonce] = useState(0);

  // Sleep Timer state
  const [sleepTimerOption, setSleepTimerOption] = useState<number | 'end-of-surah' | null>(null);
  const [sleepTimerEndsAt, setSleepTimerEndsAt] = useState<number | null>(null);

  const total = verses.length;
  totalRef.current = total;
  indexRef.current = currentIndex;

  // Restore persisted preferences after mount
  useEffect(() => {
    setMounted(true);
    const stored = readAudioSettings();
    if (stored.reciterId && RECITERS.some((r) => r.id === stored.reciterId)) {
      setReciterId(stored.reciterId);
    }
    if (stored.playbackRate && PLAYBACK_RATES.includes(stored.playbackRate)) {
      setRate(stored.playbackRate);
    }
    if (stored.repeatMode && ['none', 'verse', 'range'].includes(stored.repeatMode)) {
      setRepeatMode(stored.repeatMode as RepeatMode);
    }
    if (
      stored.repeatCount !== undefined &&
      stored.repeatCount >= 0 &&
      stored.repeatCount <= 50
    ) {
      setRepeatCount(stored.repeatCount);
    }
    if (stored.volume !== undefined && stored.volume >= 0 && stored.volume <= 1) {
      setVolume(stored.volume);
      setMuted(stored.volume === 0);
    }
    if (typeof stored.singleAyah === 'boolean') {
      setSingleMode(stored.singleAyah);
    }
  }, []);

  // Persist preferences
  useEffect(() => {
    if (!mounted) return;
    saveAudioSettings({
      reciterId,
      playbackRate: rate,
      repeatMode,
      repeatCount,
      volume: muted ? 0 : volume,
      singleAyah: singleMode,
    });
  }, [mounted, reciterId, rate, repeatMode, repeatCount, volume, muted, singleMode]);

  // Create the shared dual-buffer audio elements once
  useEffect(() => {
    const audioA = new Audio();
    const audioB = new Audio();
    audioA.preload = 'auto';
    audioB.preload = 'auto';
    audioARef.current = audioA;
    audioBRef.current = audioB;
    audioRef.current = audioA;

    return () => {
      [audioA, audioB].forEach((a) => {
        a.pause();
        a.removeAttribute('src');
        a.load();
      });
      audioARef.current = null;
      audioBRef.current = null;
      audioRef.current = null;
    };
  }, []);

  // Preload next ayah onto the idle buffer for sub-10ms gapless transition
  const preloadNext = useCallback(
    (nextIdx: number) => {
      if (surahNumber === null || nextIdx >= verses.length) return;
      const nextVerse = verses[nextIdx];
      if (!nextVerse) return;
      const idleAudio = activeSlotRef.current === 'A' ? audioBRef.current : audioARef.current;
      if (!idleAudio) return;

      const nextGlobalAyah = getGlobalAyahNumber(surahNumber, nextVerse.number);
      const nextUrl = getAyahAudioUrl(reciterId, nextGlobalAyah);
      if (idleAudio.src !== nextUrl) {
        idleAudio.src = nextUrl;
        idleAudio.preload = 'auto';
        idleAudio.load();
      }
    },
    [surahNumber, verses, reciterId],
  );

  // Latest "ended" handler (swaps buffer for instant gapless playback)
  const endedHandlerRef = useRef<() => void>(() => {});
  useEffect(() => {
    endedHandlerRef.current = () => {
      const shouldRepeatVerse =
        repeatMode === 'verse' &&
        (repeatCount === 0 || repeatCounterRef.current < repeatCount - 1);

      if (shouldRepeatVerse) {
        repeatCounterRef.current += 1;
        setVerseRepeatDisplay(repeatCounterRef.current + 1);
        const activeAudio = activeSlotRef.current === 'A' ? audioARef.current : audioBRef.current;
        if (activeAudio) {
          activeAudio.currentTime = 0;
          activeAudio.play().catch(() => {});
        }
      } else if (singleMode) {
        repeatCounterRef.current = 0;
        setIsPlaying(false);
      } else if (sleepTimerOption === 'end-of-surah' && indexRef.current >= totalRef.current - 1) {
        repeatCounterRef.current = 0;
        setIsPlaying(false);
        setSleepTimerOption(null);
      } else {
        // Auto-advance
        let nextIndex = indexRef.current + 1;
        let shouldLoop = false;

        if (repeatMode === 'range' && nextIndex >= totalRef.current) {
          nextIndex = 0;
          shouldLoop = true;
        }

        if (nextIndex >= totalRef.current) {
          setIsPlaying(false);
        } else {
          if (shouldLoop) {
            setRangeLoopDisplay((prev) => prev + 1);
          }
          repeatCounterRef.current = 0;

          // Seamless dual-buffer swap!
          const nextSlot = activeSlotRef.current === 'A' ? 'B' : 'A';
          const nextAudio = nextSlot === 'A' ? audioARef.current : audioBRef.current;
          const currentAudio = activeSlotRef.current === 'A' ? audioARef.current : audioBRef.current;

          if (currentAudio) currentAudio.pause();

          if (nextAudio) {
            nextAudio.playbackRate = rate;
            nextAudio.volume = muted ? 0 : volume;
            nextAudio.play().catch(() => {});
          }

          activeSlotRef.current = nextSlot;
          audioRef.current = nextAudio;
          setCurrentIndex(nextIndex);

          // Preload the following verse on the newly idle buffer
          preloadNext(nextIndex + 1);
        }
      }
    };
  }, [repeatMode, repeatCount, singleMode, sleepTimerOption, rate, volume, muted, preloadNext]);

  // Attach media listeners to both buffers
  useEffect(() => {
    const a = audioARef.current;
    const b = audioBRef.current;
    if (!a || !b) return;

    const attach = (el: HTMLAudioElement, slot: 'A' | 'B') => {
      const onWaiting = () => {
        if (activeSlotRef.current === slot) setIsBuffering(true);
      };
      const onPlaying = () => {
        if (activeSlotRef.current === slot) setIsBuffering(false);
      };
      const onCanPlay = () => {
        if (activeSlotRef.current === slot) setIsBuffering(false);
      };
      const onEnded = () => {
        if (activeSlotRef.current === slot) endedHandlerRef.current();
      };
      const onError = () => {
        if (activeSlotRef.current === slot) {
          setIsBuffering(false);
          setIsPlaying(false);
          setError(intl.formatMessage({ id: 'audioPlayer.error.stream' }));
        }
      };

      el.addEventListener('waiting', onWaiting);
      el.addEventListener('playing', onPlaying);
      el.addEventListener('canplay', onCanPlay);
      el.addEventListener('ended', onEnded);
      el.addEventListener('error', onError);

      return () => {
        el.removeEventListener('waiting', onWaiting);
        el.removeEventListener('playing', onPlaying);
        el.removeEventListener('canplay', onCanPlay);
        el.removeEventListener('ended', onEnded);
        el.removeEventListener('error', onError);
      };
    };

    const cleanupA = attach(a, 'A');
    const cleanupB = attach(b, 'B');

    return () => {
      cleanupA();
      cleanupB();
    };
  }, [intl]);

  // Keep volume in sync across both buffers
  useEffect(() => {
    const targetVolume = muted ? 0 : volume;
    if (audioARef.current) audioARef.current.volume = targetVolume;
    if (audioBRef.current) audioBRef.current.volume = targetVolume;
  }, [volume, muted]);

  // Sleep Timer ticker with 30s gentle volume fade-out
  useEffect(() => {
    if (!sleepTimerEndsAt || !isPlaying) return;

    const interval = setInterval(() => {
      const remaining = sleepTimerEndsAt - Date.now();
      if (remaining <= 0) {
        const activeAudio = audioRef.current;
        if (activeAudio) activeAudio.pause();
        setIsPlaying(false);
        setSleepTimerOption(null);
        setSleepTimerEndsAt(null);
        if (activeAudio) activeAudio.volume = muted ? 0 : volume;
      } else if (remaining <= 30_000) {
        // Gentle 30-second volume fade-out
        const activeAudio = audioRef.current;
        if (activeAudio && !muted) {
          const factor = Math.max(0, remaining / 30_000);
          activeAudio.volume = volume * factor;
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [sleepTimerEndsAt, isPlaying, volume, muted]);

  // Load + play the current verse on the active buffer and preload next verse
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || total === 0 || surahNumber === null) return;
    const verse = verses[currentIndex];
    if (!verse) return;

    const globalAyah = getGlobalAyahNumber(surahNumber, verse.number);
    const url = getAyahAudioUrl(reciterId, globalAyah);

    if (audio.src !== url) {
      audio.src = url;
    }
    audio.playbackRate = rate;

    if (isPlaying) {
      audio.play().catch(() => {
        setIsBuffering(false);
        setIsPlaying(false);
        setError(intl.formatMessage({ id: 'audioPlayer.error.start' }));
      });
      // Preload next ayah right away
      preloadNext(currentIndex + 1);
    } else {
      audio.pause();
    }
  }, [currentIndex, isPlaying, rate, reciterId, surahNumber, total, verses, intl, preloadNext]);

  // ─── Actions ────────────────────────────────────────────────────────────
  const playFromIndex = useCallback(
    (s: number, vs: VerseMeta[], index: number, name?: string) => {
      hasStartedRef.current = true;
      setStarted(true);
      setDismissed(false);
      setSurahNumber(s);
      setSurahName(name ?? `Surah ${s}`);
      setVerses(vs);
      setCurrentIndex(index);
      setIsPlaying(true);
      setError(null);
      repeatCounterRef.current = 0;
      setVerseRepeatDisplay(1);
      setPlayNonce((n) => n + 1);
    },
    [],
  );

  const pauseAtIndex = useCallback((index: number) => {
    if (indexRef.current === index) {
      setIsPlaying(false);
    }
  }, []);

  const toggle = useCallback(() => {
    setError(null);
    const next = !isPlaying;
    if (next) {
      hasStartedRef.current = true;
      setStarted(true);
      setDismissed(false);
      const audio = audioRef.current;
      if (
        audio &&
        Number.isFinite(audio.duration) &&
        audio.duration > 0 &&
        audio.currentTime >= audio.duration - 0.05
      ) {
        audio.currentTime = 0;
      }
    }
    setIsPlaying(next);
  }, [isPlaying]);

  const goPrev = useCallback(() => {
    hasStartedRef.current = true;
    setStarted(true);
    setDismissed(false);
    setError(null);
    repeatCounterRef.current = 0;
    setCurrentIndex((prev) => (prev <= 0 ? 0 : prev - 1));
    setIsPlaying(true);
  }, []);

  const goNext = useCallback(() => {
    hasStartedRef.current = true;
    setStarted(true);
    setDismissed(false);
    setError(null);
    repeatCounterRef.current = 0;
    setCurrentIndex((prev) => (prev >= totalRef.current - 1 ? prev : prev + 1));
    setIsPlaying(true);
  }, []);

  const close = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    setIsPlaying(false);
    setDismissed(true);
    setSleepTimerOption(null);
    setSleepTimerEndsAt(null);
  }, []);

  const handleReciterChange = useCallback(
    (id: string) => {
      if (!RECITERS.some((r) => r.id === id)) return;
      const audio = audioRef.current;
      const prevTime = audio?.currentTime || 0;
      setReciterId(id);
      if (surahNumber !== null && verses[currentIndex]) {
        const globalAyah = getGlobalAyahNumber(surahNumber, verses[currentIndex].number);
        const url = getAyahAudioUrl(id, globalAyah);
        if (audio) {
          audio.src = url;
          audio.currentTime = prevTime;
          if (isPlaying) audio.play().catch(() => {});
        }
      }
    },
    [currentIndex, isPlaying, surahNumber, verses],
  );

  const changeRepeatMode = useCallback((m: RepeatMode) => {
    setRepeatMode(m);
    repeatCounterRef.current = 0;
    setVerseRepeatDisplay(1);
    setRangeLoopDisplay(1);
  }, []);

  const changeRepeatCount = useCallback((n: number) => {
    setRepeatCount(n);
    repeatCounterRef.current = 0;
    setVerseRepeatDisplay(1);
  }, []);

  const toggleSingleMode = useCallback((b: boolean) => {
    setSingleMode(b);
  }, []);

  const setSleepTimer = useCallback((option: number | 'end-of-surah' | null) => {
    setSleepTimerOption(option);
    if (typeof option === 'number') {
      setSleepTimerEndsAt(Date.now() + option * 60 * 1000);
    } else {
      setSleepTimerEndsAt(null);
    }
  }, []);

  const currentVerse = useMemo(() => {
    if (total === 0) return null;
    return verses[currentIndex] ?? null;
  }, [currentIndex, total, verses]);

  const open = started && !dismissed && surahNumber !== null && total > 0;

  const value = useMemo<PlayerContextValue>(
    () => ({
      surahNumber,
      surahName,
      currentIndex,
      total,
      currentVerse,
      isPlaying,
      isBuffering,
      error,
      open,
      singleMode,
      repeatMode,
      repeatCount,
      verseRepeatDisplay,
      rangeLoopDisplay,
      reciterId,
      rate,
      volume,
      muted,
      audioRef,
      playNonce,
      sleepTimerOption,
      sleepTimerEndsAt,
      playFromIndex,
      pauseAtIndex,
      toggle,
      goPrev,
      goNext,
      close,
      setReciterId: handleReciterChange,
      setRate,
      setRepeatMode: changeRepeatMode,
      setRepeatCount: changeRepeatCount,
      setSingleMode: toggleSingleMode,
      setVolume,
      setMuted,
      setSleepTimer,
    }),
    [
      surahNumber,
      surahName,
      currentIndex,
      total,
      currentVerse,
      isPlaying,
      isBuffering,
      error,
      open,
      singleMode,
      repeatMode,
      repeatCount,
      verseRepeatDisplay,
      rangeLoopDisplay,
      reciterId,
      rate,
      volume,
      muted,
      playNonce,
      sleepTimerOption,
      sleepTimerEndsAt,
      playFromIndex,
      pauseAtIndex,
      toggle,
      goPrev,
      goNext,
      close,
      handleReciterChange,
      changeRepeatMode,
      changeRepeatCount,
      toggleSingleMode,
      setSleepTimer,
    ],
  );

  return (
    <PlayerContext.Provider value={value}>
      {children}
      {open && <div aria-hidden="true" className="h-48 lg:h-36" />}
      <QuranAudioPlayer />
    </PlayerContext.Provider>
  );
}
