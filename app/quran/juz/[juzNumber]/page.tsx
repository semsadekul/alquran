import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { getJuz, getAllJuz } from '@/lib/data/juz';
import { getSurahs } from '@/lib/data/quran';
import { absoluteUrl, breadcrumbJsonLd } from '@/lib/seo';

interface JuzPageProps {
  params: {
    juzNumber: string;
  };
}

export function generateStaticParams() {
  return getAllJuz().map((juz) => ({
    juzNumber: String(juz.number),
  }));
}

export function generateMetadata({ params }: JuzPageProps): Metadata {
  const num = parseInt(params.juzNumber, 10);
  const juz = getJuz(num);
  if (!juz) return {};

  const title = `${juz.englishName} (${juz.banglaName}) — Read Para ${juz.number} | Al Quran`;
  const description = `Read ${juz.englishName} (${juz.arabicName}) covering Surah ${juz.startSurahName} to ${juz.endSurahName} (Pages ${juz.startPage}–${juz.endPage}) with Bangla and English translations, audio recitation, and Tafsir.`;
  const path = `/quran/juz/${juz.number}`;

  return {
    title,
    description,
    alternates: { canonical: absoluteUrl(path) },
    openGraph: {
      type: 'article',
      title,
      description,
      url: absoluteUrl(path),
      siteName: 'Al Quran',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default function JuzDetailPage({ params }: JuzPageProps) {
  const num = parseInt(params.juzNumber, 10);
  const juz = getJuz(num);

  if (!juz) {
    notFound();
  }

  const allSurahs = getSurahs();
  const coveredSurahs = allSurahs.filter(
    (s) => s.number >= juz.startSurah && s.number <= juz.endSurah
  );

  const breadcrumbs = [
    { name: 'Home', path: '/' },
    { name: 'Juz', path: '/quran/juz' },
    { name: `Juz ${juz.number}`, path: `/quran/juz/${juz.number}` },
  ];

  const prevJuz = num > 1 ? getJuz(num - 1) : null;
  const nextJuz = num < 30 ? getJuz(num + 1) : null;

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto py-4">
      {/* Structured Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd(breadcrumbs)) }}
      />

      {/* Hero Card */}
      <Card variant="hero" className="p-6 sm:p-8 text-center relative overflow-hidden">
        <div className="inline-block px-4 py-1 rounded-full bg-forest/10 dark:bg-gold-veil text-gold-dark text-xs font-semibold uppercase tracking-wider mb-3">
          Juz {juz.number} of 30 · পারা {juz.number}
        </div>

        <h1 className="font-arabic text-4xl sm:text-5xl font-bold text-text mb-3 leading-relaxed" dir="rtl">
          {juz.arabicName}
        </h1>

        <h2 className="text-2xl font-bold text-text font-display mb-1">
          {juz.englishName}
        </h2>
        <p className="text-base text-text-muted mb-6" style={{ fontFamily: 'var(--font-bengali-ui)' }}>
          {juz.banglaName}
        </p>

        {/* Badges */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-6 text-xs text-text-muted">
          <span className="px-3 py-1.5 rounded-lg bg-surface border border-gold-line">
            📖 Mushaf Pages <strong>{juz.startPage}–{juz.endPage}</strong>
          </span>
          <span className="px-3 py-1.5 rounded-lg bg-surface border border-gold-line">
            ✨ Surah <strong>{juz.startSurahName} ({juz.startAyah})</strong> to <strong>{juz.endSurahName} ({juz.endAyah})</strong>
          </span>
          <span className="px-3 py-1.5 rounded-lg bg-surface border border-gold-line">
            📚 <strong>{coveredSurahs.length}</strong> Surahs covered
          </span>
        </div>

        {/* Primary CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href={`/quran/mushaf?page=${juz.startPage}`}>
            <Button variant="primary" className="w-full sm:w-auto bg-gradient-to-r from-gold to-gold-dark text-white font-medium px-6 py-2.5">
              Read in Mushaf Page Mode (Page {juz.startPage}) →
            </Button>
          </Link>
          <Link href={`/quran/surahs/${juz.startSurah}?ayah=${juz.startAyah}`}>
            <Button variant="outline" className="w-full sm:w-auto border-gold-line text-text hover:bg-surface">
              Begin at {juz.startSurahName} Ayah {juz.startAyah}
            </Button>
          </Link>
        </div>
      </Card>

      {/* Surahs in this Juz */}
      <section className="space-y-3">
        <h3 className="text-lg font-bold text-text font-display flex items-center gap-2">
          <span>📚</span> Surahs in Juz {juz.number}
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {coveredSurahs.map((surah) => (
            <Link
              key={surah.number}
              href={`/quran/surahs/${surah.number}`}
              className="group block"
            >
              <Card
                variant="interactive"
                className="p-4 border-gold-line group-hover:border-gold transition-all flex items-center justify-between"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-8 h-8 rounded-full bg-forest/10 dark:bg-gold-veil/40 text-gold-dark font-bold text-xs flex items-center justify-center shrink-0">
                    {surah.number}
                  </span>
                  <div className="min-w-0">
                    <p className="font-semibold text-text text-sm truncate group-hover:text-gold-dark transition-colors">
                      {surah.englishName}
                    </p>
                    <p className="text-xs text-text-muted truncate" style={{ fontFamily: 'var(--font-bengali-ui)' }}>
                      {surah.banglaName} · {surah.numberOfAyahs} ayahs
                    </p>
                  </div>
                </div>

                <span className="font-arabic text-lg text-text/80 group-hover:text-gold-dark shrink-0" dir="rtl">
                  {surah.name}
                </span>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Bottom Juz Pagination */}
      <nav className="flex items-center justify-between pt-6 border-t border-border-subtle" aria-label="Juz navigation">
        {prevJuz ? (
          <Link href={`/quran/juz/${prevJuz.number}`}>
            <Button variant="ghost" size="sm" className="text-text hover:text-gold-dark">
              ← Juz {prevJuz.number} ({prevJuz.englishName})
            </Button>
          </Link>
        ) : (
          <div />
        )}

        <Link href="/quran/juz">
          <Button variant="outline" size="sm" className="border-gold-line text-text">
            All 30 Juz
          </Button>
        </Link>

        {nextJuz ? (
          <Link href={`/quran/juz/${nextJuz.number}`}>
            <Button variant="ghost" size="sm" className="text-text hover:text-gold-dark">
              Juz {nextJuz.number} ({nextJuz.englishName}) →
            </Button>
          </Link>
        ) : (
          <div />
        )}
      </nav>
    </div>
  );
}
