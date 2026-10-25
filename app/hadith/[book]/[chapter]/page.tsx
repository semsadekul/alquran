import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getHadithBook, getHadithChapter, HADITH_BOOKS } from '@/lib/data/hadith-books';
import { HadithReaderClient } from './HadithReaderClient';

interface ChapterPageProps {
  params: { book: string; chapter: string };
}

export function generateMetadata({ params }: ChapterPageProps): Metadata {
  const book = getHadithBook(params.book);
  const chNum = Number(params.chapter);
  const chapter = book ? getHadithChapter(params.book, chNum) : null;

  if (!book || !chapter) {
    return { title: 'হাদীস অধ্যায় | Al Quran' };
  }

  return {
    title: `${chapter.nameBn} (${chapter.nameEn}) • ${book.titleBn} | Al Quran`,
    description: `${book.titleBn} এর অধ্যায় ${chapter.id}: ${chapter.nameBn}। হাদিস ${chapter.hadithFirst} থেকে ${chapter.hadithLast}। মূল আরবি ও প্রামাণ্য বাংলা অর্থসহ।`,
  };
}

async function fetchChapterData(book: string, chapter: number) {
  const cdnBase = 'https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions';
  const [benRes, araRes, engRes] = await Promise.all([
    fetch(`${cdnBase}/ben-${book}/sections/${chapter}.json`, { next: { revalidate: 86400 } }),
    fetch(`${cdnBase}/ara-${book}/sections/${chapter}.json`, { next: { revalidate: 86400 } }).catch(() => null),
    fetch(`${cdnBase}/eng-${book}/sections/${chapter}.json`, { next: { revalidate: 86400 } }).catch(() => null),
  ]);

  if (!benRes.ok) return null;

  const benData = await benRes.json();
  const araData = araRes && araRes.ok ? await araRes.json() : { hadiths: [] };
  const engData = engRes && engRes.ok ? await engRes.json() : { hadiths: [] };

  const araMap = new Map<number, string>(
    (araData.hadiths || []).map((h: { hadithnumber: number; text: string }) => [h.hadithnumber, h.text])
  );
  const engMap = new Map<number, string>(
    (engData.hadiths || []).map((h: { hadithnumber: number; text: string }) => [h.hadithnumber, h.text])
  );

  return (benData.hadiths || []).map((h: {
    hadithnumber: number;
    arabicnumber?: number;
    text: string;
    grades?: Array<{ name: string; grade: string }>;
    reference?: { book: number; hadith: number };
  }) => ({
    hadithNumber: h.hadithnumber,
    arabicNumber: h.arabicnumber,
    arabic: araMap.get(h.hadithnumber) || '',
    bangla: h.text || '',
    english: engMap.get(h.hadithnumber) || '',
    grades: h.grades || [],
    reference: h.reference,
  }));
}

export default async function ChapterReaderPage({ params }: ChapterPageProps) {
  const book = getHadithBook(params.book);
  const chNum = Number(params.chapter);
  const chapter = book ? getHadithChapter(params.book, chNum) : null;

  if (!book || !chapter) notFound();

  const rawHadiths = await fetchChapterData(book.id, chNum);
  if (!rawHadiths) notFound();

  const hadiths = rawHadiths.map((h: {
    hadithNumber: number;
    arabicNumber?: number;
    arabic: string;
    bangla: string;
    english: string;
    grades?: Array<{ name: string; grade: string }>;
    reference?: { book: number; hadith: number };
  }) => ({
    ...h,
    book: book.id,
    bookTitleBn: book.titleBn,
    bookTitleEn: book.titleEn,
    chapter: chapter.id,
    chapterNameBn: chapter.nameBn,
    chapterNameEn: chapter.nameEn,
  }));

  const prevChapter = getHadithChapter(book.id, chNum - 1);
  const nextChapter = getHadithChapter(book.id, chNum + 1);

  return (
    <HadithReaderClient
      book={book}
      chapter={chapter}
      hadiths={hadiths}
      prevChapter={prevChapter}
      nextChapter={nextChapter}
    />
  );
}
