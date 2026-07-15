import Link from 'next/link';
import { notFound } from 'next/navigation';
import { HADITH_COLLECTIONS, getCollectionBySlug } from '@alquran/hadith';

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
    <div className="page-container">
      <Link className="back-link" href="/hadith">← All Collections</Link>

      <section className="page-hero">
        <p className="eyebrow">Hadith Collection</p>
        <h1>{collection.nameEnglish}</h1>
        <div className="surah-header-name-ar">{collection.nameArabic}</div>
        {collection.nameBangla && <p className="lede">{collection.nameBangla}</p>}
        <p className="lede">{collection.description}</p>
        <div className="meta-row">
          <span>{collection.totalHadith?.toLocaleString()} hadith</span>
          <span>Catalog preview</span>
        </div>
      </section>

      <div className="coming-soon-card">
        <h2>Books and Chapters</h2>
        <p>
          This collection page currently exposes the catalog and metadata only. Full books, chapters, and hadith entry reading will appear here after the ingestion and API wiring step is completed.
        </p>
        <p className="coming-soon-note">
          Current priority is restoring Quran audio playback and Hifz parity before expanding Hadith depth.
        </p>
      </div>
    </div>
  );
}
