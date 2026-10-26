'use client';

import React from 'react';
import Link from 'next/link';
import { useIntl } from 'react-intl';
import { HADITH_BOOKS, HadithBook } from '@/lib/data/hadith-books';
import { useLocale } from '@/components/providers/LocaleProvider';

interface HadithBookshelfProps {
  onSearchFocus?: () => void;
}

export function HadithBookshelf({ onSearchFocus }: HadithBookshelfProps) {
  const intl = useIntl();
  const { locale } = useLocale();

  const topShelfBooks = HADITH_BOOKS.filter((b) => b.shelf === 'top');
  const bottomShelfBooks = HADITH_BOOKS.filter((b) => b.shelf === 'bottom');
  const bonusBooks = HADITH_BOOKS.filter((b) => b.shelf === 'bonus');

  return (
    <div className="w-full max-w-5xl mx-auto py-6 select-none">
      {/* ─── Top Shelf: The Two Sahihs (সহীহাইন্‌) ─── */}
      <div className="relative mb-12">
        <div className="flex items-center justify-between px-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <h2 className="text-xs uppercase tracking-wider font-semibold text-text-muted">
              {intl.formatMessage({ id: 'hadith.sahiheen' })}
            </h2>
          </div>
          <span className="text-xs text-text-muted">
            {intl.formatMessage({ id: 'hadith.sahiheenCount' })}
          </span>
        </div>

        {/* Books container */}
        <div className="flex flex-wrap justify-center items-end gap-6 sm:gap-10 px-4 min-h-[300px] z-10 relative">
          {topShelfBooks.map((book) => (
            <BookCover key={book.id} book={book} size="large" locale={locale} />
          ))}
        </div>

        {/* Shelf Wood Beam */}
        <ShelfPlank />
      </div>

      {/* ─── Bottom Shelf: Sunan Collections & Muwatta (সুনান ও মুয়াত্তা) ─── */}
      <div className="relative mb-12">
        <div className="flex items-center justify-between px-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <h2 className="text-xs uppercase tracking-wider font-semibold text-text-muted">
{intl.formatMessage({ id: 'hadith.sunan' })}
            </h2>
          </div>
          <span className="text-xs text-text-muted">
            {intl.formatMessage({ id: 'hadith.sunanCount' })}
          </span>
        </div>

        {/* Books container */}
        <div className="flex flex-wrap justify-center items-end gap-3 sm:gap-5 px-4 min-h-[250px] z-10 relative">
          {bottomShelfBooks.map((book) => (
            <BookCover key={book.id} book={book} size="normal" locale={locale} />
          ))}
        </div>

        {/* Shelf Wood Beam */}
        <ShelfPlank />
      </div>

      {/* ─── Bonus Collection: 40 Nawawi ─── */}
      {bonusBooks.length > 0 && (
        <div className="mt-8 pt-6 border-t border-border-subtle flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-xl bg-surface-highlight/40 border">
          <div className="flex items-center gap-4">
            <div className="w-12 h-16 rounded shadow-md bg-gradient-to-br from-[#2b2518] to-[#120f09] border border-[#d4af37]/40 flex items-center justify-center text-[#d4af37] font-arabic text-xl">
              ن
            </div>
            <div>
              <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-gold/15 text-gold-dark mb-1">
                {intl.formatMessage({ id: 'hadith.special' })}
              </span>
              <h3 className="font-display font-semibold text-text text-base">
                {intl.formatMessage({ id: 'hadith.nawawi' })}
              </h3>
              <p className="text-xs text-text-muted">
                {intl.formatMessage({ id: 'hadith.nawawiDesc' })}
              </p>
            </div>
          </div>
          <Link
            href="/hadith/nawawi"
            className="px-4 py-2 rounded-lg bg-surface border border-border-subtle hover:border-gold/50 text-xs font-medium text-text hover:text-gold-dark transition-colors shadow-soft"
          >
{intl.formatMessage({ id: 'hadith.readCollection' })}
          </Link>
        </div>
      )}

      {/* Authenticity Caption */}
      <div className="text-center mt-10 text-xs text-text-muted max-w-xl mx-auto px-4">
        <p className="bangla-ui leading-relaxed">
          {intl.formatMessage({ id: 'hadith.authenticityCaption' })}
        </p>
        <p className="mt-1 text-[11px] text-text-subtle">
          {intl.formatMessage({ id: 'hadith.translationCaption' })}
        </p>
      </div>
    </div>
  );
}

/** Realistic 3D Shelf Wood Plank */
function ShelfPlank() {
  return (
    <div className="w-full relative z-0">
      {/* Top face of plank (depth surface) */}
      <div
        className="w-full h-3 rounded-t-sm"
        style={{
          background: 'linear-gradient(to right, #8a5a36 0%, #aa774c 50%, #835532 100%)',
          boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.25), inset 0 -1px 2px rgba(0,0,0,0.4)',
          borderTop: '1px solid rgba(220,175,120,0.3)',
        }}
      />
      {/* Front edge beam */}
      <div
        className="w-full h-4 rounded-b-sm"
        style={{
          background: 'linear-gradient(to bottom, #5e3b20 0%, #3e2513 100%)',
          boxShadow: '0 8px 20px -3px rgba(0,0,0,0.45), 0 3px 6px -2px rgba(0,0,0,0.3)',
          borderTop: '1px solid rgba(0,0,0,0.3)',
        }}
      />
    </div>
  );
}

interface BookCoverProps {
  book: HadithBook;
  size: 'large' | 'normal';
  locale: string;
}

function BookCover({ book, size, locale }: BookCoverProps) {
  const isLarge = size === 'large';

  // Dimension classes matching Quranly's proportion
  const widthClass = isLarge
    ? 'w-[170px] sm:w-[210px] md:w-[230px] h-[280px] sm:h-[320px]'
    : 'w-[125px] sm:w-[155px] md:w-[170px] h-[225px] sm:h-[265px]';

  return (
    <Link
      href={`/hadith/${book.id}`}
      className={`group relative ${widthClass} rounded-[5px] cursor-pointer transition-all duration-300 transform-gpu hover:-translate-y-3 hover:scale-[1.02] flex flex-col justify-between p-4 sm:p-5`}
      style={{
        background: book.coverGradient,
        boxShadow: `
          -3px 0 6px rgba(0,0,0,0.4),
          inset 4px 0 8px rgba(0,0,0,0.45),
          inset 0 1px 0 rgba(255,255,255,0.15),
          inset -1px 0 0 rgba(255,255,255,0.05),
          0 16px 28px -6px rgba(0,0,0,0.5)
        `,
      }}
    >
      {/* Book Left Spine Ribbing Effect */}
      <div
        aria-hidden="true"
        className="absolute left-0 top-0 bottom-0 w-[8px] rounded-l-[4px] pointer-events-none"
        style={{
          background: 'linear-gradient(to right, rgba(0,0,0,0.5), transparent)',
          borderRight: '1px solid rgba(255,255,255,0.1)',
        }}
      />

      {/* Gold Ornamental Inner Frame */}
      <div
        aria-hidden="true"
        className="absolute inset-2 sm:inset-3 rounded-[3px] pointer-events-none border border-[#d4af37]/35 group-hover:border-[#d4af37]/60 transition-colors"
        style={{
          boxShadow: 'inset 0 0 12px rgba(212,175,55,0.1)',
        }}
      >
        {/* Corner filigree accents */}
        <span className="absolute top-1 left-1 text-[8px] text-[#d4af37]/60">❖</span>
        <span className="absolute top-1 right-1 text-[8px] text-[#d4af37]/60">❖</span>
        <span className="absolute bottom-1 left-1 text-[8px] text-[#d4af37]/60">❖</span>
        <span className="absolute bottom-1 right-1 text-[8px] text-[#d4af37]/60">❖</span>
      </div>

      {/* Top: Arabic Title Calligraphy */}
      <div className="pt-2 text-center relative z-10">
        <h3
          className={`font-arabic text-[#e0b868] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] tracking-wide leading-tight ${
            isLarge ? 'text-2xl sm:text-3xl' : 'text-lg sm:text-xl'
          }`}
          style={{ fontFamily: 'var(--font-arabic)' }}
        >
          {book.titleAr}
        </h3>
      </div>

      {/* Center: English & Bengali Names */}
      <div className="text-center relative z-10 py-2">
        <h4
          className={`font-display font-semibold text-white/95 leading-tight tracking-wide drop-shadow-sm ${
            isLarge ? 'text-sm sm:text-base' : 'text-xs sm:text-sm'
          }`}
        >
          {book.titleEn}
        </h4>
        <p
          className={`bangla-ui text-white/80 font-medium mt-1 leading-snug ${
            isLarge ? 'text-xs sm:text-sm' : 'text-[11px] sm:text-xs'
          }`}
        >
          {book.titleBn}
        </p>

        <p className="text-[10px] sm:text-xs text-white/50 mt-1 italic font-light truncate">
          {locale === 'bn' ? book.authorBn : book.authorEn}
        </p>
      </div>

      {/* Bottom: Count & Authenticity Badge */}
      <div className="text-center relative z-10 pb-1">
        <div className="flex items-center justify-center gap-1.5 mb-1.5">
          <span className="text-[10px] sm:text-[11px] text-white/70 font-mono tracking-tight">
            {locale === 'bn'
              ? `${book.totalHadiths.toLocaleString('bn-BD')} টি হাদিস`
              : `${book.totalHadiths.toLocaleString()} hadiths`}
          </span>
        </div>

        {/* Authenticity Pill Badge */}
        <div className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-black/40 border border-[#d4af37]/40 text-[#f5d77f] text-[9px] sm:text-[10px] font-medium tracking-wide shadow-sm">
          {book.badge}
        </div>
      </div>

      {/* Subtle Dynamic Sheen on Hover */}
      <div
        aria-hidden="true"
        className="absolute inset-0 rounded-[5px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{
          background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.08) 50%, transparent 60%)',
        }}
      />
    </Link>
  );
}
