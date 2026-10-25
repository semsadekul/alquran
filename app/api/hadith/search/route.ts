import { NextRequest, NextResponse } from 'next/server';
import { HADITH_BOOKS, getHadithBook } from '@/lib/data/hadith-books';

export const runtime = 'nodejs';

// Pre-curated high-frequency thematic hadiths for instant search matching
const TOPIC_HIGHLIGHTS: Record<string, { book: string; hadith: number }[]> = {
  // Niyyat / Intention
  intention: [{ book: 'bukhari', hadith: 1 }, { book: 'muslim', hadith: 1907 }, { book: 'nawawi', hadith: 1 }],
  নিয়ত: [{ book: 'bukhari', hadith: 1 }, { book: 'muslim', hadith: 1907 }, { book: 'nawawi', hadith: 1 }],
  নিয়াত: [{ book: 'bukhari', hadith: 1 }, { book: 'muslim', hadith: 1907 }, { book: 'nawawi', hadith: 1 }],
  
  // Faith / Iman
  iman: [{ book: 'muslim', hadith: 1 }, { book: 'bukhari', hadith: 8 }, { book: 'nawawi', hadith: 2 }],
  ঈমান: [{ book: 'muslim', hadith: 1 }, { book: 'bukhari', hadith: 8 }, { book: 'nawawi', hadith: 2 }],
  বিশ্বাস: [{ book: 'muslim', hadith: 1 }, { book: 'bukhari', hadith: 8 }],

  // Patience / Sabr
  patience: [{ book: 'bukhari', hadith: 1469 }, { book: 'muslim', hadith: 2999 }, { book: 'bukhari', hadith: 5641 }],
  sabr: [{ book: 'bukhari', hadith: 1469 }, { book: 'muslim', hadith: 2999 }],
  ধৈর্য: [{ book: 'bukhari', hadith: 1469 }, { book: 'muslim', hadith: 2999 }, { book: 'bukhari', hadith: 5641 }],
  সবর: [{ book: 'bukhari', hadith: 1469 }, { book: 'muslim', hadith: 2999 }],

  // Prayer / Salat
  prayer: [{ book: 'bukhari', hadith: 500 }, { book: 'muslim', hadith: 397 }, { book: 'tirmidhi', hadith: 1 }],
  salat: [{ book: 'bukhari', hadith: 500 }, { book: 'muslim', hadith: 397 }],
  সালাত: [{ book: 'bukhari', hadith: 500 }, { book: 'muslim', hadith: 397 }, { book: 'tirmidhi', hadith: 1 }],
  নামাজ: [{ book: 'bukhari', hadith: 500 }, { book: 'muslim', hadith: 397 }],

  // Knowledge / Ilm
  knowledge: [{ book: 'bukhari', hadith: 59 }, { book: 'tirmidhi', hadith: 2682 }, { book: 'ibnmajah', hadith: 224 }],
  ilm: [{ book: 'bukhari', hadith: 59 }, { book: 'ibnmajah', hadith: 224 }],
  জ্ঞান: [{ book: 'bukhari', hadith: 59 }, { book: 'tirmidhi', hadith: 2682 }, { book: 'ibnmajah', hadith: 224 }],
  ইলম: [{ book: 'bukhari', hadith: 59 }, { book: 'ibnmajah', hadith: 224 }],

  // Parents / Birr al-Walidayn
  parents: [{ book: 'bukhari', hadith: 5971 }, { book: 'muslim', hadith: 2548 }],
  মাতা: [{ book: 'bukhari', hadith: 5971 }, { book: 'muslim', hadith: 2548 }],
  পিতা: [{ book: 'bukhari', hadith: 5971 }, { book: 'muslim', hadith: 2548 }],
  মা: [{ book: 'bukhari', hadith: 5971 }],

  // Character / Akhlaq
  character: [{ book: 'bukhari', hadith: 6035 }, { book: 'tirmidhi', hadith: 2003 }],
  charity: [{ book: 'bukhari', hadith: 1410 }, { book: 'muslim', hadith: 1009 }],
  দান: [{ book: 'bukhari', hadith: 1410 }, { book: 'muslim', hadith: 1009 }],
  সদকা: [{ book: 'bukhari', hadith: 1410 }, { book: 'muslim', hadith: 1009 }],
  
  // Fasting / Ramadan / Roza
  fasting: [{ book: 'bukhari', hadith: 1891 }, { book: 'muslim', hadith: 1151 }],
  ramadan: [{ book: 'bukhari', hadith: 1901 }, { book: 'bukhari', hadith: 38 }],
  রোজা: [{ book: 'bukhari', hadith: 1891 }, { book: 'muslim', hadith: 1151 }],
  সওম: [{ book: 'bukhari', hadith: 1891 }, { book: 'bukhari', hadith: 38 }],
};

const BENGALI_DIGITS: Record<string, string> = {
  '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4',
  '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9',
};

function normalizeQuery(q: string): string {
  let res = q.trim().toLowerCase();
  for (const [bn, en] of Object.entries(BENGALI_DIGITS)) {
    res = res.replaceAll(bn, en);
  }
  return res;
}

const BOOK_ALIASES: Record<string, string> = {
  bukhari: 'bukhari',
  বুখারী: 'bukhari',
  বুখারি: 'bukhari',
  'sahih bukhari': 'bukhari',
  muslim: 'muslim',
  মুসলিম: 'muslim',
  'sahih muslim': 'muslim',
  abudawud: 'abudawud',
  'abu dawud': 'abudawud',
  'abu dawood': 'abudawud',
  'আবু দাউদ': 'abudawud',
  'আবূ দাঊদ': 'abudawud',
  tirmidhi: 'tirmidhi',
  'at-tirmidhi': 'tirmidhi',
  তিরমিযী: 'tirmidhi',
  তিরমিজী: 'tirmidhi',
  nasai: 'nasai',
  'an-nasai': 'nasai',
  নাসায়ী: 'nasai',
  নাসায়ী: 'nasai',
  ibnmajah: 'ibnmajah',
  'ibn majah': 'ibnmajah',
  'ইবনে মাজাহ': 'ibnmajah',
  malik: 'malik',
  muwatta: 'malik',
  মালিক: 'malik',
  মুয়াত্তা: 'malik',
  nawawi: 'nawawi',
  নববী: 'nawawi',
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');

  if (!q || !q.trim()) {
    return NextResponse.json({ results: [] });
  }

  const rawQuery = q.trim();
  const normalized = normalizeQuery(rawQuery);

  // Check citation pattern: e.g. "bukhari 1", "বুখারী ১", "muslim:45", "1"
  let matchedBookId: string | null = null;
  let matchedHadithNum: number | null = null;

  for (const [alias, bookId] of Object.entries(BOOK_ALIASES)) {
    const pattern = new RegExp(`^${alias}\\s*[:#]?\\s*(\\d+)$`, 'i');
    const match = normalized.match(pattern);
    if (match) {
      matchedBookId = bookId;
      matchedHadithNum = Number(match[1]);
      break;
    }
  }

  // Check if query is just a number (default to Bukhari)
  if (!matchedBookId && /^\d+$/.test(normalized)) {
    matchedBookId = 'bukhari';
    matchedHadithNum = Number(normalized);
  }

  const cdnBase = 'https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions';

  // If specific hadith requested
  if (matchedBookId && matchedHadithNum) {
    const book = getHadithBook(matchedBookId);
    if (book) {
      try {
        const [benRes, araRes, engRes] = await Promise.all([
          fetch(`${cdnBase}/ben-${matchedBookId}/${matchedHadithNum}.json`).then((r) => r.ok ? r.json() : null),
          fetch(`${cdnBase}/ara-${matchedBookId}/${matchedHadithNum}.json`).then((r) => r.ok ? r.json() : null),
          fetch(`${cdnBase}/eng-${matchedBookId}/${matchedHadithNum}.json`).then((r) => r.ok ? r.json() : null),
        ]);

        const raw = benRes?.hadiths?.[0];
        if (raw) {
          const ch = book.chapters.find((c) => matchedHadithNum! >= c.hadithFirst && matchedHadithNum! <= c.hadithLast) || book.chapters[0];
          return NextResponse.json({
            results: [
              {
                hadithNumber: raw.hadithnumber,
                arabic: araRes?.hadiths?.[0]?.text || '',
                bangla: raw.text || '',
                english: engRes?.hadiths?.[0]?.text || '',
                grades: raw.grades || [],
                book: book.id,
                bookTitleBn: book.titleBn,
                bookTitleEn: book.titleEn,
                chapter: ch?.id || 1,
                chapterNameBn: ch?.nameBn || '',
                chapterNameEn: ch?.nameEn || '',
              },
            ],
          });
        }
      } catch {
        /* fallback to keyword search */
      }
    }
  }

  // Check topic match
  const topicKey = Object.keys(TOPIC_HIGHLIGHTS).find((k) =>
    normalized.includes(k) || k.includes(normalized)
  );

  if (topicKey) {
    const list = TOPIC_HIGHLIGHTS[topicKey];
    const results = await Promise.all(
      list.slice(0, 3).map(async ({ book: bId, hadith: hNum }) => {
        const book = getHadithBook(bId);
        if (!book) return null;
        try {
          const [benRes, araRes, engRes] = await Promise.all([
            fetch(`${cdnBase}/ben-${bId}/${hNum}.json`).then((r) => r.ok ? r.json() : null),
            fetch(`${cdnBase}/ara-${bId}/${hNum}.json`).then((r) => r.ok ? r.json() : null),
            fetch(`${cdnBase}/eng-${bId}/${hNum}.json`).then((r) => r.ok ? r.json() : null),
          ]);
          const raw = benRes?.hadiths?.[0];
          if (!raw) return null;
          const ch = book.chapters.find((c) => hNum >= c.hadithFirst && hNum <= c.hadithLast) || book.chapters[0];
          return {
            hadithNumber: raw.hadithnumber,
            arabic: araRes?.hadiths?.[0]?.text || '',
            bangla: raw.text || '',
            english: engRes?.hadiths?.[0]?.text || '',
            grades: raw.grades || [],
            book: book.id,
            bookTitleBn: book.titleBn,
            bookTitleEn: book.titleEn,
            chapter: ch?.id || 1,
            chapterNameBn: ch?.nameBn || '',
            chapterNameEn: ch?.nameEn || '',
          };
        } catch {
          return null;
        }
      })
    );

    return NextResponse.json({
      results: results.filter(Boolean),
    });
  }

  return NextResponse.json({ results: [] });
}
