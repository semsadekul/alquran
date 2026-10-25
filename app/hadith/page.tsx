import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { HadithBookshelf } from '@/components/hadith/HadithBookshelf';
import { HadithSearchBar } from '@/components/hadith/HadithSearchBar';

export const metadata: Metadata = {
  title: 'হাদীস সংকলন • ৩৬,৩৯০টি বিশুদ্ধ হাদিসের প্রামাণ্য সংগ্রহ | Al Quran',
  description:
    'সহীহ বুখারী, সহীহ মুসলিম, সুনান আবূ দাঊদ, জামে তিরমিযীসহ ৭টি প্রধান হাদীস গ্রন্থের ৩৬,৩৯০টি হাদিস — মূল আরবি, প্রামাণ্য বাংলা অর্থ ও সনদ ভিত্তিক তাহকীকসহ।',
};

export default function HadithLandingPage() {
  return (
    <div className="w-full pb-16 animate-fade-in">
      {/* ─── Hero Section ─── */}
      <div className="pt-4 pb-8 text-center max-w-3xl mx-auto px-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 border border-gold/30 text-gold-dark text-xs font-semibold mb-4">
          <span className="font-arabic text-sm">حديث نبوي</span>
          <span>•</span>
          <span>THE PROPHETIC TRADITIONS</span>
        </div>

        <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-text tracking-tight leading-tight">
          হাদীস গ্রন্থসমূহ
        </h1>

        <p className="bangla-ui text-text-muted text-base sm:text-lg mt-3 max-w-2xl mx-auto leading-relaxed">
          ৭টি প্রধান হাদিস সংকলন থেকে ৩৬,৩৯০টি হাদিস — প্রতিটি হাদিসের মূল আরবি মতন, সনদ ভিত্তিক তাহকীক (বিশুদ্ধতার মান) এবং নির্ভরযোগ্য বাংলা অর্থসহ।
        </p>

        {/* ─── Search Bar ─── */}
        <div className="mt-8">
          <HadithSearchBar />
        </div>

        {/* Quick Topic Tags */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs">
          <span className="text-text-subtle">জনপ্রিয় বিষয়:</span>
          {[
            { label: 'নিয়াত', book: 'bukhari', hadith: 1 },
            { label: 'ঈমান', book: 'bukhari', hadith: 8 },
            { label: 'ধৈর্য', book: 'bukhari', hadith: 1469 },
            { label: 'সালাত', book: 'bukhari', hadith: 500 },
            { label: 'ইলম ও জ্ঞান', book: 'bukhari', hadith: 59 },
            { label: 'মা-বাবা', book: 'bukhari', hadith: 5971 },
            { label: 'দান ও সদকা', book: 'bukhari', hadith: 1410 },
          ].map((topic) => (
            <Link
              key={topic.label}
              href={`/hadith/${topic.book}/hadith/${topic.hadith}`}
              className="px-2.5 py-1 rounded-full bg-surface-highlight hover:bg-gold/15 text-text-muted hover:text-gold-dark border border-border-subtle transition-colors"
            >
              {topic.label}
            </Link>
          ))}
        </div>
      </div>

      {/* ─── 3D Bookshelf Mockup ─── */}
      <HadithBookshelf />
    </div>
  );
}
