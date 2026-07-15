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
    <form onSubmit={handleSearch} className="search-omnibox">
      <div className="search-input-wrapper">
        <Search className="search-icon" size={20} />
        <input 
          type="text" 
          placeholder="কুরআন খুঁজুন (Surah, Keyword, Verse)..." 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="search-input"
        />
        <button type="submit" className="search-button">
          খুঁজুন
        </button>
      </div>
      
      <style jsx>{`
        .search-omnibox {
          margin-bottom: 32px;
        }
        .search-input-wrapper {
          display: flex;
          align-items: center;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-full);
          padding: 8px 8px 8px 24px;
          transition: border-color var(--duration-fast) var(--ease-default),
                      box-shadow var(--duration-fast) var(--ease-default);
        }
        .search-input-wrapper:focus-within {
          border-color: var(--border-focus);
          box-shadow: 0 0 0 4px var(--accent-subtle);
        }
        .search-icon {
          color: var(--text-3);
          margin-right: 12px;
        }
        .search-input {
          flex: 1;
          background: transparent;
          border: none;
          color: var(--text-1);
          font-size: 1rem;
          font-family: var(--font-bengali-ui);
          outline: none;
        }
        .search-input::placeholder {
          color: var(--text-4);
        }
        .search-button {
          background: var(--accent);
          color: white;
          border: none;
          padding: 10px 24px;
          border-radius: var(--radius-full);
          font-family: var(--font-bengali-ui);
          font-weight: 600;
          cursor: pointer;
          transition: background-color var(--duration-fast) var(--ease-default);
        }
        .search-button:hover {
          background: var(--accent-hover);
        }
      `}</style>
    </form>
  );
}
