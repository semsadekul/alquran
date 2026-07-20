'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useHifzPlayback } from './useHifzPlayback';
import type { ReaderAyah, ReaderSurah } from './types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Toggle } from '@/components/ui/Toggle';
import { IconButton } from '@/components/ui/IconButton';
import { cn } from '@/lib/cn';

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

  const selectClasses = cn(
    'bg-[var(--bg)] border border-line text-ink rounded-[var(--radius-sm)]',
    'px-3 py-2.5 text-[0.95rem] min-h-[44px] outline-none',
    'transition-colors duration-[var(--duration-fast)]',
    'focus:border-[var(--border-focus)]'
  );

  const inputClasses = cn(
    'bg-[var(--bg)] border border-line text-ink rounded-[var(--radius-sm)]',
    'px-3 py-2.5 text-[0.95rem] min-h-[44px] outline-none',
    'transition-colors duration-[var(--duration-fast)]',
    'focus:border-[var(--border-focus)]'
  );

  return (
    <>
      <div className="flex flex-col gap-6 max-w-[1000px] mx-auto px-4 py-6">
        {/* Settings and Status panels */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Settings Card */}
          <Card>
            <h3 className="text-[1.1rem] font-semibold text-ink mb-1">Loop &amp; Memorization Settings</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="flex flex-col gap-2">
                <span className="text-[0.85rem] text-ink-3 font-medium">Select Surah</span>
                <select
                  value={initialSurahNumber}
                  onChange={(e) => handleSurahChange(Number(e.target.value))}
                  className={selectClasses}
                >
                  {surahs.map(surah => (
                    <option key={surah.number} value={surah.number}>{surah.number}. {surah.englishName}</option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-[0.85rem] text-ink-3 font-medium">Delay Between Verses</span>
                <select
                  value={String(delay)}
                  onChange={(e) => setDelay(e.target.value === 'auto' ? 'auto' : Number(e.target.value))}
                  className={selectClasses}
                >
                  <option value="0">No delay</option>
                  <option value="1">1 second</option>
                  <option value="2">2 seconds</option>
                  <option value="3">3 seconds</option>
                  <option value="5">5 seconds</option>
                  <option value="auto">Equal to verse length</option>
                </select>
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-[0.85rem] text-ink-3 font-medium">Start Ayah</span>
                <input
                  type="number"
                  min={1}
                  max={currentSurah.numberOfAyahs}
                  value={startAyah}
                  onChange={(e) => setStartAyah(Number(e.target.value))}
                  className={inputClasses}
                />
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-[0.85rem] text-ink-3 font-medium">End Ayah</span>
                <input
                  type="number"
                  min={1}
                  max={currentSurah.numberOfAyahs}
                  value={endAyah}
                  onChange={(e) => setEndAyah(Number(e.target.value))}
                  className={inputClasses}
                />
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-[0.85rem] text-ink-3 font-medium">Repeat Each Verse</span>
                <select
                  value={verseRepeats}
                  onChange={(e) => setVerseRepeats(Number(e.target.value))}
                  className={selectClasses}
                >
                  {[1, 2, 3, 5, 10, 20].map(value => <option key={value} value={value}>{value} time{value > 1 ? 's' : ''}</option>)}
                </select>
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-[0.85rem] text-ink-3 font-medium">Repeat Range Loop</span>
                <select
                  value={String(loopRepeats)}
                  onChange={(e) => setLoopRepeats(e.target.value === 'infinite' ? 'infinite' : Number(e.target.value))}
                  className={selectClasses}
                >
                  {[1, 2, 3, 5, 10].map(value => <option key={value} value={value}>{value} loop{value > 1 ? 's' : ''}</option>)}
                  <option value="infinite">Infinite loops</option>
                </select>
              </label>
            </div>
            <Button variant="gold" onClick={startSession} className="mt-2">
              Start Hifz Loop
            </Button>
          </Card>

          {/* Status Card */}
          <Card>
            <h3 className="text-[1.1rem] font-semibold text-ink mb-1">
              {playback.state.completed ? 'Hifz Loop Completed' : 'Player Status'}
            </h3>
            <p className="text-[0.95rem] text-ink-2 bg-[var(--surface-muted)] px-4 py-3 rounded-[var(--radius-md)] border-l-3 border-l-accent">
              {playback.state.completed
                ? 'Barakallah! Range successfully memorized.'
                : playback.currentAyah
                ? `Ayah ${playback.currentAyah.ayah} in range ${startAyah}-${endAyah}`
                : 'Setup a range and press start.'}
            </p>
            <div className="grid grid-cols-3 gap-3 mt-2">
              <div className="bg-[var(--bg)] border border-line rounded-[var(--radius-md)] px-3 py-4 text-center flex flex-col gap-1">
                <strong className="text-2xl text-ink leading-none">{playback.currentAyah ? playback.currentAyah.ayah : '-'}</strong>
                <small className="text-[0.75rem] text-ink-3 uppercase tracking-wider">Active Ayah</small>
              </div>
              <div className="bg-[var(--bg)] border border-line rounded-[var(--radius-md)] px-3 py-4 text-center flex flex-col gap-1">
                <strong className="text-2xl text-ink leading-none">{playback.state.currentRepeatCount} / {playback.state.verseRepeatsLimit}</strong>
                <small className="text-[0.75rem] text-ink-3 uppercase tracking-wider">Verse Repeat</small>
              </div>
              <div className="bg-[var(--bg)] border border-line rounded-[var(--radius-md)] px-3 py-4 text-center flex flex-col gap-1">
                <strong className="text-2xl text-ink leading-none">{playback.state.currentLoopCount} / {String(playback.state.loopRepeatsLimit)}</strong>
                <small className="text-[0.75rem] text-ink-3 uppercase tracking-wider">Range Loop</small>
              </div>
            </div>
            <div className="flex gap-3 mt-auto">
              <Button
                variant="ghost"
                onClick={() => playback.togglePauseResume()}
                disabled={!playback.state.isPlaying && !playback.state.isPaused}
              >
                {playback.state.isPaused ? 'Resume' : 'Pause'}
              </Button>
              <Button
                variant="ghost"
                onClick={() => playback.stop(false)}
                disabled={!playback.state.isPlaying && !playback.state.isPaused}
              >
                Stop
              </Button>
            </div>
            {playback.state.errorMessage && (
              <p className="text-red-600 text-sm mt-2">{playback.state.errorMessage}</p>
            )}
          </Card>
        </div>

        {/* Active Recall Toggles Card */}
        <Card>
          <h3 className="text-[1.1rem] font-semibold text-ink mb-4">Active Recall Memorization Toggles</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 cursor-pointer select-none bg-[var(--bg)] border border-line rounded-[var(--radius-md)] px-4 py-3 transition-colors hover:border-[var(--border-focus)]">
              <Toggle checked={hideArabic} onChange={setHideArabic} label="Hide Arabic" />
              <span className="text-[0.95rem] text-ink-2">Hide Arabic</span>
            </div>
            <div className="flex items-center gap-3 cursor-pointer select-none bg-[var(--bg)] border border-line rounded-[var(--radius-md)] px-4 py-3 transition-colors hover:border-[var(--border-focus)]">
              <Toggle checked={hideTranslit} onChange={setHideTranslit} label="Hide English Pronunciation" />
              <span className="text-[0.95rem] text-ink-2">Hide English Pronunciation</span>
            </div>
            <div className="flex items-center gap-3 cursor-pointer select-none bg-[var(--bg)] border border-line rounded-[var(--radius-md)] px-4 py-3 transition-colors hover:border-[var(--border-focus)]">
              <Toggle checked={hideBanglaPron} onChange={setHideBanglaPron} label="Hide Bangla Pronunciation" />
              <span className="text-[0.95rem] text-ink-2">Hide Bangla Pronunciation</span>
            </div>
            <div className="flex items-center gap-3 cursor-pointer select-none bg-[var(--bg)] border border-line rounded-[var(--radius-md)] px-4 py-3 transition-colors hover:border-[var(--border-focus)]">
              <Toggle checked={hideBangla} onChange={setHideBangla} label="Hide Bangla Meaning" />
              <span className="text-[0.95rem] text-ink-2">Hide Bangla Meaning</span>
            </div>
          </div>
        </Card>

        {/* Verses list */}
        <div className="flex flex-col gap-6 mt-4 pb-[120px]">
          {playlist.map(verse => {
            const key = `${verse.surah}-${verse.ayah}`;
            const isActive = activeKey === key;
            return (
              <article
                className={cn(
                  'rounded-2xl px-4 py-5 md:px-8 md:py-7 transition-colors scroll-mt-20',
                  isActive
                    ? 'bg-[var(--active-verse-bg)] ring-1 ring-[var(--active-verse-border)] verse-card-active'
                    : 'hover:bg-[var(--surface-hover)]'
                )}
                key={key}
                ref={isActive ? activeRef : undefined}
              >
                <Badge tone="gold" className="mb-3">{verse.surah}:{verse.ayah}</Badge>
                <RevealBlock hidden={hideArabic} revealed={revealed[`${key}-ar`] ?? false} onReveal={() => reveal(`${key}-ar`)} label="Arabic">
                  <div dir="rtl" lang="ar" className="verse-arabic">{verse.arabic}</div>
                </RevealBlock>
                <RevealBlock hidden={hideTranslit} revealed={revealed[`${key}-translit`] ?? false} onReveal={() => reveal(`${key}-translit`)} label="English Pronunciation">
                  <div className="text-ink-3 text-sm italic leading-relaxed">
                    <span className="text-xs font-semibold uppercase tracking-wider text-ink-3 block mb-1">English Pronunciation</span>
                    <p>{verse.transliteration}</p>
                  </div>
                </RevealBlock>
                <RevealBlock hidden={hideBanglaPron} revealed={revealed[`${key}-bnpron`] ?? false} onReveal={() => reveal(`${key}-bnpron`)} label="Bangla Pronunciation">
                  {verse.banglaTransliteration ? (
                    <div className="text-ink-3 text-sm leading-relaxed">
                      <span className="text-xs font-semibold uppercase tracking-wider text-ink-3 block mb-1">Bangla Pronunciation</span>
                      <p>{verse.banglaTransliteration}</p>
                    </div>
                  ) : null}
                </RevealBlock>
                <RevealBlock hidden={hideBangla} revealed={revealed[`${key}-bn`] ?? false} onReveal={() => reveal(`${key}-bn`)} label="Bangla Meaning">
                  <div className="mb-4">
                    <span className="text-xs font-semibold uppercase tracking-wider text-ink-3 block mb-1">Bangla Meaning</span>
                    <p className="verse-bangla">{verse.bangla}</p>
                  </div>
                </RevealBlock>
              </article>
            );
          })}
        </div>
      </div>

      {/* Hifz Audio Dock — pinned to viewport */}
      <HifzDock playback={playback} surahName={currentSurah.englishName} />
    </>
  );
}

/* --- Hifz Dock: fixed-position bar showing what's currently playing --- */
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
    <div
      className={cn(
        'fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-[600px]',
        'bg-[var(--glass)] backdrop-blur-xl border border-[var(--border-subtle)]',
        'rounded-[var(--radius-full)] px-5 py-3',
        'flex items-center justify-between',
        'shadow-[var(--shadow-elevated),var(--shadow-glow)] z-50 gap-4'
      )}
      role="region"
      aria-label="Hifz audio player"
    >
      <div className="flex items-center gap-4 min-w-0 flex-1">
        <div
          className="w-12 h-12 rounded-full bg-accent-subtle text-accent flex items-center justify-center text-xl shrink-0"
          aria-hidden="true"
        >
          &#x1f4d6;
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-[0.7rem] uppercase tracking-wider text-accent font-semibold mb-0.5">Hifz Mode</span>
          <h5 className="text-[1rem] font-semibold text-ink m-0 truncate" title={surahName}>{surahName}</h5>
          <p className="text-[0.85rem] text-ink-3 m-0 truncate">
            Ayah {verseRef} &mdash; Repeat {state.currentRepeatCount}/{state.verseRepeatsLimit}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <IconButton
          onClick={playback.togglePauseResume}
          ariaLabel={state.isPaused ? 'Resume' : 'Pause'}
          className="w-12 h-12 bg-ink text-[var(--bg)] hover:bg-ink-2 border-0 text-xl"
        >
          {state.isPaused ? '\u25b6' : '\u275a\u275a'}
        </IconButton>
        <IconButton
          onClick={() => playback.stop(false)}
          ariaLabel="Stop Hifz"
          className="w-10 h-10"
        >
          &#x25a0;
        </IconButton>
      </div>
    </div>
  );
}

function RevealBlock({
  hidden,
  revealed,
  onReveal,
  label,
  children,
}: {
  hidden: boolean;
  revealed: boolean;
  onReveal: () => void;
  label: string;
  children: React.ReactNode;
}) {
  if (!hidden) return <>{children}</>;
  return (
    <div className="relative min-h-[48px] rounded-[var(--radius-md)] overflow-hidden mt-3">
      <div style={{ visibility: revealed ? 'visible' : 'hidden' }}>{children}</div>
      {!revealed && (
        <button
          className={cn(
            'absolute inset-0 w-full h-full min-h-[44px]',
            'bg-[var(--surface-muted)] backdrop-blur-sm border border-dashed border-line',
            'text-ink-3 text-[0.9rem] font-medium cursor-pointer',
            'flex items-center justify-center',
            'transition-all duration-[var(--duration-fast)]',
            'hover:bg-[var(--surface-hover)] hover:text-ink-2 hover:border-[var(--border-focus)]',
            'z-10'
          )}
          onClick={onReveal}
        >
          Tap to Reveal {label}
        </button>
      )}
    </div>
  );
}
