'use client';

import { useState, useEffect, useCallback } from 'react';
import { useIntl } from 'react-intl';
import { fetchMushafPage, getSurahStartPage, type MushafPageData, type MushafVerse } from '@/lib/data/mushaf';
import { getSurah } from '@/lib/data/quran';

interface MushafPageViewProps {
  initialPage?: number;
  currentSurahNumber?: number;
  activeVerseNumber?: number;
  onAyahClick?: (surahNumber: number, verseNumber: number) => void;
  onTafsirClick?: (surahNumber: number, verseNumber: number) => void;
}

export function MushafPageView({
  initialPage,
  currentSurahNumber,
  activeVerseNumber,
  onAyahClick,
  onTafsirClick,
}: MushafPageViewProps) {
  const intl = useIntl();
  const startPage = initialPage || (currentSurahNumber ? getSurahStartPage(currentSurahNumber) : 1);
  const [currentPage, setCurrentPage] = useState<number>(startPage);
  const [pageData, setPageData] = useState<MushafPageData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Load page data
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchMushafPage(currentPage).then((data) => {
      if (!cancelled) {
        setPageData(data);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [currentPage]);

  // Sync if currentSurahNumber prop changes externally
  useEffect(() => {
    if (currentSurahNumber) {
      const targetPage = getSurahStartPage(currentSurahNumber);
      setCurrentPage(targetPage);
    }
  }, [currentSurahNumber]);

  const handlePrevPage = useCallback(() => {
    setCurrentPage((p) => Math.max(1, p - 1));
  }, []);

  const handleNextPage = useCallback(() => {
    setCurrentPage((p) => Math.min(604, p + 1));
  }, []);

  // Keyboard navigation for page turning
  useEffect(() => {
    const onKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'ArrowLeft') {
        handlePrevPage();
      } else if (e.key === 'ArrowRight') {
        handleNextPage();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handlePrevPage, handleNextPage]);

  // Group verses by Surah on this page
  const versesBySurah = pageData
    ? pageData.verses.reduce<Record<number, MushafVerse[]>>((acc, v) => {
        if (!acc[v.surahNumber]) acc[v.surahNumber] = [];
        acc[v.surahNumber].push(v);
        return acc;
      }, {})
    : {};

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Sacred Mushaf Outer Parchment Card */}
      <div className="relative rounded-3xl border-2 border-gold/30 bg-[#FFFDF8] dark:bg-[#0E1714] p-6 sm:p-10 shadow-elevated transition-colors">
        {/* Subtle Islamic Corner Accents */}
        <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-gold/40 rounded-tl-lg pointer-events-none" />
        <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-gold/40 rounded-tr-lg pointer-events-none" />
        <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-gold/40 rounded-bl-lg pointer-events-none" />
        <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-gold/40 rounded-br-lg pointer-events-none" />

        {/* Top Header Margin */}
        <div className="flex items-center justify-between pb-6 mb-6 border-b border-gold/20 text-xs sm:text-sm font-medium text-text-muted">
          {/* Juz indicator */}
          <div className="flex items-center gap-1.5 font-sans">
            <span className="w-2 h-2 rounded-full bg-gold" />
            <span>
              {intl.formatMessage({ id: 'nav.juz' }) || 'Juz'} {pageData?.juzNumber ?? 1}
            </span>
          </div>

          {/* Surah Name in header */}
          <div className="font-arabic font-bold text-sm sm:text-base text-gold-dark truncate max-w-[200px]">
            {pageData?.surahNumbers.map((sNum) => getSurah(sNum)?.name).join(' · ') || ''}
          </div>

          {/* Page number */}
          <div className="font-sans tabular-nums text-text-muted">
            {currentPage} / 604
          </div>
        </div>

        {/* Page Body Content */}
        {loading ? (
          <div className="py-24 space-y-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="h-6 rounded-md shimmer" />
            ))}
          </div>
        ) : (
          <div className="space-y-8 select-text">
            {Object.entries(versesBySurah).map(([surahStr, vList]) => {
              const surahNum = Number(surahStr);
              const surahInfo = getSurah(surahNum);
              const isFirstAyahOnPage = vList[0]?.verseNumber === 1;

              return (
                <div key={surahNum} className="space-y-6">
                  {/* Surah Banner if Surah starts on this page */}
                  {isFirstAyahOnPage && (
                    <div className="text-center my-6 space-y-4">
                      <div className="inline-block px-8 py-3 rounded-2xl bg-gradient-to-r from-gold/10 via-gold/25 to-gold/10 border border-gold/40 shadow-soft">
                        <h2 className="font-arabic text-2xl sm:text-3xl text-gold-dark font-bold">
                          سُورَةُ {surahInfo?.name || `Surah ${surahNum}`}
                        </h2>
                        <p className="text-xs text-text-muted font-sans mt-0.5">
                          {surahInfo?.englishName} · {surahInfo?.numberOfAyahs} {intl.formatMessage({ id: 'surah.ayahs' }) || 'Ayahs'}
                        </p>
                      </div>

                      {/* Bismillah (except Surah 9 At-Tawbah and Surah 1 Al-Fatiha which has it as Ayah 1) */}
                      {surahNum !== 9 && surahNum !== 1 && (
                        <p className="font-arabic text-xl sm:text-2xl text-text/80 tracking-wide font-normal pt-2">
                          بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
                        </p>
                      )}
                    </div>
                  )}

                  {/* 15-Line Flowing Justified Quran Text */}
                  <div
                    dir="rtl"
                    className="font-uthmani text-justify text-2xl sm:text-3xl md:text-[32px] leading-[2.6] sm:leading-[2.8] text-text"
                  >
                    {vList.map((v) => {
                      const isActive =
                        currentSurahNumber === v.surahNumber &&
                        activeVerseNumber === v.verseNumber;

                      return (
                        <span
                          key={v.id}
                          className={`relative inline transition-colors rounded-md ${
                            isActive
                              ? 'bg-gold/25 text-gold-dark px-1'
                              : 'hover:bg-gold/10'
                          }`}
                        >
                          <span
                            onClick={() => onAyahClick?.(v.surahNumber, v.verseNumber)}
                            className="cursor-pointer"
                          >
                            {v.arabic}
                          </span>

                          {/* Ornate Circular Ayah End Marker */}
                          <button
                            type="button"
                            onClick={() => onAyahClick?.(v.surahNumber, v.verseNumber)}
                            className="inline-flex items-center justify-center mx-1.5 w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-gold/60 text-gold-dark font-bold font-arabic text-xs sm:text-sm bg-gold/10 hover:bg-gold hover:text-[#1a1814] transition-all select-none align-middle"
                            title={`Ayah ${v.verseNumber} (Click to play/read)`}
                          >
                            {v.verseNumber}
                          </button>

                          {/* Tafsir quick link */}
                          {onTafsirClick && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onTafsirClick(v.surahNumber, v.verseNumber);
                              }}
                              className="inline-flex items-center justify-center text-[11px] text-text-muted hover:text-gold-dark opacity-40 hover:opacity-100 ml-1 transition-opacity align-middle"
                              title="Tafsir"
                            >
                              📖
                            </button>
                          )}
                        </span>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Bottom Page Number Badge */}
        <div className="pt-8 mt-8 border-t border-gold/20 flex items-center justify-between text-xs text-text-muted">
          <button
            type="button"
            onClick={handlePrevPage}
            disabled={currentPage <= 1}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border bg-surface hover:bg-surface-highlight disabled:opacity-40 disabled:pointer-events-none transition-colors"
          >
            ← {intl.formatMessage({ id: 'pagination.prev' }) || 'Previous'}
          </button>

          {/* Jump to page */}
          <div className="flex items-center gap-2">
            <span className="font-arabic text-sm text-gold-dark font-bold">
              صفحة {currentPage}
            </span>
            <select
              value={currentPage}
              onChange={(e) => setCurrentPage(Number(e.target.value))}
              className="bg-surface border border-border rounded-lg text-xs px-2 py-1 text-text focus:outline-none focus:border-gold"
              aria-label="Select page"
            >
              {Array.from({ length: 604 }, (_, i) => i + 1).map((p) => (
                <option key={p} value={p}>
                  Page {p} (Juz {Math.min(30, Math.floor((p - 1) / 20) + 1)})
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={handleNextPage}
            disabled={currentPage >= 604}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border bg-surface hover:bg-surface-highlight disabled:opacity-40 disabled:pointer-events-none transition-colors"
          >
            {intl.formatMessage({ id: 'pagination.next' }) || 'Next'} →
          </button>
        </div>
      </div>
    </div>
  );
}
