'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

interface DuaVerse {
  surah: number;
  ayah: number;
  arabic: string;
  bangla: string;
  english: string;
  transliteration: string;
}

interface DuaRef {
  surah: number;
  ayahStart: number;
  ayahEnd: number;
}

interface Dua {
  id: number;
  titleEn: string;
  titleBn: string;
  refs: DuaRef[];
  surahNameEn: string;
  surahNameBn: string;
  verses: DuaVerse[];
}

function formatRef(refs: DuaRef[], surahNameBn: string): string {
  return refs
    .map((r) => {
      const ayahPart =
        r.ayahStart === r.ayahEnd
          ? String(r.ayahStart)
          : `${r.ayahStart}-${r.ayahEnd}`;
      return `${surahNameBn} ${r.surah}:${ayahPart}`;
    })
    .join(', ');
}

export function DuasListClient({ duas }: { duas: Dua[] }) {
  const [search, setSearch] = useState('');

  const filtered = duas.filter((dua) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      dua.titleEn.toLowerCase().includes(q) ||
      dua.titleBn.includes(search) ||
      dua.surahNameEn.toLowerCase().includes(q) ||
      dua.surahNameBn.includes(search) ||
      dua.verses.some(
        (v) =>
          v.english.toLowerCase().includes(q) ||
          v.bangla.includes(search),
      )
    );
  });

  return (
    <>
      {/* Search box */}
      <div className="flex items-center bg-surface border border-line rounded-full px-4 py-2 mb-6 max-w-lg focus-within:border-[var(--border-focus)] transition-colors">
        <Search size={18} className="text-ink-3 mr-2 shrink-0" />
        <input
          type="text"
          placeholder="Search duas..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-transparent border-none outline-none text-ink text-sm min-w-0 min-h-[44px]"
          aria-label="Search duas"
        />
      </div>

      {/* Results count */}
      {search.trim() && (
        <p className="text-sm text-ink-3 mb-4">
          {filtered.length} {filtered.length === 1 ? 'dua' : 'duas'} found
        </p>
      )}

      {/* Duas grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-ink-3 text-sm">No duas found matching your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((dua) => (
            <Link href={`/duas/${dua.id}`} key={dua.id}>
              <Card variant="interactive" className="h-full flex flex-col gap-3">
                {/* Number badge */}
                <div className="flex items-start justify-between gap-2">
                  <Badge tone="gold">
                    {formatRef(dua.refs, dua.surahNameBn)}
                  </Badge>
                  <span className="text-xs text-ink-4 font-medium shrink-0">
                    #{dua.id}
                  </span>
                </div>

                {/* Bengali title */}
                <h3 className="font-semibold text-ink text-base leading-snug">
                  {dua.titleBn}
                </h3>

                {/* English title */}
                <p className="text-sm text-ink-3 leading-relaxed">
                  {dua.titleEn}
                </p>

                {/* Arabic first line */}
                {dua.verses.length > 0 && (
                  <p
                    dir="rtl"
                    lang="ar"
                    className="font-arabic text-[var(--arabic-text)] text-base leading-[2] mt-auto line-clamp-2"
                  >
                    {dua.verses[0].arabic}
                  </p>
                )}
              </Card>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
