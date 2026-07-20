'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, LayoutGrid, List } from 'lucide-react';
import type { Surah } from '@alquran/types';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { cn } from '@/lib/cn';

export function SurahListClient({ initialSurahs }: { initialSurahs: Surah[] }) {
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [filter, setFilter] = useState<'all' | 'Meccan' | 'Medinan'>('all');

  const filteredSurahs = initialSurahs.filter((surah) => {
    const matchesSearch =
      surah.englishName.toLowerCase().includes(search.toLowerCase()) ||
      surah.englishNameTranslation.toLowerCase().includes(search.toLowerCase()) ||
      (surah.banglaName && surah.banglaName.includes(search)) ||
      surah.number.toString() === search;
    const matchesFilter = filter === 'all' || surah.revelationType === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <>
      {/* Controls bar */}
      <div className="flex flex-wrap gap-3 justify-between items-center mb-6">
        {/* Search input */}
        <div className="flex items-center bg-surface border border-line rounded-full px-4 py-2 flex-1 min-w-[200px] focus-within:border-[var(--border-focus)] transition-colors">
          <Search size={18} className="text-ink-3 mr-2 shrink-0" />
          <input
            type="text"
            placeholder="Search surah..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-ink text-sm min-w-0"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Filter */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as 'all' | 'Meccan' | 'Medinan')}
            className="bg-surface border border-line text-ink text-sm px-3 py-2 rounded-xl min-h-[40px] focus:outline-none focus:ring-1 focus:ring-[var(--border-focus)]"
          >
            <option value="all">All</option>
            <option value="Meccan">Meccan</option>
            <option value="Medinan">Medinan</option>
          </select>

          {/* View toggle */}
          <div className="flex bg-[var(--surface-muted)] rounded-xl p-1 gap-0.5">
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={cn(
                'p-1.5 rounded-lg transition-colors',
                viewMode === 'list'
                  ? 'bg-surface text-accent shadow-sm'
                  : 'text-ink-3 hover:text-ink',
              )}
              aria-label="List view"
            >
              <List size={18} />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={cn(
                'p-1.5 rounded-lg transition-colors',
                viewMode === 'grid'
                  ? 'bg-surface text-accent shadow-sm'
                  : 'text-ink-3 hover:text-ink',
              )}
              aria-label="Grid view"
            >
              <LayoutGrid size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Surah list/grid */}
      <div
        className={
          viewMode === 'grid'
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
            : 'flex flex-col gap-3'
        }
      >
        {filteredSurahs.map((surah) => (
          <Link
            href={`/quran/surahs/${surah.number}`}
            key={surah.number}
          >
            <Card variant="interactive" className="flex items-center gap-4">
              {/* Number medallion */}
              <div className="w-10 h-10 bg-[var(--surface-muted)] text-ink-2 flex items-center justify-center rounded-xl font-semibold text-sm shrink-0">
                {surah.number}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-ink">{surah.englishName}</div>
                <div className="text-xs text-ink-3 mt-0.5">
                  {surah.englishNameTranslation}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <Badge tone={surah.revelationType === 'Meccan' ? 'green' : 'neutral'}>
                    {surah.revelationType}
                  </Badge>
                  <span className="text-xs text-ink-4">
                    {surah.numberOfAyahs} Ayahs
                  </span>
                </div>
              </div>

              {/* Arabic name */}
              <div
                dir="rtl"
                lang="ar"
                className="font-arabic text-xl text-[var(--arabic-text)] shrink-0"
              >
                {surah.name}
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </>
  );
}
