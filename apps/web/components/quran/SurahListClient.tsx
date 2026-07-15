'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, LayoutGrid, List } from 'lucide-react';
import type { Surah } from '@alquran/types';

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
      <div className="controls-bar">
        <div className="search-input-wrapper">
          <Search className="search-icon" size={18} />
          <input 
            type="text" 
            placeholder="Search surah..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="filters">
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value as any)}
            className="filter-select"
          >
            <option value="all">All</option>
            <option value="Meccan">Meccan</option>
            <option value="Medinan">Medinan</option>
          </select>
          
          <div className="view-toggles">
            <button 
              className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
            >
              <List size={20} />
            </button>
            <button 
              className={`toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
            >
              <LayoutGrid size={20} />
            </button>
          </div>
        </div>
      </div>

      <div className={viewMode === 'grid' ? 'surah-grid' : 'surah-list'}>
        {filteredSurahs.map(surah => (
          <Link
            className="surah-item"
            href={`/quran/surahs/${surah.number}`}
            key={surah.number}
          >
            <div className="surah-number-badge">
              <span className="badge-text">{surah.number}</span>
            </div>
            <div className="surah-info">
              <div className="surah-name-en">{surah.englishName}</div>
              <div className="surah-name-translation">{surah.englishNameTranslation}</div>
              <div className="surah-meta">
                {surah.revelationType} · {surah.numberOfAyahs} Ayahs
              </div>
            </div>
            <div className="surah-arabic-name">{surah.name}</div>
          </Link>
        ))}
      </div>

      <style jsx>{`
        .controls-bar {
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
        }
        .search-input-wrapper {
          display: flex;
          align-items: center;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-full);
          padding: 8px 16px;
          flex: 1;
          min-width: 240px;
        }
        .search-input-wrapper:focus-within {
          border-color: var(--border-focus);
        }
        .search-icon {
          color: var(--text-3);
          margin-right: 8px;
        }
        .search-input {
          flex: 1;
          background: transparent;
          border: none;
          color: var(--text-1);
          outline: none;
          font-family: var(--font-sans);
        }
        .filters {
          display: flex;
          gap: 16px;
          align-items: center;
        }
        .filter-select {
          background: var(--surface);
          border: 1px solid var(--border);
          color: var(--text-1);
          padding: 8px 16px;
          border-radius: var(--radius-full);
          outline: none;
        }
        .view-toggles {
          display: flex;
          background: var(--surface-muted);
          border-radius: var(--radius-full);
          padding: 4px;
        }
        .toggle-btn {
          background: transparent;
          border: none;
          padding: 6px 12px;
          border-radius: var(--radius-full);
          color: var(--text-3);
          cursor: pointer;
          transition: all var(--duration-fast);
        }
        .toggle-btn.active {
          background: var(--surface);
          color: var(--accent);
          box-shadow: var(--shadow-sm);
        }
        .surah-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 16px;
        }
        .surah-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .surah-item {
          display: flex;
          align-items: center;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 16px;
          transition: transform var(--duration-normal), border-color var(--duration-normal);
        }
        .surah-item:hover {
          transform: translateY(-2px);
          border-color: var(--border-focus);
        }
        .surah-number-badge {
          width: 40px;
          height: 40px;
          background: var(--surface-muted);
          color: var(--text-2);
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: var(--radius-md);
          font-weight: 600;
          margin-right: 16px;
          transform: rotate(45deg);
        }
        .badge-text {
          transform: rotate(-45deg);
        }
        .surah-info {
          flex: 1;
        }
        .surah-name-en {
          font-weight: 600;
          font-size: 1.1rem;
          color: var(--text-1);
        }
        .surah-name-translation {
          font-size: 0.85rem;
          color: var(--text-3);
          margin-top: 2px;
        }
        .surah-meta {
          font-size: 0.8rem;
          color: var(--text-4);
          margin-top: 4px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .surah-arabic-name {
          font-family: var(--font-arabic);
          font-size: 1.5rem;
          color: var(--arabic-text);
          margin-left: 16px;
        }
      `}</style>
    </>
  );
}
