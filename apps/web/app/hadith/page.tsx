import Link from 'next/link';
import { HADITH_COLLECTIONS } from '@alquran/hadith';
import { PageShell } from '@/components/ui/PageShell';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export const metadata = {
  title: 'Hadith Collections — Al Quran Ecosystem',
  description: 'Browse the major authenticated hadith collection catalog while full reading data is being connected.'
};

export default function HadithPage() {
  return (
    <PageShell
      eyebrow="Hadith"
      title="Hadith Collection Catalog"
      lede="Browse the major authenticated hadith collections. Full book, chapter, and entry-level reading is being connected after Quran audio and Hifz parity restoration."
    >
      <div className="bg-accent-subtle rounded-xl p-4 mb-6">
        <p className="text-sm text-ink-2">
          The collection directory is live, but full hadith reading content is still being wired from the backend data pipeline.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {HADITH_COLLECTIONS.map(collection => (
          <Link
            href={`/hadith/collections/${collection.slug}`}
            key={collection.id}
            className="block"
          >
            <Card variant="interactive" className="h-full">
              <div className="flex flex-wrap gap-2 mb-3">
                <Badge tone="gold">{collection.totalHadith?.toLocaleString()} hadith</Badge>
                <Badge tone="neutral">Catalog</Badge>
              </div>
              <h2 className="text-lg font-semibold text-ink mb-1">{collection.nameEnglish}</h2>
              <p dir="rtl" lang="ar" className="font-arabic text-sm text-ink-2 mb-1">
                {collection.nameArabic}
              </p>
              {collection.nameBangla && (
                <p className="text-sm text-ink-3 mb-2" style={{ fontFamily: 'var(--font-bengali-ui)' }}>
                  {collection.nameBangla}
                </p>
              )}
              <p className="text-sm text-ink-3 leading-relaxed">{collection.description}</p>
            </Card>
          </Link>
        ))}
      </div>
    </PageShell>
  );
}
