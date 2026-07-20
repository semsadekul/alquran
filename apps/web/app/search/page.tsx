'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { PageShell } from '@/components/ui/PageShell';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { cn } from '@/lib/cn';

interface VerseMatch {
  number: number;
  surah: number;
  ayah: number;
  arabic: string;
  bangla: string;
  english: string;
  transliteration: string;
}

type SearchMode = 'all' | 'arabic' | 'bangla' | 'english' | 'transliteration';

const SEARCH_MODES: SearchMode[] = ['all', 'arabic', 'bangla', 'english', 'transliteration'];

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState<SearchMode>('all');
  const [results, setResults] = useState<VerseMatch[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSearch = useCallback(async () => {
    const trimmed = query.trim();
    if (trimmed.length < 2) return;

    setLoading(true);
    setSearched(true);

    try {
      const res = await fetch('/search-index.json');
      if (res.ok) {
        const allVerses = await res.json();

        function matchesQuery(text: string, q: string) {
          return text.toLowerCase().includes(q.toLowerCase());
        }

        const q = trimmed.toLowerCase();
        const matches = allVerses.filter((v: VerseMatch) => {
          switch (mode) {
            case 'arabic': return matchesQuery(v.arabic, q);
            case 'bangla': return matchesQuery(v.bangla, q);
            case 'english': return matchesQuery(v.english, q);
            case 'transliteration': return matchesQuery(v.transliteration, q);
            default: return (
              matchesQuery(v.arabic, q) ||
              matchesQuery(v.bangla, q) ||
              matchesQuery(v.english, q) ||
              matchesQuery(v.transliteration, q)
            );
          }
        }).slice(0, 100);

        setResults(matches);
      } else {
        setResults([]);
      }
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [query, mode]);

  return (
    <PageShell
      eyebrow="Search"
      title="কুরআন অনুসন্ধান"
      lede="Find verses by Arabic, Bengali, English, or transliteration."
    >
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text"
          placeholder="Type search term (e.g., mercy, رحمة, ক্ষমা)..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
          className={cn(
            'flex-1 px-4 py-3 min-h-[44px] rounded-xl text-sm',
            'bg-surface border border-line text-ink placeholder:text-ink-4',
            'focus:outline-none focus:ring-2 focus:ring-[var(--border-focus)]',
          )}
        />
        <Button onClick={handleSearch} disabled={loading} loading={loading}>
          {loading ? 'Searching...' : 'Search'}
        </Button>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {SEARCH_MODES.map(m => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={cn(
              'px-3 py-1.5 text-sm font-medium rounded-full min-h-[44px] min-w-[44px] transition-colors',
              mode === m
                ? 'bg-accent-subtle text-accent border border-accent/20'
                : 'bg-[var(--surface-muted)] text-ink-3 border border-line hover:text-ink',
            )}
          >
            {m === 'all' ? 'All' : m.charAt(0).toUpperCase() + m.slice(1)}
          </button>
        ))}
      </div>

      {loading && (
        <div className="space-y-3 mb-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      )}

      {searched && !loading && (
        <p className="text-sm text-ink-3 mb-4">
          {results.length === 0
            ? `No results for "${query.trim()}".`
            : `Found ${results.length} matches for "${query.trim()}".`}
        </p>
      )}

      <div className="space-y-3">
        {results.map(r => (
          <Link
            href={`/quran/surahs/${r.surah}`}
            key={r.number}
            className="block"
          >
            <Card variant="interactive" className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-ink-2">
                  Surah {r.surah}, Verse {r.ayah}
                </span>
                <span className="text-xs text-ink-4">
                  {r.surah}:{r.ayah}
                </span>
              </div>
              <p dir="rtl" lang="ar" className="font-arabic text-lg text-ink leading-relaxed mb-2">
                {r.arabic}
              </p>
              <p className="text-sm text-ink-2 mb-1" style={{ fontFamily: 'var(--font-bengali-ui)' }}>
                {r.bangla}
              </p>
              <p className="text-sm text-ink-3">
                {r.english}
              </p>
            </Card>
          </Link>
        ))}
      </div>

      {searched && !loading && results.length === 0 && (
        <EmptyState
          title="No results found"
          hint={`Try a different search term or mode for "${query.trim()}".`}
        />
      )}
    </PageShell>
  );
}
