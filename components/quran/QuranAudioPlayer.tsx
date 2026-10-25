'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { useIntl } from 'react-intl';
import { RECITERS, PLAYBACK_RATES } from '@/lib/audio';
import { usePlayer } from './player-context';
import {
  PlayIcon,
  PauseIcon,
  SkipBackIcon,
  SkipForwardIcon,
  VolumeIcon,
  VolumeMuteIcon,
  MoreHorizontalIcon,
  RepeatIcon,
  SingleVerseIcon,
  CloseIcon,
  MoonIcon,
  DownloadIcon,
  CheckIcon,
  TrashIcon,
} from '@/components/ui/Icon';
import { isSurahAudioCached, downloadSurahAudio, deleteSurahAudioCache } from '@/lib/audio/cache';

/** mm:ss, or h:mm:ss when the track is an hour or longer. */
function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '00:00';
  const s = Math.floor(seconds % 60);
  const m = Math.floor((seconds / 60) % 60);
  const h = Math.floor(seconds / 3600);
  const ss = String(s).padStart(2, '0');
  const mm = String(m).padStart(2, '0');
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

/**
 * Global bottom playback bar. The audio engine + session state live in
 * PlayerProvider; this component renders the UI and keeps its own
 * seek/time display in sync by listening to the shared audio element.
 */
export function QuranAudioPlayer() {
  const intl = useIntl();
  const {
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
    setSleepTimer,
    toggle,
    goPrev,
    goNext,
    close,
    setReciterId,
    setRate,
    setRepeatMode,
    setRepeatCount,
    setSingleMode,
    setVolume,
    setMuted,
  } = usePlayer();

  // Popover visibility is bar-local UI state (keeps provider re-renders low).
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [repeatOpen, setRepeatOpen] = useState(false);
  const [sleepOpen, setSleepOpen] = useState(false);

  const toggleSettings = () => {
    setSettingsOpen((s) => !s);
    setRepeatOpen(false);
    setSleepOpen(false);
  };
  const toggleRepeat = () => {
    setRepeatOpen((o) => !o);
    setSettingsOpen(false);
    setSleepOpen(false);
  };
  const toggleSleep = () => {
    setSleepOpen((s) => !s);
    setSettingsOpen(false);
    setRepeatOpen(false);
  };

  // Live countdown remaining text for sleep timer
  const [sleepRemainingText, setSleepRemainingText] = useState<string | null>(null);
  useEffect(() => {
    if (!sleepTimerEndsAt) {
      setSleepRemainingText(null);
      return;
    }
    const update = () => {
      const diffMs = sleepTimerEndsAt - Date.now();
      if (diffMs <= 0) {
        setSleepRemainingText(null);
        return;
      }
      const totalSec = Math.ceil(diffMs / 1000);
      const m = Math.floor(totalSec / 60);
      const s = totalSec % 60;
      setSleepRemainingText(`${m}:${String(s).padStart(2, '0')}`);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [sleepTimerEndsAt]);

  // Offline audio caching state
  const [isCached, setIsCached] = useState(false);
  const [downloadingPct, setDownloadingPct] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (surahNumber && total > 0) {
      isSurahAudioCached(reciterId, surahNumber, total).then((cached) => {
        if (!cancelled) setIsCached(cached);
      });
    }
    return () => {
      cancelled = true;
    };
  }, [surahNumber, reciterId, total]);

  const handleDownloadToggle = async () => {
    if (!surahNumber || total <= 0) return;
    if (isCached) {
      await deleteSurahAudioCache(reciterId, surahNumber, total);
      setIsCached(false);
    } else {
      setDownloadingPct(0);
      try {
        await downloadSurahAudio(reciterId, surahNumber, total, (pct) => {
          setDownloadingPct(pct);
        });
        setIsCached(true);
      } catch (err) {
        console.error('[AudioPlayer] Download failed:', err);
      } finally {
        setDownloadingPct(null);
      }
    }
  };

  // Seek/time display is local — the provider avoids re-rendering the whole
  // app on every `timeupdate` (which fires ~4×/second).
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Attach time listeners to the shared audio element while the bar is shown.
  // `open` is in the deps because the element is only created (by the parent
  // provider) after this component first mounts.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTimeUpdate = () => setCurrentTime(audio.currentTime || 0);
    const onDurationChange = () =>
      setDuration(Number.isFinite(audio.duration) ? audio.duration : 0);
    const onLoadStart = () => {
      setCurrentTime(0);
      setDuration(0);
    };
    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('durationchange', onDurationChange);
    audio.addEventListener('loadstart', onLoadStart);
    // Initialize from the element (e.g. reopened while paused mid-ayah).
    setCurrentTime(audio.currentTime || 0);
    setDuration(Number.isFinite(audio.duration) ? audio.duration : 0);
    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('durationchange', onDurationChange);
      audio.removeEventListener('loadstart', onLoadStart);
    };
  }, [audioRef, open]);

  // Reset the seek position when a new play request arrives (covers replaying
  // the same verse — a `loadstart` only fires when the src actually changes).
  // Also close any open popovers on a new play request.
  const lastNonceRef = useRef(playNonce);
  useEffect(() => {
    if (playNonce !== lastNonceRef.current) {
      lastNonceRef.current = playNonce;
      setCurrentTime(0);
      setDuration(0);
      setSettingsOpen(false);
      setRepeatOpen(false);
      setSleepOpen(false);
    }
  }, [playNonce]);

  if (!open || total === 0) return null;

  const pct = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;
  const label = surahName ?? `Surah ${surahNumber}`;
  const selectClass =
    'w-full bg-surface-2 border border-border rounded-lg text-sm text-text px-2 py-2 focus:outline-none focus:border-gold/50 focus:ring-2 focus:ring-gold/20 transition-colors';

  const handleSeek = (t: number) => {
    setCurrentTime(t);
    if (audioRef.current && Number.isFinite(duration)) {
      audioRef.current.currentTime = t;
    }
  };

  return (
    <div className="fixed inset-x-0 bottom-[calc(4rem+env(safe-area-inset-bottom))] lg:bottom-0 z-40 animate-slide-up">
      <div className="relative">
        {/* Settings popover */}
        {settingsOpen && (
          <div className="absolute bottom-full right-3 sm:right-4 mb-2 w-72 max-w-[calc(100vw-1.5rem)] rounded-xl border border-border bg-surface shadow-elevated p-4 space-y-3 animate-scale-in">
            <p className="text-xs font-semibold text-text uppercase tracking-wider">
              {intl.formatMessage({ id: 'audioPlayer.settings' })}
            </p>

            <label className="block space-y-1">
              <span className="text-xs text-text-muted">
                {intl.formatMessage({ id: 'audioPlayer.reciter' })}
              </span>
              <select
                value={reciterId}
                onChange={(e) => setReciterId(e.target.value)}
                className={selectClass}
              >
                {RECITERS.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="block space-y-1">
              <span className="text-xs text-text-muted">
                {intl.formatMessage({ id: 'audioPlayer.playbackSpeed' })}
              </span>
              <select
                value={rate}
                onChange={(e) => setRate(Number(e.target.value))}
                className={selectClass}
              >
                {PLAYBACK_RATES.map((r) => (
                  <option key={r} value={r}>
                    {r}×
                  </option>
                ))}
              </select>
            </label>

            {/* Offline download */}
            <div className="pt-2 border-t border-border space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-text-muted">
                  {intl.formatMessage({ id: 'audioPlayer.downloadSurah' })}
                </span>
                {isCached && (
                  <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                    <CheckIcon className="w-3.5 h-3.5" />
                    {intl.formatMessage({ id: 'audioPlayer.downloaded' })}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={handleDownloadToggle}
                disabled={downloadingPct !== null}
                className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  isCached
                    ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20'
                    : 'bg-gold/15 text-gold-dark hover:bg-gold/25'
                }`}
              >
                {downloadingPct !== null ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
                    {intl.formatMessage({ id: 'audioPlayer.downloading' }, { percent: downloadingPct })}
                  </>
                ) : isCached ? (
                  <>
                    <TrashIcon className="w-3.5 h-3.5" />
                    {intl.formatMessage({ id: 'audioPlayer.deleteDownload' })}
                  </>
                ) : (
                  <>
                    <DownloadIcon className="w-3.5 h-3.5" />
                    {intl.formatMessage({ id: 'audioPlayer.downloadSurah' })}
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Sleep Timer popover */}
        {sleepOpen && (
          <div className="absolute bottom-full right-3 sm:right-4 mb-2 w-64 max-w-[calc(100vw-1.5rem)] rounded-xl border border-border bg-surface shadow-elevated p-4 space-y-1.5 animate-scale-in">
            <div className="flex items-center justify-between pb-1">
              <p className="text-xs font-semibold text-text uppercase tracking-wider flex items-center gap-1.5">
                <MoonIcon className="w-3.5 h-3.5 text-gold" />
                {intl.formatMessage({ id: 'audioPlayer.sleepTimer' })}
              </p>
              {sleepRemainingText && (
                <span className="text-xs font-semibold text-gold tabular-nums bg-gold/10 px-2 py-0.5 rounded-full">
                  {sleepRemainingText}
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                setSleepTimer(null);
                setSleepOpen(false);
              }}
              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-sm transition-colors ${
                sleepTimerOption === null
                  ? 'bg-gold/10 text-gold-dark font-medium'
                  : 'text-text/80 hover:bg-surface-highlight'
              }`}
            >
              <span>{intl.formatMessage({ id: 'audioPlayer.sleepTimerOff' })}</span>
              {sleepTimerOption === null && <CheckIcon className="w-4 h-4 text-gold-dark" />}
            </button>

            {([15, 30, 45, 60] as const).map((mins) => {
              const isSelected = sleepTimerOption === mins;
              return (
                <button
                  key={mins}
                  type="button"
                  onClick={() => {
                    setSleepTimer(mins);
                    setSleepOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-sm transition-colors ${
                    isSelected
                      ? 'bg-gold/10 text-gold-dark font-medium'
                      : 'text-text/80 hover:bg-surface-highlight'
                  }`}
                >
                  <span>
                    {intl.formatMessage({ id: 'audioPlayer.sleepTimerMinutes' }, { minutes: mins })}
                  </span>
                  {isSelected && <CheckIcon className="w-4 h-4 text-gold-dark" />}
                </button>
              );
            })}

            <button
              type="button"
              onClick={() => {
                setSleepTimer('end-of-surah');
                setSleepOpen(false);
              }}
              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-sm transition-colors ${
                sleepTimerOption === 'end-of-surah'
                  ? 'bg-gold/10 text-gold-dark font-medium'
                  : 'text-text/80 hover:bg-surface-highlight'
              }`}
            >
              <span>{intl.formatMessage({ id: 'audioPlayer.sleepTimerEndSurah' })}</span>
              {sleepTimerOption === 'end-of-surah' && <CheckIcon className="w-4 h-4 text-gold-dark" />}
            </button>
          </div>
        )}

        {/* Repeat popover — quick loop options for memorization */}
        {repeatOpen && (
          <div className="absolute bottom-full right-3 sm:right-4 mb-2 w-64 max-w-[calc(100vw-1.5rem)] rounded-xl border border-border bg-surface shadow-elevated p-4 space-y-1.5 animate-scale-in">
            <p className="text-xs font-semibold text-text uppercase tracking-wider pb-1">
              {intl.formatMessage({ id: 'audioPlayer.repeat' })}
            </p>

            <button
              type="button"
              onClick={() => setRepeatMode('none')}
              className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-colors ${
                repeatMode === 'none'
                  ? 'bg-gold/10 text-gold-dark font-medium'
                  : 'text-text/80 hover:bg-surface-highlight'
              }`}
            >
              <RepeatIcon className="w-4 h-4 shrink-0" />
              {intl.formatMessage({ id: 'audioPlayer.repeatNone' })}
            </button>

            <button
              type="button"
              onClick={() => setRepeatMode('verse')}
              className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-colors ${
                repeatMode === 'verse'
                  ? 'bg-gold/10 text-gold-dark font-medium'
                  : 'text-text/80 hover:bg-surface-highlight'
              }`}
            >
              <RepeatIcon className="w-4 h-4 shrink-0" />
              {intl.formatMessage({ id: 'audioPlayer.repeatVerse' })}
            </button>

            {repeatMode === 'verse' && (
              <div className="flex flex-wrap gap-1.5 pl-9 pb-1">
                {[2, 3, 5, 10, 20, 0].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setRepeatCount(n)}
                    aria-label={
                      n === 0
                        ? intl.formatMessage({ id: 'audioPlayer.repeatInfinite' })
                        : `${n}×`
                    }
                    className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                      repeatCount === n
                        ? 'bg-gold text-[#1a1814] border-gold'
                        : 'bg-surface-2 border-border-subtle text-text-muted hover:border-gold/40 hover:text-gold-dark'
                    }`}
                  >
                    {n === 0 ? '∞' : `${n}×`}
                  </button>
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={() => setRepeatMode('range')}
              className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-colors ${
                repeatMode === 'range'
                  ? 'bg-gold/10 text-gold-dark font-medium'
                  : 'text-text/80 hover:bg-surface-highlight'
              }`}
            >
              <RepeatIcon className="w-4 h-4 shrink-0" />
              {intl.formatMessage({ id: 'audioPlayer.loopSurah' })}
            </button>
          </div>
        )}

        {/* Bar */}
        <div className="glass-dark border-t sm:border sm:border-gold/20 sm:rounded-2xl sm:mx-3 sm:mb-3 shadow-elevated">
          <div
            className="max-w-7xl mx-auto px-4 sm:px-6 py-3"
            style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom))' }}
          >
            {/* Time · translation · total */}
            <div className="flex items-center gap-3">
              <span className="text-xs text-[#b0a896] tabular-nums whitespace-nowrap w-12 shrink-0">
                {formatTime(currentTime)}
              </span>
              <div className="flex-1 min-w-0 text-center">
                <p className="text-[13px] leading-snug text-[#f2ede0] truncate">
                  <span className="text-[#e3c989] font-medium">
                    {label} {surahNumber}:{currentVerse?.number}
                  </span>
                  {currentVerse?.english && (
                    <>
                      <span className="mx-1.5 text-[#b0a896]">·</span>
                      <span className="italic text-[#d6cfbf]">{currentVerse.english}</span>
                    </>
                  )}
                </p>
              </div>
              <span className="text-xs text-[#b0a896] tabular-nums whitespace-nowrap w-12 shrink-0 text-right">
                {formatTime(duration)}
              </span>
            </div>

            {/* Seek bar */}
            <input
              type="range"
              min={0}
              max={Math.max(duration, 0)}
              step={0.1}
              value={Math.min(currentTime, Math.max(duration, 0))}
              disabled={!duration}
              onChange={(e) => handleSeek(Number(e.target.value))}
              className="audio-progress mt-2"
              aria-label={intl.formatMessage({ id: 'audioPlayer.seek' })}
              style={{ '--fill': `${pct}%` } as CSSProperties}
            />

            {/* Controls */}
            <div className="flex items-center justify-between gap-2 mt-1">
              {/* Settings + repeat + single-ayah + volume */}
              <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                <button
                  type="button"
                  onClick={toggleSettings}
                  aria-label={intl.formatMessage({ id: 'audioPlayer.settings' })}
                  aria-expanded={settingsOpen}
                  className={`p-2 rounded-full transition-colors ${
                    settingsOpen
                      ? 'text-[#e3c989] bg-gold/15'
                      : 'text-[#d6cfbf] hover:text-[#e3c989] hover:bg-gold/10'
                  }`}
                >
                  <MoreHorizontalIcon className="w-5 h-5" />
                </button>

                {/* Repeat / loop */}
                <button
                  type="button"
                  onClick={toggleRepeat}
                  aria-label={intl.formatMessage({ id: 'audioPlayer.repeat' })}
                  aria-expanded={repeatOpen}
                  className={`relative p-2 rounded-full transition-colors ${
                    repeatOpen || repeatMode !== 'none'
                      ? 'text-[#e3c989] bg-gold/15'
                      : 'text-[#d6cfbf] hover:text-[#e3c989] hover:bg-gold/10'
                  }`}
                >
                  <RepeatIcon className="w-5 h-5" />
                  {(repeatMode === 'range' ||
                    (repeatMode === 'verse' &&
                      (repeatCount === 0 || repeatCount > 1))) && (
                    <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 rounded-full bg-gold text-[#1a1814] text-[10px] font-bold flex items-center justify-center tabular-nums ring-2 ring-[#1a1814]/80">
                      {repeatMode === 'range' || repeatCount === 0
                        ? '∞'
                        : `${repeatCount}x`}
                    </span>
                  )}
                </button>

                {/* Single-ayah mode — stop after this ayah */}
                <button
                  type="button"
                  onClick={() => setSingleMode(!singleMode)}
                  aria-label={intl.formatMessage({ id: 'audioPlayer.singleAyah' })}
                  aria-pressed={singleMode}
                  title={intl.formatMessage({ id: 'audioPlayer.singleAyah' })}
                  className={`relative p-2 rounded-full transition-colors ${
                    singleMode
                      ? 'text-[#e3c989] bg-gold/15'
                      : 'text-[#d6cfbf] hover:text-[#e3c989] hover:bg-gold/10'
                  }`}
                >
                  <SingleVerseIcon className="w-5 h-5" />
                  {singleMode && (
                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-gold" />
                  )}
                </button>

                {/* Sleep Timer */}
                <button
                  type="button"
                  onClick={toggleSleep}
                  aria-label={intl.formatMessage({ id: 'audioPlayer.sleepTimer' })}
                  aria-expanded={sleepOpen}
                  title={
                    sleepTimerOption === 'end-of-surah'
                      ? intl.formatMessage({ id: 'audioPlayer.sleepTimerEndSurah' })
                      : sleepRemainingText
                      ? `${intl.formatMessage({ id: 'audioPlayer.sleepTimer' })}: ${sleepRemainingText}`
                      : intl.formatMessage({ id: 'audioPlayer.sleepTimer' })
                  }
                  className={`relative p-2 rounded-full transition-colors ${
                    sleepOpen || sleepTimerOption !== null
                      ? 'text-[#e3c989] bg-gold/15'
                      : 'text-[#d6cfbf] hover:text-[#e3c989] hover:bg-gold/10'
                  }`}
                >
                  <MoonIcon className="w-5 h-5" />
                  {sleepTimerOption !== null && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-4 px-1 rounded-full bg-gold text-[#1a1814] text-[9px] font-bold flex items-center justify-center tabular-nums ring-2 ring-[#1a1814]/80">
                      {sleepTimerOption === 'end-of-surah'
                        ? 'Surah'
                        : sleepRemainingText || `${sleepTimerOption}m`}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setMuted(!muted)}
                  aria-label={intl.formatMessage({
                    id: muted || volume === 0 ? 'audioPlayer.unmute' : 'audioPlayer.mute',
                  })}
                  className="p-2 rounded-full text-[#d6cfbf] hover:text-[#e3c989] hover:bg-gold/10 transition-colors"
                >
                  {muted || volume === 0 ? (
                    <VolumeMuteIcon className="w-5 h-5" />
                  ) : (
                    <VolumeIcon className="w-5 h-5" />
                  )}
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={muted ? 0 : volume}
                  onChange={(e) => {
                    setVolume(Number(e.target.value));
                    setMuted(false);
                  }}
                  className="hidden sm:block w-20"
                  style={{ accentColor: 'var(--gold)' }}
                  aria-label={intl.formatMessage({ id: 'audioPlayer.volume' })}
                />
              </div>

              {/* Transport */}
              <div className="flex items-center gap-2 sm:gap-4">
                <button
                  type="button"
                  onClick={goPrev}
                  disabled={currentIndex === 0}
                  aria-label={intl.formatMessage({ id: 'audioPlayer.prevVerse' })}
                  className="p-2 rounded-full text-[#d6cfbf] hover:text-[#e3c989] hover:bg-gold/10 transition-colors disabled:opacity-40 disabled:pointer-events-none"
                >
                  <SkipBackIcon className="w-5 h-5" />
                </button>

                <button
                  type="button"
                  onClick={toggle}
                  aria-label={
                    isPlaying
                      ? intl.formatMessage({ id: 'audioPlayer.pauseRecitation' })
                      : intl.formatMessage({ id: 'audioPlayer.playRecitation' })
                  }
                  className="relative w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-br from-gold-light via-gold to-gold-dark text-[#1a1814] shadow-soft transition-all duration-300 hover:scale-105 active:scale-95"
                >
                  {isBuffering ? (
                    <span className="w-5 h-5 border-2 border-[#1a1814]/30 border-t-[#1a1814] rounded-full animate-spin" />
                  ) : isPlaying ? (
                    <PauseIcon className="w-6 h-6" />
                  ) : (
                    <PlayIcon className="w-6 h-6 ml-0.5" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={goNext}
                  disabled={currentIndex >= total - 1}
                  aria-label={intl.formatMessage({ id: 'audioPlayer.nextVerse' })}
                  className="p-2 rounded-full text-[#d6cfbf] hover:text-[#e3c989] hover:bg-gold/10 transition-colors disabled:opacity-40 disabled:pointer-events-none"
                >
                  <SkipForwardIcon className="w-5 h-5" />
                </button>
              </div>

              {/* Repeat status + close */}
              <div className="flex items-center gap-1 sm:gap-2 shrink-0 justify-end">
                {repeatMode === 'verse' && (repeatCount > 1 || repeatCount === 0) && (
                  <span className="hidden md:inline text-[10px] text-[#e3c989] tabular-nums">
                    {intl.formatMessage(
                      { id: 'audioPlayer.repeatStatus' },
                      {
                        current: currentIndex + 1,
                        display: repeatCount === 0 ? '∞' : verseRepeatDisplay,
                        count: repeatCount === 0 ? '∞' : repeatCount,
                      }
                    )}
                  </span>
                )}
                {repeatMode === 'range' && (
                  <span className="hidden md:inline text-[10px] text-[#e3c989] tabular-nums">
                    1–{total} · {rangeLoopDisplay}x
                  </span>
                )}
                <button
                  type="button"
                  onClick={close}
                  aria-label={intl.formatMessage({ id: 'audioPlayer.close' })}
                  className="p-2 rounded-full text-[#d6cfbf] hover:text-[#e3c989] hover:bg-gold/10 transition-colors"
                >
                  <CloseIcon className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <p className="mt-1.5 text-[11px] text-[#d9967c] text-center" role="alert">
                <span aria-hidden="true">⚠ </span>
                {error}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
