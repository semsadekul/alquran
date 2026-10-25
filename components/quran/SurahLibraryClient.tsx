'use client';

import Link from 'next/link';
import { useState, useMemo } from 'react';
import { useIntl } from 'react-intl';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/cn';
import type { Surah } from '@/lib/data/quran';

export function SurahLibraryClient({ surahs }: { surahs: Surah[] }) {
  const intl = useIntl();
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'meccan' | 'medinan'>('all');

  const filteredSurahs = useMemo(() => {
    let result = surahs;

    if (filter !== 'all') {
      result = result.filter((s) =>
        filter === 'meccan' ? s.revelationType === 'Meccan' : s.revelationType === 'Medinan'
      );
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          s.englishName.toLowerCase().includes(q) ||
          s.englishNameTranslation.toLowerCase().includes(q) ||
          s.name.includes(q) ||
          s.banglaName.toLowerCase().includes(q) ||
          s.number.toString() === q
      );
    }

    return result;
  }, [surahs, searchQuery, filter]);

  const revealDelay = (index: number) => `${Math.min(index * 20, 240)}ms`;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <header className="text-center lg:text-left">
        <div className="inline-block px-4 py-1 rounded-full bg-surface-highlight border border-gold-line mb-4">
          <p className="text-sm font-medium text-gold-dark">
            {intl.formatMessage({ id: 'library.title' })}
          </p>
        </div>
        <h1 className="font-display text-3xl md:text-4xl font-semibold text-text mb-2">
          {intl.formatMessage({ id: 'library.title' })}
        </h1>
        <p className="text-lg text-text/70">
          {surahs.length} {intl.formatMessage({ id: 'library.subtitle' })}
        </p>
      </header>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder={intl.formatMessage({ id: 'library.search.placeholder' })}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={cn(
              'w-full pl-10 pr-4 py-2.5 rounded-xl border border-gold-line bg-surface text-text placeholder-text-muted',
              'focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50',
              'transition-all duration-200'
            )}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text transition-colors"
              aria-label="Clear search"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        <div className="flex gap-2">
          {(['all', 'meccan', 'medinan'] as const).map((option) => (
            <button
              key={option}
              onClick={() => setFilter(option)}
              className={cn(
                'px-3 py-2 rounded-lg text-sm font-medium capitalize transition-all duration-200',
                filter === option
                  ? 'bg-forest text-forest-ink shadow-sm'
                  : 'bg-surface text-text-muted border border-gold-line hover:bg-surface-highlight'
              )}
            >
              {intl.formatMessage({ id: `library.filter.${option}` })}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      <p className="text-sm text-text-muted">
        {intl.formatMessage(
          { id: 'library.showing' },
          { count: filteredSurahs.length, total: surahs.length },
        )}
      </p>

      {/* Surah List */}
      {filteredSurahs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSurahs.map((surah, index) => (
            <Link
              key={surah.number}
              href={`/quran/surahs/${surah.number}`}
              style={{ animationDelay: revealDelay(index) }}
              className="animate-slide-up"
            >
              <Card variant="interactive" className="p-4 h-full card-lift group">
                <div className="flex items-center gap-4">
                  {/* Surah Number */}
                  <div className="flex-shrink-0 relative">
                    <div
                      className={cn(
                        'w-12 h-12 rounded-md flex items-center justify-center font-semibold text-lg transition-transform duration-300 group-hover:scale-[1.03]',
                        'bg-forest text-gold-light'
                      )}
                    >
                      {surah.number}
                    </div>
                    <div className="absolute inset-0 w-12 h-12 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 geometric-overlay" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-text truncate">
                        {surah.englishName}
                      </h3>
                      <Badge tone="neutral" size="sm" className="flex-shrink-0">
                        {surah.numberOfAyahs}
                      </Badge>
                    </div>
                    <p className="text-sm text-text/70 truncate">
                      {surah.englishNameTranslation}
                    </p>
                    <p
                      className="text-xs text-text/50 truncate"
                      style={{ fontFamily: 'var(--font-bengali-ui)' }}
                    >
                      {surah.banglaName}
                    </p>
                  </div>

                  {/* Info */}
                  <div className="flex-shrink-0 text-right space-y-1">
                    <div className="flex items-center gap-1 text-xs text-text-muted">
                      <span>{surah.revelationType === 'Meccan' ? '🕋' : '🕌'}</span>
                      <span className="capitalize">
                        {surah.revelationType === 'Meccan'
                          ? intl.formatMessage({ id: 'library.meccan' })
                          : intl.formatMessage({ id: 'library.medinan' })}
                      </span>
                    </div>
                    <p className="text-xs text-text/40">
                      {intl.formatMessage({ id: 'library.juz' }, { num: surah.juzCount })}
                    </p>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-text-muted mb-2">
            {intl.formatMessage({ id: 'library.noResults' })}
          </p>
          <p className="text-sm text-text/50">
            {intl.formatMessage({ id: 'library.noResultsSub' })}
          </p>
        </div>
      )}
    </div>
  );
}
