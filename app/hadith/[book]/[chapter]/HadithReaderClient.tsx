'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { HadithBook, HadithChapter } from '@/lib/data/hadith-books';
import { HadithCard, HadithItemData } from '@/components/hadith/HadithCard';
import { ChevronDownIcon, SearchIcon } from '@/components/ui/Icon';

interface HadithReaderClientProps {
  book: HadithBook;
  chapter: HadithChapter;
  hadiths: HadithItemData[];
  prevChapter?: HadithChapter;
  nextChapter?: HadithChapter;
}

export function HadithReaderClient({
  book,
  chapter,
  hadiths,
  prevChapter,
  nextChapter,
}: HadithReaderClientProps) {
  const router = useRouter();
  const [arabicFontSize, setArabicFontSize] = useState(30);
  const [showAllEnglish, setShowAllEnglish] = useState(false);
  const [chapterFilter, setChapterFilter] = useState('');
  const activeChapterRef = useRef<HTMLLIElement | null>(null);

  const filteredChapters = useMemo(() => {
    const q = chapterFilter.trim().toLowerCase();
    if (!q) return book.chapters;
    return book.chapters.filter(
      (c) =>
        c.nameBn.toLowerCase().includes(q) ||
        c.nameEn.toLowerCase().includes(q) ||
        String(c.id) === q
    );
  }, [book.chapters, chapterFilter]);

  // Keep active chapter scrolled into view in sidebar
  useEffect(() => {
    if (activeChapterRef.current) {
      activeChapterRef.current.scrollIntoView({
        block: 'nearest',
        behavior: 'smooth',
      });
    }
  }, [chapter.id]);

  const handleChapterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val) {
      router.push(`/hadith/${book.id}/${val}`);
    }
  };

  return (
    <div className="w-full mx-auto pb-20 animate-fade-in">
      <div className="flex gap-6 xl:gap-8 justify-center">
        {/* ─── Chapter Quick-Nav Sidebar (Desktop Rail) ─── */}
        <aside className="hidden xl:block w-[320px] shrink-0">
          <nav
            aria-label="অধ্যায়সমূহ"
            className="sticky top-20 max-h-[calc(100vh-5.5rem)] flex flex-col rounded-2xl border border-border-subtle bg-surface shadow-soft overflow-hidden"
          >
            {/* Header with Title & Search */}
            <div className="p-3.5 border-b border-border-subtle bg-surface/90 backdrop-blur-md space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-gold shrink-0" />
                  <span className="text-xs font-bold uppercase tracking-wider text-text">
                    অধ্যায়সমূহ
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-gold/15 text-gold-dark border border-gold/25 font-mono">
                    {book.totalChapters}
                  </span>
                </div>
                <Link
                  href={`/hadith/${book.id}`}
                  className="text-xs text-gold-dark hover:underline font-medium inline-flex items-center gap-1"
                >
                  সূচী <span aria-hidden="true">→</span>
                </Link>
              </div>

              {/* Quick filter input */}
              <div className="relative">
                <SearchIcon
                  width={14}
                  height={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
                />
                <input
                  type="text"
                  value={chapterFilter}
                  onChange={(e) => setChapterFilter(e.target.value)}
                  placeholder="অধ্যায় বা হাদিস খুঁজুন..."
                  className="w-full pl-9 pr-7 py-2 rounded-xl bg-surface-highlight/70 border border-border-subtle focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/30 text-xs text-text placeholder:text-text-muted transition-all outline-none"
                />
                {chapterFilter && (
                  <button
                    type="button"
                    onClick={() => setChapterFilter('')}
                    aria-label="ফিল্টার মুছুন"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted hover:text-text p-1 text-xs"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>

            {/* Chapters list */}
            <ol className="overflow-y-auto p-2.5 space-y-1.5 scroll-smooth divide-y-0">
              {filteredChapters.length === 0 ? (
                <li className="p-6 text-center text-xs text-text-muted">
                  <p>কোন অধ্যায় মেলেনি</p>
                  <button
                    type="button"
                    onClick={() => setChapterFilter('')}
                    className="mt-2 text-gold-dark hover:underline font-medium"
                  >
                    ফিল্টার মুছুন
                  </button>
                </li>
              ) : (
                filteredChapters.map((ch) => {
                  const isActive = ch.id === chapter.id;
                  return (
                    <li key={ch.id} ref={isActive ? activeChapterRef : undefined}>
                      <Link
                        href={`/hadith/${book.id}/${ch.id}`}
                        className={`group flex items-center gap-3 rounded-xl p-2.5 transition-all duration-150 border ${
                          isActive
                            ? 'bg-forest text-forest-ink border-gold/50 shadow-md ring-1 ring-gold/30'
                            : 'bg-transparent border-transparent hover:bg-surface-highlight text-text hover:border-border-subtle/60'
                        }`}
                      >
                        {/* Chapter Number Badge */}
                        <div
                          className={`w-9 h-9 shrink-0 rounded-xl flex items-center justify-center font-bold text-xs transition-colors ${
                            isActive
                              ? 'bg-gold text-forest shadow-xs ring-1 ring-gold/40'
                              : 'bg-surface-highlight border border-border-subtle text-gold-dark group-hover:border-gold/50 group-hover:bg-gold/10 group-hover:text-gold-light'
                          }`}
                        >
                          {ch.id}
                        </div>

                        {/* Chapter Info */}
                        <div className="min-w-0 flex-1">
                          {/* Bengali Title */}
                          <div className="flex items-center justify-between gap-1.5 mb-1">
                            <span
                              className={`bangla-ui text-[13.5px] leading-tight font-semibold truncate ${
                                isActive
                                  ? 'text-forest-ink font-bold'
                                  : 'text-text group-hover:text-gold-dark transition-colors'
                              }`}
                              title={ch.nameBn}
                            >
                              {ch.nameBn}
                            </span>
                          </div>

                          {/* English Title & Hadith Range */}
                          <div className="flex items-center justify-between gap-2 text-[11px]">
                            <span
                              className={`truncate font-medium ${
                                isActive
                                  ? 'text-forest-ink/80'
                                  : 'text-text-muted group-hover:text-text/90'
                              }`}
                              title={ch.nameEn}
                            >
                              {ch.nameEn}
                            </span>
                            <span
                              className={`shrink-0 font-mono text-[10px] px-1.5 py-0.5 rounded-md ${
                                isActive
                                  ? 'bg-white/20 text-forest-ink font-semibold'
                                  : 'bg-surface-highlight border border-border-subtle/60 text-text-muted'
                              }`}
                              title={`হাদিস পরিসীমা ${ch.hadithFirst} থেকে ${ch.hadithLast}`}
                            >
                              {ch.hadithFirst}–{ch.hadithLast}
                            </span>
                          </div>
                        </div>

                        {/* Active glow / pulse dot */}
                        {isActive && (
                          <span className="w-2 h-2 rounded-full bg-gold shrink-0 animate-pulse ring-2 ring-gold/40" />
                        )}
                      </Link>
                    </li>
                  );
                })
              )}
            </ol>
          </nav>
        </aside>

        {/* ─── Main Reader Content ─── */}
        <div className="flex-1 min-w-0 max-w-4xl">
          {/* ─── Breadcrumb & Quick Controls ─── */}
          <div className="flex flex-wrap items-center justify-between gap-3 py-3 border-b border-border-subtle mb-6">
            <nav className="flex items-center gap-2 text-xs text-text-muted">
              <Link href="/hadith" className="hover:text-gold-dark transition-colors">
                হাদীস
              </Link>
              <span>/</span>
              <Link href={`/hadith/${book.id}`} className="hover:text-gold-dark transition-colors">
                {book.titleBn}
              </Link>
              <span>/</span>
              <span className="text-text font-medium">অধ্যায় {chapter.id}</span>
            </nav>

            {/* Reader Customization Toolbar */}
            <div className="flex items-center gap-3">
              {/* English translation toggle */}
              <button
                type="button"
                onClick={() => setShowAllEnglish((prev) => !prev)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  showAllEnglish
                    ? 'bg-gold/15 text-gold-dark border-gold/40'
                    : 'bg-surface text-text-muted border-border-subtle hover:text-text'
                }`}
              >
                {showAllEnglish ? 'English On' : 'English Off'}
              </button>

              {/* Arabic Font Size Controls */}
              <div className="flex items-center border border-border-subtle rounded-lg bg-surface text-xs text-text-muted overflow-hidden shadow-xs">
                <button
                  type="button"
                  onClick={() => setArabicFontSize((s) => Math.max(22, s - 2))}
                  aria-label="Decrease font size"
                  className="px-2.5 py-1.5 hover:text-text hover:bg-surface-highlight transition-colors font-medium"
                >
                  A-
                </button>
                <span className="px-2 text-[11px] font-mono border-x border-border-subtle text-text font-semibold">
                  {arabicFontSize}px
                </span>
                <button
                  type="button"
                  onClick={() => setArabicFontSize((s) => Math.min(44, s + 2))}
                  aria-label="Increase font size"
                  className="px-2.5 py-1.5 hover:text-text hover:bg-surface-highlight transition-colors font-medium"
                >
                  A+
                </button>
              </div>
            </div>
          </div>

          {/* ─── Chapter Header Hero Card (Clean & Well-Organized) ─── */}
          <div className="relative overflow-hidden rounded-2xl bg-forest text-forest-ink border border-gold-line-strong p-6 sm:p-8 shadow-xl mb-8">
            {/* Subtle decorative Islamic geometric pattern background */}
            <div className="absolute inset-0 islamic-pattern opacity-40 pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2.5 max-w-xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gold/25 text-gold-light border border-gold/40 shadow-xs">
                    {book.titleBn}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-surface/30 text-forest-ink/90 border border-gold-line/40">
                    অধ্যায় {chapter.id.toLocaleString('bn-BD')}
                  </span>
                </div>

                <h1 className="bangla-ui text-2xl sm:text-3xl lg:text-4xl font-bold text-forest-ink tracking-tight leading-tight">
                  {chapter.nameBn}
                </h1>

                {chapter.nameEn && (
                  <p className="text-sm sm:text-base text-forest-ink/80 font-sans">
                    {chapter.nameEn}
                  </p>
                )}

                <div className="pt-2 flex flex-wrap items-center gap-3 text-xs text-forest-ink/75">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-gold-light" />
                    হাদিস পরিসীমা: {chapter.hadithFirst.toLocaleString('bn-BD')} – {chapter.hadithLast.toLocaleString('bn-BD')}
                  </span>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1.5">
                    মোট হাদিস: {hadiths.length.toLocaleString('bn-BD')}টি
                  </span>
                </div>
              </div>

              {/* Quick Chapter Selector Dropdown */}
              <div className="shrink-0 md:self-end bg-surface/20 backdrop-blur-md p-3.5 sm:p-4 rounded-xl border border-gold-line/50">
                <label htmlFor="chapter-select" className="block text-xs font-medium text-gold-light mb-1.5 bangla-ui">
                  অধ্যায় পরিবর্তন করুন
                </label>
                <div className="relative">
                  <select
                    id="chapter-select"
                    value={chapter.id}
                    onChange={handleChapterChange}
                    className="w-full sm:w-72 px-3 py-2.5 pr-8 rounded-lg bg-surface text-text font-medium text-xs sm:text-sm border border-gold-line focus:outline-none focus:border-gold/50 focus:ring-2 focus:ring-gold/25 shadow-sm cursor-pointer appearance-none transition-all"
                  >
                    {book.chapters.map((c) => (
                      <option key={c.id} value={c.id} className="bg-surface text-text py-1">
                        {c.id}. {c.nameBn} ({c.nameEn})
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-text-muted">
                    <ChevronDownIcon width={14} height={14} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ─── Hadiths Stream ─── */}
          <div className="space-y-6">
            {hadiths.map((item) => (
              <HadithCard
                key={item.hadithNumber}
                hadith={item}
                showEnglishDefault={showAllEnglish}
                arabicFontSize={arabicFontSize}
              />
            ))}
          </div>

          {/* ─── Bottom Navigation: Prev / Index / Next ─── */}
          <div className="mt-12 pt-6 border-t border-border-subtle flex flex-wrap items-center justify-between gap-4">
            {prevChapter ? (
              <Link
                href={`/hadith/${book.id}/${prevChapter.id}`}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface border border-border-subtle hover:border-gold/50 text-xs font-medium text-text hover:text-gold-dark transition-colors shadow-soft"
              >
                ← পূর্ববর্তী অধ্যায়: {prevChapter.nameBn}
              </Link>
            ) : (
              <div />
            )}

            <Link
              href={`/hadith/${book.id}`}
              className="px-4 py-2.5 rounded-xl bg-surface-highlight border border-border-subtle text-xs font-semibold text-text hover:text-gold-dark transition-colors"
            >
              সকল অধ্যায় সূচী
            </Link>

            {nextChapter ? (
              <Link
                href={`/hadith/${book.id}/${nextChapter.id}`}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface border border-border-subtle hover:border-gold/50 text-xs font-medium text-text hover:text-gold-dark transition-colors shadow-soft"
              >
                পরবর্তী অধ্যায়: {nextChapter.nameBn} →
              </Link>
            ) : (
              <div />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
