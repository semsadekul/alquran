'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLocale } from '@/components/providers/LocaleProvider';
import { readSavedHadiths, toggleSavedHadith, SavedHadithEntry } from '@/lib/hadith-storage';
import { BookmarkIcon, CopyIcon, CheckIcon } from '@/components/ui/Icon';
import { HadithTranslation } from '@/components/hadith/HadithTranslation';

export default function SavedHadithsPage() {
  const { locale } = useLocale();
  const [items, setItems] = useState<SavedHadithEntry[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    try {
      if (typeof readSavedHadiths === 'function') {
        setItems(readSavedHadiths());
      }
    } catch {
      /* noop */
    }
  }, []);

  const handleRemove = (item: SavedHadithEntry) => {
    if (typeof toggleSavedHadith === 'function') {
      toggleSavedHadith(item);
    }
    if (typeof readSavedHadiths === 'function') {
      setItems(readSavedHadiths());
    }
  };

  const handleCopy = async (item: SavedHadithEntry) => {
    const text = [
      `【 ${item.bookTitleBn} • হাদিস ${item.hadithNumber} 】`,
      `অধ্যায়: ${item.chapterNameBn}`,
      item.arabic ? `\n[আরবি মতন]\n${item.arabic}` : '',
      `\n[বাংলা অর্থ]\n${item.bangla}`,
      item.english ? `\n[English]\n${item.english}` : '',
    ]
      .filter(Boolean)
      .join('\n');

    try {
      await navigator.clipboard.writeText(text);
      const key = `${item.book}-${item.hadithNumber}`;
      setCopiedId(key);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      /* noop */
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto pb-20 animate-fade-in">
      {/* ─── Breadcrumb ─── */}
      <nav className="flex items-center gap-2 text-xs text-text-muted py-3 px-1 mb-4">
        <Link href="/" className="hover:text-gold-dark transition-colors">
          হোম
        </Link>
        <span>/</span>
        <Link href="/hadith" className="hover:text-gold-dark transition-colors">
          হাদীস গ্রন্থসমূহ
        </Link>
        <span>/</span>
        <span className="text-text font-medium">সংরক্ষিত হাদিস</span>
      </nav>

      {/* ─── Header ─── */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <BookmarkIcon width={22} height={22} className="text-gold" />
            <h1 className="bangla-display text-2xl font-bold text-text">
              সংরক্ষিত হাদিস
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-text-muted mt-1">
            আপনার বুকমার্ক করা সকল গুরুত্বপূর্ণ হাদিস এখানে সংরক্ষিত থাকবে।
          </p>
        </div>
        <span className="text-xs px-2.5 py-1 rounded-full bg-gold/15 text-gold-dark font-medium border border-gold/30">
          মোট {items.length} টি হাদিস
        </span>
      </div>

      {/* ─── List of Saved Hadiths ─── */}
      {items.length > 0 ? (
        <div className="space-y-4">
          {items.map((item) => {
            const key = `${item.book}-${item.hadithNumber}`;
            return (
              <div
                key={key}
                className="rounded-xl bg-surface border border-border-subtle p-5 shadow-soft hover:border-gold/30 transition-all space-y-3"
              >
                <div className="flex items-center justify-between gap-3 pb-3 border-b border-border-subtle">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-xs font-semibold bg-surface-highlight text-gold-dark border border-gold-line">
                      {item.bookTitleBn} • হাদিস {item.hadithNumber}
                    </span>
                    <span className="text-xs text-text-muted">
                      {item.chapterNameBn}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleCopy(item)}
                      aria-label="কপি করুন"
                      title="কপি করুন"
                      className="p-1.5 rounded-md text-text-muted hover:text-text hover:bg-surface-highlight transition-colors"
                    >
                      {copiedId === key ? (
                        <CheckIcon width={16} height={16} className="text-emerald-500" />
                      ) : (
                        <CopyIcon width={16} height={16} />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleRemove(item)}
                      aria-label="বুকমার্ক সরান"
                      title="বুকমার্ক সরান"
                      className="p-1.5 rounded-md text-red-500/80 hover:text-red-500 hover:bg-red-500/10 transition-colors text-xs"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                {item.arabic && (
                  <p
                    className="font-arabic text-text text-right leading-loose"
                    dir="rtl"
                    style={{ fontSize: '22px', fontFamily: 'var(--font-arabic)' }}
                  >
                    {item.arabic}
                  </p>
                )}

                <HadithTranslation
                  text={item.bangla}
                  className="bangla-ui text-sm sm:text-base text-text leading-relaxed"
                />

                <div className="pt-2 flex items-center justify-between text-xs text-text-muted">
                  <Link
                    href={`/hadith/${item.book}/hadith/${item.hadithNumber}`}
                    className="text-gold-dark hover:underline font-medium"
                  >
                    সম্পূর্ণ হাদিস ও তাহকীক দেখুন →
                  </Link>
                  <span className="text-[11px] text-text-subtle">
                    {new Date(item.addedAt).toLocaleDateString(
                      locale === 'bn' ? 'bn-BD' : 'en-US'
                    )}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 px-4 rounded-2xl bg-surface border border-border-subtle">
          <BookmarkIcon width={40} height={40} className="text-text-muted mx-auto mb-3 opacity-40" />
          <h2 className="text-base font-semibold text-text mb-1">
            কোনো সংরক্ষিত হাদিস নেই
          </h2>
          <p className="text-xs sm:text-sm text-text-muted max-w-sm mx-auto mb-6">
            হাদিস পড়ার সময় বুকমার্ক আইকনে ক্লিক করে যে কোনো হাদিস এখানে সংরক্ষণ করে রাখতে পারেন।
          </p>
          <Link
            href="/hadith"
            className="inline-flex px-4 py-2 rounded-xl bg-gold text-[#1a1814] text-xs font-semibold shadow-soft hover:shadow-hover transition-all"
          >
            হাদীস গ্রন্থসমূহ দেখুন →
          </Link>
        </div>
      )}
    </div>
  );
}
