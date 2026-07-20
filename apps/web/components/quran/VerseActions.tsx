'use client';

import { Play, Bookmark, Copy, Share2 } from 'lucide-react';
import { useState, useCallback } from 'react';
import { ReaderAyah } from './types';
import { IconButton } from '@/components/ui/IconButton';

interface VerseActionsProps {
  verse: ReaderAyah;
  onPlay: () => void;
}

export function VerseActions({ verse, onPlay }: VerseActionsProps) {
  const [isBookmarked, setIsBookmarked] = useState(false);

  const handleBookmark = useCallback(() => {
    setIsBookmarked((prev) => !prev);
    // TODO: integrate with IndexedDB bookmarks store
  }, []);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(verse.arabic + '\n\n' + verse.bangla);
  }, [verse.arabic, verse.bangla]);

  const handleShare = useCallback(async () => {
    const text = `${verse.arabic}\n\n${verse.bangla}\n\n— Quran ${verse.surah}:${verse.ayah}`;
    if (navigator.share) {
      try {
        await navigator.share({ text });
      } catch {
        // user cancelled
      }
    } else {
      navigator.clipboard.writeText(text);
    }
  }, [verse]);

  return (
    <div className="flex items-center gap-1">
      <IconButton ariaLabel="Play verse" onClick={onPlay}>
        <Play size={16} />
      </IconButton>
      <IconButton
        ariaLabel={isBookmarked ? 'Remove bookmark' : 'Bookmark'}
        onClick={handleBookmark}
        active={isBookmarked}
      >
        <Bookmark
          size={16}
          fill={isBookmarked ? 'currentColor' : 'none'}
        />
      </IconButton>
      <IconButton ariaLabel="Copy verse" onClick={handleCopy}>
        <Copy size={16} />
      </IconButton>
      <IconButton ariaLabel="Share verse" onClick={handleShare}>
        <Share2 size={16} />
      </IconButton>
    </div>
  );
}
