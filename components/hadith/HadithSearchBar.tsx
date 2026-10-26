'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useIntl } from 'react-intl';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SearchIcon, BookmarkIcon, CheckIcon } from '@/components/ui/Icon';
import { useLocale } from '@/components/providers/LocaleProvider';
import { readSavedHadiths } from '@/lib/hadith-storage';
import { banglaOnly } from '@/lib/hadith-text';

interface SearchResultItem {
  hadithNumber: number;
  arabic?: string;
  bangla: string;
  english?: string;
  grades?: Array<{ name: string; grade: string }>;
  book: string;
  bookTitleBn: string;
  bookTitleEn: string;
  chapter: number;
  chapterNameBn: string;
  chapterNameEn: string;
}

export function HadithSearchBar() {
  const intl = useIntl();
  const { locale } = useLocale();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [savedCount, setSavedCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function updateCount() {
      try {
        if (typeof readSavedHadiths === 'function') {
          const items = readSavedHadiths();
          if (Array.isArray(items)) {
            setSavedCount(items.length);
          }
        }
      } catch {
        /* noop */
      }
    }
    updateCount();
    window.addEventListener('storage', updateCount);
    return () => window.removeEventListener('storage', updateCount);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!query.trim() || query.trim().length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/hadith/search?q=${encodeURIComponent(query.trim())}`);
        const data = await res.json();
        setResults(data.results || []);
        setOpen(true);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (results.length > 0) {
      const first = results[0];
      router.push(`/hadith/${first.book}/hadith/${first.hadithNumber}`);
      setOpen(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto relative" ref={dropdownRef}>
      <div className="flex items-center gap-3">
        {/* Search Input Bar */}
        <form onSubmit={handleSubmit} className="flex-1 relative">
          <div className="relative flex items-center">
            <SearchIcon
              width={18}
              height={18}
              className="absolute left-3.5 text-text-muted pointer-events-none"
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => {
                if (results.length > 0) setOpen(true);
              }}
              placeholder={intl.formatMessage({ id: 'hadith.searchPlaceholder' })}
              className="w-full pl-10 pr-10 py-3 rounded-xl bg-surface border border-border-subtle focus:outline-none focus:border-gold/50 focus:ring-2 focus:ring-gold/25 text-sm text-text placeholder:text-text-muted shadow-soft transition-all outline-none"
            />
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  setResults([]);
                  setOpen(false);
                }}
                className="absolute right-3.5 text-text-muted hover:text-text text-xs"
              >
                ✕
              </button>
            )}
          </div>
        </form>

        {/* Saved Hadiths Button */}
        <Link
          href="/hadith/saved"
          className="flex items-center gap-2 px-3.5 py-3 rounded-xl bg-surface border border-border-subtle hover:border-gold/50 text-text hover:text-gold-dark text-xs font-medium shadow-soft transition-all shrink-0"
        >
          <BookmarkIcon width={16} height={16} className="text-gold" />
          <span className="hidden sm:inline">
            {intl.formatMessage({ id: 'hadith.saved' })}
          </span>
          {savedCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-gold/15 text-gold-dark text-[11px] font-semibold">
              {savedCount}
            </span>
          )}
        </Link>
      </div>

      {/* Autocomplete Dropdown */}
      {open && (
        <div className="absolute left-0 right-0 top-full mt-2 rounded-xl bg-surface border border-border shadow-2xl z-50 overflow-hidden max-h-[380px] overflow-y-auto animate-fade-in">
          {loading ? (
            <div className="p-4 text-center text-xs text-text-muted">
              {intl.formatMessage({ id: 'hadith.searching' })}
            </div>
          ) : results.length > 0 ? (
            <div className="p-2 space-y-1">
              {results.map((item, idx) => (
                <Link
                  key={`${item.book}-${item.hadithNumber}-${idx}`}
                  href={`/hadith/${item.book}/hadith/${item.hadithNumber}`}
                  onClick={() => setOpen(false)}
                  className="block p-3 rounded-lg hover:bg-surface-highlight transition-colors text-left"
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-xs font-semibold text-gold-dark">
                      {item.bookTitleBn} • হাদিস {item.hadithNumber}
                    </span>
                    <span className="text-[11px] text-text-muted truncate">
                      {item.chapterNameBn}
                    </span>
                  </div>
                  <p className="bangla-ui text-xs text-text line-clamp-2 leading-relaxed">
                    {banglaOnly(item.bangla)}
                  </p>
                </Link>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-xs text-text-muted">
              {intl.formatMessage({ id: 'hadith.noResults' })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
