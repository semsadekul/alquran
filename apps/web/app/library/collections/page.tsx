'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Collection {
  id: string;
  name: string;
  description?: string;
  isPublic: boolean;
  itemCount: number;
  createdAt: string;
}

export default function CollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Will connect to API when auth is wired
    setLoading(false);
  }, []);

  return (
    <div className="page-container">
      <section className="page-hero">
        <p className="eyebrow">Library</p>
        <h1>Collections</h1>
        <p className="lede">Organize verses, hadith, and passages into study collections.</p>
      </section>

      {loading ? (
        <div className="empty-state">Loading collections…</div>
      ) : collections.length === 0 ? (
        <div className="empty-state">
          <p>No collections yet. Create a collection to organize your study materials.</p>
          <Link className="reader-nav-btn" href="/quran/surahs">Browse Surahs</Link>
        </div>
      ) : (
        <div className="card-grid">
          {collections.map(c => (
            <div className="card" key={c.id}>
              <h2>{c.name}</h2>
              {c.description && <p>{c.description}</p>}
              <div className="meta-row" style={{ marginTop: 12 }}>
                <span>{c.itemCount} items</span>
                <span>{c.isPublic ? 'Public' : 'Private'}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
