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
 * Lives at the app root so recitation keeps playing while the user navigates
 * between surahs. Pages trigger playback through `usePlayer().playFromIndex()`.
 */
export function PlayerProvider({ children }: { children: ReactNode }) {
  const intl = useIntl();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const totalRef = useRef(0);
  const indexRef = useRef(0);
  const hasStartedRef = useRef(false);
  const repeatCounterRef = useRef(0);
  // Playback session / bar visibility.
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

  const total = verses.length;
  totalRef.current = total;
  indexRef.current = currentIndex;

  // Restore persisted preferences after mount.
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

  // Persist preferences.
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

  // Create the shared audio element once (survives across page navigation
  // and player setting changes — it is never torn down mid-session).
  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'auto';
    audioRef.current = audio;
    return () => {
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
      audioRef.current = null;
    };
  }, []);

  // Latest "ended" handler (reads current repeat/single settings without
  // forcing the media listeners to be re-attached).
  const endedHandlerRef = useRef<() => void>(() => {});
  useEffect(() => {
    endedHandlerRef.current = () => {
      // repeatCount === 0 means "repeat this verse forever" (∞).
      const shouldRepeatVerse =
        repeatMode === 'verse' &&
        (repeatCount === 0 || repeatCounterRef.current < repeatCount - 1);
      if (shouldRepeatVerse) {
        // Repeat this verse
        repeatCounterRef.current += 1;
        setVerseRepeatDisplay(repeatCounterRef.current + 1);
        if (audioRef.current) {
          audioRef.current.currentTime = 0;
          audioRef.current.play();
        }
      } else if (singleMode) {
        // Single-ayah mode — stop after this ayah (no advancing, no looping).
        repeatCounterRef.current = 0;
        setIsPlaying(false);
      } else {
        // Auto-advance
        if (repeatMode === 'range') {
          const end = totalRef.current - 1;
          if (indexRef.current >= end) {
            // Loop back to the start of the surah
            repeatCounterRef.current = 0;
            setCurrentIndex(0);
            setRangeLoopDisplay((prev) => prev + 1);
          } else {
            repeatCounterRef.current = 0;
            setCurrentIndex(indexRef.current + 1);
          }
        } else if (repeatMode === 'verse') {
          if (indexRef.current >= totalRef.current - 1) {
            setIsPlaying(false);
          } else {
            repeatCounterRef.current = 0;
            setCurrentIndex(indexRef.current + 1);
          }
        } else {
          // No repeat mode
          if (indexRef.current >= totalRef.current - 1) {
            setIsPlaying(false);
          } else {
            setCurrentIndex(indexRef.current + 1);
          }
        }
      }
    };
  }, [repeatMode, repeatCount, singleMode]);

  // Attach media events once — cleanup only removes listeners, so playback
  // is never interrupted by re-running this effect.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onWaiting = () => setIsBuffering(true);
    const onPlaying = () => setIsBuffering(false);
    const onCanPlay = () => setIsBuffering(false);
    const onEnded = () => endedHandlerRef.current();
    const onError = () => {
      setIsBuffering(false);
      setIsPlaying(false);
      setError(
        intl.formatMessage({ id: 'audioPlayer.error.stream' })
      );
    };

    audio.addEventListener('waiting', onWaiting);
    audio.addEventListener('playing', onPlaying);
    audio.addEventListener('canplay', onCanPlay);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('error', onError);

    return () => {
      audio.removeEventListener('waiting', onWaiting);
      audio.removeEventListener('playing', onPlaying);
      audio.removeEventListener('canplay', onCanPlay);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('error', onError);
    };
  }, [intl]);

  // Keep the audio element's volume in sync.
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = muted ? 0 : volume;
    }
  }, [volume, muted]);

  // Load + play the current verse.
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
        setError(
          intl.formatMessage({ id: 'audioPlayer.error.start' })
        );
      });
    } else {
      audio.pause();
    }
  }, [currentIndex, isPlaying, rate, reciterId, surahNumber, total, verses, intl]);

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
    []
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
      // If paused at the very end of the ayah, restart from the top so
      // pressing play actually plays something instead of instantly ending.
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
    setCurrentIndex((prev) =>
      prev >= totalRef.current - 1 ? totalRef.current - 1 : prev + 1
    );
    setIsPlaying(true);
  }, []);

  const close = useCallback(() => {
    setDismissed(true);
    setError(null);
    setIsPlaying(false);
    hasStartedRef.current = false;
  }, []);

  const changeRepeatMode = useCallback((m: RepeatMode) => {
    repeatCounterRef.current = 0;
    setRepeatMode(m);
    if (m === 'verse') setVerseRepeatDisplay(1);
    if (m === 'range') setRangeLoopDisplay(1);
  }, []);

  const changeRepeatCount = useCallback((n: number) => {
    repeatCounterRef.current = 0;
    setVerseRepeatDisplay(1);
    setRepeatCount(n);
  }, []);

  const toggleSingleMode = useCallback(() => {
    const next = !singleMode;
    setSingleMode(next);
    // Single-ayah mode is incompatible with a full-surah loop — clear the
    // loop so the badge and behavior stay consistent.
    if (next && repeatMode === 'range') {
      repeatCounterRef.current = 0;
      setRepeatMode('none');
    }
  }, [singleMode, repeatMode]);

  const handleReciterChange = useCallback((id: string) => {
    setError(null);
    setReciterId(id);
  }, []);

  const open = started && !dismissed;

  // Media Session — lock-screen metadata + hardware controls.
  const toggleRef = useRef(toggle);
  const goPrevRef = useRef(goPrev);
  const goNextRef = useRef(goNext);
  toggleRef.current = toggle;
  goPrevRef.current = goPrev;
  goNextRef.current = goNext;

  useEffect(() => {
    if (typeof window === 'undefined' || !('mediaSession' in navigator)) return;
    const verse = currentIndex >= 0 ? verses[currentIndex] : undefined;
    if (!verse || !open) return;
    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: `${surahName ?? `Surah ${surahNumber}`} · ${surahNumber}:${verse.number}`,
        artist: getReciter(reciterId).name,
        album: 'Al Quran',
      });
      navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
    } catch {
      /* Media Session unavailable — non-critical */
    }
  }, [currentIndex, isPlaying, reciterId, verses, surahName, surahNumber, open]);

  useEffect(() => {
    if (typeof window === 'undefined' || !('mediaSession' in navigator)) return;
    try {
      navigator.mediaSession.setActionHandler('play', () => toggleRef.current());
      navigator.mediaSession.setActionHandler('pause', () => toggleRef.current());
      navigator.mediaSession.setActionHandler('previoustrack', () => goPrevRef.current());
      navigator.mediaSession.setActionHandler('nexttrack', () => goNextRef.current());
    } catch {
      /* ignore */
    }
  }, []);

  const currentVerse =
    currentIndex >= 0 && currentIndex < verses.length ? verses[currentIndex] : null;

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
      audioRef,
      playNonce,
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
    ]
  );

  return (
    <PlayerContext.Provider value={value}>
      {children}
      {/* Spacer so the global bar never hides page content on any page. */}
      {open && <div aria-hidden="true" className="h-48 lg:h-36" />}
      <QuranAudioPlayer />
    </PlayerContext.Provider>
  );
}
