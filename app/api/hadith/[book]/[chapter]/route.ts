import { NextRequest, NextResponse } from 'next/server';
import { getHadithBook, getHadithChapter } from '@/lib/data/hadith-books';
import { getHadithOverride } from '@/lib/data/hadith-overrides';

export const runtime = 'nodejs';

export async function GET(
  request: NextRequest,
  { params }: { params: { book: string; chapter: string } }
) {
  const { book, chapter } = params;
  const chapterNum = Number(chapter);

  const bookMeta = getHadithBook(book);
  if (!bookMeta) {
    return NextResponse.json({ error: 'Book not found' }, { status: 404 });
  }

  const chapterMeta = getHadithChapter(book, chapterNum);
  if (!chapterMeta) {
    return NextResponse.json({ error: 'Chapter not found' }, { status: 404 });
  }

  try {
    const cdnBase = 'https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions';
    
    // Fetch Bangla, Arabic, and English editions in parallel
    const [benRes, araRes, engRes] = await Promise.all([
      fetch(`${cdnBase}/ben-${book}/sections/${chapterNum}.json`, { next: { revalidate: 86400 } }),
      fetch(`${cdnBase}/ara-${book}/sections/${chapterNum}.json`, { next: { revalidate: 86400 } }).catch(() => null),
      fetch(`${cdnBase}/eng-${book}/sections/${chapterNum}.json`, { next: { revalidate: 86400 } }).catch(() => null),
    ]);

    if (!benRes.ok) {
      return NextResponse.json(
        { error: `Failed to fetch section ${chapterNum} for book ${book}` },
        { status: 502 }
      );
    }

    const benData = await benRes.json();
    const araData = araRes && araRes.ok ? await araRes.json() : { hadiths: [] };
    const engData = engRes && engRes.ok ? await engRes.json() : { hadiths: [] };

    const araMap = new Map<number, string>(
      (araData.hadiths || []).map((h: { hadithnumber: number; text: string }) => [h.hadithnumber, h.text])
    );
    const engMap = new Map<number, string>(
      (engData.hadiths || []).map((h: { hadithnumber: number; text: string }) => [h.hadithnumber, h.text])
    );

    const hadiths = (benData.hadiths || []).map((h: {
      hadithnumber: number;
      arabicnumber?: number;
      text: string;
      grades?: Array<{ name: string; grade: string }>;
      reference?: { book: number; hadith: number };
    }) => {
      const override = getHadithOverride(bookMeta.id, h.hadithnumber);
      return {
        hadithNumber: h.hadithnumber,
        arabicNumber: h.arabicnumber,
        arabic: araMap.get(h.hadithnumber) || '',
        bangla: override?.bangla || h.text || '',
        english: engMap.get(h.hadithnumber) || '',
        grades: h.grades || [],
        reference: h.reference,
        book: bookMeta.id,
        bookTitleBn: bookMeta.titleBn,
        bookTitleEn: bookMeta.titleEn,
        chapter: chapterNum,
        chapterNameBn: chapterMeta.nameBn,
        chapterNameEn: chapterMeta.nameEn,
      };
    });

    return NextResponse.json(
      {
        book: bookMeta.id,
        bookTitleBn: bookMeta.titleBn,
        bookTitleEn: bookMeta.titleEn,
        bookTitleAr: bookMeta.titleAr,
        authorBn: bookMeta.authorBn,
        badge: bookMeta.badge,
        gradeNoteBn: bookMeta.gradeNoteBn,
        publisherNoteBn: bookMeta.publisherNoteBn,
        chapter: chapterNum,
        chapterNameBn: chapterMeta.nameBn,
        chapterNameEn: chapterMeta.nameEn,
        hadithFirst: chapterMeta.hadithFirst,
        hadithLast: chapterMeta.hadithLast,
        totalHadiths: hadiths.length,
        hadiths,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800',
        },
      }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
