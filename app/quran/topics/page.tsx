import type { Metadata } from 'next';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { getAllTopics } from '@/lib/data/topics';
import { absoluteUrl } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Quran Topics & Famous Verses — Ayatul Kursi, Yaseen, Mulk, Duas & Themes',
  description:
    'Explore curated Quranic themes, powerful Duas, and essential surahs: Ayatul Kursi, Surah Yaseen, Surah Mulk, Sabr, Rizq, and Tawbah with Bangla & English translation and audio recitation.',
  alternates: { canonical: absoluteUrl('/quran/topics') },
  openGraph: {
    title: 'Quran Topics, Duas & Important Surahs — Al Quran',
    description:
      'Curated high-volume Quranic topics: Ayatul Kursi, Surah Yaseen, Mulk, Duas for Parents, Sabr, Rizq, and Forgiveness.',
    url: absoluteUrl('/quran/topics'),
  },
};

export default function TopicsIndexPage() {
  const topics = getAllTopics();

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto py-4">
      {/* Header */}
      <header className="text-center max-w-2xl mx-auto">
        <div className="inline-block px-4 py-1 rounded-full bg-forest/10 dark:bg-gold-veil text-gold-dark text-xs font-semibold uppercase tracking-wider mb-3">
          <span>✨</span> Essential Quranic Themes
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-text font-display mb-2">
          Curated Quran Topics &amp; Duas
        </h1>
        <p className="text-sm sm:text-base text-text-muted" style={{ fontFamily: 'var(--font-bengali-ui)' }}>
          কুরআনের গুরুত্বপূর্ণ বিষয়ভিত্তিক আয়াত, বহুল পঠিত সূরা এবং শক্তিশালী দোয়া সমূহের সংকলন
        </p>
      </header>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {topics.map((t) => (
          <Link key={t.slug} href={`/quran/topics/${t.slug}`} className="group">
            <Card
              variant="interactive"
              className="p-5 h-full flex flex-col justify-between border-gold-line group-hover:border-gold group-hover:shadow-md transition-all"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="font-arabic text-lg font-bold text-text/80 group-hover:text-gold-dark transition-colors" dir="rtl">
                    {t.arabicTitle}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-forest/5 dark:bg-gold-veil text-gold-dark font-medium">
                    {t.verses.length} {t.verses.length === 1 ? 'Ayah' : 'Ayahs'}
                  </span>
                </div>

                <h2 className="font-semibold text-text text-base group-hover:text-gold-dark transition-colors">
                  {t.title}
                </h2>
                <p className="text-xs text-text-muted mt-1" style={{ fontFamily: 'var(--font-bengali-ui)' }}>
                  {t.banglaTitle}
                </p>

                <p className="text-xs text-text/70 mt-2.5 line-clamp-2 leading-relaxed">
                  {t.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-border-subtle flex items-center justify-between text-xs text-gold-dark font-medium">
                <span>{t.tagline}</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
