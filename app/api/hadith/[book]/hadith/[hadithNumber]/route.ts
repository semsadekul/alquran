import { NextRequest, NextResponse } from 'next/server';
import { getHadithBook } from '@/lib/data/hadith-books';

export const runtime = 'nodejs';

export async function GET(
  request: NextRequest,
  { params }: { params: { book: string; hadithNumber: string } }
) {
  const { book, hadithNumber } = params;
  const num = Number(hadithNumber);

  const bookMeta = getHadithBook(book);
  if (!bookMeta) {
    return NextResponse.json({ error: 'Book not found' }, { status: 404 });
  }

  try {
    const cdnBase = 'https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions';

    const [benRes, araRes, engRes] = await Promise.all([
      fetch(`${cdnBase}/ben-${book}/${num}.json`, { next: { revalidate: 86400 } }),
      fetch(`${cdnBase}/ara-${book}/${num}.json`, { next: { revalidate: 86400 } }).catch(() => null),
      fetch(`${cdnBase}/eng-${book}/${num}.json`, { next: { revalidate: 86400 } }).catch(() => null),
    ]);

    if (!benRes.ok) {
      return NextResponse.json(
        { error: `Hadith ${num} not found in ${book}` },
        { status: 404 }
      );
    }

    const benData = await benRes.json();
    const araData = araRes && araRes.ok ? await araRes.json() : { hadiths: [] };
    const engData = engRes && engRes.ok ? await engRes.json() : { hadiths: [] };

    const rawHadith = benData.hadiths?.[0];
    if (!rawHadith) {
      return NextResponse.json({ error: 'Hadith content missing' }, { status: 404 });
    }

    // Find which chapter this hadith belongs to
    const chapter = bookMeta.chapters.find(
      (c) => num >= c.hadithFirst && num <= c.hadithLast
    ) || bookMeta.chapters[0];

    const unified = {
      hadithNumber: rawHadith.hadithnumber,
      arabicNumber: rawHadith.arabicnumber,
      arabic: araData.hadiths?.[0]?.text || '',
      bangla: rawHadith.text || '',
      english: engData.hadiths?.[0]?.text || '',
      grades: rawHadith.grades || [],
      reference: rawHadith.reference,
      book: bookMeta.id,
      bookTitleBn: bookMeta.titleBn,
      bookTitleEn: bookMeta.titleEn,
      bookTitleAr: bookMeta.titleAr,
      authorBn: bookMeta.authorBn,
      badge: bookMeta.badge,
      gradeNoteBn: bookMeta.gradeNoteBn,
      chapter: chapter?.id || 1,
      chapterNameBn: chapter?.nameBn || '',
      chapterNameEn: chapter?.nameEn || '',
    };

    return NextResponse.json(unified, {
      headers: {
        'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800',
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
