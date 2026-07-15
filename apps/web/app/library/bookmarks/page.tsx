'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getBookmarks, type LegacyBookmark } from '@/lib/storage/indexeddb';

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState<LegacyBookmark[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getBookmarks()
      .then(data => setBookmarks(data.sort((a, b) => b.timestamp - a.timestamp)))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-container">
      <section className="page-hero">
        <p className="eyebrow">Library</p>
        <h1>Your Bookmarks</h1>
        <p className="lede">Verses you saved for recitation, study, or memorization.</p>
      </section>

      {loading ? (
        <div className="empty-state">Loading bookmarks…</div>
      ) : bookmarks.length === 0 ? (
        <div className="empty-state">
          <p>No bookmarks saved yet. Add bookmarks while reading the Quran to see them here.</p>
          <Link className="reader-nav-btn" href="/quran/surahs">Browse Surahs</Link>
        </div>
      ) : (
        <div className="bookmarks-list">
          {bookmarks.map(bm => (
            <Link
              className="bookmark-card"
              href={`/quran/surahs/${bm.surah}`}
              key={bm.surah_ayah}
            >
              <div className="bookmark-ref">{bm.surahName} — {bm.surah}:{bm.ayah}</div>
              <p className="bookmark-preview">{bm.textPreview}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
