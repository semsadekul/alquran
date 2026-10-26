'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useIntl } from 'react-intl';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

interface VerseResult {
  type: 'verse';
  surah: number;
  ayah: number;
  arabic: string;
  bangla: string;
  english: string;
  surahName?: string;
  score: number;
}

interface SurahResult {
  type: 'surah';
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  banglaName: string;
  numberOfAyahs: number;
  revelationType: string;
  juzCount: number;
  score: number;
}

type SearchResult = VerseResult | SurahResult;

interface SearchResponse {
  results: SearchResult[];
  suggestions: Array<{ text: string; type: string }>;
  query: string;
  total: number;
  page: number;
  totalPages: number;
}

const POPULAR_SEARCHES = ['Mercy', 'Patience', 'Forgiveness', 'Prayer', 'যাকাত', 'রোযা', 'হজ্জ'];

export default function SearchPage() {
  const intl = useIntl();
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('alquran_search_history');
    if (stored) {
      try {
        setRecentSearches(JSON.parse(stored));
      } catch {
        setRecentSearches([]);
      }
    }
  }, []);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const search = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
      if (!res.ok) {
        console.error('Search API error:', res.status, res.statusText);
        setResults([]);
        return;
      }
      const data: SearchResponse = await res.json();
      setResults(data.results);
      
      if (searchQuery.trim()) {
        setRecentSearches((prev) => {
          if (prev.includes(searchQuery)) return prev;
          const updated = [searchQuery, ...prev].slice(0, 10);
          localStorage.setItem('alquran_search_history', JSON.stringify(updated));
          return updated;
        });
      }
    } catch (error) {
      console.error('Search failed:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickSearch = (term: string) => {
    setQuery(term);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    search(term);
  };

  const clearHistory = () => {
    setRecentSearches([]);
    localStorage.removeItem('alquran_search_history');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <header className="text-center lg:text-left">
        <div className="inline-block px-4 py-1 rounded-full bg-surface-highlight border border-border-subtle mb-4">
          <p className="text-sm font-medium text-gold-dark">
            {intl.formatMessage({ id: 'pageSearch' })}
          </p>
        </div>
        <h1 className="font-display text-3xl md:text-4xl font-semibold text-text mb-2">
          {intl.formatMessage({ id: 'pageSearch' })}
        </h1>
        <p className="text-lg text-text/70">
          {intl.formatMessage({ id: 'search.placeholder' })}
        </p>
      </header>

      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            const value = e.target.value;
            setQuery(value);
            if (debounceRef.current) clearTimeout(debounceRef.current);
            debounceRef.current = setTimeout(() => search(value), 300);
          }}
          placeholder={intl.formatMessage({ id: 'search.placeholder' })}
          className="w-full h-14 px-6 rounded-xl border border-border bg-surface text-text text-lg focus:outline-none focus:border-gold/50 focus:ring-2 focus:ring-gold/25 transition-all shadow-sm"
          autoFocus
        />
        {isLoading && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        )}
      </div>

      {/* Recent Searches */}
      {!query && recentSearches.length > 0 && (
        <Card variant="elevated" className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-text">Recent Searches</h3>
            <Button variant="ghost" size="sm" onClick={clearHistory}>
              {intl.formatMessage({ id: 'duas.clearFilters' })}
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {recentSearches.map((term) => (
              <button
                key={term}
                onClick={() => handleQuickSearch(term)}
                className="px-3 py-1.5 rounded-lg bg-surface-highlight text-text text-sm hover:bg-primary/10 hover:text-primary transition-colors"
              >
                {term}
              </button>
            ))}
          </div>
        </Card>
      )}

      {/* Popular Searches */}
      {!query && recentSearches.length === 0 && (
        <Card variant="elevated" className="p-4">
          <h3 className="font-semibold text-text mb-3">Popular Searches</h3>
          <div className="flex flex-wrap gap-2">
            {POPULAR_SEARCHES.map((term) => (
              <button
                key={term}
                onClick={() => handleQuickSearch(term)}
                className="px-3 py-1.5 rounded-lg bg-surface text-gold-dark border border-border text-sm hover:border-gold/30 hover:bg-surface-highlight transition-colors"
              >
                {term}
              </button>
            ))}
          </div>
        </Card>
      )}

      {/* Search Results */}
      {results.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-text">
              {intl.formatMessage(
                { id: 'search.results' },
                { count: results.length },
              )}
            </h3>
          </div>
          {results.map((result, index) => {
            if (result.type === 'surah') {
              return (
                <Link key={`surah-${result.number}`} href={`/quran/surahs/${result.number}`}>
                  <Card variant="interactive" className="p-6 card-lift">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <Badge tone="gold">Surah {result.number}</Badge>
                        <span className="text-text/60 text-sm ml-2">{result.revelationType}</span>
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-bold text-text mb-1">
                      {result.englishName}
                    </h3>
                    <p className="text-text/70 text-sm mb-2">
                      {result.englishNameTranslation}
                    </p>
                    <p className="text-text/50 text-sm" style={{ fontFamily: 'var(--font-bengali-ui)' }}>
                      {result.banglaName}
                    </p>
                    
                    <div className="flex items-center gap-4 mt-3 text-xs text-text/50">
                      <span>{result.numberOfAyahs} {intl.formatMessage({ id: 'surah.ayahs' })}</span>
                      <span>{intl.formatMessage({ id: 'library.juz' }, { num: result.juzCount })}</span>
                    </div>
                  </Card>
                </Link>
              );
            }
            
            return (
              <Card key={`verse-${result.surah}:${result.ayah}`} variant="elevated" className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <Badge tone="gold">Surah {result.surah}</Badge>
                    <span className="text-text/60 text-sm ml-2">
                      {intl.formatMessage({ id: 'audioPlayer.versePosition' }, { current: result.ayah, total: '?' })}
                    </span>
                  </div>
                </div>
                
                <p 
                  dir="rtl" 
                  lang="ar"
                  className="text-2xl md:text-3xl text-text mb-4 leading-loose text-right"
                  style={{ fontFamily: 'var(--font-arabic)' }}
                >
                  {result.arabic}
                </p>
                
                <p className="text-text/90 mb-2" style={{ fontFamily: 'var(--font-bengali-ui)' }}>
                  {result.bangla}
                </p>
                
                <p className="text-text/70 text-sm">
                  {result.english}
                </p>
              </Card>
            );
          })}
        </div>
      )}

      {/* No Results */}
      {query && results.length === 0 && !isLoading && (
        <Card variant="elevated" className="p-12 text-center">
          <div className="text-4xl mb-4">🔍</div>
          <h3 className="text-lg font-bold text-text mb-2">
            {intl.formatMessage({ id: 'search.noResults' })}
          </h3>
          <p className="text-text/70">
            {intl.formatMessage({ id: 'search.noResultsSub' })}
          </p>
        </Card>
      )}
    </div>
  );
}
