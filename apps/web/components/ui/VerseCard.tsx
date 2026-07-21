import { cn } from '@/lib/cn';
import { IconButton } from './IconButton';
import { VerseActions } from '../quran/VerseActions';
import { SujudMarker, SUJUD_AYAHS } from '../quran/SujudMarker';
import type { ReaderAyah } from '../quran/types';

interface VerseCardProps {
  verseNumber: number;
  arabic: string;
  bangla?: string;
  english?: string;
  urdu?: string;
  transliteration?: string;
  banglaTransliteration?: string;
  isActive?: boolean;
  showBangla?: boolean;
  showEnglish?: boolean;
  showUrdu?: boolean;
  showTransliteration?: boolean;
  onPlay?: () => void;
  surahName?: string;
  surahNumber?: number;
  verse?: ReaderAyah;
  className?: string;
}

export function VerseCard({
  verseNumber,
  arabic,
  bangla,
  english,
  urdu,
  transliteration,
  banglaTransliteration,
  isActive,
  showBangla = true,
  showEnglish = true,
  showUrdu = false,
  showTransliteration = false,
  onPlay,
  surahName,
  surahNumber,
  verse,
  className,
}: VerseCardProps) {
  return (
    <div
      id={`verse-${verseNumber}`}
      className={cn(
        'rounded-2xl px-4 py-5 md:px-8 md:py-7 transition-colors scroll-mt-20',
        isActive
          ? 'bg-[var(--active-verse-bg)] ring-1 ring-[var(--active-verse-border)] verse-card-active'
          : 'hover:bg-[var(--surface-hover)]',
        className,
      )}
    >
      {/* Verse number + actions row */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {/* Octagon-star badge for verse number */}
          <div className="relative w-10 h-10 flex items-center justify-center">
            <svg
              viewBox="0 0 40 40"
              className="absolute inset-0 w-full h-full"
              fill="none"
              aria-label={`Verse ${verseNumber}`}
            >
              <polygon
                points="20,2 26,8 34,6 32,14 38,20 32,26 34,34 26,32 20,38 14,32 6,34 8,26 2,20 8,14 6,6 14,8"
                stroke="var(--warm)"
                strokeWidth="1.5"
                fill="none"
                opacity="0.6"
              />
            </svg>
            <span className="text-xs font-semibold text-gold relative z-10 font-sans">
              {verseNumber}
            </span>
          </div>
          {/* Sajdah marker */}
          {surahNumber && SUJUD_AYAHS.has(`${surahNumber}-${verseNumber}`) && (
            <SujudMarker surah={surahNumber} ayah={verseNumber} />
          )}
        </div>

        {/* Action buttons - use VerseActions component when verse data is available */}
        {verse && surahName && onPlay ? (
          <VerseActions verse={verse} surahName={surahName} onPlay={onPlay} />
        ) : (
          onPlay && (
            <IconButton ariaLabel="Play verse" onClick={onPlay}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5,3 19,12 5,21" />
              </svg>
            </IconButton>
          )
        )}
      </div>

      {/* Arabic text */}
      <div
        dir="rtl"
        lang="ar"
        className="verse-arabic mb-4 leading-[2.2] break-words"
      >
        {arabic}
      </div>

      {/* Transliteration */}
      {showTransliteration && transliteration && (
        <p className="text-ink-3 italic text-sm mb-3 leading-relaxed">
          {transliteration}
        </p>
      )}

      {/* Bangla transliteration */}
      {showTransliteration && banglaTransliteration && (
        <p className="text-ink-3 text-sm mb-3 leading-relaxed font-[var(--font-bengali-ui)]">
          {banglaTransliteration}
        </p>
      )}

      {/* Bangla translation */}
      {showBangla && bangla && (
        <p className="verse-bangla mb-3 leading-relaxed break-words">
          {bangla}
        </p>
      )}

      {/* English translation */}
      {showEnglish && english && (
        <p className="verse-english leading-relaxed break-words">
          {english}
        </p>
      )}

      {/* Urdu translation */}
      {showUrdu && urdu && (
        <p className="text-ink-2 text-sm leading-relaxed break-words" dir="rtl" lang="ur" style={{ fontFamily: 'var(--font-arabic)' }}>
          {urdu}
        </p>
      )}
    </div>
  );
}
