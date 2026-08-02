'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Equalizer } from '@/components/ui/Equalizer';
import { usePlayer } from '@/components/quran/player-context';
import { getSurahs, getGlobalAyahNumber } from '@/lib/data/quran';
import {
  RECITERS,
  DEFAULT_RECITER_ID,
  DEFAULT_PLAYBACK_RATE,
  PLAYBACK_RATES,
  getAyahAudioUrl,
} from '@/lib/audio';
import {
  PlayIcon,
  PauseIcon,
  SettingsIcon,
  EyeIcon,
  EyeOffIcon,
  CheckIcon,
} from '@/components/ui/Icon';

// ─── Types ───────────────────────────────────────────────────────────

interface PracticeConfig {
  surahNumber: number;
  startAyah: number;
  endAyah: number;
  repeatEachVerse: number;
  delayBetweenVerses: number;
  repeatRangeLoops: number;
  hideTranslation: boolean;
  reciterId: string;
  playbackRate: number;
}

interface AyahMastery {
  mastered: boolean;
  practiceCount: number;
  lastPracticed: number;
}

interface VerseData {
  number: number;
  arabic: string;
  bangla: string;
  english: string;
  transliteration?: string;
  banglaTransliteration?: string;
}

type PracticePhase = 'setup' | 'playing' | 'paused' | 'completed';

// ─── LocalStorage helpers ────────────────────────────────────────────

const STORAGE_KEY = 'alquran_hifz_practice_config';
const MASTERY_KEY = 'alquran_hifz_ayah_progress';

const defaultConfig: PracticeConfig = {
  surahNumber: 1,
  startAyah: 1,
  endAyah: 7,
  repeatEachVerse: 3,
  delayBetweenVerses: 0,
  repeatRangeLoops: 1,
  hideTranslation: false,
  reciterId: DEFAULT_RECITER_ID,
  playbackRate: DEFAULT_PLAYBACK_RATE,
};

function getPracticeConfig(): PracticeConfig {
  if (typeof window === 'undefined') return defaultConfig;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? { ...defaultConfig, ...JSON.parse(stored) } : defaultConfig;
  } catch {
    return defaultConfig;
  }
}

function savePracticeConfig(config: PracticeConfig) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

function getAyahMastery(): Record<string, AyahMastery> {
  if (typeof window === 'undefined') return {};
  try {
    const stored = localStorage.getItem(MASTERY_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

function updateAyahMastery(surahNum: number, ayahNum: number, count: number) {
  if (typeof window === 'undefined') return;
  const key = `${surahNum}:${ayahNum}`;
  const all = getAyahMastery();
  const existing = all[key] || { mastered: false, practiceCount: 0, lastPracticed: 0 };
  all[key] = {
    ...existing,
    practiceCount: existing.practiceCount + count,
    lastPracticed: Date.now(),
    mastered: existing.practiceCount + count >= 15,
  };
  localStorage.setItem(MASTERY_KEY, JSON.stringify(all));
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ─── Session component ───────────────────────────────────────────────

export default function HifzSession() {
  const intl = useIntl();
  // Pause the global reader player while a focused session is running.
  const { open: globalPlayerOpen, close: closeGlobalPlayer } = usePlayer();
  const [mounted, setMounted] = useState(false);
  const [config, setConfig] = useState<PracticeConfig>(defaultConfig);
  const [phase, setPhase] = useState<PracticePhase>('setup');
  const [verseRepeatCounter, setVerseRepeatCounter] = useState(0);
  const [rangeLoopCounter, setRangeLoopCounter] = useState(0);
  const [currentAyahInSurah, setCurrentAyahInSurah] = useState(1);
  const [surahVerses, setSurahVerses] = useState<VerseData[]>([]);
  const [loading, setLoading] = useState(false);
  const [audioRate, setAudioRate] = useState(DEFAULT_PLAYBACK_RATE);
  const [selectedReciter, setSelectedReciter] = useState(DEFAULT_RECITER_ID);
  const [mastery, setMastery] = useState<Record<string, AyahMastery>>({});
  const runningRef = useRef(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const surahs = getSurahs();
  const selectedSurah = surahs.find((s) => s.number === config.surahNumber);
  const practiceAyahs = Array.from(
    { length: config.endAyah - config.startAyah + 1 },
    (_, i) => config.startAyah + i
  );

  useEffect(() => {
    setMounted(true);
    setMastery(getAyahMastery());
    const loaded = getPracticeConfig();
    setConfig(loaded);
    setSelectedReciter(loaded.reciterId);
    setAudioRate(loaded.playbackRate);
  }, []);

  const updateConfig = useCallback(
    (patch: Partial<PracticeConfig>) => {
      setConfig((prev) => {
        const next = { ...prev, ...patch };
        // Validate end >= start
        if (next.endAyah < next.startAyah) next.endAyah = next.startAyah;
        if (
          next.endAyah >
          (surahs.find((s) => s.number === next.surahNumber)?.numberOfAyahs ?? 114)
        ) {
          next.endAyah =
            surahs.find((s) => s.number === next.surahNumber)?.numberOfAyahs ?? 114;
        }
        savePracticeConfig(next);
        return next;
      });
    },
    [surahs]
  );

  // Load surah verses when surah changes.
  useEffect(() => {
    if (!config.surahNumber) return;
    setLoading(true);
    (async () => {
      try {
        const res = await fetch(`/data/verses/${config.surahNumber}.json`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const payload = await res.json();
        setSurahVerses((payload?.ayahs as VerseData[]) ?? []);
      } catch {
        setSurahVerses([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [config.surahNumber]);

  // ─── Audio control ────────────────────────────────────────────────

  const getAudioForAyah = (ayahInSurah: number) => {
    const globalAyah = getGlobalAyahNumber(config.surahNumber, ayahInSurah);
    return getAyahAudioUrl(selectedReciter, globalAyah);
  };

  const playAyah = (ayahInSurah: number): Promise<void> => {
    return new Promise((resolve, reject) => {
      const audio = new Audio();
      audio.src = getAudioForAyah(ayahInSurah);
      audio.playbackRate = audioRate;
      audioRef.current = audio;
      const cleanup = () => {
        if (audioRef.current === audio) audioRef.current = null;
        audio.remove();
      };
      audio.onended = () => {
        cleanup();
        resolve();
      };
      audio.onerror = () => {
        cleanup();
        reject(new Error('Audio error'));
      };
      audio.play().catch(() => {
        cleanup();
        reject(new Error('Play failed'));
      });
    });
  };

  // Stops any in-flight ayah audio immediately so a pending playAyah()
  // promise settles right away (prevents double streams after pause/resume).
  const stopCurrentAudio = () => {
    const audio = audioRef.current;
    audioRef.current = null;
    if (audio) {
      audio.onended = null;
      audio.onerror = null;
      audio.pause();
      audio.remove();
    }
  };

  // Stop audio if the user navigates away mid-session.
  useEffect(() => {
    return () => {
      runningRef.current = false;
      stopCurrentAudio();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Practice session loop ────────────────────────────────────────

  const stopSession = useCallback(() => {
    runningRef.current = false;
    stopCurrentAudio();
    setPhase('setup');
  }, []);

  const startSession = useCallback(() => {
    if (practiceAyahs.length === 0) return;
    // Avoid two streams at once — stop the global reader player.
    if (globalPlayerOpen) closeGlobalPlayer();
    runningRef.current = true;
    setVerseRepeatCounter(0);
    setRangeLoopCounter(0);
    setCurrentAyahInSurah(config.startAyah);
    setPhase('playing');

    runLoop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.surahNumber, config.startAyah, config.endAyah]);

  const runLoop = async () => {
    let loopCount = 0;
    const maxLoops = config.repeatRangeLoops;

    while (runningRef.current && loopCount < maxLoops) {
      for (const ayahNum of practiceAyahs) {
        if (!runningRef.current) break;

        setCurrentAyahInSurah(ayahNum);
        setVerseRepeatCounter(0);

        const repeatsNeeded = config.repeatEachVerse;

        for (let r = 0; r < repeatsNeeded; r++) {
          if (!runningRef.current) break;
          setVerseRepeatCounter(r + 1);

          try {
            await playAyah(ayahNum);
          } catch {
            // Skip audio errors
          }

          // Small pause between repeats of the same verse
          if (r < repeatsNeeded - 1 && runningRef.current) {
            await delay(500);
          }
        }

        // Track mastery (live — updates the grid immediately)
        updateAyahMastery(config.surahNumber, ayahNum, 1);
        setMastery(getAyahMastery());

        // Delay between verses
        if (ayahNum < config.endAyah && runningRef.current) {
          if (config.delayBetweenVerses > 0) {
            await delay(config.delayBetweenVerses * 1000);
          } else {
            await delay(1000);
          }
        }
      }

      loopCount++;
      setRangeLoopCounter(loopCount + 1);

      // Pause between range loops
      if (loopCount < maxLoops && runningRef.current) {
        await delay(3000);
      }
    }

    // `runningRef` is only true when the loop is still active — i.e. it
    // finished all loops naturally (pause/reset flip it to false).
    if (runningRef.current) {
      setPhase('completed');
      runningRef.current = false;
    }
  };

  const handlePause = () => {
    // Kill the in-flight audio so the pending playAyah() promise resolves
    // immediately and the loop exits now (not after the ayah finishes).
    stopCurrentAudio();
    runningRef.current = false;
    setPhase('paused');
  };

  const handleResume = () => {
    runningRef.current = true;
    setPhase('playing');
    runLoop();
  };

  const handleReset = () => {
    stopCurrentAudio();
    runningRef.current = false;
    setPhase('setup');
    setVerseRepeatCounter(0);
    setRangeLoopCounter(0);
  };

  if (!mounted) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const selectClass =
    'w-full bg-surface border border-border rounded-lg px-3 py-2.5 text-text focus:outline-none focus:border-gold/50 focus:ring-2 focus:ring-gold/20';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* ─── Left Panel: Settings ─────────────────────────────────── */}
      <Card variant="elevated" className="p-6 self-start">
        <h3 className="font-semibold text-text mb-4 flex items-center gap-2">
          <SettingsIcon className="w-5 h-5 text-gold-dark" />
          {intl.formatMessage({ id: 'readerSettings.title' })}
        </h3>

        {/* Surah selector */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-text/80 mb-1.5">
            {intl.formatMessage({ id: 'nav.surah' })}
          </label>
          <select
            value={config.surahNumber}
            onChange={(e) => {
              const num = Number(e.target.value);
              const surah = surahs.find((s) => s.number === num);
              updateConfig({
                surahNumber: num,
                startAyah: 1,
                endAyah: surah?.numberOfAyahs ?? 1,
              });
            }}
            className={selectClass}
          >
            {surahs.map((s) => (
              <option key={s.number} value={s.number}>
                {s.number}. {s.englishName} — {s.name} ({s.banglaName})
              </option>
            ))}
          </select>
        </div>

        {/* Ayah range */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className="block text-sm font-medium text-text/80 mb-1.5">
              Start Ayah
            </label>
            <input
              type="number"
              min={1}
              max={selectedSurah?.numberOfAyahs ?? 114}
              value={config.startAyah}
              onChange={(e) => updateConfig({ startAyah: Number(e.target.value) })}
              className={selectClass}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text/80 mb-1.5">
              End Ayah
            </label>
            <input
              type="number"
              min={config.startAyah}
              max={selectedSurah?.numberOfAyahs ?? 114}
              value={config.endAyah}
              onChange={(e) => updateConfig({ endAyah: Number(e.target.value) })}
              className={selectClass}
            />
          </div>
        </div>

        {/* Repeat each verse */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-text/80 mb-1.5">
            Repeat Each Verse
          </label>
          <select
            value={config.repeatEachVerse}
            onChange={(e) => updateConfig({ repeatEachVerse: Number(e.target.value) })}
            className={selectClass}
          >
            {[1, 2, 3, 5, 10, 20, 50].map((n) => (
              <option key={n} value={n}>
                {n}x
              </option>
            ))}
          </select>
        </div>

        {/* Delay between verses */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-text/80 mb-1.5">
            Delay Between Verses
          </label>
          <select
            value={config.delayBetweenVerses}
            onChange={(e) => updateConfig({ delayBetweenVerses: Number(e.target.value) })}
            className={selectClass}
          >
            <option value={0}>No delay</option>
            <option value={3}>3s</option>
            <option value={5}>5s</option>
            <option value={10}>10s</option>
            <option value={15}>15s</option>
          </select>
        </div>

        {/* Range loop count */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-text/80 mb-1.5">
            Range Loop Count
          </label>
          <select
            value={config.repeatRangeLoops}
            onChange={(e) => updateConfig({ repeatRangeLoops: Number(e.target.value) })}
            className={selectClass}
          >
            {[1, 2, 3, 5, 10, 20, 50].map((n) => (
              <option key={n} value={n}>
                {n} loops
              </option>
            ))}
          </select>
        </div>

        {/* Reciter */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-text/80 mb-1.5">
            {intl.formatMessage({ id: 'audioPlayer.reciter' })}
          </label>
          <select
            value={selectedReciter}
            onChange={(e) => {
              setSelectedReciter(e.target.value);
              updateConfig({ reciterId: e.target.value });
            }}
            className={selectClass}
          >
            {RECITERS.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </div>

        {/* Playback speed */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-text/80 mb-1.5">
            {intl.formatMessage({ id: 'audioPlayer.playbackSpeed' })}
          </label>
          <select
            value={audioRate}
            onChange={(e) => {
              setAudioRate(Number(e.target.value));
              updateConfig({ playbackRate: Number(e.target.value) });
            }}
            className={selectClass}
          >
            {PLAYBACK_RATES.map((r) => (
              <option key={r} value={r}>
                {r}x
              </option>
            ))}
          </select>
        </div>

        {/* Hide translation toggle */}
        <div className="mb-6">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={config.hideTranslation}
              onChange={(e) => updateConfig({ hideTranslation: e.target.checked })}
              className="rounded border-border text-gold-dark focus:ring-gold-dark/30 w-4 h-4"
            />
            <span className="text-sm text-text">
              {config.hideTranslation ? (
                <>
                  <EyeOffIcon className="w-4 h-4 inline mr-1" />
                  Memory Test Mode — translations hidden
                </>
              ) : (
                <>
                  <EyeIcon className="w-4 h-4 inline mr-1" />
                  Hide translations for memory test
                </>
              )}
            </span>
          </label>
        </div>

        {/* Start button */}
        {phase === 'setup' && (
          <Button
            variant="primary"
            onClick={startSession}
            className="w-full bg-gradient-to-r from-gold to-gold-dark text-white hover:from-gold-dark hover:to-gold-dark"
          >
            <PlayIcon className="w-5 h-5 mr-2" />
            Start Hifz Loop
          </Button>
        )}
      </Card>

      {/* ─── Right Panel: Player Status ───────────────────────────── */}
      <div className="space-y-4">
        {/* Status Banner */}
        <Card
          variant="hero"
          className={`relative overflow-hidden p-6 ${
            phase === 'playing'
              ? 'border-gold/40'
              : phase === 'completed'
                ? 'border-success/40'
                : phase === 'paused'
                  ? 'border-warning/40'
                  : ''
          }`}
        >
          <div className="relative z-10 text-center">
            {phase === 'setup' && (
              <>
                <div className="text-4xl mb-3">🎯</div>
                <h2 className="text-xl font-semibold text-text mb-1">
                  Configure &amp; Start
                </h2>
                <p className="text-text/60 text-sm">
                  Set your range and press Start Hifz Loop
                </p>
              </>
            )}
            {phase === 'playing' && (
              <>
                <div className="flex items-center justify-center gap-2.5 mb-3">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold opacity-75" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-gold-dark" />
                  </span>
                  <span className="text-gold-dark text-sm font-medium uppercase tracking-wider">
                    Playing
                  </span>
                  <Equalizer className="text-gold-dark" />
                </div>
                <h2 className="text-2xl font-semibold text-text mb-1">
                  {selectedSurah?.englishName} — Ayah {currentAyahInSurah}
                </h2>
                <p className="text-text/60 text-sm">
                  {selectedSurah?.name} · {selectedSurah?.banglaName}
                </p>
              </>
            )}
            {phase === 'paused' && (
              <>
                <div className="text-4xl mb-3">⏸</div>
                <h2 className="text-xl font-semibold text-text mb-1">Paused</h2>
                <p className="text-text/60 text-sm mb-4">
                  {selectedSurah?.englishName} — Ayah {currentAyahInSurah}
                </p>
                <div className="flex gap-3 justify-center">
                  <Button variant="primary" onClick={handleResume}>
                    <PlayIcon className="w-4 h-4 mr-2" /> Resume
                  </Button>
                  <Button variant="ghost" onClick={handleReset}>
                    Reset
                  </Button>
                </div>
              </>
            )}
            {phase === 'completed' && (
              <>
                <div className="text-4xl mb-3">✅</div>
                <h2 className="text-xl font-semibold text-text mb-1">
                  Session Complete!
                </h2>
                <p className="text-text/60 text-sm mb-4">
                  All loops finished for {selectedSurah?.englishName}
                </p>
                <Button variant="primary" onClick={handleReset}>
                  New Session
                </Button>
              </>
            )}
          </div>
        </Card>

        {/* Repeat counters */}
        {(phase === 'playing' || phase === 'paused') && (
          <div className="grid grid-cols-2 gap-3">
            <Card variant="elevated" className="p-4 text-center">
              <p className="text-xs text-text/50 uppercase tracking-wider mb-1">
                Verse Repeat
              </p>
              <p className="text-3xl font-bold text-gold-dark">
                {verseRepeatCounter}
                <span className="text-lg text-text/40">/{config.repeatEachVerse}</span>
              </p>
            </Card>
            <Card variant="elevated" className="p-4 text-center">
              <p className="text-xs text-text/50 uppercase tracking-wider mb-1">
                Range Loop
              </p>
              <p className="text-3xl font-bold text-gold-dark">
                {rangeLoopCounter}
                <span className="text-lg text-text/40">/{config.repeatRangeLoops}</span>
              </p>
            </Card>
          </div>
        )}

        {/* Active Ayah display */}
        {(phase === 'playing' || phase === 'paused') && surahVerses.length > 0 && (
          <Card variant="elevated" className="p-6">
            <p className="text-xs text-text/50 uppercase tracking-wider mb-3 text-center">
              Active Ayah
            </p>
            {(() => {
              const current = surahVerses.find((v) => v.number === currentAyahInSurah);
              if (!current)
                return <p className="text-text/40 text-center">Loading...</p>;
              return (
                <div className="text-center space-y-3">
                  <p
                    dir="rtl"
                    lang="ar"
                    className="text-2xl md:text-3xl font-arabic text-text leading-relaxed"
                    style={{ fontFamily: 'var(--font-arabic)' }}
                  >
                    {current.arabic}
                  </p>
                  {config.hideTranslation ? (
                    <p className="text-text/30 italic text-sm">
                      — Memory test mode —
                    </p>
                  ) : (
                    <>
                      {current.transliteration && (
                        <p className="text-gold-dark/80 italic text-sm">
                          {current.transliteration}
                        </p>
                      )}
                      {current.banglaTransliteration && (
                        <p
                          className="text-gold-dark/70 text-sm bangla-ui"
                          style={{ fontFamily: 'var(--font-bengali-ui)' }}
                        >
                          {current.banglaTransliteration}
                        </p>
                      )}
                      <p
                        className="text-text/90 text-sm"
                        style={{ fontFamily: 'var(--font-bengali-ui)' }}
                      >
                        {current.bangla}
                      </p>
                      <p className="text-text/60 italic text-sm">
                        &ldquo;{current.english}&rdquo;
                      </p>
                    </>
                  )}
                </div>
              );
            })()}
          </Card>
        )}

        {/* Ayah mastery grid */}
        {practiceAyahs.length > 0 && (
          <Card variant="elevated" className="p-4">
            <p className="text-xs text-text/50 uppercase tracking-wider mb-3">
              Ayah Mastery
            </p>
            <div className="flex flex-wrap gap-2">
              {practiceAyahs.map((ayahNum) => {
                const key = `${config.surahNumber}:${ayahNum}`;
                const masteryEntry = mastery[key];
                const isCurrent = ayahNum === currentAyahInSurah;
                const practiceCount = masteryEntry?.practiceCount ?? 0;
                const mastered = masteryEntry?.mastered ?? false;

                return (
                  <div
                    key={ayahNum}
                    className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      isCurrent
                        ? 'bg-gold/20 ring-1 ring-gold/40 scale-105'
                        : 'bg-surface-highlight/50'
                    }`}
                  >
                    <span className="text-text">{ayahNum}</span>
                    {mastered ? (
                      <CheckIcon className="w-3 h-3 text-success" />
                    ) : (
                      <span className="text-text/40">{practiceCount}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        {/* Controls */}
        {phase === 'playing' && (
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={handlePause}>
              <PauseIcon className="w-4 h-4 mr-2" />
              Pause
            </Button>
            <Button variant="ghost" className="flex-1" onClick={handleReset}>
              Stop
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
