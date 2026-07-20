'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getBookmarks, type LegacyBookmark } from '@/lib/storage/indexeddb';
import { PageShell } from '@/components/ui/PageShell';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';

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
    <PageShell
      eyebrow="Library"
      title="Your Bookmarks"
      lede="Verses you saved for recitation, study, or memorization."
    >
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      ) : bookmarks.length === 0 ? (
        <EmptyState
          title="No bookmarks saved yet"
          hint="Add bookmarks while reading the Quran to see them here."
          action={
            <Button href="/quran/surahs" variant="gold">
              Browse Surahs
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {bookmarks.map(bm => (
            <Link
              href={`/quran/surahs/${bm.surah}`}
              key={bm.surah_ayah}
              className="block"
            >
              <Card variant="interactive" className="p-4">
                <p className="text-sm font-medium text-accent mb-1">
                  {bm.surahName} &mdash; {bm.surah}:{bm.ayah}
                </p>
                <p className="text-sm text-ink-3 leading-relaxed line-clamp-2">
                  {bm.textPreview}
                </p>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </PageShell>
  );
}
