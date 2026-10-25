'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useIntl } from 'react-intl';
import { MushafPageView } from '@/components/quran/MushafPageView';
import { TafsirDrawer } from '@/components/quran/TafsirDrawer';
import { usePlayer } from '@/components/quran/player-context';
import { getSurah } from '@/lib/data/quran';

export default function MushafPage() {
  const intl = useIntl();
  const { playFromIndex } = usePlayer();
  const [tafsirState, setTafsirState] = useState<{ surahNumber: number; ayahNumber: number } | null>(null);

  const handleAyahClick = async (surahNumber: number, ayahNumber: number) => {
    try {
      const res = await fetch(`/data/verses/${surahNumber}.json`);
      if (res.ok) {
        const data = await res.json();
        const verses = data.ayahs || [];
        const idx = verses.findIndex((v: { number: number }) => v.number === ayahNumber);
        if (idx !== -1) {
          const surah = getSurah(surahNumber);
          playFromIndex(surahNumber, verses, idx, surah?.englishName);
        }
      }
    } catch (err) {
      console.warn('[Mushaf] Failed to load verses for playback:', err);
    }
  };

  const handleTafsirClick = (surahNumber: number, ayahNumber: number) => {
    setTafsirState({ surahNumber, ayahNumber });
  };

  return (
    <div className="min-h-screen bg-bg text-text transition-colors pb-24 pt-6 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Navigation Breadcrumbs */}
        <div className="flex items-center justify-between">
          <nav className="flex items-center gap-2 text-xs sm:text-sm text-text-muted">
            <Link href="/" className="hover:text-gold-dark transition-colors">
              {intl.formatMessage({ id: 'nav.home' }) || 'Home'}
            </Link>
            <span>/</span>
            <Link href="/quran/surahs" className="hover:text-gold-dark transition-colors">
              {intl.formatMessage({ id: 'nav.surah' }) || 'Surahs'}
            </Link>
            <span>/</span>
            <span className="text-text font-medium">
              15-Line Madani Mushaf (604 Pages)
            </span>
          </nav>
        </div>

        {/* Hero Title */}
        <div className="text-center py-4 space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text">
            المصحف الشريف (604 صفحات)
          </h1>
          <p className="text-xs sm:text-sm text-text-muted max-w-xl mx-auto">
            Sacred 15-line physical Mushaf layout with continuous flowing Arabic script, authentic page margins, and instant audio recitation.
          </p>
        </div>

        {/* 604-Page Mushaf Viewer */}
        <MushafPageView
          initialPage={1}
          onAyahClick={handleAyahClick}
          onTafsirClick={handleTafsirClick}
        />

        {/* Slide-over Tafsir Drawer */}
        {tafsirState && (
          <TafsirDrawer
            surahNumber={tafsirState.surahNumber}
            surahName={getSurah(tafsirState.surahNumber)?.name || `Surah ${tafsirState.surahNumber}`}
            totalAyahs={getSurah(tafsirState.surahNumber)?.numberOfAyahs || 7}
            currentAyah={tafsirState.ayahNumber}
            isOpen={true}
            onClose={() => setTafsirState(null)}
            onNavigateAyah={(newAyah) =>
              setTafsirState((prev) => (prev ? { ...prev, ayahNumber: newAyah } : null))
            }
          />
        )}
      </div>
    </div>
  );
}
