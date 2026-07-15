'use client';

import { formatAudioTime, RECITERS } from './audio-utils';
import type { ReaderSurah } from './types';
import type { ReaderPlaybackApi } from './useAudioPlayback';

export function AudioDock({
  playback,
  currentSurah,
}: {
  playback: ReaderPlaybackApi;
  currentSurah: ReaderSurah | null;
}) {
  const { state, currentAyah } = playback;
  if (!currentAyah) return null;

  const progress = state.duration > 0 ? (state.currentTime / state.duration) * 100 : 0;
  const title = currentSurah?.englishName ?? `Surah ${currentAyah.surah}`;
  const verseRef = `${currentAyah.surah}:${currentAyah.ayah}`;

  return (
    <div className="audio-player-bar-web active" role="region" aria-label="Audio player">
      {/* Now Playing Info */}
      <div className="audio-now-playing-web">
        <div className="audio-avatar-web" aria-hidden="true">🎧</div>
        <div className="audio-meta-web">
          <span className="audio-kicker-web">Now Playing</span>
          <h5 title={title}>{title}</h5>
          <p>Verse {verseRef}</p>
        </div>
      </div>

      {/* Controls + Progress */}
      <div className="audio-center-stack-web">
        <div className="audio-buttons-web">
          <button
            className="audio-btn-web"
            onClick={playback.playPrev}
            disabled={state.currentIndex <= 0}
            aria-label="Previous verse"
            title="Previous verse"
          >
            ◀◀
          </button>
          <button
            className="audio-btn-web play-pause-btn-web"
            onClick={playback.togglePlayPause}
            aria-label={state.isPlaying ? 'Pause' : 'Play'}
            title={state.isPlaying ? 'Pause' : 'Play'}
          >
            {state.isPlaying ? '❚❚' : '▶'}
          </button>
          <button
            className="audio-btn-web"
            onClick={playback.stop}
            aria-label="Stop playback"
            title="Stop"
          >
            ■
          </button>
          <button
            className="audio-btn-web"
            onClick={playback.playNext}
            disabled={state.currentIndex >= state.playlist.length - 1}
            aria-label="Next verse"
            title="Next verse"
          >
            ▶▶
          </button>
        </div>

        <div className="audio-progress-container-web">
          <span className="audio-time-web">{formatAudioTime(state.currentTime)}</span>
          <div
            className="audio-progress-bar-web"
            role="slider"
            aria-label="Playback position"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(progress)}
            tabIndex={0}
            onClick={(event) => {
              const rect = event.currentTarget.getBoundingClientRect();
              const percentage = (event.clientX - rect.left) / rect.width;
              playback.seek(percentage);
            }}
            onKeyDown={(event) => {
              if (event.key === 'ArrowRight') playback.seek((state.currentTime + 5) / state.duration);
              if (event.key === 'ArrowLeft') playback.seek((state.currentTime - 5) / state.duration);
            }}
          >
            <div className="audio-progress-fill-web" style={{ width: `${progress}%` }} />
          </div>
          <span className="audio-time-web">{formatAudioTime(state.duration)}</span>
        </div>
      </div>

      {/* Settings */}
      <div className="audio-settings-web">
        <select 
          value={state.reciterId} 
          onChange={e => playback.setReciter(e.target.value)}
          className="audio-select-web"
          aria-label="Reciter"
        >
          {RECITERS.map(r => (
            <option key={r.id} value={r.id}>{r.name}</option>
          ))}
        </select>
        
        <select
          value={state.playbackRate}
          onChange={e => playback.setPlaybackRate(Number(e.target.value))}
          className="audio-select-web"
          aria-label="Speed"
        >
          <option value={1}>1x</option>
          <option value={1.25}>1.25x</option>
          <option value={1.5}>1.5x</option>
        </select>

        <div className="audio-volume-controls-web">
          <span className="volume-label-web">Vol</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={state.volume}
            aria-label="Volume"
            onChange={(event) => playback.setVolume(Number(event.target.value))}
          />
        </div>
      </div>
    </div>
  );
}
