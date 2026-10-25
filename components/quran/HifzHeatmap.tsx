'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useIntl } from 'react-intl';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { getSurahs, getQuranStats } from '@/lib/data/quran';
import { JUZ_START_PAGES, SURAH_START_PAGES, getJuzForPage } from '@/lib/data/mushaf';

interface AyahMasteryRecord {
  mastered: boolean;
  practiceCount: number;
  lastPracticed: number;
}

const MASTERY_KEY = 'alquran_hifz_ayah_progress';

export function HifzHeatmap() {
  const intl = useIntl();
  const [activeTab, setActiveTab] = useState<'juz' | 'pages'>('juz');
  const [masteryData, setMasteryData] = useState<Record<string, AyahMasteryRecord>>({});
  const [hoveredPage, setHoveredPage] = useState<number | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(MASTERY_KEY);
      if (stored) {
        setMasteryData(JSON.parse(stored));
      }
    } catch {
      // Ignore parse errors
    }
  }, []);

  const surahs = useMemo(() => getSurahs(), []);
  const stats = useMemo(() => getQuranStats(), []);

  // Compute total mastered ayahs
  const masteredAyahKeys = useMemo(() => {
    return new Set(
      Object.entries(masteryData)
        .filter(([_, v]) => v.mastered || v.practiceCount >= 10)
        .map(([k]) => k),
    );
  }, [masteryData]);

  // Compute 30 Juz statistics
  const juzStats = useMemo(() => {
    // 30 juz
    return Array.from({ length: 30 }, (_, idx) => {
      const juzNum = idx + 1;
      const startPage = JUZ_START_PAGES[idx];
      const endPage = idx === 29 ? 604 : JUZ_START_PAGES[idx + 1] - 1;

      // Find surahs in this juz (based on start page)
      const surahsInJuz = surahs.filter((s) => {
        const p = SURAH_START_PAGES[s.number - 1];
        return p >= startPage && p <= endPage;
      });

      // Rough count of total ayahs in this juz (approx 6236 / 30 ~ 208)
      const approxTotal = Math.round(stats.totalAyahs / 30);
      let masteredInJuz = 0;

      surahsInJuz.forEach((s) => {
        for (let a = 1; a <= s.numberOfAyahs; a++) {
          if (masteredAyahKeys.has(`${s.number}:${a}`)) {
            masteredInJuz += 1;
          }
        }
      });

      const pct = Math.min(100, Math.round((masteredInJuz / approxTotal) * 100));

      return {
        juz: juzNum,
        startPage,
        endPage,
        surahNames: surahsInJuz.map((s) => s.englishName).slice(0, 3).join(', ') + (surahsInJuz.length > 3 ? '…' : ''),
        masteredCount: masteredInJuz,
        totalCount: approxTotal,
        percentage: pct,
      };
    });
  }, [surahs, stats.totalAyahs, masteredAyahKeys]);

  // Compute 604 page mastery
  const pagesStats = useMemo(() => {
    // Average 10 ayahs per page
    return Array.from({ length: 604 }, (_, idx) => {
      const pageNum = idx + 1;
      const juzNum = getJuzForPage(pageNum);

      // Find surah starting closest to this page
      let closestSurah = 1;
      for (let s = 1; s <= 114; s++) {
        if (SURAH_START_PAGES[s - 1] <= pageNum) {
          closestSurah = s;
        } else {
          break;
        }
      }

      // Check if any ayahs around this surah are mastered
      let masteredOnPage = 0;
      for (let a = 1; a <= 15; a++) {
        if (masteredAyahKeys.has(`${closestSurah}:${a}`)) {
          masteredOnPage += 1;
        }
      }

      return {
        page: pageNum,
        juz: juzNum,
        surah: surahs.find((s) => s.number === closestSurah)?.englishName || `Surah ${closestSurah}`,
        masteredCount: masteredOnPage,
        isMastered: masteredOnPage >= 5,
        isPartial: masteredOnPage > 0 && masteredOnPage < 5,
      };
    });
  }, [surahs, masteredAyahKeys]);

  const totalMasteredAyahs = masteredAyahKeys.size;
  const overallMasteryPct = Math.round((totalMasteredAyahs / 6236) * 100);

  return (
    <Card variant="elevated" className="p-6 space-y-6">
      {/* Header & View Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h3 className="text-lg font-bold text-text flex items-center gap-2">
            <span>🌟</span>
            Quran Mastery Heatmap (হিজফ হিটম্যাপ)
          </h3>
          <p className="text-xs text-text-muted mt-0.5">
            Visualize your memorization progress across all 30 Juz and 604 Madani Mushaf pages.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="inline-flex rounded-xl bg-surface-2 p-1 border border-border">
          <button
            type="button"
            onClick={() => setActiveTab('juz')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'juz'
                ? 'bg-gold text-[#1a1814] shadow-sm'
                : 'text-text-muted hover:text-text'
            }`}
          >
            30 Juz View
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('pages')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'pages'
                ? 'bg-gold text-[#1a1814] shadow-sm'
                : 'text-text-muted hover:text-text'
            }`}
          >
            604 Pages Grid
          </button>
        </div>
      </div>

      {/* Summary Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 rounded-xl bg-surface-2 border border-border text-center">
          <p className="text-[11px] text-text-muted uppercase tracking-wider">Ayahs Mastered</p>
          <p className="text-xl font-bold text-gold-dark mt-0.5 tabular-nums">
            {totalMasteredAyahs} <span className="text-xs text-text-muted font-normal">/ 6,236</span>
          </p>
        </div>
        <div className="p-3 rounded-xl bg-surface-2 border border-border text-center">
          <p className="text-[11px] text-text-muted uppercase tracking-wider">Overall Progress</p>
          <p className="text-xl font-bold text-gold-dark mt-0.5 tabular-nums">
            {overallMasteryPct}%
          </p>
        </div>
        <div className="p-3 rounded-xl bg-surface-2 border border-border text-center">
          <p className="text-[11px] text-text-muted uppercase tracking-wider">Mastered Pages</p>
          <p className="text-xl font-bold text-gold-dark mt-0.5 tabular-nums">
            {pagesStats.filter((p) => p.isMastered).length}{' '}
            <span className="text-xs text-text-muted font-normal">/ 604</span>
          </p>
        </div>
        <div className="p-3 rounded-xl bg-surface-2 border border-border text-center">
          <p className="text-[11px] text-text-muted uppercase tracking-wider">Active Juz</p>
          <p className="text-xl font-bold text-gold-dark mt-0.5 tabular-nums">
            {juzStats.filter((j) => j.masteredCount > 0).length}{' '}
            <span className="text-xs text-text-muted font-normal">/ 30</span>
          </p>
        </div>
      </div>

      {/* 30 Juz View */}
      {activeTab === 'juz' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {juzStats.map((j) => (
            <div
              key={j.juz}
              className={`p-4 rounded-xl border transition-all ${
                j.percentage === 100
                  ? 'bg-emerald-500/10 border-emerald-500/30'
                  : j.percentage > 0
                  ? 'bg-gold/10 border-gold/30'
                  : 'bg-surface-2 border-border/60 hover:border-gold/20'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-text">
                  Juz {j.juz}
                </span>
                <span className="text-xs font-semibold tabular-nums text-gold-dark">
                  {j.percentage}%
                </span>
              </div>
              <p className="text-[11px] text-text-muted truncate mb-2">
                {j.surahNames || `Pages ${j.startPage}–${j.endPage}`}
              </p>
              <div className="w-full h-1.5 bg-border rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    j.percentage === 100
                      ? 'bg-emerald-500'
                      : 'bg-gradient-to-r from-gold-light via-gold to-gold-dark'
                  }`}
                  style={{ width: `${Math.max(j.percentage, 2)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 604 Pages Grid View */}
      {activeTab === 'pages' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-text-muted">
            <span className="flex items-center gap-1.5">
              <span>Page 1</span>
              <span>→</span>
              <span>Page 604</span>
            </span>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-sm bg-surface-2 border border-border" />
                Unlearned
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-sm bg-gold/40 border border-gold" />
                In Progress
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-sm bg-emerald-500 border border-emerald-600" />
                Mastered
              </span>
            </div>
          </div>

          {/* 604 Cell Interactive Grid */}
          <div className="grid grid-cols-[repeat(auto-fill,minmax(14px,1fr))] sm:grid-cols-[repeat(auto-fill,minmax(18px,1fr))] gap-1 sm:gap-1.5 p-3 rounded-2xl bg-surface-2 border border-border max-h-[380px] overflow-y-auto">
            {pagesStats.map((p) => {
              const isHovered = hoveredPage === p.page;
              return (
                <Link
                  key={p.page}
                  href={`/quran/mushaf`}
                  onMouseEnter={() => setHoveredPage(p.page)}
                  onMouseLeave={() => setHoveredPage(null)}
                  className={`relative aspect-square rounded-[3px] sm:rounded-md transition-all select-none border ${
                    p.isMastered
                      ? 'bg-emerald-500 border-emerald-600 text-white'
                      : p.isPartial
                      ? 'bg-gold/40 border-gold/60 text-gold-dark'
                      : 'bg-surface hover:bg-surface-highlight border-border/70 hover:border-gold/40'
                  } ${isHovered ? 'scale-125 z-10 shadow-elevated ring-2 ring-gold' : ''}`}
                  title={`Page ${p.page} (Juz ${p.juz}) · ${p.surah}`}
                >
                  <span className="sr-only">Page {p.page}</span>
                </Link>
              );
            })}
          </div>

          {/* Hovered Page Info Pill */}
          {hoveredPage !== null && (
            <div className="p-2.5 rounded-xl bg-surface border border-gold/30 text-center text-xs animate-scale-in">
              <span className="font-bold text-gold-dark">
                Page {hoveredPage}
              </span>{' '}
              <span className="text-text-muted">
                (Juz {getJuzForPage(hoveredPage)}) ·{' '}
                {pagesStats[hoveredPage - 1]?.surah}
              </span>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
