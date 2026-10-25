'use client';

import { useState } from 'react';
import { type WordItem, playWordAudio } from '@/lib/data/words';

interface WordByWordVerseProps {
  words: WordItem[];
  arabicScript?: 'uthmani' | 'indopak';
  arabicSize?: number;
  onWordClick?: (word: WordItem) => void;
}

export function WordByWordVerse({
  words,
  arabicScript = 'uthmani',
  arabicSize = 28,
  onWordClick,
}: WordByWordVerseProps) {
  const [playingWordId, setPlayingWordId] = useState<number | null>(null);

  const handleWordClick = async (word: WordItem) => {
    if (word.charType === 'end') return;
    if (word.audioUrl) {
      setPlayingWordId(word.id);
      try {
        await playWordAudio(word.audioUrl);
      } finally {
        setTimeout(() => setPlayingWordId(null), 700);
      }
    }
    if (onWordClick) {
      onWordClick(word);
    }
  };

  if (!words || words.length === 0) return null;

  return (
    <div
      dir="rtl"
      className="flex flex-wrap items-end justify-start gap-x-3 gap-y-4 py-2"
    >
      {words.map((w) => {
        const isEnd = w.charType === 'end';
        const isPlaying = playingWordId === w.id;

        if (isEnd) {
          return (
            <div
              key={w.id || `end-${w.position}`}
              className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-gold/40 text-gold-dark text-xs font-bold font-arabic bg-gold/5 shrink-0 self-center"
              title={w.translation || `Ayah marker`}
            >
              {w.arabic || '۝'}
            </div>
          );
        }

        return (
          <button
            key={w.id || `${w.location}-${w.position}`}
            type="button"
            onClick={() => handleWordClick(w)}
            className={`group relative flex flex-col items-center p-2 rounded-xl border transition-all text-center select-none ${
              isPlaying
                ? 'bg-gold/20 border-gold shadow-sm scale-105'
                : 'bg-surface hover:bg-surface-highlight border-border hover:border-gold/30 hover:shadow-subtle'
            }`}
          >
            {/* Arabic Word */}
            <span
              lang="ar"
              className={`arabic-text text-text transition-colors leading-relaxed ${
                arabicScript === 'indopak' ? 'font-indopak' : 'font-uthmani'
              } ${isPlaying ? 'text-gold-dark font-medium' : 'group-hover:text-gold-dark'}`}
              style={{ fontSize: `${arabicSize}px` }}
            >
              {w.arabic}
            </span>

            {/* Transliteration */}
            {w.transliteration && (
              <span
                dir="ltr"
                className="text-[11px] font-sans text-text-muted/80 tracking-tight mt-0.5 max-w-[120px] truncate"
              >
                {w.transliteration}
              </span>
            )}

            {/* Translation */}
            {w.translation && (
              <span
                dir="ltr"
                className="text-[11px] font-sans font-medium text-text/80 tracking-tight mt-0.5 max-w-[120px] truncate group-hover:text-text"
              >
                {w.translation}
              </span>
            )}

            {/* Audio Indicator */}
            {w.audioUrl && (
              <span className="absolute top-1 left-1 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-gold-dark">
                🔊
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
