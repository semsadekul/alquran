'use client';

import { useState, useMemo } from 'react';
import { useIntl } from 'react-intl';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { SearchIcon } from '@/components/ui/Icon';
import { duas, categories, type Dua } from '@/lib/data/duas';

export default function DuasPage() {
  const intl = useIntl();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<Dua['category'] | 'All'>('All');

  const filtered = useMemo(() => {
    return duas.filter((d) => {
      const matchesCategory = activeCategory === 'All' || d.category === activeCategory;
      if (!matchesCategory) return false;
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        d.arabic.includes(q) ||
        d.english.toLowerCase().includes(q) ||
        d.bangla.includes(q) ||
        d.source.toLowerCase().includes(q) ||
        d.category.toLowerCase().includes(q)
      );
    });
  }, [search, activeCategory]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <div className="ornamental-divider text-xs text-gold-dark mb-3">
          <span className="text-xs">{intl.formatMessage({ id: 'duas.dailySupplications' })}</span>
        </div>
        <h1 className="font-display text-2xl sm:text-3xl font-semibold text-text">
          {intl.formatMessage({ id: 'duas.title' })}
        </h1>
        <p className="text-text-muted mt-1">{intl.formatMessage({ id: 'duas.subtitle' })}</p>
      </div>

      {/* Search */}
      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-3 w-5 h-5" />
        <input
          type="text"
          placeholder={intl.formatMessage({ id: 'duas.search.placeholder' })}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search duas"
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-surface text-text placeholder:text-text-muted focus:outline-none focus:border-gold/50 focus:ring-2 focus:ring-gold/25 transition-colors text-sm"
        />
        {search && (
          <button
            type="button"
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-ink transition-colors"
            aria-label="Clear search"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        )}
      </div>

      {/* Categories */}
      <div className="flex gap-2 flex-wrap" role="tablist" aria-label="Dua categories">
        {(['All', ...categories] as const).map((cat) => (
          <button
            key={cat}
            role="tab"
            aria-selected={activeCategory === cat}
            onClick={() => setActiveCategory(cat)}
            className={[
              'px-3 py-1.5 rounded-full text-sm font-medium border transition-colors whitespace-nowrap',
              activeCategory === cat
                ? 'bg-gold text-[#1a1814] border-gold shadow-soft'
                : 'bg-surface text-text-muted border-border hover:border-gold/30 hover:text-gold-dark',
            ].join(' ')}
          >
            {cat === 'All'
              ? intl.formatMessage({ id: 'duas.category.all' })
              : intl.formatMessage({ id: `duas.category.${cat.toLowerCase()}` })}
          </button>
        ))}
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <Card variant="default" className="p-8 text-center">
          <p className="text-text-muted">
            {intl.formatMessage({ id: 'duas.noResults' })}
          </p>
          <Button
            variant="ghost"
            size="sm"
            className="mt-3"
            onClick={() => {
              setSearch('');
              setActiveCategory('All');
            }}
          >
            {intl.formatMessage({ id: 'duas.clearFilters' })}
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map((dua, i) => (
            <div
              key={`${dua.category}-${i}`}
              className="animate-slide-up"
              style={{ animationDelay: `${Math.min(i * 30, 300)}ms` }}
            >
              <Card variant="default" className="h-full p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <Badge tone="classic" size="sm">{dua.source}</Badge>
                  <Badge tone="neutral" size="sm">
                    {intl.formatMessage({ id: `duas.category.${dua.category.toLowerCase()}` })}
                  </Badge>
                </div>

                <p
                  className="arabic-text text-text text-lg mb-3 leading-relaxed"
                  dir="rtl"
                  lang="ar"
                  style={{ fontFamily: 'var(--font-arabic)' }}
                >
                  {dua.arabic}
                </p>

                <p className="text-xs text-gold-dark mb-2 italic">
                  {dua.transliteration}
                </p>

                <p className="verse-bangla text-sm text-text/90 mb-1.5">
                  {dua.bangla}
                </p>

                <p className="text-sm text-text-muted leading-relaxed">
                  &ldquo;{dua.english}&rdquo;
                </p>
              </Card>
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="pt-2 text-center">
        <p className="text-xs text-text-muted">
          {intl.formatMessage({ id: 'duas.comingSoon' })}
        </p>
      </div>
    </div>
  );
}
