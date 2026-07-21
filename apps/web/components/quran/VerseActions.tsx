'use client';

import { Play, Bookmark, Copy, Share2 } from 'lucide-react';
import { useCallback } from 'react';
import { ReaderAyah } from './types';
import { IconButton } from '@/components/ui/IconButton';
import { useBookmarks } from '@/hooks/useBookmarks';
import { useAnnounce } from '@/components/ui/Announce';

interface VerseActionsProps {
  verse: ReaderAyah;
  surahName: string;
  onPlay: () => void;
}

export function VerseActions({ verse, surahName, onPlay }: VerseActionsProps) {
  const { toggle, has } = useBookmarks();
  const { announce } = useAnnounce();

  const handleCopy = useCallback(() => {
    const text = `${verse.arabic}\n\n${verse.bangla}\n\n${verse.english}\n\n— Quran ${verse.surah}:${verse.ayah}`;
    navigator.clipboard.writeText(text).then(() => {
      announce(`Verse ${verse.surah}:${verse.ayah} copied to clipboard`);
    }).catch(console.error);
  }, [verse, announce]);

  const handleShare = useCallback(async () => {
    const text = `${verse.arabic}\n\n${verse.bangla}\n\n${verse.english}\n\n— Quran ${verse.surah}:${verse.ayah}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Surah ${verse.surah}, Verse ${verse.ayah}`,
          text,
        });
        announce(`Shared verse ${verse.surah}:${verse.ayah}`);
      } catch {
        // user cancelled
      }
    } else {
      navigator.clipboard.writeText(text).then(() => {
        announce(`Verse ${verse.surah}:${verse.ayah} copied to clipboard`);
      }).catch(console.error);
    }
  }, [verse, announce]);

  const handleTafsir = useCallback(() => {
    window.open(`/quran/tafsir/${verse.surah}/${verse.ayah}`, '_self');
  }, [verse]);

  return (
    <div className="flex items-center gap-1">
      <IconButton ariaLabel="Play verse" onClick={onPlay}>
        <Play size={16} />
      </IconButton>
      <IconButton
        ariaLabel={has(verse.surah, verse.ayah) ? 'Remove bookmark' : 'Bookmark'}
        onClick={() => toggle(verse.surah, verse.ayah, verse, surahName)}
        active={has(verse.surah, verse.ayah)}
      >
        <Bookmark
          size={16}
          fill={has(verse.surah, verse.ayah) ? 'currentColor' : 'none'}
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
