'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { HadithBook, HadithChapter } from '@/lib/data/hadith-books';
import { SearchIcon } from '@/components/ui/Icon';

interface HadithChapterListClientProps {
  book: HadithBook;
}

export function HadithChapterListClient({ book }: HadithChapterListClientProps) {
  const [search, setSearch] = useState('');

  const filteredChapters = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return book.chapters;
    const hadithNumber = Number(query);
    const isHadithNumber = Number.isFinite(hadithNumber) && hadithNumber > 0;
    return book.chapters.filter(
      (c) =>
        c.nameBn.toLowerCase().includes(query) ||
        c.nameEn.toLowerCase().includes(query) ||
        String(c.id) === query ||
        (isHadithNumber && hadithNumber >= c.hadithFirst && hadithNumber <= c.hadithLast)
    );
  }, [book.chapters, search]);

  return (
    <div className="space-y-6">
      {/* ─── Search / Filter Chapters ─── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <SearchIcon
            width={16}
            height={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="অধ্যায়ের নাম বা হাদিস নম্বর দিয়ে খুঁজুন..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface border border-border-subtle focus:border-gold focus:ring-1 focus:ring-gold text-sm text-text placeholder:text-text-muted shadow-soft transition-all outline-none"
          />
        </div>
        <div className="text-xs text-text-muted self-end sm:self-center px-1 font-mono">
          মোট {filteredChapters.length} টি অধ্যায়
        </div>
      </div>

      {/* ─── Chapters Grid ─── */}
      {filteredChapters.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filteredChapters.map((chapter) => (
            <ChapterCard key={chapter.id} bookId={book.id} chapter={chapter} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 rounded-xl bg-surface border border-border-subtle">
          <p className="text-sm text-text-muted">
            &ldquo;{search}&rdquo; এর সাথে কোনো অধ্যায় মেলেনি।
          </p>
        </div>
      )}
    </div>
  );
}

function ChapterCard({
  bookId,
  chapter,
}: {
  bookId: string;
  chapter: HadithChapter;
}) {
  return (
    <Link
      href={`/hadith/${bookId}/${chapter.id}`}
      className="group relative flex items-start justify-between p-4 rounded-xl bg-surface border border-border-subtle hover:border-gold/40 shadow-soft hover:shadow-hover transition-all duration-200"
    >
      <div className="flex items-start gap-3.5 min-w-0">
        {/* Chapter Index Badge */}
        <div className="w-8 h-8 rounded-lg bg-surface-highlight border border-border-subtle flex items-center justify-center text-xs font-semibold text-gold-dark group-hover:border-gold/50 transition-colors shrink-0">
          {chapter.id}
        </div>

        <div className="min-w-0">
          <h2 className="bangla-ui text-sm sm:text-base font-semibold text-text group-hover:text-gold-dark transition-colors truncate">
            {chapter.nameBn}
          </h2>
          <p className="text-xs text-text-muted truncate mt-0.5">
            {chapter.nameEn}
          </p>

          <div className="flex items-center gap-2 mt-2 text-[11px] text-text-subtle">
            <span>
              হাদিস {chapter.hadithFirst.toLocaleString('bn-BD')} – {chapter.hadithLast.toLocaleString('bn-BD')}
            </span>
            <span>•</span>
            <span className="font-medium text-text-muted">
              {chapter.totalHadiths.toLocaleString('bn-BD')}টি হাদিস
            </span>
          </div>
        </div>
      </div>

      {/* Arrow */}
      <span className="text-text-muted group-hover:text-gold-dark transition-colors text-sm pt-1 pl-2">
        →
      </span>
    </Link>
  );
}
