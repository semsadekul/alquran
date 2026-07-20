import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getSurahByNumber, getVersesBySurah, getSurahs } from '@/lib/data/quran';
import { PageShell } from '@/components/ui/PageShell';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';

export function generateStaticParams() {
  const surahs = getSurahs();
  const params: { surah: string; ayah: string }[] = [];

  for (const surah of surahs) {
    for (let ayah = 1; ayah <= surah.numberOfAyahs; ayah++) {
      params.push({
        surah: surah.number.toString(),
        ayah: ayah.toString(),
      });
    }
  }

  return params;
}

export async function generateMetadata({ params }: { params: Promise<{ surah: string; ayah: string }> }) {
  const { surah, ayah } = await params;
  const s = parseInt(surah, 10);
  const a = parseInt(ayah, 10);
  const surahMeta = getSurahByNumber(s);
  if (!surahMeta) return { title: 'Not Found' };
  return {
    title: `Tafsir — ${surahMeta.englishName} ${s}:${a}`,
    description: `Tafsir and commentary for verse ${s}:${a} of Surah ${surahMeta.englishName}.`
  };
}

export default async function TafsirPage({ params }: { params: Promise<{ surah: string; ayah: string }> }) {
  const { surah, ayah } = await params;
  const surahNum = parseInt(surah, 10);
  const ayahNum = parseInt(ayah, 10);
  const surahMeta = getSurahByNumber(surahNum);
  if (!surahMeta) notFound();

  const verses = getVersesBySurah(surahNum);
  const verse = verses.find(v => v.ayah === ayahNum);
  if (!verse) notFound();

  const prevAyah = ayahNum > 1 ? ayahNum - 1 : null;
  const nextAyah = ayahNum < surahMeta.numberOfAyahs ? ayahNum + 1 : null;

  return (
    <PageShell
      eyebrow="Tafsir"
      title={`${surahMeta.englishName} — ${surahNum}:${ayahNum}`}
      lede={surahMeta.englishNameTranslation}
    >
      <Button href={`/quran/surahs/${surahNum}`} variant="ghost" className="mb-6">
        &larr; {surahMeta.englishName}
      </Button>

      <Card className="p-5 md:p-6 mb-8">
        <div className="mb-3">
          <Badge tone="gold">{surahNum}:{ayahNum}</Badge>
        </div>
        <p dir="rtl" lang="ar" className="font-arabic text-2xl md:text-3xl text-ink leading-loose mb-4">
          {verse.arabic}
        </p>
        <div className="space-y-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-accent mb-1">Bangla</p>
            <p className="text-sm text-ink-2 leading-relaxed" style={{ fontFamily: 'var(--font-bengali-ui)' }}>
              {verse.bangla}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-accent mb-1">English</p>
            <p className="text-sm text-ink-2 leading-relaxed">
              {verse.english}
            </p>
          </div>
        </div>
      </Card>

      <div className="mb-8">
        <h2 className="text-lg font-semibold text-ink mb-4">Tafsir &amp; Commentary</h2>
        <Card className="p-5 md:p-6">
          <p className="text-sm text-ink-2 leading-relaxed mb-3">
            Tafsir content for this verse will be loaded from the database once the tafsir data ingestion
            pipeline is complete. This will include classical and contemporary commentary in Bengali and English.
          </p>
          <p className="text-xs text-ink-4">
            Supported tafsir sources: Ibn Kathir, Jalalayn, Ma&apos;ariful Quran, Tafsir Uthmani.
          </p>
        </Card>
      </div>

      <div className="mb-8">
        <h3 className="text-base font-semibold text-ink mb-3">Translations</h3>
        <Card variant="interactive" className="p-4">
          <Link href={`/quran/compare/${surahNum}/${ayahNum}`} className="block min-h-[44px] flex items-center">
            <span className="text-sm text-accent font-medium">
              Compare translations side by side &rarr;
            </span>
          </Link>
        </Card>
      </div>

      <nav className="flex items-center justify-between mt-8">
        {prevAyah ? (
          <Button href={`/quran/tafsir/${surahNum}/${prevAyah}`} variant="ghost">
            &larr; Ayah {prevAyah}
          </Button>
        ) : <span />}
        {nextAyah ? (
          <Button href={`/quran/tafsir/${surahNum}/${nextAyah}`} variant="ghost">
            Ayah {nextAyah} &rarr;
          </Button>
        ) : <span />}
      </nav>
    </PageShell>
  );
}
