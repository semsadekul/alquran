import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getHadithBook } from '@/lib/data/hadith-books';
import { HadithCard } from '@/components/hadith/HadithCard';

interface SingleHadithPageProps {
  params: { book: string; hadithNumber: string };
}

export async function generateMetadata({ params }: SingleHadithPageProps): Promise<Metadata> {
  const book = getHadithBook(params.book);
  const num = Number(params.hadithNumber);
  if (!book) return { title: 'হাদীস | Al Quran' };

  return {
    title: `${book.titleBn} • হাদিস ${num} | Al Quran`,
    description: `${book.titleBn} হাদিস নং ${num}। মূল আরবি পাঠ, প্রামাণ্য বাংলা অর্থ ও সনদ ভিত্তিক তাহকীকসহ।`,
  };
}

async function fetchSingleHadith(book: string, hadithNum: number) {
  const cdnBase = 'https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions';
  const [benRes, araRes, engRes] = await Promise.all([
    fetch(`${cdnBase}/ben-${book}/${hadithNum}.json`, { next: { revalidate: 86400 } }),
    fetch(`${cdnBase}/ara-${book}/${hadithNum}.json`, { next: { revalidate: 86400 } }).catch(() => null),
    fetch(`${cdnBase}/eng-${book}/${hadithNum}.json`, { next: { revalidate: 86400 } }).catch(() => null),
  ]);

  if (!benRes.ok) return null;

  const benData = await benRes.json();
  const araData = araRes && araRes.ok ? await araRes.json() : { hadiths: [] };
  const engData = engRes && engRes.ok ? await engRes.json() : { hadiths: [] };

  const raw = benData.hadiths?.[0];
  if (!raw) return null;

  return {
    hadithNumber: raw.hadithnumber,
    arabicNumber: raw.arabicnumber,
    arabic: araData.hadiths?.[0]?.text || '',
    bangla: raw.text || '',
    english: engData.hadiths?.[0]?.text || '',
    grades: raw.grades || [],
    reference: raw.reference,
  };
}

export default async function SingleHadithPage({ params }: SingleHadithPageProps) {
  const book = getHadithBook(params.book);
  const num = Number(params.hadithNumber);

  if (!book) notFound();

  const data = await fetchSingleHadith(book.id, num);
  if (!data) notFound();

  // Find chapter
  const chapter = book.chapters.find((c) => num >= c.hadithFirst && num <= c.hadithLast) || book.chapters[0];

  const hadithItem = {
    ...data,
    book: book.id,
    bookTitleBn: book.titleBn,
    bookTitleEn: book.titleEn,
    chapter: chapter?.id || 1,
    chapterNameBn: chapter?.nameBn || '',
    chapterNameEn: chapter?.nameEn || '',
  };

  return (
    <div className="w-full max-w-3xl mx-auto pb-16 animate-fade-in">
      {/* ─── Breadcrumb ─── */}
      <nav className="flex items-center gap-2 text-xs text-text-muted py-3 px-1 mb-4">
        <Link href="/hadith" className="hover:text-gold-dark transition-colors">
          হাদীস গ্রন্থসমূহ
        </Link>
        <span>/</span>
        <Link href={`/hadith/${book.id}`} className="hover:text-gold-dark transition-colors">
          {book.titleBn}
        </Link>
        <span>/</span>
        <Link href={`/hadith/${book.id}/${chapter?.id}`} className="hover:text-gold-dark transition-colors">
          অধ্যায় {chapter?.id}: {chapter?.nameBn}
        </Link>
        <span>/</span>
        <span className="text-text font-medium">হাদিস {num}</span>
      </nav>

      {/* ─── The Single Hadith Card ─── */}
      <HadithCard hadith={hadithItem} showEnglishDefault={true} />

      {/* ─── Bottom Actions ─── */}
      <div className="mt-8 flex items-center justify-between gap-4">
        {num > 1 ? (
          <Link
            href={`/hadith/${book.id}/hadith/${num - 1}`}
            className="px-4 py-2 rounded-xl bg-surface border border-border-subtle hover:border-gold/50 text-xs text-text hover:text-gold-dark transition-colors shadow-soft"
          >
            ← পূর্ববর্তী হাদিস ({num - 1})
          </Link>
        ) : (
          <div />
        )}

        <Link
          href={`/hadith/${book.id}/${chapter?.id}`}
          className="px-4 py-2 rounded-xl bg-surface-highlight border border-border-subtle text-xs font-semibold text-text hover:text-gold-dark transition-colors"
        >
          অধ্যায়ের সকল হাদিস পড়ুন ({chapter?.nameBn})
        </Link>

        {num < book.totalHadiths ? (
          <Link
            href={`/hadith/${book.id}/hadith/${num + 1}`}
            className="px-4 py-2 rounded-xl bg-surface border border-border-subtle hover:border-gold/50 text-xs text-text hover:text-gold-dark transition-colors shadow-soft"
          >
            পরবর্তী হাদিস ({num + 1}) →
          </Link>
        ) : (
          <div />
        )}
      </div>
    </div>
  );
}
