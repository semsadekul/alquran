'use client';

import { formatAudioTime, RECITERS } from './audio-utils';
import type { ReaderSurah } from './types';
import type { ReaderPlaybackApi } from './useAudioPlayback';
import { Play, Pause, Square, SkipBack, SkipForward, Volume2 } from 'lucide-react';
import { IconButton } from '@/components/ui/IconButton';
import { cn } from '@/lib/cn';

export function AudioDock({
  playback,
  currentSurah,
}: {
  playback: ReaderPlaybackApi;
  currentSurah: ReaderSurah | null;
}) {
  const { state, currentAyah } = playback;
  if (!currentAyah) return null;

  const progress =
    state.duration > 0 ? (state.currentTime / state.duration) * 100 : 0;
  const title = currentSurah?.englishName ?? `Surah ${currentAyah.surah}`;
  const verseRef = `${currentAyah.surah}:${currentAyah.ayah}`;

  return (
    <div
      className={cn(
        'fixed left-2 right-2 md:left-auto md:right-4 z-40',
        'bottom-[calc(64px+env(safe-area-inset-bottom))] md:bottom-4',
        'max-w-3xl mx-auto',
        'bg-[var(--glass)] backdrop-blur-xl border border-[var(--glass-border)]',
        'rounded-2xl shadow-[var(--shadow-elevated)]',
        'p-3 md:p-4',
      )}
      role="region"
      aria-label="Audio player"
      aria-live="polite"
    >
      {/* Top: Now playing + controls */}
      <div className="flex items-center gap-3 mb-2">
        {/* Avatar */}
        <div className="w-10 h-10 rounded-xl bg-accent-subtle flex items-center justify-center shrink-0">
          <Volume2 size={18} className="text-accent" />
        </div>

        {/* Meta */}
        <div className="min-w-0 flex-1">
          <p className="text-[10px] uppercase tracking-wider text-ink-4 font-medium">
            Now Playing
          </p>
          <h5 className="text-sm font-semibold text-ink truncate">{title}</h5>
          <p className="text-xs text-ink-3">Verse {verseRef}</p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1">
          <IconButton
            ariaLabel="Previous verse"
            onClick={playback.playPrev}
            disabled={state.currentIndex <= 0}
          >
            <SkipBack size={16} />
          </IconButton>
          <IconButton
            ariaLabel={state.isPlaying ? 'Pause' : 'Play'}
            onClick={playback.togglePlayPause}
            className="bg-accent text-white hover:bg-accent-hover"
          >
            {state.isPlaying ? <Pause size={18} /> : <Play size={18} />}
          </IconButton>
          <IconButton ariaLabel="Stop" onClick={playback.stop}>
            <Square size={14} />
          </IconButton>
          <IconButton
            ariaLabel="Next verse"
            onClick={playback.playNext}
            disabled={state.currentIndex >= state.playlist.length - 1}
          >
            <SkipForward size={16} />
          </IconButton>
        </div>
      </div>

      {/* Progress bar */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-ink-4 tabular-nums w-10 text-right">
          {formatAudioTime(state.currentTime)}
        </span>
        <div
          className="flex-1 h-1.5 bg-[var(--border)] rounded-full overflow-hidden cursor-pointer"
          role="slider"
          aria-label="Playback position"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress)}
          tabIndex={0}
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const pct = (e.clientX - rect.left) / rect.width;
            playback.seek(pct);
          }}
          onKeyDown={(e) => {
            if (e.key === 'ArrowRight')
              playback.seek((state.currentTime + 5) / state.duration);
            if (e.key === 'ArrowLeft')
              playback.seek((state.currentTime - 5) / state.duration);
          }}
        >
          <div
            className="h-full bg-gradient-to-r from-majestic-gold-dark to-majestic-gold rounded-full transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-[10px] text-ink-4 tabular-nums w-10">
          {formatAudioTime(state.duration)}
        </span>
      </div>

      {/* Bottom: reciter + speed + volume */}
      <div className="flex items-center gap-2 mt-2 flex-wrap">
        <select
          value={state.reciterId}
          onChange={(e) => playback.setReciter(e.target.value)}
          className="text-xs bg-[var(--surface-muted)] text-ink-2 border border-line rounded-lg px-2 py-1 min-h-[32px] focus:outline-none focus:ring-1 focus:ring-[var(--border-focus)]"
          aria-label="Reciter"
        >
          {RECITERS.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>

        <select
          value={state.playbackRate}
          onChange={(e) => playback.setPlaybackRate(Number(e.target.value))}
          className="text-xs bg-[var(--surface-muted)] text-ink-2 border border-line rounded-lg px-2 py-1 min-h-[32px] focus:outline-none focus:ring-1 focus:ring-[var(--border-focus)]"
          aria-label="Speed"
        >
          <option value={1}>1x</option>
          <option value={1.25}>1.25x</option>
          <option value={1.5}>1.5x</option>
        </select>

        <div className="flex items-center gap-1 ml-auto">
          <Volume2 size={14} className="text-ink-4" />
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={state.volume}
            aria-label="Volume"
            onChange={(e) => playback.setVolume(Number(e.target.value))}
            className="w-16 accent-majestic-gold"
          />
        </div>
      </div>
    </div>
  );
}
