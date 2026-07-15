import Link from 'next/link';
import { HADITH_COLLECTIONS } from '@alquran/hadith';

export const metadata = {
  title: 'Hadith Collections — Al Quran Ecosystem',
  description: 'Browse the major authenticated hadith collection catalog while full reading data is being connected.'
};

export default function HadithPage() {
  return (
    <div className="page-container">
      <section className="page-hero">
        <p className="eyebrow">Hadith</p>
        <h1>Hadith Collection Catalog</h1>
        <p className="lede">
          Browse the major authenticated hadith collections. Full book, chapter, and entry-level reading is being connected after Quran audio and Hifz parity restoration.
        </p>
      </section>

      <div className="settings-note" style={{ marginBottom: 24 }}>
        The collection directory is live, but full hadith reading content is still being wired from the backend data pipeline.
      </div>

      <div className="card-grid">
        {HADITH_COLLECTIONS.map(collection => (
          <Link
            className="card card-link"
            href={`/hadith/collections/${collection.slug}`}
            key={collection.id}
          >
            <div className="card-badge-row">
              <span className="card-badge">{collection.totalHadith?.toLocaleString()} hadith</span>
              <span className="card-badge badge-coming">Catalog</span>
            </div>
            <h2>{collection.nameEnglish}</h2>
            <div className="card-arabic">{collection.nameArabic}</div>
            {collection.nameBangla && <div className="card-bangla">{collection.nameBangla}</div>}
            <p>{collection.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
