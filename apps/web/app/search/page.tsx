'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';

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
        
        function matchesQuery(text: string, query: string) {
          return text.toLowerCase().includes(query.toLowerCase());
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

  const modes: SearchMode[] = ['all', 'arabic', 'bangla', 'english', 'transliteration'];

  return (
    <div className="shell">
      <section className="hero">
        <p className="eyebrow">Search</p>
        <h1>কুরআন অনুসন্ধান</h1>
        <p className="lede">Find verses by Arabic, Bengali, English, or transliteration.</p>
      </section>

      <div className="search-box">
        <input
          className="search-input"
          type="text"
          placeholder="Type search term (e.g., mercy, رحمة, ক্ষমা)…"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
        />
        <button className="search-btn" onClick={handleSearch} disabled={loading}>
          {loading ? 'Searching…' : 'Search'}
        </button>
      </div>

      <div className="search-modes">
        {modes.map(m => (
          <button
            key={m}
            className={`mode-chip ${mode === m ? 'active' : ''}`}
            onClick={() => setMode(m)}
          >
            {m === 'all' ? 'All' : m.charAt(0).toUpperCase() + m.slice(1)}
          </button>
        ))}
      </div>

      {searched && !loading && (
        <div className="search-summary">
          {results.length === 0
            ? `No results for "${query.trim()}".`
            : `Found ${results.length} matches for "${query.trim()}".`}
        </div>
      )}

      <div className="search-results">
        {results.map(r => (
          <Link
            className="search-result-card"
            href={`/quran/surahs/${r.surah}`}
            key={r.number}
          >
            <div className="search-result-header">
              <span>Surah {r.surah}, Verse {r.ayah}</span>
              <span>{r.surah}:{r.ayah}</span>
            </div>
            <div className="search-result-arabic">{r.arabic}</div>
            <p className="search-result-bangla">{r.bangla}</p>
            <p className="search-result-english">{r.english}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
