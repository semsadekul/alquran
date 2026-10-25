import { promises as fs } from 'fs';
import path from 'path';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getSurah, getSurahs } from '@/lib/data/quran';
import { absoluteUrl, ayahArticleJsonLd, breadcrumbJsonLd } from '@/lib/seo';

interface VerseData {
  number: number;
  arabic: string;
  transliteration?: string;
  banglaTransliteration?: string;
  bangla: string;
  english: string;
}

interface CorpusPayload {
  ayahs?: VerseData[];
}

/**
 * Only the 6,236 real ayahs exist. Any other segment must return a true 404,
 * not a 200 "not found" page that search engines would index.
 */
export const dynamicParams = false;

/** Every ayah page is static: 6,236 routes across 114 surahs. */
export async function generateStaticParams() {
  const params: { surahNumber: string; ayahNumber: string }[] = [];
  for (const surah of getSurahs()) {
    for (let ayah = 1; ayah <= surah.numberOfAyahs; ayah++) {
      params.push({ surahNumber: String(surah.number), ayahNumber: String(ayah) });
    }
  }
  return params;
}

async function readVerses(surahNumber: number): Promise<VerseData[] | null> {
  try {
    const raw = await fs.readFile(
      path.join(process.cwd(), 'public', 'data', 'verses', `${surahNumber}.json`),
      'utf8'
    );
    const payload = JSON.parse(raw) as CorpusPayload;
    return Array.isArray(payload.ayahs) ? payload.ayahs : null;
  } catch {
    return null;
  }
}

/** Parses a route segment into a valid surah/ayah pair, or null. */
function parseParams(params: { surahNumber: string; ayahNumber: string }) {
  const surahNumber = Number(params.surahNumber);
  const ayahNumber = Number(params.ayahNumber);
  if (!Number.isInteger(surahNumber) || !Number.isInteger(ayahNumber)) return null;
  const surah = getSurah(surahNumber);
  if (!surah || ayahNumber < 1 || ayahNumber > surah.numberOfAyahs) return null;
  return { surah, ayahNumber };
}

export async function generateMetadata({
  params,
}: {
  params: { surahNumber: string; ayahNumber: string };
}) {
  const parsed = parseParams(params);
  if (!parsed) return { title: 'Ayah not found — Al Quran' };
  const { surah, ayahNumber } = parsed;
  const title = `${surah.englishName} ${surah.number}:${ayahNumber} — Al Quran`;
  const path = `/quran/surahs/${surah.number}/${ayahNumber}`;
  return {
    title,
    description: `Surah ${surah.englishName} ayah ${ayahNumber} — Arabic text with Bengali and English translation.`,
    alternates: { canonical: path },
    openGraph: { type: 'article', title, url: absoluteUrl(path), siteName: 'Al Quran' },
  };
}

export default async function AyahPage({
  params,
}: {
  params: { surahNumber: string; ayahNumber: string };
}) {
  const parsed = parseParams(params);
  if (!parsed) notFound();
  const { surah, ayahNumber } = parsed;

  const verses = await readVerses(surah.number);
  const verse = verses?.find((v) => v.number === ayahNumber);
  if (!verse) notFound();

  const prev = ayahNumber > 1 ? `/quran/surahs/${surah.number}/${ayahNumber - 1}` : null;
  const next =
    ayahNumber < surah.numberOfAyahs ? `/quran/surahs/${surah.number}/${ayahNumber + 1}` : null;

  const basePath = `/quran/surahs/${surah.number}/${ayahNumber}`;
  const breadcrumbs = breadcrumbJsonLd([
    { name: 'Surahs', path: '/quran/library' },
    { name: surah.englishName, path: `/quran/surahs/${surah.number}` },
    { name: `${surah.number}:${ayahNumber}`, path: basePath },
  ]);
  const article = ayahArticleJsonLd({
    headline: `${surah.englishName} ${surah.number}:${ayahNumber}`,
    description: verse.english,
    path: basePath,
  });

  return (
    <article className="max-w-3xl mx-auto space-y-8 animate-fade-in">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(article) }}
      />
      <nav aria-label="Breadcrumb" className="text-sm text-text-muted">
        <Link href="/quran/library" className="hover:text-gold-dark">
          Surahs
        </Link>
        {' / '}
        <Link href={`/quran/surahs/${surah.number}`} className="hover:text-gold-dark">
          {surah.englishName}
        </Link>
        {' / '}
        <span>{ayahNumber}</span>
      </nav>

      <header className="text-center">
        <p className="text-sm text-gold-dark tabular-nums">
          {surah.englishName} · {surah.number}:{ayahNumber}
        </p>
      </header>

      <p
        dir="rtl"
        lang="ar"
        className="arabic-text text-text text-center"
        style={{ fontSize: '40px', lineHeight: 2.4 }}
      >
        {verse.arabic}
      </p>

      {verse.transliteration && (
        <p className="verse-transliteration text-gold-dark/90 italic text-center text-base mb-1">
          {verse.transliteration}
        </p>
      )}

      {verse.banglaTransliteration && (
        <p
          lang="bn"
          className="verse-bangla-transliteration text-gold-dark/80 text-center text-base bangla-ui mb-2"
          style={{ fontFamily: 'var(--font-bengali-ui)' }}
        >
          {verse.banglaTransliteration}
        </p>
      )}

      <p lang="bn" className="verse-bangla text-text/90 text-center text-lg">
        {verse.bangla}
      </p>

      <p lang="en" className="text-text/70 italic text-center">
        &quot;{verse.english}&quot;
      </p>

      <nav aria-label="Ayah navigation" className="flex justify-between gap-3 pt-4">
        {prev ? (
          <Link href={prev} className="text-gold-dark hover:underline">
            ← Previous ayah
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link href={next} className="text-gold-dark hover:underline">
            Next ayah →
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </article>
  );
}
