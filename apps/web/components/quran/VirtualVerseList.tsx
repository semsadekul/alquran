'use client';

import { useCallback, useEffect, useMemo, useRef } from 'react';
import { List } from 'react-window';
import type { ListImperativeAPI } from 'react-window';
import { AutoSizer } from 'react-virtualized-auto-sizer';
import type { ReaderAyah, ReaderSurah } from './types';
import { VerseCard } from '@/components/ui/VerseCard';
import { ReaderPreferences } from '@alquran/types';
import type { ListProps } from 'react-window';

const DEFAULT_ROW_HEIGHT = 260;

// Custom row data — only non-forbidden keys
interface RowData {
  verses: ReaderAyah[];
  surah: ReaderSurah;
  preferences: ReaderPreferences;
  activeAyahKey: string | null;
  onPlay: (verse: ReaderAyah) => void;
}

interface VerseRow {
  index: number;
  style: React.CSSProperties;
  verses: ReaderAyah[];
  surah: ReaderSurah;
  preferences: ReaderPreferences;
  activeAyahKey: string | null;
  onPlay: (verse: ReaderAyah) => void;
}

// Inline row renderer for react-window v2
function VerseRow({
  index,
  style,
  verses,
  surah,
  preferences,
  activeAyahKey,
  onPlay,
}: VerseRow) {
  const verse = verses[index];
  if (!verse) return null;

  const key = `${verse.surah}-${verse.ayah}`;
  const isActive = activeAyahKey === key;

  return (
    <div style={style}>
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
        onPlay={() => onPlay(verse)}
        surahName={surah.englishName}
        surahNumber={surah.number}
        verse={verse}
      />
    </div>
  );
}

interface VirtualVerseListProps {
  verses: ReaderAyah[];
  surah: ReaderSurah;
  preferences: ReaderPreferences;
  activeAyahKey: string | null;
  onPlay: (verse: ReaderAyah) => void;
  onActiveRef: (el: HTMLDivElement | null) => void;
}

export function VirtualVerseList({
  verses,
  surah,
  preferences,
  activeAyahKey,
  onPlay,
}: VirtualVerseListProps) {
  const listRef = useRef<ListImperativeAPI>(null);

  // Estimate row height based on Arabic text length
  const getRowHeight = useCallback((index: number): number => {
    const verse = verses[index];
    if (!verse) return DEFAULT_ROW_HEIGHT;
    const base = 200;
    const extra = Math.floor(verse.arabic.length / 50) * 30;
    return Math.max(140, Math.min(500, base + extra));
  }, [verses]);

  // Scroll active verse into view when playback changes
  useEffect(() => {
    if (!activeAyahKey || !listRef.current) return;
    const activeIndex = verses.findIndex(
      (v) => `${v.surah}-${v.ayah}` === activeAyahKey,
    );
    if (activeIndex >= 0) {
      listRef.current.scrollToRow({
        behavior: 'smooth',
        align: 'center',
        index: activeIndex,
      });
    }
  }, [activeAyahKey, verses]);

  // Only virtualize for long surahs (≥50 ayahs)
  if (verses.length < 50) return null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const safeRowProps: any = {
    verses,
    surah,
    preferences,
    activeAyahKey,
    onPlay,
  };

  return (
    <div className="h-[70vh] w-full">
      <AutoSizer
        renderProp={({ height, width }) => (
          <List<VerseRow>
            listRef={listRef}
            rowCount={verses.length}
            rowHeight={getRowHeight}
            overscanCount={4}
            defaultHeight={DEFAULT_ROW_HEIGHT}
            style={{ width, height }}
            rowComponent={VerseRow}
            rowProps={safeRowProps}
          />
        )}
      />
    </div>
  );
}
