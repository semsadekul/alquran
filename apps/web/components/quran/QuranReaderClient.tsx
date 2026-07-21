'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { AudioDock } from './AudioDock';
import type { ReaderAyah, ReaderSurah } from './types';
import { useAudioPlayback } from './useAudioPlayback';
import { useReadingProgress } from '../../hooks/useReadingProgress';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import { VerseActions } from './VerseActions';
import { ReadingSettings } from './ReadingSettings';
import { ReaderPreferences } from '@alquran/types';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { VerseCard } from '@/components/ui/VerseCard';
import { Play, BookOpen, ArrowLeft, Download, BookMarked } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useDownloads } from '@/components/audio/useDownloads';
import { DownloadButton } from '@/components/audio/DownloadButton';
import { JuzNavigator } from './JuzNavigator';
import { getJuzForVerse } from '@/lib/data/juz';
import { GoToAyah } from './GoToAyah';
import { useAnnounce } from '@/components/ui/Announce';
import { VirtualVerseList } from './VirtualVerseList';

const defaultPrefs: ReaderPreferences = {
  theme: 'dark',
  arabicFontSize: 38,
  banglaFontSize: 16,
  englishFontSize: 15,
  showArabic: true,
  showBangla: true,
  showEnglish: true,
  showUrdu: false,
  showTransliteration: false,
  showBanglaTransliteration: false,
  lineSpacing: 'normal',
  readingMode: 'study',
};

export function QuranReaderClient({
  surah,
  verses,
  showBismillah,
}: {
  surah: ReaderSurah;
  verses: ReaderAyah[];
  showBismillah: boolean;
}) {
  const playback = useAudioPlayback(surah);
  const activeAyahKey = playback.state.activeAyahKey;
  const activeRef = useRef<HTMLDivElement | null>(null);

  useReadingProgress(surah.number, surah.englishName, surah.numberOfAyahs);

  const { getRecord, manager } = useDownloads();
  const downloadRecord = getRecord('Alafasy_128kbps', surah.number);
  const { announce } = useAnnounce();

  const [preferences, setPreferences] = useLocalStorage<ReaderPreferences>(
    'alquran_preferences',
    defaultPrefs,
  );

  useKeyboardShortcuts({
    onNextVerse: () => {
      if (playback.state.isPlaying && playback.currentAyah) {
        const nextAyahNum = playback.currentAyah.ayah + 1;
        if (nextAyahNum <= surah.numberOfAyahs) {
          const nextVerse = verses.find((v) => v.ayah === nextAyahNum);
          if (nextVerse) playback.playAyah(nextVerse, verses);
        }
      } else {
        window.scrollBy({ top: 100, behavior: 'smooth' });
      }
    },
    onPrevVerse: () => {
      if (playback.state.isPlaying && playback.currentAyah) {
        const prevAyahNum = playback.currentAyah.ayah - 1;
        if (prevAyahNum >= 1) {
          const prevVerse = verses.find((v) => v.ayah === prevAyahNum);
          if (prevVerse) playback.playAyah(prevVerse, verses);
        }
      } else {
        window.scrollBy({ top: -100, behavior: 'smooth' });
      }
    },
    onTogglePlay: () => {
      if (playback.state.isPlaying) playback.togglePlayPause();
      else playback.playCurrentSurahFromStart(verses);
    },
  });

  useEffect(() => {
    if (activeAyahKey) {
      const [surahNum, ayahNum] = activeAyahKey.split('-');
      announce(`Now playing verse ${ayahNum} of ${surah.englishName}`);
    }
  }, [activeAyahKey, surah.englishName, announce]);

  useEffect(() => {
    if (activeRef.current) {
      activeRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [activeAyahKey]);

  return (
    <div
      className="max-w-3xl mx-auto px-4 py-6 md:py-10 reader-content"
      style={{
        '--arabic-size-multiplier': preferences.arabicFontSize / 38,
        '--translation-size-multiplier': preferences.banglaFontSize / 16,
        '--line-spacing-multiplier': preferences.lineSpacing === 'compact' ? 0.85 : preferences.lineSpacing === 'spacious' ? 1.2 : 1,
      } as React.CSSProperties}
    >
      {/* Back link + settings + juz navigator + go to ayah */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <Link
          href="/quran/surahs"
          className="inline-flex items-center gap-2 text-sm text-ink-2 hover:text-accent transition-colors min-h-[44px]"
        >
          <ArrowLeft size={16} />
          সূরা তালিকা
        </Link>
        <div className="flex items-center gap-3 flex-wrap">
          <GoToAyah surahNumber={surah.number} numberOfAyahs={surah.numberOfAyahs} />
          <JuzNavigator currentJuz={getJuzForVerse(surah.number, 1)} />
          <ReadingSettings
            preferences={preferences}
            onChange={(newPrefs) =>
              setPreferences({ ...preferences, ...newPrefs })
            }
          />
        </div>
      </div>

      {/* Surah Header Card */}
      <Card variant="hero" className="text-center mb-8 relative overflow-hidden">
        {/* Surah number medallion */}
        <div className="absolute top-4 left-4 w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center font-bold text-white/90 text-lg">
          {surah.number}
        </div>

        <div dir="rtl" lang="ar" className="font-arabic text-4xl md:text-5xl text-white mb-3 mt-2">
          {surah.name}
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">
          {surah.englishName}
        </h1>
        <p className="text-white/70 text-sm mb-4">
          {surah.englishNameTranslation}
        </p>

        <div className="flex justify-center gap-3 mb-6">
          <Badge tone="gold">{surah.revelationType}</Badge>
          <Badge tone="gold">{surah.numberOfAyahs} Ayahs</Badge>
        </div>

        {/* Reading Progress Bar */}
        <div className="mb-6 max-w-xs mx-auto">
          <div className="flex items-center justify-between text-xs text-white/60 mb-2">
            <span>Progress</span>
            <span>{activeAyahKey ? Math.round((parseInt(activeAyahKey.split('-')[1] || '0') / surah.numberOfAyahs) * 100) : 0}%</span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#c5a059] to-[#e2c275] transition-all duration-500"
              style={{
                width: activeAyahKey
                  ? `${(parseInt(activeAyahKey.split('-')[1] || '0') / surah.numberOfAyahs) * 100}%`
                  : '0%',
              }}
              role="progressbar"
              aria-valuenow={activeAyahKey ? (parseInt(activeAyahKey.split('-')[1] || '0') / surah.numberOfAyahs) * 100 : 0}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
        </div>

        <div className="flex justify-center gap-3 flex-wrap items-center">
          <Button
            variant="gold"
            onClick={() => playback.playCurrentSurahFromStart(verses)}
            className="rounded-full"
          >
            <Play size={16} />
            Play Surah
          </Button>
          <Button
            variant="ghost"
            href="/quran/hifz"
            className="rounded-full text-white border-white/20 hover:bg-white/10"
          >
            <BookOpen size={16} />
            Hifz Mode
          </Button>
          <DownloadButton
            record={downloadRecord}
            onDownload={() => manager.enqueueSurah('Alafasy_128kbps', surah.number, surah.numberOfAyahs)}
            onPause={() => manager.pause(`Alafasy_128kbps:${surah.number}`)}
            onResume={() => manager.resume(`Alafasy_128kbps:${surah.number}`)}
            onDelete={() => manager.deleteSurah('Alafasy_128kbps', surah.number)}
            className="text-white hover:bg-white/10"
          />
        </div>

        {playback.state.errorMessage && (
          <p className="mt-4 text-sm text-red-300 bg-red-900/30 rounded-xl px-4 py-2">
            {playback.state.errorMessage}
          </p>
        )}
      </Card>

      {/* Bismillah */}
      {showBismillah && (
        <div className="bismillah mb-8">
          بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
        </div>
      )}

      {/* Verses — virtualized for long surahs (≥50 ayahs) */}
      {verses.length >= 50 ? (
        <VirtualVerseList
          verses={verses}
          surah={surah}
          preferences={preferences}
          activeAyahKey={activeAyahKey}
          onPlay={(verse) => playback.playAyah(verse, verses)}
          onActiveRef={(el) => { activeRef.current = el; }}
        />
      ) : (
        <div className="space-y-2">
          {verses.map((verse) => {
            const key = `${verse.surah}-${verse.ayah}`;
            const isActive = activeAyahKey === key;
            return (
              <div
                key={verse.number}
                ref={isActive ? activeRef : null}
              >
                <VerseCard
                  verseNumber={verse.ayah}
                  arabic={verse.arabic}
                  bangla={verse.bangla}
                  english={verse.english}
                  urdu={verse.urdu}
                  transliteration={verse.transliteration}
                  banglaTransliteration={verse.banglaTransliteration}
                  isActive={isActive}
                  showBangla={preferences.showBangla}
                  showEnglish={preferences.showEnglish}
                  showUrdu={preferences.showUrdu}
                  showTransliteration={
                    preferences.showTransliteration ||
                    preferences.showBanglaTransliteration
                  }
                  onPlay={() => playback.playAyah(verse, verses)}
                  surahName={surah.englishName}
                  surahNumber={surah.number}
                  verse={verse}
                />
              </div>
            );
          })}
        </div>
      )}

      {/* Surah navigation */}
      <nav className="flex justify-between items-center mt-12 pt-8 border-t border-line">
        {surah.number > 1 ? (
          <Link
            href={`/quran/surahs/${surah.number - 1}`}
            className="text-ink-2 hover:text-accent transition-colors font-medium min-h-[44px] inline-flex items-center"
          >
            ← Previous Surah
          </Link>
        ) : (
          <span />
        )}
        {surah.number < 114 ? (
          <Link
            href={`/quran/surahs/${surah.number + 1}`}
            className="text-ink-2 hover:text-accent transition-colors font-medium min-h-[44px] inline-flex items-center"
          >
            Next Surah →
          </Link>
        ) : (
          <span />
        )}
      </nav>

      {/* Audio Dock */}
      <AudioDock playback={playback} currentSurah={surah} />
    </div>
  );
}
