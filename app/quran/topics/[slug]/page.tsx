import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { promises as fs } from 'fs';
import path from 'path';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { getTopicBySlug, getAllTopics } from '@/lib/data/topics';
import { TopicVerseList, type DisplayVerse } from '@/components/quran/TopicVerseList';
import { absoluteUrl, breadcrumbJsonLd } from '@/lib/seo';

interface TopicPageProps {
  params: {
    slug: string;
  };
}

export function generateStaticParams() {
  return getAllTopics().map((t) => ({
    slug: t.slug,
  }));
}

export function generateMetadata({ params }: TopicPageProps): Metadata {
  const topic = getTopicBySlug(params.slug);
  if (!topic) return {};

  const title = `${topic.title} (${topic.banglaTitle}) — Arabic, Bangla & English | Al Quran`;
  const description = `${topic.description} Read with Arabic text, Bangla & English translations, and audio recitation.`;
  const pagePath = `/quran/topics/${topic.slug}`;

  return {
    title,
    description,
    alternates: { canonical: absoluteUrl(pagePath) },
    openGraph: {
      type: 'article',
      title,
      description,
      url: absoluteUrl(pagePath),
      siteName: 'Al Quran',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

async function loadVerseData(surahNum: number, ayahNum: number): Promise<DisplayVerse | null> {
  try {
    const filePath = path.join(process.cwd(), 'public', 'data', 'verses', `${surahNum}.json`);
    const raw = await fs.readFile(filePath, 'utf8');
    const data = JSON.parse(raw);
    const found = data.ayahs?.find((a: { number: number }) => a.number === ayahNum);
    if (!found) return null;
    return {
      surahNumber: surahNum,
      ayahNumber: ayahNum,
      arabic: found.arabic,
      bangla: found.bangla,
      english: found.english,
      transliteration: found.transliteration,
      banglaTransliteration: found.banglaTransliteration,
    };
  } catch {
    return null;
  }
}

export default async function TopicDetailPage({ params }: TopicPageProps) {
  const topic = getTopicBySlug(params.slug);
  if (!topic) {
    notFound();
  }

  const versesPromises = topic.verses.map((v) => loadVerseData(v.surahNumber, v.ayahNumber));
  const rawVerses = await Promise.all(versesPromises);
  const verses = rawVerses.filter((v): v is DisplayVerse => v !== null);

  const breadcrumbs = [
    { name: 'Home', path: '/' },
    { name: 'Topics', path: '/quran/topics' },
    { name: topic.title, path: `/quran/topics/${topic.slug}` },
  ];

  const allTopics = getAllTopics();
  const currentIndex = allTopics.findIndex((t) => t.slug === topic.slug);
  const prevTopic = currentIndex > 0 ? allTopics[currentIndex - 1] : null;
  const nextTopic = currentIndex < allTopics.length - 1 ? allTopics[currentIndex + 1] : null;

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto py-4">
      {/* Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd(breadcrumbs)) }}
      />

      {/* Hero Header */}
      <Card variant="hero" className="p-6 sm:p-8 text-center relative overflow-hidden">
        <div className="inline-block px-4 py-1 rounded-full bg-forest/10 dark:bg-gold-veil text-gold-dark text-xs font-semibold uppercase tracking-wider mb-3">
          Quranic Theme &middot; {topic.tagline}
        </div>

        <h1 className="font-arabic text-3xl sm:text-4xl font-bold text-text mb-2" dir="rtl">
          {topic.arabicTitle}
        </h1>

        <h2 className="text-2xl sm:text-3xl font-bold text-text font-display mb-1">
          {topic.title}
        </h2>
        <p className="text-base text-text-muted mb-4" style={{ fontFamily: 'var(--font-bengali-ui)' }}>
          {topic.banglaTitle}
        </p>

        <p className="text-xs sm:text-sm text-text/80 max-w-2xl mx-auto leading-relaxed mb-4">
          {topic.description}
        </p>

        {topic.targetSurahNumber && (
          <div className="mt-2">
            <Link href={`/quran/surahs/${topic.targetSurahNumber}`}>
              <Button variant="outline" size="sm" className="border-gold-line text-text hover:bg-surface text-xs">
                Read Complete Surah in Full Reader →
              </Button>
            </Link>
          </div>
        )}
      </Card>

      {/* Hadith / Virtue Note */}
      {topic.hadithNote && (
        <Card variant="elevated" className="p-4 bg-gold-veil/20 border-gold/30">
          <div className="flex items-start gap-3">
            <span className="text-xl shrink-0 mt-0.5">📜</span>
            <div className="text-xs sm:text-sm text-text/90 leading-relaxed italic">
              {topic.hadithNote}
            </div>
          </div>
        </Card>
      )}

      {/* Verse List */}
      <section className="space-y-3">
        <h3 className="text-lg font-bold text-text font-display flex items-center justify-between">
          <span>Verses &amp; Translation ({verses.length})</span>
          <span className="text-xs text-text-muted font-normal">
            Bangla: Muhiuddin Khan &middot; English: Sahih Int.
          </span>
        </h3>

        <TopicVerseList verses={verses} />
      </section>

      {/* Bottom Topic Pagination */}
      <nav className="flex items-center justify-between pt-6 border-t border-border-subtle" aria-label="Topic navigation">
        {prevTopic ? (
          <Link href={`/quran/topics/${prevTopic.slug}`}>
            <Button variant="ghost" size="sm" className="text-text hover:text-gold-dark text-xs sm:text-sm">
              &larr; {prevTopic.title}
            </Button>
          </Link>
        ) : (
          <div />
        )}

        <Link href="/quran/topics">
          <Button variant="outline" size="sm" className="border-gold-line text-text text-xs sm:text-sm">
            All Topics
          </Button>
        </Link>

        {nextTopic ? (
          <Link href={`/quran/topics/${nextTopic.slug}`}>
            <Button variant="ghost" size="sm" className="text-text hover:text-gold-dark text-xs sm:text-sm">
              {nextTopic.title} &rarr;
            </Button>
          </Link>
        ) : (
          <div />
        )}
      </nav>
    </div>
  );
}
