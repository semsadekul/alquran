'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useIntl } from 'react-intl';
import {
  TAFSIR_SOURCES,
  DEFAULT_BN_TAFSIR_ID,
  DEFAULT_EN_TAFSIR_ID,
  fetchTafsir,
  getTafsirSource,
} from '@/lib/data/tafsir';
import { ArrowLeftIcon, ArrowRightIcon, CloseIcon } from '@/components/ui/Icon';
import { Button } from '@/components/ui/Button';

export interface TafsirDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  surahNumber: number;
  surahName: string;
  totalAyahs: number;
  currentAyah: number;
  ayahArabic?: string;
  ayahTranslation?: string;
  onNavigateAyah: (ayah: number) => void;
}

export function TafsirDrawer({
  isOpen,
  onClose,
  surahNumber,
  surahName,
  totalAyahs,
  currentAyah,
  ayahArabic,
  ayahTranslation,
  onNavigateAyah,
}: TafsirDrawerProps) {
  const intl = useIntl();
  const isBengali = intl.locale.startsWith('bn');

  const [selectedTafsirId, setSelectedTafsirId] = useState<number>(
    isBengali ? DEFAULT_BN_TAFSIR_ID : DEFAULT_EN_TAFSIR_ID,
  );
  const [tafsirHtml, setTafsirHtml] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [fontSize, setFontSize] = useState<number>(16);

  const scrollRef = useRef<HTMLDivElement>(null);

  // Sync default selection if locale changes
  useEffect(() => {
    setSelectedTafsirId(isBengali ? DEFAULT_BN_TAFSIR_ID : DEFAULT_EN_TAFSIR_ID);
  }, [isBengali]);

  // Load tafsir on ayah or edition change
  const loadTafsir = useCallback(async () => {
    if (!isOpen || !surahNumber || !currentAyah) return;
    setIsLoading(true);
    setError(null);

    const res = await fetchTafsir(selectedTafsirId, surahNumber, currentAyah);
    if (res.error) {
      setError(res.error);
      setTafsirHtml('');
    } else {
      setTafsirHtml(res.text);
      setError(null);
    }
    setIsLoading(false);

    // Scroll back to top on ayah change
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [isOpen, selectedTafsirId, surahNumber, currentAyah]);

  useEffect(() => {
    loadTafsir();
  }, [loadTafsir]);

  // Handle ESC key and arrow keys for navigation
  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        if (currentAyah > 1) {
          onNavigateAyah(currentAyah - 1);
        }
      } else if (e.key === 'ArrowRight') {
        if (currentAyah < totalAyahs) {
          onNavigateAyah(currentAyah + 1);
        }
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose, currentAyah, totalAyahs, onNavigateAyah]);

  if (!isOpen) return null;

  const currentSource = getTafsirSource(selectedTafsirId);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="tafsir-drawer-title"
      className="fixed inset-0 z-50 overflow-hidden flex justify-end animate-fade-in"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-over panel */}
      <aside className="relative z-10 w-full max-w-2xl bg-surface border-l border-border shadow-elevated flex flex-col h-full overflow-hidden text-text animate-slide-left">
        {/* Header */}
        <div className="p-4 sm:px-6 border-b border-border-subtle bg-surface-highlight/40 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-wider text-gold-dark font-medium">
              {intl.formatMessage({ id: 'surah.tafsirs' }) || 'Tafsir'}
            </p>
            <h2 id="tafsir-drawer-title" className="font-display text-lg sm:text-xl font-semibold text-text truncate">
              {surahName} · {surahNumber}:{currentAyah}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {/* Font size toggle */}
            <div className="flex items-center border border-border-subtle rounded-lg bg-surface px-1 py-0.5 text-xs">
              <button
                type="button"
                onClick={() => setFontSize((s) => Math.max(14, s - 1))}
                aria-label={intl.formatMessage({ id: 'tafsir.fontDecrease' })}
                className="w-6 h-6 flex items-center justify-center text-text-muted hover:text-text rounded"
              >
                A-
              </button>
              <span className="px-1 text-[11px] text-text-muted font-mono">{fontSize}</span>
              <button
                type="button"
                onClick={() => setFontSize((s) => Math.min(24, s + 1))}
                aria-label={intl.formatMessage({ id: 'tafsir.fontIncrease' })}
                className="w-6 h-6 flex items-center justify-center text-text-muted hover:text-text rounded"
              >
                A+
              </button>
            </div>

            {/* Close button */}
            <button
              type="button"
              onClick={onClose}
              aria-label={intl.formatMessage({ id: 'tafsir.close' })}
              className="w-9 h-9 rounded-lg flex items-center justify-center text-text-muted hover:text-text hover:bg-surface-highlight transition-colors"
            >
              <CloseIcon width={18} height={18} />
            </button>
          </div>
        </div>

        {/* Edition Selector Bar */}
        <div className="px-4 sm:px-6 py-2.5 bg-surface border-b border-border-subtle flex items-center gap-2 overflow-x-auto no-scrollbar">
          <label htmlFor="tafsir-edition-select" className="text-xs text-text-muted shrink-0 font-medium">
            Edition:
          </label>
          <select
            id="tafsir-edition-select"
            value={selectedTafsirId}
            onChange={(e) => setSelectedTafsirId(Number(e.target.value))}
            className="text-xs sm:text-sm bg-surface-highlight border border-border-subtle rounded-lg px-2.5 py-1.5 text-text font-medium focus:outline-none focus:ring-1 focus:ring-gold"
          >
            <optgroup label="Bengali (বাংলা তাফসীর)">
              {TAFSIR_SOURCES.filter((s) => s.language === 'bn').map((s) => (
                <option key={s.id} value={s.id}>
                  {s.banglaName}
                </option>
              ))}
            </optgroup>
            <optgroup label="English Tafsir">
              {TAFSIR_SOURCES.filter((s) => s.language === 'en').map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.authorName})
                </option>
              ))}
            </optgroup>
          </select>
        </div>

        {/* Scrollable Content Body */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Ayah preview box */}
          {(ayahArabic || ayahTranslation) && (
            <div className="rounded-xl p-4 bg-surface-highlight/50 border border-gold-line space-y-3">
              {ayahArabic && (
                <p
                  dir="rtl"
                  lang="ar"
                  className="font-arabic text-xl sm:text-2xl text-right leading-loose text-text"
                  style={{ fontFamily: 'var(--font-arabic)' }}
                >
                  {ayahArabic}
                </p>
              )}
              {ayahTranslation && (
                <p className="text-sm text-text-muted italic border-t border-border-subtle pt-2.5">
                  &quot;{ayahTranslation}&quot;
                </p>
              )}
            </div>
          )}

          {/* Tafsir text / skeleton */}
          {isLoading ? (
            <div className="space-y-4 animate-pulse pt-4">
              <div className="h-4 bg-surface-highlight rounded w-3/4" />
              <div className="h-4 bg-surface-highlight rounded w-full" />
              <div className="h-4 bg-surface-highlight rounded w-5/6" />
              <div className="h-4 bg-surface-highlight rounded w-2/3" />
              <div className="h-32 bg-surface-highlight rounded-xl w-full mt-6" />
            </div>
          ) : error ? (
            <div className="text-center py-12 space-y-3">
              <p className="text-sm text-rose-500">{error}</p>
              <Button variant="outline" size="sm" onClick={loadTafsir}>
                Retry
              </Button>
            </div>
          ) : (
            <article className="space-y-4">
              <div className="flex items-center justify-between text-xs text-text-muted border-b border-border-subtle pb-2">
                <span>{currentSource?.name}</span>
                <span>{currentSource?.authorName}</span>
              </div>

              {/* Rendered HTML */}
              <div
                className="tafsir-content prose prose-stone dark:prose-invert max-w-none text-text leading-relaxed space-y-4"
                style={{ fontSize: `${fontSize}px` }}
                dangerouslySetInnerHTML={{ __html: tafsirHtml }}
              />
            </article>
          )}
        </div>

        {/* Footer Navigation Bar */}
        <footer className="p-3 sm:px-6 border-t border-border-subtle bg-surface-highlight/50 flex items-center justify-between gap-3 shrink-0">
          <Button
            variant="outline"
            size="sm"
            disabled={currentAyah <= 1}
            onClick={() => onNavigateAyah(currentAyah - 1)}
            aria-label={intl.formatMessage({ id: 'tafsir.prevAyah' })}
          >
            <ArrowLeftIcon className="w-3.5 h-3.5 mr-1" />
            <span className="hidden sm:inline">Previous Ayah</span>
            <span className="sm:hidden">Prev</span>
          </Button>

          <span className="text-xs font-mono text-text-muted">
            Ayah {currentAyah} of {totalAyahs}
          </span>

          <Button
            variant="outline"
            size="sm"
            disabled={currentAyah >= totalAyahs}
            onClick={() => onNavigateAyah(currentAyah + 1)}
            aria-label={intl.formatMessage({ id: 'tafsir.nextAyah' })}
          >
            <span className="hidden sm:inline">Next Ayah</span>
            <span className="sm:hidden">Next</span>
            <ArrowRightIcon className="w-3.5 h-3.5 ml-1" />
          </Button>
        </footer>
      </aside>
    </div>
  );
}
