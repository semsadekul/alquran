import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getHadithBook, HADITH_BOOKS } from '@/lib/data/hadith-books';
import { HadithChapterListClient } from './HadithChapterListClient';

interface BookPageProps {
  params: { book: string };
}

export function generateStaticParams() {
  return HADITH_BOOKS.map((b) => ({ book: b.id }));
}

export function generateMetadata({ params }: BookPageProps): Metadata {
  const book = getHadithBook(params.book);
  if (!book) return { title: 'হাদীস গ্রন্থ | Al Quran' };
  return {
    title: `${book.titleBn} (${book.titleEn}) • সকল অধ্যায় ও হাদিস | Al Quran`,
    description: `${book.titleBn} - ${book.authorBn} সংকলিত ${book.totalHadiths.toLocaleString()}টি হাদিস। মূল আরবি, প্রামাণ্য বাংলা অনুবাদ ও তাহকীকসহ।`,
  };
}

export default function BookChaptersPage({ params }: BookPageProps) {
  const book = getHadithBook(params.book);
  if (!book) notFound();

  return (
    <div className="w-full mx-auto pb-16 animate-fade-in">
      <div className="flex gap-8 items-start justify-start">
        {/* ─── Chapter quick-nav rail — fills the left gutter on wide screens ─── */}
        <aside className="hidden xl:block w-[320px] shrink-0">
          <nav
            aria-label="অধ্যায়সমূহ"
            className="sticky top-20 max-h-[calc(100vh-5.5rem)] flex flex-col rounded-2xl border border-border-subtle bg-surface shadow-soft overflow-hidden"
          >
            {/* Header */}
            <div className="p-3.5 border-b border-border-subtle bg-surface/90 backdrop-blur-md flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-gold shrink-0" />
                <span className="text-xs font-bold uppercase tracking-wider text-text">
                  অধ্যায়সমূহ
                </span>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-gold/15 text-gold-dark border border-gold/25 font-mono">
                  {book.totalChapters}
                </span>
              </div>
            </div>

            {/* Chapter List */}
            <ol className="overflow-y-auto p-2.5 space-y-1.5 scroll-smooth">
              {book.chapters.map((chapter) => (
                <li key={chapter.id}>
                  <Link
                    href={`/hadith/${book.id}/${chapter.id}`}
                    className="group flex items-center gap-3 rounded-xl p-2.5 transition-all duration-150 border border-transparent hover:bg-surface-highlight hover:border-border-subtle/60 text-text"
                  >
                    <div className="w-9 h-9 shrink-0 rounded-xl bg-surface-highlight border border-border-subtle group-hover:border-gold/50 group-hover:bg-gold/10 group-hover:text-gold-light flex items-center justify-center text-xs font-bold text-gold-dark transition-colors">
                      {chapter.id}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1.5 mb-1">
                        <span className="bangla-ui text-[13.5px] leading-tight font-semibold text-text group-hover:text-gold-dark transition-colors truncate">
                          {chapter.nameBn}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2 text-[11px]">
                        <span className="truncate text-text-muted group-hover:text-text/90 font-medium">
                          {chapter.nameEn}
                        </span>
                        <span className="shrink-0 font-mono text-[10px] px-1.5 py-0.5 rounded-md bg-surface-highlight border border-border-subtle/60 text-text-muted">
                          {chapter.hadithFirst}–{chapter.hadithLast}
                        </span>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ol>
          </nav>
        </aside>

        <div className="flex-1 min-w-0 max-w-4xl xl:max-w-5xl">
        {/* ─── Navigation Breadcrumb ─── */}
        <nav className="flex items-center gap-2 text-xs text-text-muted py-3 px-1 mb-4">
          <Link href="/" className="hover:text-gold-dark transition-colors">
            হোম
          </Link>
          <span>/</span>
          <Link href="/hadith" className="hover:text-gold-dark transition-colors">
            হাদীস গ্রন্থসমূহ
          </Link>
          <span>/</span>
          <span className="text-text font-medium">{book.titleBn}</span>
        </nav>

        {/* ─── Book Hero Banner ─── */}
        <div
          className="rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl mb-8 border border-white/10"
          style={{
            background: book.coverGradient,
            boxShadow: '0 20px 40px -15px rgba(0,0,0,0.5)',
          }}
        >
          {/* Subtle decorative background watermarks */}
          <div
            aria-hidden="true"
            className="absolute -right-8 -bottom-10 font-arabic text-8xl sm:text-9xl text-white/5 pointer-events-none select-none"
          >
            {book.iconLetter}
          </div>

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-black/40 border border-[#d4af37]/40 text-[#f5d77f] text-xs font-medium">
                  {book.badge}
                </span>
                <span className="text-xs text-white/70">
                  {book.totalHadiths.toLocaleString('bn-BD')} টি হাদিস • {book.totalChapters} টি অধ্যায়
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-white drop-shadow-sm">
                {book.titleBn}
              </h1>
              <p className="text-sm sm:text-base text-white/80 font-medium">
                {book.titleEn}
              </p>
              <p className="text-xs sm:text-sm text-white/60 italic">
                {book.authorBn} ({book.authorEn})
              </p>
            </div>

            {/* Right Calligraphy & Read First Button */}
            <div className="flex flex-col items-start md:items-end gap-3 shrink-0">
              <span
                className="font-arabic text-3xl sm:text-4xl text-[#e0b868] drop-shadow-md leading-none"
                style={{ fontFamily: 'var(--font-arabic)' }}
              >
                {book.titleAr}
              </span>
              <Link
                href={`/hadith/${book.id}/1`}
                className="mt-2 px-5 py-2.5 rounded-xl bg-gold hover:bg-gold-light text-[#1a1814] text-xs sm:text-sm font-semibold shadow-soft hover:shadow-hover transition-all"
              >
                প্রথম অধ্যায় পড়ুন →
              </Link>
            </div>
          </div>

          {/* Translation & Authenticity Details Footer */}
          <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs text-white/70">
            <p>
              <strong className="text-white/90">বিশুদ্ধতার মানদণ্ড:</strong> {book.gradeNoteBn}
            </p>
            <p className="text-[11px] text-white/50">
              {book.publisherNoteBn}
            </p>
          </div>
        </div>

        {/* ─── Client Chapter Search & Chapters List ─── */}
        <HadithChapterListClient book={book} />
        </div>
      </div>
    </div>
  );
}
