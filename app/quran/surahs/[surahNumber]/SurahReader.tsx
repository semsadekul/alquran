'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useIntl } from 'react-intl';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  ReaderSettings,
  loadReaderSettings,
  DEFAULT_READER_SETTINGS,
  type ReaderSettingsState,
} from '@/components/ui/ReaderSettings';
import { VerseNumberBadge } from '@/components/ui/VerseNumberBadge';
import { Equalizer } from '@/components/ui/Equalizer';
import { usePlayer } from '@/components/quran/player-context';
import { getSurah } from '@/lib/data/quran';
import { recordRecentSurah, readBookmarks, toggleBookmark, recordAyahRead } from '@/lib/storage';
import { useToast } from '@/components/ui/Toast';
import { ShareAyahModal, type ShareAyahData } from '@/components/ui/ShareAyahModal';
import { BookmarkModal } from '@/components/ui/BookmarkModal';
import { TafsirDrawer } from '@/components/quran/TafsirDrawer';
import {
  fetchSurahTranslation,
  BANGLA_TRANSLATIONS,
  ENGLISH_TRANSLATIONS,
} from '@/lib/data/translations';
import {
  PlayIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
} from '@/components/ui/Icon';
import { WordByWordVerse } from '@/components/quran/WordByWordVerse';
import { getSurahWords, type WordItem } from '@/lib/data/words';
import { MushafPageView } from '@/components/quran/MushafPageView';

interface Verse {
  number: number;
  arabic: string;
  bangla: string;
  english: string;
  transliteration?: string;
  banglaTransliteration?: string;
}

interface SurahVersesPayload {
  surah: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: string;
  ayahs: Verse[];
}

export default function SurahReader({
  surahNumber,
  initialVerses,
  bismillah,
}: {
  surahNumber: string;
  initialVerses?: Verse[] | null;
  /** First ayah of Al-Fatiha from the corpus — never typed into source. */
  bismillah?: string | null;
}) {
  const intl = useIntl();
  const { showToast } = useToast();
  // Bookmarked ayah keys ("surah:ayah"), loaded from localStorage after mount.
  const [bookmarked, setBookmarked] = useState<Set<string>>(new Set());
  // Verse currently opened in the bookmark/note modal (null = closed).
  const [bookmarkTarget, setBookmarkTarget] = useState<number | null>(null);
  // Verse currently offered in the share-image modal (null = closed).
  const [shareCard, setShareCard] = useState<ShareAyahData | null>(null);
  const [settings, setSettings] = useState<ReaderSettingsState>({
    ...DEFAULT_READER_SETTINGS,
  });
  // Verse content is server-rendered when the corpus exists — the fallback
  // fetch below only runs when initialVerses is empty (corpus not generated).
  const [verses, setVerses] = useState<Verse[]>(initialVerses ?? []);
  const [loading, setLoading] = useState(!initialVerses?.length);
  // When the corpus cannot be loaded we show an explicit error + retry. We
  // never substitute typed-in Quran text.
  const [loadFailed, setLoadFailed] = useState(false);
  const [retryToken, setRetryToken] = useState(0);
  const verseRefs = useRef<(HTMLDivElement | null)[]>([]);
  // Focus mode shows one ayah at a time; this is the index it is showing.
  const [focusIndex, setFocusIndex] = useState(0);

  // Read tracker state: lingers on an ayah >= 3s to count as an authentic read
  const readAyahsSet = useRef<Set<number>>(new Set());
  const lingerTimers = useRef<Map<number, NodeJS.Timeout>>(new Map());
  const [tafsirAyah, setTafsirAyah] = useState<number | null>(null);
  const number = parseInt(surahNumber, 10);
  const surah = getSurah(number);

  const [altTranslations, setAltTranslations] = useState<{
    bn?: Record<number, string>;
    en?: Record<number, string>;
  }>({});
  const [wordsMap, setWordsMap] = useState<Record<number, WordItem[]>>({});

  // Fetch word-by-word data when enabled
  useEffect(() => {
    if (settings.showWordByWord && number && Object.keys(wordsMap).length === 0) {
      getSurahWords(number, verses).then((data) => {
        setWordsMap(data);
      });
    }
  }, [settings.showWordByWord, number, verses, wordsMap]);

  // Global playback state — highlight + auto-scroll follow the active verse
  // while the player is reciting THIS surah.
  const {
    currentIndex,
    isPlaying,
    surahNumber: activeSurahNumber,
    playFromIndex,
    pauseAtIndex,
  } = usePlayer();

  // Load alternate translation editions if selected in ReaderSettings
  useEffect(() => {
    let active = true;
    const loadAlt = async () => {
      const bnTarget = BANGLA_TRANSLATIONS.find((t) => t.id === settings.banglaEdition);
      const enTarget = ENGLISH_TRANSLATIONS.find((t) => t.id === settings.englishEdition);

      let bnMap: Record<number, string> | undefined;
      let enMap: Record<number, string> | undefined;

      if (bnTarget?.apiId) {
        bnMap = await fetchSurahTranslation(bnTarget.apiId, number);
      }
      if (enTarget?.apiId) {
        enMap = await fetchSurahTranslation(enTarget.apiId, number);
      }

      if (active) {
        setAltTranslations({ bn: bnMap, en: enMap });
      }
    };

    loadAlt();
    return () => {
      active = false;
    };
  }, [number, settings.banglaEdition, settings.englishEdition]);

  // Auto-scroll the highlighted verse into view while playing (only when the
  // player is reciting this surah).
  useEffect(() => {
    if (!isPlaying || activeSurahNumber !== number) return;
    const el = verseRefs.current[currentIndex];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [currentIndex, isPlaying, activeSurahNumber, number]);

  // Reading tracker: observe each ayah in view for >= 3 seconds
  useEffect(() => {
    if (typeof window === 'undefined' || !verses.length || !surah) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const ayahNum = Number(entry.target.getAttribute('data-ayah-number'));
          if (!ayahNum) return;

          if (entry.isIntersecting && !readAyahsSet.current.has(ayahNum)) {
            const timer = setTimeout(() => {
              if (!readAyahsSet.current.has(ayahNum)) {
                readAyahsSet.current.add(ayahNum);
                recordAyahRead(number, surah.englishName);
              }
            }, 3000);
            lingerTimers.current.set(ayahNum, timer);
          } else {
            const timer = lingerTimers.current.get(ayahNum);
            if (timer) {
              clearTimeout(timer);
              lingerTimers.current.delete(ayahNum);
            }
          }
        });
      },
      { threshold: 0.6 }
    );

    verseRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    const timers = lingerTimers.current;
    return () => {
      observer.disconnect();
      timers.forEach((t) => clearTimeout(t));
      timers.clear();
    };
  }, [verses, number, surah]);

  // Clicking a verse badge starts playback from that verse (globally).
  const handleVerseClick = (verseNumber: number) => {
    const index = verses.findIndex((v) => v.number === verseNumber);
    if (index === -1) return;
    playFromIndex(number, verses, index, surah?.englishName);
  };

  // Per-verse play/pause toggle — plays the ayah (and continues through the
  // surah verse by verse) or pauses when the ayah is already playing.
  const handleVersePlayClick = (index: number) => {
    if (activeSurahNumber === number && currentIndex === index && isPlaying) {
      pauseAtIndex(index);
    } else {
      playFromIndex(number, verses, index, surah?.englishName);
    }
  };

  const refreshBookmarks = useCallback(() => {
    setBookmarked(
      new Set(readBookmarks().map((b) => `${number}:${b.ayah}`)),
    );
  }, [number]);

  useEffect(() => {
    refreshBookmarks();
  }, [refreshBookmarks]);

  const handleBookmark = (verseNumber: number) => {
    setBookmarkTarget(verseNumber);
  };

  const handleCopy = async (verse: Verse) => {
    const text = `${verse.arabic}\n\n${verse.bangla}\n\n"${verse.english}"\n\n${surah?.englishName} ${number}:${verse.number}`;
    try {
      await navigator.clipboard.writeText(text);
      showToast('Copied', 'success');
    } catch {
      showToast('Copy failed', 'error');
    }
  };

  const openShareCard = (verse: Verse) => {
    if (!surah) return;
    setShareCard({
      surahName: surah.name,
      surahEnglishName: surah.englishName,
      surahNumber: number,
      verseNumber: verse.number,
      arabic: verse.arabic,
      bangla: verse.bangla,
      english: verse.english,
    });
  };

  // Share a link to this exact ayah. Uses the Web Share API where available,
  // otherwise copies the link.
  const handleShare = async (verseNumber: number) => {
    const url = `${window.location.origin}/quran/surahs/${number}#ayah-${verseNumber}`;
    const title = `${surah?.englishName ?? ''} ${number}:${verseNumber}`;
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      showToast(intl.formatMessage({ id: 'reader.linkCopied' }), 'success');
    } catch (err) {
      // User dismissing the native share sheet rejects with AbortError: not an error.
      if (err instanceof DOMException && err.name === 'AbortError') return;
      showToast('Share failed', 'error');
    }
  };

  useEffect(() => {
    setSettings(loadReaderSettings());
    // Content is server-rendered when the corpus exists — record the visit.
    if (surah) {
      recordRecentSurah({
        surah: {
          number: surah.number,
          name: surah.name,
          englishName: surah.englishName,
          englishNameTranslation: surah.englishNameTranslation,
          banglaName: surah.banglaName,
          numberOfAyahs: surah.numberOfAyahs,
          revelationType: surah.revelationType,
        },
        lastRead: Date.now(),
      });
    }
  }, [surah]);

  // Fallback: fetch the corpus when it wasn't included in the server payload.
  useEffect(() => {
    if (initialVerses && initialVerses.length > 0) return;
    let cancelled = false;
    setLoading(true);
    setLoadFailed(false);

    (async () => {
      try {
        const res = await fetch(`/data/verses/${surahNumber}.json`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const payload: SurahVersesPayload = await res.json();
        if (cancelled) return;
        if (!Array.isArray(payload.ayahs) || payload.ayahs.length === 0) {
          throw new Error('Empty corpus payload');
        }
        setVerses(payload.ayahs);
      } catch {
        if (cancelled) return;
        setVerses([]);
        setLoadFailed(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [surahNumber, number, initialVerses, retryToken]);

  // The Bismillah banner is shown once, above the ayahs, for every surah whose
  // text does not already begin with it: all surahs except At-Tawbah (9) and
  // Al-Fatiha (1), where it is ayah 1 itself.
  const showBismillah = number !== 1 && number !== 9 && Boolean(bismillah);

  // The Uthmani edition carries the Bismillah as a prefix of ayah 1 (except in
  // Al-Fatiha and At-Tawbah). Since the same text is shown in the banner above,
  // the exact prefix is removed from the displayed ayah so it never appears
  // twice. This is an exact-prefix trim of text read from the corpus — no
  // pattern matching, no character normalisation of the Arabic.
  const displayVerses = useMemo(() => {
    const first = verses[0];
    if (!showBismillah || !bismillah || !first) return verses;
    const prefix = `${bismillah} `;
    if (!first.arabic.startsWith(prefix)) return verses;
    return [
      { ...first, arabic: first.arabic.slice(prefix.length).replace(/^\s+/, '') },
      ...verses.slice(1),
    ];
  }, [verses, bismillah, showBismillah]);

  // Focus mode: ← / → step through ayahs. Keys typed into form fields and
  // modified shortcuts are left alone so the browser keeps its own behaviour.
  useEffect(() => {
    if (settings.readingMode !== 'focus') return;
    const onKey = (e: KeyboardEvent) => {
      if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
      const target = e.target as HTMLElement | null;
      if (target && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))) return;
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        setFocusIndex((i) => Math.min(displayVerses.length - 1, i + 1));
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setFocusIndex((i) => Math.max(0, i - 1));
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [settings.readingMode, displayVerses.length]);

  if (!surah) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-5xl">📖</div>
          <h1 className="font-display text-2xl font-semibold text-text">
            Surah not found
          </h1>
          <Link href="/quran/library">
            <Button variant="outline">Browse Surahs</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Surah Header */}
      <Card variant="hero" className="p-8 overflow-hidden bg-forest text-forest-ink border-gold-line-strong">
        <div className="absolute inset-0 islamic-pattern opacity-50" />

        <div className="relative z-10 text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-gold-light mb-2">
            সূরা
          </p>
          <p
            dir="rtl"
            lang="ar"
            className="text-4xl md:text-5xl font-arabic text-forest-ink mb-2"
            style={{ fontFamily: 'var(--font-arabic)' }}
          >
            {surah.name}
          </p>

          <h1 className="font-display text-2xl md:text-3xl font-semibold text-forest-ink mb-1">
            {surah.englishName}
          </h1>
          <p className="text-forest-ink/80 mb-3">
            {surah.englishNameTranslation} ·{' '}
            <span className="bangla-ui">{surah.banglaName}</span>
          </p>

          <div className="flex flex-wrap justify-center gap-2">
            <Badge tone="classic" size="sm">
              {surah.revelationType}
            </Badge>
            <Badge tone="classic" size="sm">
              {surah.numberOfAyahs} Ayahs
            </Badge>
          </div>

          {verses.length > 0 && (
            <div className="mt-4 flex justify-center">
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleVerseClick(1)}
                aria-label={intl.formatMessage({ id: 'audioPlayer.playSurah' })}
              >
                <PlayIcon className="w-4 h-4" />
                {intl.formatMessage({ id: 'audioPlayer.playSurah' })}
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Bismillah — rendered from the corpus (Al-Fatiha 1:1), never typed here */}
      {showBismillah && (
        <div className="text-center py-6">
          <p
            dir="rtl"
            lang="ar"
            className="text-2xl md:text-3xl"
            style={{ fontFamily: 'var(--font-arabic)', color: 'var(--gold-dark)' }}
          >
            {bismillah}
          </p>
        </div>
      )}

      {/* Reader toolbar */}
      <div className="flex items-center justify-between gap-2">
        <div className="text-sm text-text/70">
          {loading
            ? `Loading ${surah.englishName}…`
            : verses.length > 0
              ? `${verses.length} verses · ${surah.englishName}`
              : ''}
        </div>
        <ReaderSettings onChange={setSettings} />
      </div>

      {/* Surah Content */}
      {loading ? (
        <Card variant="elevated" className="p-12">
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 rounded-xl shimmer" />
            ))}
          </div>
        </Card>
      ) : verses.length > 0 && settings.readingMode === 'mushaf' ? (
        <MushafPageView
          currentSurahNumber={number}
          activeVerseNumber={
            activeSurahNumber === number && currentIndex >= 0 && currentIndex < verses.length
              ? verses[currentIndex]?.number
              : undefined
          }
          onAyahClick={(_sNum, aNum) => {
            const idx = verses.findIndex((v) => v.number === aNum);
            if (idx !== -1) {
              playFromIndex(number, verses, idx, surah?.englishName);
            }
          }}
          onTafsirClick={(_sNum, aNum) => setTafsirAyah(aNum)}
        />
      ) : verses.length > 0 && settings.readingMode === 'focus' ? (
        <Card variant="elevated" className="p-8 text-center">
          <p className="text-xs text-text-muted mb-4 tabular-nums">
            {displayVerses[focusIndex]?.number} / {displayVerses.length}
          </p>
          {settings.showArabic && (
            settings.showWordByWord && displayVerses[focusIndex] && wordsMap[displayVerses[focusIndex].number] ? (
              <div className="flex justify-center mb-6">
                <WordByWordVerse
                  words={wordsMap[displayVerses[focusIndex].number]}
                  arabicScript={settings.arabicScript}
                  arabicSize={settings.arabicSize + 4}
                />
              </div>
            ) : (
              <p
                dir="rtl"
                lang="ar"
                className={`arabic-text text-text mb-6 ${
                  settings.arabicScript === 'indopak' ? 'font-indopak' : 'font-uthmani'
                }`}
                style={{
                  fontSize: `${settings.arabicSize + 8}px`,
                  lineHeight: settings.arabicLineHeight,
                }}
              >
                {displayVerses[focusIndex]?.arabic}
              </p>
            )
          )}
          {settings.showTransliteration && displayVerses[focusIndex]?.transliteration && (
            <p
              lang="en"
              className="verse-transliteration text-gold-dark/90 italic mb-2 text-center"
              style={{ fontSize: `${settings.translationSize}px` }}
            >
              {displayVerses[focusIndex].transliteration}
            </p>
          )}
          {settings.showBanglaPronunciation && displayVerses[focusIndex]?.banglaTransliteration && (
            <p
              lang="bn"
              className="verse-bangla-transliteration text-gold-dark/80 mb-3 bangla-ui text-center"
              style={{
                fontSize: `${settings.translationSize}px`,
                fontFamily: 'var(--font-bengali-ui)',
              }}
            >
              {displayVerses[focusIndex].banglaTransliteration}
            </p>
          )}
          {settings.showBangla && (
            <p
              lang="bn"
              className="verse-bangla text-text/90 mb-2"
              style={{ fontSize: `${settings.translationSize + 2}px` }}
            >
              {(altTranslations.bn && displayVerses[focusIndex] && altTranslations.bn[displayVerses[focusIndex].number]) || displayVerses[focusIndex]?.bangla}
            </p>
          )}
          {settings.showEnglish && (
            <p lang="en" className="text-text/60 italic mb-4">
              &quot;{(altTranslations.en && displayVerses[focusIndex] && altTranslations.en[displayVerses[focusIndex].number]) || displayVerses[focusIndex]?.english}&quot;
            </p>
          )}
          <div className="flex justify-center mb-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setTafsirAyah(displayVerses[focusIndex]?.number ?? 1)}
            >
              📖 {intl.formatMessage({ id: 'surah.tafsirs' }) || 'Tafsir'}
            </Button>
          </div>
          <div className="mt-8 flex justify-between gap-3">
            <Button
              variant="outline"
              disabled={focusIndex === 0}
              onClick={() => setFocusIndex((i) => Math.max(0, i - 1))}
            >
              <ArrowLeftIcon className="w-4 h-4" /> Previous Ayah
            </Button>
            <Button
              variant="outline"
              disabled={focusIndex >= displayVerses.length - 1}
              onClick={() =>
                setFocusIndex((i) => Math.min(displayVerses.length - 1, i + 1))
              }
            >
              Next Ayah <ArrowRightIcon className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      ) : verses.length > 0 ? (
        <Card variant="elevated" className="overflow-hidden">
          {displayVerses.map((verse, index) => {
            // Check if audio is currently reciting this surah
            const isAudioActiveOnSurah = isPlaying && activeSurahNumber === number;
            const isCurrentVerse = activeSurahNumber === number && currentIndex === index;
            const isActive = isCurrentVerse && isPlaying;
            const isHighlighted = isCurrentVerse;
            const isDimmed = isAudioActiveOnSurah && !isCurrentVerse;

            return (
              <div
                key={verse.number}
                id={`ayah-${verse.number}`}
                data-ayah-number={verse.number}
                ref={(el) => {
                  verseRefs.current[index] = el;
                }}
                className={`transition-all duration-500 ease-out scroll-mt-28 ${
                  isActive
                    ? 'px-6 sm:px-8 py-7 sm:py-8 my-3 rounded-2xl bg-surface-highlight/95 border-2 border-gold/70 shadow-xl ring-2 ring-gold/20'
                    : isDimmed
                    ? 'px-6 py-5 opacity-40 hover:opacity-100 transition-opacity'
                    : isHighlighted
                    ? 'px-6 py-7 bg-gold-veil/40 border-l-4 border-gold'
                    : `px-6 py-7 ${verse.number % 2 === 1 ? 'bg-surface-highlight/40 dark:bg-surface-highlight/20' : ''}`
                }`}
              >
                <div className="flex items-start gap-4 sm:gap-6">
                  <div className="flex flex-col items-center gap-2 shrink-0">
                    <VerseNumberBadge
                      number={verse.number}
                      active={isHighlighted}
                      onClick={() => handleVerseClick(verse.number)}
                    />
                    {isActive && (
                      <div
                        className="p-1.5 rounded-full bg-gold/15 text-gold animate-fade-in shadow-xs"
                        title="এখন তিলাওয়াত হচ্ছে (Now reciting)"
                      >
                        <Equalizer className="text-gold h-3.5" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Arabic Verse Text */}
                    {settings.showArabic && (
                      settings.showWordByWord && wordsMap[verse.number] ? (
                        <div className="mb-4">
                          <WordByWordVerse
                            words={wordsMap[verse.number]}
                            arabicScript={settings.arabicScript}
                            arabicSize={isActive ? settings.arabicSize + 4 : settings.arabicSize}
                          />
                        </div>
                      ) : (
                        <p
                          dir="rtl"
                          lang="ar"
                          className={`arabic-text transition-all duration-300 mb-5 ${
                            isActive
                              ? 'text-gold-dark dark:text-gold-light font-medium'
                              : 'text-text'
                          } ${
                            settings.arabicScript === 'indopak' ? 'font-indopak' : 'font-uthmani'
                          }`}
                          style={{
                            fontSize: isActive
                              ? `${settings.arabicSize + 4}px`
                              : `${settings.arabicSize}px`,
                            lineHeight: isActive ? 2.3 : settings.arabicLineHeight,
                          }}
                        >
                          {verse.arabic}
                        </p>
                      )
                    )}

                    {/* Transliterations / Pronunciation Section (Grouped & Balanced) */}
                    {(settings.showTransliteration && verse.transliteration) ||
                    (settings.showBanglaPronunciation && verse.banglaTransliteration) ? (
                      <div className="space-y-1.5 pb-2.5 mb-3 border-b border-border-subtle/50">
                        {/* English Transliteration */}
                        {settings.showTransliteration && verse.transliteration && (
                          <p
                            lang="en"
                            className="verse-transliteration italic text-gold-dark/90 leading-relaxed text-[15px] sm:text-base font-normal"
                          >
                            {verse.transliteration}
                          </p>
                        )}

                        {/* Bangla Pronunciation (উচ্চারণ) */}
                        {settings.showBanglaPronunciation && verse.banglaTransliteration && (
                          <p
                            lang="bn"
                            className="verse-bangla-transliteration text-gold-dark/85 bangla-ui leading-relaxed text-[15px] sm:text-base font-normal"
                            style={{ fontFamily: 'var(--font-bengali-ui)' }}
                          >
                            {verse.banglaTransliteration}
                          </p>
                        )}
                      </div>
                    ) : null}

                    {/* Translations Section (Balanced Bangla & English) */}
                    <div className="space-y-3">
                      {/* Bangla Translation */}
                      {settings.showBangla && (
                        <p
                          lang="bn"
                          className="verse-bangla text-text bangla-ui leading-[1.85] sm:leading-[1.95] text-[17px] sm:text-[19px] font-normal tracking-[0.01em]"
                        >
                          {(altTranslations.bn && altTranslations.bn[verse.number]) || verse.bangla}
                        </p>
                      )}

                      {/* English Translation */}
                      {settings.showEnglish && (
                        <p
                          lang="en"
                          className="verse-english text-text/80 italic font-sans leading-relaxed text-[15px] sm:text-[16px] pl-3 border-l-2 border-gold-line/60"
                        >
                          &quot;{(altTranslations.en && altTranslations.en[verse.number]) || verse.english}&quot;
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Per-ayah actions: tafsir, bookmark, copy, share */}
                  <div className="shrink-0 mt-1.5 flex flex-col gap-1.5">
                    <button
                      type="button"
                      onClick={() => setTafsirAyah(verse.number)}
                      aria-label="Read Tafsir"
                      title="Read Tafsir"
                      className="w-8 h-8 rounded-full flex items-center justify-center border border-gold-line text-ink-3 hover:text-gold-dark hover:border-gold-line-strong transition-colors"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleBookmark(verse.number)}
                      aria-pressed={bookmarked.has(`${number}:${verse.number}`)}
                      aria-label={bookmarked.has(`${number}:${verse.number}`) ? 'Remove bookmark' : 'Bookmark ayah'}
                      title={bookmarked.has(`${number}:${verse.number}`) ? 'Remove bookmark' : 'Bookmark ayah'}
                      className="w-8 h-8 rounded-full flex items-center justify-center border border-gold-line text-ink-3 hover:text-gold-dark hover:border-gold-line-strong transition-colors"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill={bookmarked.has(`${number}:${verse.number}`) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M6 3h12v18l-6-4-6 4V3z" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCopy(verse)}
                      aria-label="Copy ayah"
                      title="Copy ayah"
                      className="w-8 h-8 rounded-full flex items-center justify-center border border-gold-line text-ink-3 hover:text-gold-dark hover:border-gold-line-strong transition-colors"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <rect x="9" y="9" width="11" height="11" rx="2" />
                        <path d="M5 15V5a2 2 0 0 1 2-2h10" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => openShareCard(verse)}
                      aria-label="Share as image"
                      title="Share as image"
                      className="w-8 h-8 rounded-full flex items-center justify-center border border-gold-line text-ink-3 hover:text-gold-dark hover:border-gold-line-strong transition-colors"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <circle cx="9" cy="9" r="2" />
                        <path d="M21 15l-5-5L5 21" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleShare(verse.number)}
                      aria-label={intl.formatMessage({ id: 'reader.share' })}
                      title={intl.formatMessage({ id: 'reader.share' })}
                      className="w-8 h-8 rounded-full flex items-center justify-center border border-gold-line text-ink-3 hover:text-gold-dark hover:border-gold-line-strong transition-colors"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <circle cx="18" cy="5" r="3" />
                        <circle cx="6" cy="12" r="3" />
                        <circle cx="18" cy="19" r="3" />
                        <path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4" />
                      </svg>
                    </button>
                  </div>

                  {/* Per-verse play / pause — starts recitation from this ayah */}
                  <button
                    type="button"
                    onClick={() => handleVersePlayClick(index)}
                    aria-label={intl.formatMessage(
                      { id: isActive ? 'audioPlayer.pauseVerse' : 'audioPlayer.playVerse' },
                      { number: verse.number }
                    )}
                    title={intl.formatMessage(
                      { id: isActive ? 'audioPlayer.pauseVerse' : 'audioPlayer.playVerse' },
                      { number: verse.number }
                    )}
                    className={`shrink-0 mt-1.5 w-9 h-9 rounded-full flex items-center justify-center border transition-all duration-200 ${
                      isActive
                        ? 'bg-gold-veil border-gold-line-strong text-gold-dark animate-pulse-gold'
                        : 'bg-surface-2 border-gold-line text-ink-3 hover:text-gold-dark hover:border-gold-line-strong hover:bg-gold-veil hover:scale-105 active:scale-95'
                    }`}
                  >
                    {isActive ? (
                      <Equalizer />
                    ) : (
                      <PlayIcon className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </Card>
      ) : (
        <Card variant="elevated" className="p-8">
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📖</div>
            <h2 className="text-xl font-bold text-text mb-2">
              {loadFailed
                ? `Surah ${surah.englishName} could not be loaded`
                : `Read Surah ${surah.englishName}`}
            </h2>
            <p className="text-text/70 mb-6">
              {loadFailed
                ? 'The Quran text could not be loaded. Check your connection and try again.'
                : 'Verse content for this surah is being added.'}
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button
                variant="primary"
                onClick={() => setRetryToken((token) => token + 1)}
              >
                Try again
              </Button>
              <Link href="/quran/library">
                <Button variant="outline">Browse Surahs</Button>
              </Link>
            </div>
          </div>
        </Card>
      )}

      <ShareAyahModal
        isOpen={shareCard !== null}
        onClose={() => setShareCard(null)}
        data={shareCard}
      />

      {bookmarkTarget !== null && surah && (
        <BookmarkModal
          isOpen={bookmarkTarget !== null}
          onClose={() => setBookmarkTarget(null)}
          surah={number}
          ayah={bookmarkTarget}
          surahName={surah.englishName}
          onBookmarkChanged={() => refreshBookmarks()}
        />
      )}

      {/* Slide-over Tafsir Drawer */}
      <TafsirDrawer
        isOpen={tafsirAyah !== null}
        onClose={() => setTafsirAyah(null)}
        surahNumber={number}
        surahName={surah.banglaName ? `${surah.name} (${surah.banglaName})` : surah.englishName}
        totalAyahs={surah.numberOfAyahs}
        currentAyah={tafsirAyah ?? 1}
        ayahArabic={verses.find((v) => v.number === tafsirAyah)?.arabic}
        ayahTranslation={
          settings.showBangla
            ? ((altTranslations.bn && tafsirAyah && altTranslations.bn[tafsirAyah]) || verses.find((v) => v.number === tafsirAyah)?.bangla)
            : ((altTranslations.en && tafsirAyah && altTranslations.en[tafsirAyah]) || verses.find((v) => v.number === tafsirAyah)?.english)
        }
        onNavigateAyah={(next) => setTafsirAyah(next)}
      />

      {/* Navigation */}
      <div className="flex justify-between">
        {number > 1 && (
          <Link href={`/quran/surahs/${number - 1}`}>
            <Button variant="outline">
              <ArrowLeftIcon className="w-4 h-4" /> Previous Surah
            </Button>
          </Link>
        )}
        {number < 114 && (
          <Link href={`/quran/surahs/${number + 1}`}>
            <Button variant="outline">
              Next Surah <ArrowRightIcon className="w-4 h-4" />
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}
