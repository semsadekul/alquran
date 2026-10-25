import type { Metadata } from 'next';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { getAllJuz } from '@/lib/data/juz';
import { absoluteUrl } from '@/lib/seo';

export const metadata: Metadata = {
  title: '30 Juz (Para) of Al Quran — Read by Juz with Translation & Audio',
  description:
    'Explore all 30 Juz (পারা) of the Holy Quran. Read online with Bangla and English translations, Mushaf page layout, audio recitation, and Tafsir.',
  alternates: { canonical: absoluteUrl('/quran/juz') },
  openGraph: {
    title: '30 Juz (Para) of Al Quran — Complete 30 Paras Online',
    description:
      'Complete 30 Juz index with Arabic, Bengali, and English names, Mushaf page boundaries, and audio recitation.',
    url: absoluteUrl('/quran/juz'),
  },
};

export default function JuzIndexPage() {
  const allJuz = getAllJuz();

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto py-4">
      {/* Header */}
      <header className="text-center max-w-2xl mx-auto">
        <div className="inline-block px-4 py-1 rounded-full bg-forest/10 dark:bg-gold-veil text-gold-dark text-xs font-semibold uppercase tracking-wider mb-3">
          <span>📖</span> Holy Quran Structure
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-text font-display mb-2">
          30 Juz (পারা) of the Quran
        </h1>
        <p className="text-sm sm:text-base text-text-muted" style={{ fontFamily: 'var(--font-bengali-ui)' }}>
          পবিত্র কুরআনের ৩০টি পারার তালিকা — আরবি সূচনাবাক্য, সূরা ও পৃষ্ঠা নম্বর সহ সম্পূর্ণ পাঠ করুন
        </p>
      </header>

      {/* Grid of 30 Juz */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {allJuz.map((juz) => (
          <Link key={juz.number} href={`/quran/juz/${juz.number}`} className="group">
            <Card
              variant="interactive"
              className="p-5 h-full flex flex-col justify-between border-gold-line group-hover:border-gold group-hover:shadow-md transition-all"
            >
              <div>
                <div className="flex items-center justify-between gap-3 mb-2">
                  <span className="w-8 h-8 rounded-full bg-forest/10 dark:bg-gold-veil/40 text-gold-dark font-bold text-sm flex items-center justify-center">
                    {juz.number}
                  </span>
                  <span className="font-arabic text-xl font-bold text-text/90 group-hover:text-gold-dark transition-colors" dir="rtl">
                    {juz.arabicName}
                  </span>
                </div>

                <h2 className="font-semibold text-text text-base group-hover:text-gold-dark transition-colors">
                  {juz.englishName}
                </h2>
                <p className="text-xs text-text-muted mt-0.5" style={{ fontFamily: 'var(--font-bengali-ui)' }}>
                  {juz.banglaName}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-border-subtle flex items-center justify-between text-xs text-text-muted">
                <span>
                  {juz.startSurahName} → {juz.endSurahName}
                </span>
                <span className="font-medium text-gold-dark">
                  Pages {juz.startPage}–{juz.endPage}
                </span>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
