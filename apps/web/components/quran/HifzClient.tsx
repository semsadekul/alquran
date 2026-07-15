'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useHifzPlayback } from './useHifzPlayback';
import type { ReaderAyah, ReaderSurah } from './types';

export function HifzClient({
  surahs,
  initialSurahNumber,
  initialVerses
}: {
  surahs: ReaderSurah[];
  initialSurahNumber: number;
  initialVerses: ReaderAyah[];
}) {
  const router = useRouter();
  const [startAyah, setStartAyah] = useState(1);
  const [endAyah, setEndAyah] = useState(Math.min(initialVerses.length, 7));
  const [verseRepeats, setVerseRepeats] = useState(1);
  const [loopRepeats, setLoopRepeats] = useState<number | 'infinite'>(1);
  const [delay, setDelay] = useState<number | 'auto'>(0);
  const [hideArabic, setHideArabic] = useState(false);
  const [hideTranslit, setHideTranslit] = useState(false);
  const [hideBanglaPron, setHideBanglaPron] = useState(false);
  const [hideBangla, setHideBangla] = useState(false);
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});

  const playback = useHifzPlayback();
  const currentSurah = useMemo(() => surahs.find(item => item.number === initialSurahNumber) ?? surahs[0], [initialSurahNumber, surahs]);
  const allVerses = initialVerses;
  const playlist = useMemo(() => allVerses.filter(v => v.ayah >= startAyah && v.ayah <= endAyah), [allVerses, endAyah, startAyah]);
  const activeKey = playback.currentAyah ? `${playback.currentAyah.surah}-${playback.currentAyah.ayah}` : null;
  const activeRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll the active verse into view while playing
  useEffect(() => {
    if (activeRef.current) {
      activeRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [activeKey]);

  const handleSurahChange = (nextSurahNumber: number) => {
    // Stop any playing audio before navigating
    playback.stop(false);
    router.push(`/quran/hifz/${nextSurahNumber}`);
  };

  const startSession = () => {
    if (!playlist.length) return;
    setRevealed({});
    playback.start({ playlist, verseRepeats, loopRepeats, delay });
  };

  const reveal = (key: string) => setRevealed(prev => ({ ...prev, [key]: true }));

  return (
    <>
      <div className="hifz-layout-web">
        <div className="hifz-panel-web">
          <div className="hifz-card-web">
            <h3>Loop & Memorization Settings</h3>
            <div className="hifz-form-grid-web">
              <label>
                <span>Select Surah</span>
                <select
                  value={initialSurahNumber}
                  onChange={(e) => handleSurahChange(Number(e.target.value))}
                >
                  {surahs.map(surah => (
                    <option key={surah.number} value={surah.number}>{surah.number}. {surah.englishName}</option>
                  ))}
                </select>
              </label>
              <label>
                <span>Delay Between Verses</span>
                <select value={String(delay)} onChange={(e) => setDelay(e.target.value === 'auto' ? 'auto' : Number(e.target.value))}>
                  <option value="0">No delay</option>
                  <option value="1">1 second</option>
                  <option value="2">2 seconds</option>
                  <option value="3">3 seconds</option>
                  <option value="5">5 seconds</option>
                  <option value="auto">Equal to verse length</option>
                </select>
              </label>
              <label>
                <span>Start Ayah</span>
                <input type="number" min={1} max={currentSurah.numberOfAyahs} value={startAyah} onChange={(e) => setStartAyah(Number(e.target.value))} />
              </label>
              <label>
                <span>End Ayah</span>
                <input type="number" min={1} max={currentSurah.numberOfAyahs} value={endAyah} onChange={(e) => setEndAyah(Number(e.target.value))} />
              </label>
              <label>
                <span>Repeat Each Verse</span>
                <select value={verseRepeats} onChange={(e) => setVerseRepeats(Number(e.target.value))}>
                  {[1, 2, 3, 5, 10, 20].map(value => <option key={value} value={value}>{value} time{value > 1 ? 's' : ''}</option>)}
                </select>
              </label>
              <label>
                <span>Repeat Range Loop</span>
                <select value={String(loopRepeats)} onChange={(e) => setLoopRepeats(e.target.value === 'infinite' ? 'infinite' : Number(e.target.value))}>
                  {[1, 2, 3, 5, 10].map(value => <option key={value} value={value}>{value} loop{value > 1 ? 's' : ''}</option>)}
                  <option value="infinite">Infinite loops</option>
                </select>
              </label>
            </div>
            <button className="reader-action-btn" onClick={startSession}>▶ Start Hifz Loop</button>
          </div>

          <div className="hifz-card-web">
            <h3>{playback.state.completed ? 'Hifz Loop Completed' : 'Player Status'}</h3>
            <p className="hifz-status-copy-web">
              {playback.state.completed
                ? 'Barakallah! Range successfully memorized.'
                : playback.currentAyah
                ? `Ayah ${playback.currentAyah.ayah} in range ${startAyah}-${endAyah}`
                : 'Setup a range and press start.'}
            </p>
            <div className="hifz-status-grid-web">
              <div><strong>{playback.currentAyah ? playback.currentAyah.ayah : '-'}</strong><small>Active Ayah</small></div>
              <div><strong>{playback.state.currentRepeatCount} / {playback.state.verseRepeatsLimit}</strong><small>Verse Repeat</small></div>
              <div><strong>{playback.state.currentLoopCount} / {String(playback.state.loopRepeatsLimit)}</strong><small>Range Loop</small></div>
            </div>
            <div className="hifz-actions-web">
              <button className="reader-action-btn secondary" onClick={() => playback.togglePauseResume()} disabled={!playback.state.isPlaying && !playback.state.isPaused}>
                {playback.state.isPaused ? 'Resume' : 'Pause'}
              </button>
              <button className="reader-action-btn secondary" onClick={() => playback.stop(false)} disabled={!playback.state.isPlaying && !playback.state.isPaused}>
                Stop
              </button>
            </div>
            {playback.state.errorMessage && <p className="reader-audio-error">{playback.state.errorMessage}</p>}
          </div>
        </div>

        <div className="hifz-card-web">
          <h3>Active Recall Memorization Toggles</h3>
          <div className="hifz-toggle-grid-web">
            <label><input type="checkbox" checked={hideArabic} onChange={(e) => setHideArabic(e.target.checked)} /> Hide Arabic</label>
            <label><input type="checkbox" checked={hideTranslit} onChange={(e) => setHideTranslit(e.target.checked)} /> Hide English Pronunciation</label>
            <label><input type="checkbox" checked={hideBanglaPron} onChange={(e) => setHideBanglaPron(e.target.checked)} /> Hide Bangla Pronunciation</label>
            <label><input type="checkbox" checked={hideBangla} onChange={(e) => setHideBangla(e.target.checked)} /> Hide Bangla Meaning</label>
          </div>
        </div>

        <div className="verses-container hifz-verses-web">
          {playlist.map(verse => {
            const key = `${verse.surah}-${verse.ayah}`;
            const isActive = activeKey === key;
            return (
              <article
                className={`verse-card ${isActive ? 'hifz-active-web' : ''}`}
                key={key}
                ref={isActive ? activeRef : undefined}
              >
                <div className="verse-badge">{verse.surah}:{verse.ayah}</div>
                <RevealBlock hidden={hideArabic} revealed={revealed[`${key}-ar`] ?? false} onReveal={() => reveal(`${key}-ar`)} label="Arabic">
                  <div className="verse-arabic">{verse.arabic}</div>
                </RevealBlock>
                <RevealBlock hidden={hideTranslit} revealed={revealed[`${key}-translit`] ?? false} onReveal={() => reveal(`${key}-translit`)} label="English Pronunciation">
                  <div className="verse-transliteration"><span className="translation-label">English Pronunciation</span><p>{verse.transliteration}</p></div>
                </RevealBlock>
                <RevealBlock hidden={hideBanglaPron} revealed={revealed[`${key}-bnpron`] ?? false} onReveal={() => reveal(`${key}-bnpron`)} label="Bangla Pronunciation">
                  {verse.banglaTransliteration ? <div className="verse-transliteration"><span className="translation-label">Bangla Pronunciation</span><p>{verse.banglaTransliteration}</p></div> : null}
                </RevealBlock>
                <RevealBlock hidden={hideBangla} revealed={revealed[`${key}-bn`] ?? false} onReveal={() => reveal(`${key}-bn`)} label="Bangla Meaning">
                  <div className="verse-translation"><span className="translation-label">Bangla Meaning</span><p>{verse.bangla}</p></div>
                </RevealBlock>
              </article>
            );
          })}
        </div>
      </div>

      {/* Hifz Audio Dock — pinned to viewport */}
      <HifzDock playback={playback} surahName={currentSurah.englishName} />

      <style jsx>{`
        .hifz-layout-web {
          display: flex;
          flex-direction: column;
          gap: 24px;
          max-width: 1000px;
          margin: 0 auto;
          padding: 24px 0;
        }

        .hifz-panel-web {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 24px;
        }

        .hifz-card-web {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 20px;
          box-shadow: var(--shadow-card);
        }

        .hifz-card-web h3 {
          font-size: 1.1rem;
          font-weight: 600;
          color: var(--text-1);
          margin-bottom: 4px;
        }

        .hifz-form-grid-web {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        @media (max-width: 600px) {
          .hifz-form-grid-web {
            grid-template-columns: 1fr;
          }
        }

        .hifz-form-grid-web label {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .hifz-form-grid-web span {
          font-size: 0.85rem;
          color: var(--text-3);
          font-weight: 500;
        }

        .hifz-form-grid-web select,
        .hifz-form-grid-web input {
          background: var(--bg);
          border: 1px solid var(--border);
          color: var(--text-1);
          padding: 10px 12px;
          border-radius: var(--radius-sm);
          font-size: 0.95rem;
          outline: none;
          transition: border-color var(--duration-fast);
        }

        .hifz-form-grid-web select:focus,
        .hifz-form-grid-web input:focus {
          border-color: var(--border-focus);
        }

        .hifz-status-copy-web {
          font-size: 0.95rem;
          color: var(--text-2);
          background: var(--surface-muted);
          padding: 12px 16px;
          border-radius: var(--radius-md);
          border-left: 3px solid var(--accent);
        }

        .hifz-status-grid-web {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          margin-top: 8px;
        }

        .hifz-status-grid-web div {
          background: var(--bg);
          border: 1px solid var(--border);
          padding: 16px 12px;
          border-radius: var(--radius-md);
          text-align: center;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .hifz-status-grid-web strong {
          font-size: 1.5rem;
          color: var(--text-1);
          line-height: 1;
        }

        .hifz-status-grid-web small {
          font-size: 0.75rem;
          color: var(--text-3);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .hifz-actions-web {
          display: flex;
          gap: 12px;
          margin-top: auto;
        }

        .hifz-toggle-grid-web {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
        }

        .hifz-toggle-grid-web label {
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
          font-size: 0.95rem;
          color: var(--text-2);
          background: var(--bg);
          border: 1px solid var(--border);
          padding: 12px 16px;
          border-radius: var(--radius-md);
          transition: all var(--duration-fast);
          user-select: none;
        }

        .hifz-toggle-grid-web label:hover {
          border-color: var(--border-focus);
          background: var(--surface-hover);
        }

        .hifz-toggle-grid-web input[type="checkbox"] {
          appearance: none;
          width: 20px;
          height: 20px;
          border: 2px solid var(--border);
          border-radius: 4px;
          background: var(--surface);
          position: relative;
          cursor: pointer;
        }

        .hifz-toggle-grid-web input[type="checkbox"]:checked {
          background: var(--accent);
          border-color: var(--accent);
        }

        .hifz-toggle-grid-web input[type="checkbox"]:checked::after {
          content: '✓';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          color: white;
          font-size: 12px;
          font-weight: bold;
        }

        .hifz-verses-web {
          display: flex;
          flex-direction: column;
          gap: 24px;
          margin-top: 16px;
          padding-bottom: 120px; /* space for dock */
        }

        .hifz-active-web {
          background: var(--active-verse-bg) !important;
          border-color: var(--active-verse-border) !important;
        }
      `}</style>
    </>
  );
}

/* ─── Hifz Dock: fixed-position bar showing what's currently playing ─── */
function HifzDock({
  playback,
  surahName,
}: {
  playback: ReturnType<typeof useHifzPlayback>;
  surahName: string;
}) {
  const { state, currentAyah } = playback;
  if (!currentAyah || (!state.isPlaying && !state.isPaused)) return null;

  const verseRef = `${currentAyah.surah}:${currentAyah.ayah}`;

  return (
    <div className="hifz-dock" role="region" aria-label="Hifz audio player">
      <div className="hifz-dock-now-playing">
        <div className="hifz-dock-avatar" aria-hidden="true">📖</div>
        <div className="hifz-dock-meta">
          <span className="hifz-dock-kicker">Hifz Mode</span>
          <h5 title={surahName}>{surahName}</h5>
          <p>Ayah {verseRef} — Repeat {state.currentRepeatCount}/{state.verseRepeatsLimit}</p>
        </div>
      </div>
      <div className="hifz-dock-controls">
        <button
          className="audio-btn-web play-pause-btn-web"
          onClick={playback.togglePauseResume}
          aria-label={state.isPaused ? 'Resume' : 'Pause'}
          title={state.isPaused ? 'Resume' : 'Pause'}
        >
          {state.isPaused ? '▶' : '❚❚'}
        </button>
        <button
          className="audio-btn-web"
          onClick={() => playback.stop(false)}
          aria-label="Stop Hifz"
          title="Stop"
        >
          ■
        </button>
      </div>

      <style jsx>{`
        .hifz-dock {
          position: fixed;
          bottom: 24px;
          left: 50%;
          transform: translateX(-50%);
          width: 90%;
          max-width: 600px;
          background: var(--glass);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-full);
          padding: 12px 16px 12px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          box-shadow: var(--shadow-elevated), var(--shadow-glow);
          z-index: 100;
          gap: 16px;
        }

        .hifz-dock-now-playing {
          display: flex;
          align-items: center;
          gap: 16px;
          min-width: 0;
          flex: 1;
        }

        .hifz-dock-avatar {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: var(--accent-subtle);
          color: var(--accent);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
          flex-shrink: 0;
        }

        .hifz-dock-meta {
          display: flex;
          flex-direction: column;
          min-width: 0;
        }

        .hifz-dock-kicker {
          font-size: 0.7rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--accent);
          font-weight: 600;
          margin-bottom: 2px;
        }

        .hifz-dock-meta h5 {
          font-size: 1rem;
          font-weight: 600;
          color: var(--text-1);
          margin: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .hifz-dock-meta p {
          font-size: 0.85rem;
          color: var(--text-3);
          margin: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .hifz-dock-controls {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-shrink: 0;
        }

        .audio-btn-web {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: var(--surface-muted);
          border: 1px solid var(--border);
          color: var(--text-1);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all var(--duration-fast);
        }

        .audio-btn-web:hover {
          background: var(--surface-hover);
          border-color: var(--text-3);
        }

        .play-pause-btn-web {
          width: 48px;
          height: 48px;
          background: var(--text-1);
          color: var(--bg);
          border: none;
          font-size: 1.2rem;
        }

        .play-pause-btn-web:hover {
          background: var(--text-2);
          transform: scale(1.05);
        }
      `}</style>
    </div>
  );
}

function RevealBlock({ hidden, revealed, onReveal, label, children }: { hidden: boolean; revealed: boolean; onReveal: () => void; label: string; children: React.ReactNode; }) {
  if (!hidden) return <>{children}</>;
  return (
    <div className="hifz-reveal-shell-web">
      <div style={{ visibility: revealed ? 'visible' : 'hidden' }}>{children}</div>
      {!revealed && <button className="hifz-reveal-overlay-web" onClick={onReveal}>Tap to Reveal {label}</button>}

      <style jsx>{`
        .hifz-reveal-shell-web {
          position: relative;
          min-height: 48px;
          border-radius: var(--radius-md);
          overflow: hidden;
          margin-top: 12px;
        }
        
        .hifz-reveal-overlay-web {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          background: var(--surface-muted);
          backdrop-filter: blur(4px);
          border: 1px dashed var(--border);
          color: var(--text-3);
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all var(--duration-fast);
          z-index: 10;
        }

        .hifz-reveal-overlay-web:hover {
          background: var(--surface-hover);
          color: var(--text-2);
          border-color: var(--border-focus);
        }
      `}</style>
    </div>
  );
}
