'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Equalizer } from '@/components/ui/Equalizer';
import { usePlayer } from '@/components/quran/player-context';
import { getSurahs, getGlobalAyahNumber } from '@/lib/data/quran';
import { ensureScheduled } from '@/lib/srs';
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
import {
  tokenizeArabicVerse,
  matchSpokenTranscript,
  isSpeechRecognitionSupported,
} from '@/lib/speech/arabic';

// ─── Types ───────────────────────────────────────────────────────────

/**
 * Progressive memory masking. 0 keeps the full text; each further step removes
 * more of the Arabic so the reader has to recall it before revealing.
 */
export type MaskLevel = 0 | 1 | 2 | 3;

interface PracticeConfig {
  surahNumber: number;
  startAyah: number;
  endAyah: number;
  repeatEachVerse: number;
  delayBetweenVerses: number;
  repeatRangeLoops: number;
  hideTranslation: boolean;
  maskLevel: MaskLevel;
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
  maskLevel: 0,
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

// ─── Memory masking ──────────────────────────────────────────────

const MASK_LABELS = ['Full text', 'First letter', 'Every other word', 'Tap to peek'] as const;

/** Splits an ayah into words, keeping the original spacing order. */
function toWords(text: string): string[] {
  return text.split(/\s+/).filter(Boolean);
}

/** First letter of a word, skipping combining marks so a diacritic is never shown alone. */
function firstLetter(word: string): string {
  const chars = Array.from(word);
  const base = chars.find((ch) => !/[\u064B-\u0652\u0670\u06D6-\u06ED]/.test(ch));
  return base ?? chars[0] ?? '';
}

/**
 * Renders the ayah at the selected masking level.
 *  1 — only the first letter of each word is shown.
 *  2 — every other word is blurred.
 *  3 — all words are hidden behind gold pills; tapping one peeks for 2s.
 */
function MaskedArabic({
  text,
  level,
  onPeek,
  matchedWords,
  voiceMode,
}: {
  text: string;
  level: MaskLevel;
  onPeek?: () => void;
  matchedWords?: boolean[];
  voiceMode?: boolean;
}) {
  const [peekIndex, setPeekIndex] = useState<number | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clear a pending peek when the ayah changes or the level drops.
  useEffect(() => {
    setPeekIndex(null);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [text, level]);

  const reveal = (index: number) => {
    if (timer.current) clearTimeout(timer.current);
    setPeekIndex(index);
    onPeek?.();
    timer.current = setTimeout(() => setPeekIndex(null), 2000);
  };

  const words = toWords(text);
  const base = 'text-2xl md:text-3xl font-arabic text-text leading-relaxed';

  return (
    <p
      dir="rtl"
      lang="ar"
      className={`${base} flex flex-wrap justify-center gap-x-2 gap-y-2`}
      style={{ fontFamily: 'var(--font-arabic)' }}
    >
      {words.map((word, index) => {
        const isVoiceMatched = voiceMode && matchedWords?.[index];

        if (isVoiceMatched) {
          return (
            <span
              key={index}
              className="text-emerald-600 dark:text-emerald-400 font-bold transition-all duration-300 drop-shadow-[0_0_8px_rgba(16,185,129,0.35)] scale-105 inline-block"
            >
              {word}
            </span>
          );
        }

        if (level === 0) {
          return <span key={index}>{word}</span>;
        }

        if (level === 1) {
          return (
            <span key={index} className="text-text/70">
              {firstLetter(word)}
              <span className="text-text/30">‹</span>
            </span>
          );
        }
        if (level === 2) {
          return index % 2 === 1 ? (
            <span key={index} className="blur-sm select-none" aria-hidden="true">
              {word}
            </span>
          ) : (
            <span key={index}>{word}</span>
          );
        }
        // Level 3 — pill until tapped.
        return (
          <button
            key={index}
            type="button"
            onClick={() => reveal(index)}
            aria-label={peekIndex === index ? word : 'Hidden word, tap to reveal'}
            className={`rounded-lg px-2 transition-colors ${
              peekIndex === index
                ? 'bg-gold-veil text-text'
                : 'bg-forest/10 dark:bg-gold-veil/40 text-transparent select-none'
            }`}
          >
            {peekIndex === index ? word : '•••'}
          </button>
        );
      })}
    </p>
  );
}

/** Segmented control for the masking level; shared by setup and the live card. */
function MaskBar({
  value,
  onChange,
  hintsUsed,
}: {
  value: MaskLevel;
  onChange: (level: MaskLevel) => void;
  hintsUsed?: number;
}) {
  return (
    <div className="mb-3">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-medium text-text-muted uppercase tracking-wider">
          Memory masking
        </span>
        {hintsUsed !== undefined && hintsUsed > 0 && (
          <span className="text-xs text-gold-dark font-medium">{hintsUsed} hints used</span>
        )}
      </div>
      <div className="grid grid-cols-4 gap-1.5" role="group" aria-label="Memory masking">
        {MASK_LABELS.map((label, level) => (
          <button
            key={label}
            type="button"
            aria-pressed={value === level}
            onClick={() => onChange(level as MaskLevel)}
            className={`px-1.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${
              value === level
                ? 'bg-forest text-forest-ink border-transparent shadow-sm'
                : 'border-gold-line/70 text-text-muted hover:bg-surface-highlight'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
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
  // Counts tap-to-peek reveals at the hardest masking level.
  const [hintsUsed, setHintsUsed] = useState(0);
  const runningRef = useRef(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Voice recitation follow-along state
  const [voiceMode, setVoiceMode] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [spokenTranscript, setSpokenTranscript] = useState('');
  const [matchedWords, setMatchedWords] = useState<boolean[]>([]);
  const [hasVoiceMismatch, setHasVoiceMismatch] = useState(false);
  const voiceResolverRef = useRef<(() => void) | null>(null);
  const voiceModeRef = useRef(false);
  voiceModeRef.current = voiceMode;

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

  const surahVersesRef = useRef<VerseData[]>([]);
  surahVersesRef.current = surahVerses;

  const recognitionRef = useRef<any>(null);

  const stopVoiceRecognition = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {}
      recognitionRef.current = null;
    }
    setIsListening(false);
    if (voiceResolverRef.current) {
      const res = voiceResolverRef.current;
      voiceResolverRef.current = null;
      res();
    }
  }, []);

  const waitForVoiceRecitation = useCallback(
    (ayahNum: number): Promise<void> => {
      return new Promise((resolve) => {
        if (!isSpeechRecognitionSupported()) {
          setTimeout(resolve, 3000);
          return;
        }

        voiceResolverRef.current = resolve;
        setSpokenTranscript('');
        setHasVoiceMismatch(false);

        const currentVerse = surahVersesRef.current.find((v) => v.number === ayahNum);
        const targetTokens = currentVerse ? tokenizeArabicVerse(currentVerse.arabic) : [];
        setMatchedWords(new Array(targetTokens.length).fill(false));

        const SpeechRecognitionClass =
          (window as unknown as { SpeechRecognition?: any; webkitSpeechRecognition?: any })
            .SpeechRecognition ||
          (window as unknown as { SpeechRecognition?: any; webkitSpeechRecognition?: any })
            .webkitSpeechRecognition;

        if (!SpeechRecognitionClass) {
          setTimeout(resolve, 3000);
          return;
        }

        let recognition: any;
        try {
          recognition = new SpeechRecognitionClass();
        } catch {
          setTimeout(resolve, 3000);
          return;
        }

        recognitionRef.current = recognition;
        recognition.lang = 'ar-SA';
        recognition.continuous = true;
        recognition.interimResults = true;

        let accumulatedTranscript = '';

        recognition.onstart = () => {
          setIsListening(true);
        };

        recognition.onresult = (event: any) => {
          let interim = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              accumulatedTranscript += ' ' + event.results[i][0].transcript;
            } else {
              interim += event.results[i][0].transcript;
            }
          }

          const fullTranscript = (accumulatedTranscript + ' ' + interim).trim();
          setSpokenTranscript(fullTranscript);

          if (targetTokens.length > 0) {
            const result = matchSpokenTranscript(targetTokens, fullTranscript);
            setMatchedWords(result.matchedWords);

            if (result.hasMismatch) {
              setHasVoiceMismatch(true);
              setTimeout(() => setHasVoiceMismatch(false), 800);
            }

            if (result.isComplete || result.matchedCount >= targetTokens.length) {
              setIsListening(false);
              try {
                recognition.stop();
              } catch {}
              recognitionRef.current = null;
              if (voiceResolverRef.current) {
                const res = voiceResolverRef.current;
                voiceResolverRef.current = null;
                res();
              }
            }
          }
        };

        recognition.onerror = (e: any) => {
          if (e.error !== 'no-speech') {
            console.warn('Speech recognition notice:', e.error);
          }
        };

        recognition.onend = () => {
          if (runningRef.current && voiceResolverRef.current) {
            try {
              recognition.start();
            } catch {
              setIsListening(false);
            }
          } else {
            setIsListening(false);
          }
        };

        try {
          recognition.start();
        } catch {
          setIsListening(false);
          resolve();
        }
      });
    },
    []
  );

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
      stopVoiceRecognition();
    };
  }, [stopVoiceRecognition]);

  // ─── Practice session loop ────────────────────────────────────────

  const stopSession = useCallback(() => {
    runningRef.current = false;
    stopCurrentAudio();
    stopVoiceRecognition();
    setPhase('setup');
  }, [stopVoiceRecognition]);

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

          if (voiceModeRef.current) {
            await waitForVoiceRecitation(ayahNum);
          } else {
            try {
              await playAyah(ayahNum);
            } catch {
              // Skip audio errors
            }
          }

          // Small pause between repeats of the same verse
          if (r < repeatsNeeded - 1 && runningRef.current) {
            await delay(500);
          }
        }

        // Track mastery (live — updates the grid immediately)
        updateAyahMastery(config.surahNumber, ayahNum, 1);
        // A practised ayah joins the spaced-repetition deck, due today.
        ensureScheduled(config.surahNumber, ayahNum);
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
      stopVoiceRecognition();
    }
  };

  const handlePause = () => {
    // Kill in-flight audio or voice recognition so loop exits now
    stopCurrentAudio();
    stopVoiceRecognition();
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
    stopVoiceRecognition();
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
    'w-full bg-surface border border-gold-line/60 rounded-lg px-2.5 py-2 text-xs sm:text-sm text-text focus:outline-none focus:border-gold/60 focus:ring-1 focus:ring-gold/20 transition-colors';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* ─── Left Panel: Settings ─────────────────────────────────── */}
      <Card variant="elevated" className="p-5 sm:p-6 self-start space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gold-line/30">
          <h3 className="font-semibold text-text flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-gold-dark" />
            <span>{intl.formatMessage({ id: 'readerSettings.title' })}</span>
          </h3>
          <span className="text-[11px] font-medium tracking-wide uppercase px-2.5 py-0.5 rounded-full bg-forest/10 dark:bg-gold-veil border border-gold-line/40 text-gold-dark">
            Hifz Practice
          </span>
        </div>

        {/* Practice Mode Selector: Audio Loop vs Voice Recite */}
        <div>
          <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1.5">
            Practice Mode
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setVoiceMode(false)}
              className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-medium border flex items-center justify-center gap-2 transition-all ${
                !voiceMode
                  ? 'bg-forest text-forest-ink border-transparent shadow-sm'
                  : 'border-gold-line text-text-muted hover:bg-surface-highlight'
              }`}
            >
              <span>🎧</span> Audio Loop
            </button>
            <button
              type="button"
              onClick={() => setVoiceMode(true)}
              className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-medium border flex items-center justify-center gap-2 transition-all ${
                voiceMode
                  ? 'bg-forest text-forest-ink border-transparent shadow-sm'
                  : 'border-gold-line text-text-muted hover:bg-surface-highlight'
              }`}
            >
              <span>🎙️</span> Voice Recite (AI)
            </button>
          </div>
          {voiceMode && (
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1.5 flex items-center gap-1">
              <span>💡</span> Recite in Arabic into your mic; words illuminate green as matched.
            </p>
          )}
        </div>

        {/* Target Range: Surah selector & Ayah Range */}
        <div className="p-3 rounded-xl bg-surface-highlight/30 border border-gold-line/30 space-y-2.5">
          <div>
            <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">
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

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[11px] font-medium text-text-muted mb-1">
                Start Ayah
              </label>
              <input
                type="number"
                min={1}
                max={selectedSurah?.numberOfAyahs ?? 114}
                value={config.startAyah}
                onChange={(e) => updateConfig({ startAyah: Math.max(1, Number(e.target.value)) })}
                className={selectClass}
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-text-muted mb-1 flex items-center justify-between">
                <span>End Ayah</span>
                <span className="text-[11px] text-gold-dark font-medium">
                  {Math.max(1, config.endAyah - config.startAyah + 1)} {Math.max(1, config.endAyah - config.startAyah + 1) === 1 ? 'ayah' : 'ayahs'}
                </span>
              </label>
              <input
                type="number"
                min={config.startAyah}
                max={selectedSurah?.numberOfAyahs ?? 114}
                value={config.endAyah}
                onChange={(e) => updateConfig({ endAyah: Math.max(config.startAyah, Number(e.target.value)) })}
                className={selectClass}
              />
            </div>
          </div>
        </div>

        {/* Repetition & Timing (Compact 3-column Grid) */}
        <div>
          <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1.5">
            Repetition &amp; Timing
          </label>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <span className="block text-[11px] text-text-muted mb-1 truncate" title="Repeat Each Verse">
                Verse Repeat
              </span>
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
            <div>
              <span className="block text-[11px] text-text-muted mb-1 truncate" title="Delay Between Verses">
                Interval Delay
              </span>
              <select
                value={config.delayBetweenVerses}
                onChange={(e) => updateConfig({ delayBetweenVerses: Number(e.target.value) })}
                className={selectClass}
              >
                <option value={0}>0s (None)</option>
                <option value={3}>3s</option>
                <option value={5}>5s</option>
                <option value={10}>10s</option>
                <option value={15}>15s</option>
              </select>
            </div>
            <div>
              <span className="block text-[11px] text-text-muted mb-1 truncate" title="Range Loop Count">
                Range Loops
              </span>
              <select
                value={config.repeatRangeLoops}
                onChange={(e) => updateConfig({ repeatRangeLoops: Number(e.target.value) })}
                className={selectClass}
              >
                {[1, 2, 3, 5, 10, 20, 50].map((n) => (
                  <option key={n} value={n}>
                    {n} {n === 1 ? 'loop' : 'loops'}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Audio & Reciter (Compact 2-column Grid) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div>
            <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">
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
          <div>
            <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">
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
                  {r}x Speed
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Memorization Aids */}
        <div className="pt-2 border-t border-gold-line/30 space-y-2.5">
          <MaskBar
            value={config.maskLevel}
            onChange={(level) => updateConfig({ maskLevel: level })}
          />

          <label className="flex items-center gap-2.5 p-2 rounded-lg bg-surface-highlight/40 border border-gold-line/30 cursor-pointer transition-colors hover:bg-surface-highlight/70">
            <input
              type="checkbox"
              checked={config.hideTranslation || config.maskLevel > 0}
              disabled={config.maskLevel > 0}
              onChange={(e) => updateConfig({ hideTranslation: e.target.checked })}
              className="rounded border-border text-gold-dark focus:ring-gold-dark/30 w-4 h-4 cursor-pointer"
            />
            <span className="text-xs text-text select-none flex items-center gap-1.5">
              {config.hideTranslation || config.maskLevel > 0 ? (
                <>
                  <EyeOffIcon className="w-3.5 h-3.5 text-gold-dark" />
                  <span>Translations hidden (Active recall mode)</span>
                </>
              ) : (
                <>
                  <EyeIcon className="w-3.5 h-3.5 text-text-muted" />
                  <span>Hide translations to test memory</span>
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
            className="w-full py-2.5 bg-gradient-to-r from-gold to-gold-dark text-white font-medium shadow hover:from-gold-dark hover:to-gold-dark flex items-center justify-center gap-2 transition-transform active:scale-[0.99]"
          >
            <PlayIcon className="w-4 h-4" />
            <span>Start Hifz Loop</span>
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
                <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-forest/10 dark:bg-gold-veil flex items-center justify-center text-2xl border border-gold-line/40">
                  🎯
                </div>
                <h2 className="text-xl font-semibold text-text mb-1">
                  Ready to Memorize
                </h2>
                <p className="text-text/60 text-sm mb-4">
                  Review your repetition configuration and start when ready
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-left p-3 rounded-xl bg-surface/70 border border-gold-line/30 mb-2">
                  <div className="p-2 rounded-lg bg-surface-highlight/50">
                    <span className="block text-[10px] text-text-muted font-medium uppercase tracking-wider">Surah</span>
                    <span className="text-xs font-semibold text-text truncate block">{selectedSurah?.englishName}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-surface-highlight/50">
                    <span className="block text-[10px] text-text-muted font-medium uppercase tracking-wider">Ayahs</span>
                    <span className="text-xs font-semibold text-gold-dark block">{config.startAyah} – {config.endAyah}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-surface-highlight/50">
                    <span className="block text-[10px] text-text-muted font-medium uppercase tracking-wider">Loops</span>
                    <span className="text-xs font-semibold text-text block">{config.repeatEachVerse}x · {config.repeatRangeLoops} rds</span>
                  </div>
                  <div className="p-2 rounded-lg bg-surface-highlight/50">
                    <span className="block text-[10px] text-text-muted font-medium uppercase tracking-wider">Mode</span>
                    <span className="text-xs font-semibold text-forest-ink dark:text-emerald-400 block truncate">{voiceMode ? 'Voice AI' : 'Audio Loop'}</span>
                  </div>
                </div>
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
          <Card
            variant="elevated"
            className={`p-6 transition-all duration-300 ${
              hasVoiceMismatch ? 'ring-2 ring-amber-500/70 bg-amber-500/5' : ''
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-text/50 uppercase tracking-wider">
                Active Ayah
              </p>
              {voiceMode && (
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-forest/10 dark:bg-gold-veil text-gold-dark font-medium flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Voice Recitation
                </span>
              )}
            </div>

            <MaskBar
              value={config.maskLevel}
              onChange={(level) => updateConfig({ maskLevel: level })}
              hintsUsed={hintsUsed}
            />

            {/* Voice Follow-Along Live Status */}
            {voiceMode && phase === 'playing' && (
              <div className="mb-4 flex items-center justify-between gap-3 p-3 rounded-xl bg-surface-highlight/70 border border-gold-line/40 text-sm">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="relative flex h-3 w-3 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
                  </span>
                  <div className="min-w-0 text-left">
                    <p className="font-medium text-text text-xs sm:text-sm">
                      {isListening ? 'Recite in Arabic...' : 'Starting microphone...'}
                    </p>
                    {spokenTranscript && (
                      <p className="text-xs text-text-muted truncate font-arabic" dir="rtl">
                        &ldquo;{spokenTranscript}&rdquo;
                      </p>
                    )}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={stopVoiceRecognition}
                  className="shrink-0 text-xs py-1 px-2.5 h-auto border-gold-line text-text hover:bg-surface"
                >
                  Pass Ayah →
                </Button>
              </div>
            )}

            {hasVoiceMismatch && (
              <div className="mb-3 p-2 text-xs text-amber-700 dark:text-amber-300 bg-amber-500/10 rounded-lg text-center font-medium animate-pulse">
                ⚠️ Tajweed check: pronunciation mismatch detected
              </div>
            )}

            {(() => {
              const current = surahVerses.find((v) => v.number === currentAyahInSurah);
              if (!current)
                return <p className="text-text/40 text-center">Loading...</p>;
              return (
                <div className="text-center space-y-3">
                  <MaskedArabic
                    text={current.arabic}
                    level={config.maskLevel}
                    onPeek={() => setHintsUsed((n) => n + 1)}
                    matchedWords={matchedWords}
                    voiceMode={voiceMode}
                  />
                  {config.hideTranslation || config.maskLevel > 0 ? (
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
