'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PlayIcon, ShareIcon, BookOpenIcon } from '@/components/ui/Icon';
import { TafsirDrawer } from '@/components/quran/TafsirDrawer';
import { ShareAyahModal } from '@/components/ui/ShareAyahModal';
import { usePlayer } from '@/components/quran/player-context';
import { getSurah } from '@/lib/data/quran';

export interface DisplayVerse {
  surahNumber: number;
  ayahNumber: number;
  arabic: string;
  bangla: string;
  english: string;
  transliteration?: string;
  banglaTransliteration?: string;
}

export function TopicVerseList({ verses }: { verses: DisplayVerse[] }) {
  const { playFromIndex } = usePlayer();
  const [tafsirAyah, setTafsirAyah] = useState<{ surah: number; ayah: number } | null>(null);
  const [shareAyah, setShareAyah] = useState<DisplayVerse | null>(null);

  const handlePlay = (v: DisplayVerse) => {
    const surah = getSurah(v.surahNumber);
    playFromIndex(
      v.surahNumber,
      [{ number: v.ayahNumber, arabic: v.arabic, english: v.english }],
      0,
      surah?.englishName
    );
  };

  return (
    <div className="space-y-4">
      {verses.map((v) => {
        const surah = getSurah(v.surahNumber);
        return (
          <Card
            key={`${v.surahNumber}:${v.ayahNumber}`}
            variant="elevated"
            className="p-6 border-gold-line hover:border-gold/50 transition-colors"
          >
            {/* Top header row */}
            <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-border-subtle">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-md bg-forest/10 dark:bg-gold-veil/40 text-gold-dark font-bold text-xs">
                  {v.surahNumber}:{v.ayahNumber}
                </span>
                <span className="font-semibold text-text text-sm">
                  Surah {surah?.englishName ?? v.surahNumber} ({surah?.banglaName})
                </span>
              </div>

              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handlePlay(v)}
                  aria-label="Play recitation"
                  className="text-gold-dark hover:bg-gold-veil/30 p-2 h-auto"
                >
                  <PlayIcon className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setTafsirAyah({ surah: v.surahNumber, ayah: v.ayahNumber })}
                  aria-label="Read Tafsir"
                  className="text-text-muted hover:text-text p-2 h-auto"
                >
                  <BookOpenIcon className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShareAyah(v)}
                  aria-label="Share Ayah Card"
                  className="text-text-muted hover:text-text p-2 h-auto"
                >
                  <ShareIcon className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Arabic Text */}
            <p
              dir="rtl"
              lang="ar"
              className="text-2xl sm:text-3xl font-arabic text-text text-right leading-loose mb-4"
              style={{ fontFamily: 'var(--font-arabic)' }}
            >
              {v.arabic}
            </p>

            {/* Transliteration */}
            {v.transliteration && (
              <p className="text-xs sm:text-sm text-gold-dark/90 italic mb-1.5">
                {v.transliteration}
              </p>
            )}

            {/* Bangla Pronunciation (উচ্চারণ) */}
            {v.banglaTransliteration && (
              <p
                lang="bn"
                className="text-xs sm:text-sm text-gold-dark/80 mb-2 bangla-ui"
                style={{ fontFamily: 'var(--font-bengali-ui)' }}
              >
                {v.banglaTransliteration}
              </p>
            )}

            {/* Bangla Translation */}
            <p
              className="text-sm sm:text-base text-text mb-2 leading-relaxed"
              style={{ fontFamily: 'var(--font-bengali-ui)' }}
            >
              {v.bangla}
            </p>

            {/* English Translation */}
            <p className="text-xs sm:text-sm text-text-muted italic leading-relaxed">
              &ldquo;{v.english}&rdquo;
            </p>
          </Card>
        );
      })}

      {/* Tafsir Drawer */}
      {tafsirAyah && (
        <TafsirDrawer
          isOpen={true}
          onClose={() => setTafsirAyah(null)}
          surahNumber={tafsirAyah.surah}
          currentAyah={tafsirAyah.ayah}
          surahName={getSurah(tafsirAyah.surah)?.englishName ?? ''}
          totalAyahs={getSurah(tafsirAyah.surah)?.numberOfAyahs ?? 1}
          onNavigateAyah={(nextAyah) =>
            setTafsirAyah((prev) => (prev ? { ...prev, ayah: nextAyah } : null))
          }
        />
      )}

      {/* Share Ayah Modal */}
      {shareAyah && (
        <ShareAyahModal
          isOpen={true}
          onClose={() => setShareAyah(null)}
          data={{
            surahName: getSurah(shareAyah.surahNumber)?.name ?? '',
            surahEnglishName: getSurah(shareAyah.surahNumber)?.englishName ?? '',
            surahNumber: shareAyah.surahNumber,
            verseNumber: shareAyah.ayahNumber,
            arabic: shareAyah.arabic,
            bangla: shareAyah.bangla,
            english: shareAyah.english,
          }}
        />
      )}
    </div>
  );
}
