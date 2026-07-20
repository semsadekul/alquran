import { notFound } from 'next/navigation';
import { HADITH_COLLECTIONS, getCollectionBySlug } from '@alquran/hadith';
import { PageShell } from '@/components/ui/PageShell';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export function generateStaticParams() {
  return HADITH_COLLECTIONS.map(c => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const collection = getCollectionBySlug(slug);
  if (!collection) return { title: 'Not Found' };
  return {
    title: `${collection.nameEnglish} — Hadith Collection`,
    description: `${collection.nameEnglish} collection overview while full entry-level reading is being connected.`
  };
}

export default async function CollectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const collection = getCollectionBySlug(slug);
  if (!collection) notFound();

  return (
    <PageShell
      eyebrow="Hadith Collection"
      title={collection.nameEnglish}
    >
      <Button href="/hadith" variant="ghost" className="mb-6">
        &larr; All Collections
      </Button>

      <div className="mb-6">
        <p dir="rtl" lang="ar" className="font-arabic text-lg text-ink-2 mb-2">
          {collection.nameArabic}
        </p>
        {collection.nameBangla && (
          <p className="text-ink-3 mb-2" style={{ fontFamily: 'var(--font-bengali-ui)' }}>
            {collection.nameBangla}
          </p>
        )}
        <p className="text-ink-2 leading-relaxed mb-3">{collection.description}</p>
        <div className="flex gap-3">
          <Badge tone="gold">{collection.totalHadith?.toLocaleString()} hadith</Badge>
          <Badge tone="neutral">Catalog preview</Badge>
        </div>
      </div>

      <Card className="p-5 md:p-6">
        <h2 className="text-lg font-semibold text-ink mb-3">Books and Chapters</h2>
        <p className="text-sm text-ink-2 leading-relaxed mb-3">
          This collection page currently exposes the catalog and metadata only. Full books, chapters, and hadith entry reading will appear here after the ingestion and API wiring step is completed.
        </p>
        <p className="text-xs text-ink-4">
          Current priority is restoring Quran audio playback and Hifz parity before expanding Hadith depth.
        </p>
      </Card>
    </PageShell>
  );
}
