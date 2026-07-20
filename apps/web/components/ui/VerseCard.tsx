import { cn } from '@/lib/cn';
import { IconButton } from './IconButton';

interface VerseCardProps {
  verseNumber: number;
  arabic: string;
  bangla?: string;
  english?: string;
  transliteration?: string;
  banglaTransliteration?: string;
  isActive?: boolean;
  showBangla?: boolean;
  showEnglish?: boolean;
  showTransliteration?: boolean;
  onPlay?: () => void;
  onBookmark?: () => void;
  onCopy?: () => void;
  onShare?: () => void;
  onTafsir?: () => void;
  isBookmarked?: boolean;
  className?: string;
}

export function VerseCard({
  verseNumber,
  arabic,
  bangla,
  english,
  transliteration,
  banglaTransliteration,
  isActive,
  showBangla = true,
  showEnglish = true,
  showTransliteration = false,
  onPlay,
  onBookmark,
  onCopy,
  onShare,
  onTafsir,
  isBookmarked,
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
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1">
          {onPlay && (
            <IconButton ariaLabel="Play verse" onClick={onPlay}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5,3 19,12 5,21" />
              </svg>
            </IconButton>
          )}
          {onBookmark && (
            <IconButton
              ariaLabel={isBookmarked ? 'Remove bookmark' : 'Bookmark'}
              onClick={onBookmark}
              active={isBookmarked}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill={isBookmarked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
              </svg>
            </IconButton>
          )}
          {onCopy && (
            <IconButton ariaLabel="Copy verse" onClick={onCopy}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
              </svg>
            </IconButton>
          )}
          {onShare && (
            <IconButton ariaLabel="Share verse" onClick={onShare}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
              </svg>
            </IconButton>
          )}
          {onTafsir && (
            <IconButton ariaLabel="View tafsir" onClick={onTafsir}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
              </svg>
            </IconButton>
          )}
        </div>
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
    </div>
  );
}
