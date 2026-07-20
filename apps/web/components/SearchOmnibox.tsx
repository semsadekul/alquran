'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';

export function SearchOmnibox() {
  const [query, setQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <form onSubmit={handleSearch} className="mb-8">
      <div className="flex items-center bg-surface border border-line rounded-full px-6 py-2 focus-within:border-[var(--border-focus)] focus-within:shadow-[0_0_0_4px_var(--accent-subtle)] transition-all">
        <Search className="text-ink-3 mr-3 shrink-0" size={20} />
        <input
          type="text"
          placeholder="কুরআন খুঁজুন (Surah, Keyword, Verse)..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 bg-transparent border-none outline-none text-ink text-base min-w-0"
          style={{ fontFamily: 'var(--font-bengali-ui)' }}
        />
        <button
          type="submit"
          className="bg-accent text-white px-6 py-2.5 rounded-full font-semibold text-sm min-h-[44px] hover:bg-accent-hover transition-colors shrink-0"
          style={{ fontFamily: 'var(--font-bengali-ui)' }}
        >
          খুঁজুন
        </button>
      </div>
    </form>
  );
}
