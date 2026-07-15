'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Highlight {
  id: string;
  source: string;
  sourceId: string;
  color: string;
  text?: string;
  createdAt: string;
}

export default function HighlightsPage() {
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Will connect to API when auth is wired
    setLoading(false);
  }, []);

  return (
    <div className="page-container">
      <section className="page-hero">
        <p className="eyebrow">Library</p>
        <h1>Highlights</h1>
        <p className="lede">Verses and passages you&apos;ve highlighted during study.</p>
      </section>

      {loading ? (
        <div className="empty-state">Loading highlights…</div>
      ) : highlights.length === 0 ? (
        <div className="empty-state">
          <p>No highlights yet. Highlight verses while reading to see them here.</p>
          <Link className="reader-nav-btn" href="/quran/surahs">Browse Surahs</Link>
        </div>
      ) : (
        <div className="bookmarks-list">
          {highlights.map(h => (
            <div className="bookmark-card" key={h.id}>
              <div className="bookmark-ref" style={{ borderLeftColor: h.color }}>
                {h.source} — {h.sourceId}
              </div>
              {h.text && <p className="bookmark-preview">{h.text}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
