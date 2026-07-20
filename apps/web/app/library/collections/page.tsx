'use client';

import { useEffect, useState } from 'react';
import { PageShell } from '@/components/ui/PageShell';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';

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
    <PageShell
      eyebrow="Library"
      title="Collections"
      lede="Organize verses, hadith, and passages into study collections."
    >
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      ) : collections.length === 0 ? (
        <EmptyState
          title="No collections yet"
          hint="Create a collection to organize your study materials."
          action={
            <Button href="/quran/surahs" variant="gold">
              Browse Surahs
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {collections.map(c => (
            <Card key={c.id} className="flex flex-col">
              <h2 className="text-lg font-semibold text-ink mb-1">{c.name}</h2>
              {c.description && (
                <p className="text-sm text-ink-3 leading-relaxed mb-3">{c.description}</p>
              )}
              <div className="mt-auto flex items-center gap-2 pt-3">
                <Badge tone="neutral">{c.itemCount} items</Badge>
                <Badge tone={c.isPublic ? 'green' : 'neutral'}>
                  {c.isPublic ? 'Public' : 'Private'}
                </Badge>
              </div>
            </Card>
          ))}
        </div>
      )}
    </PageShell>
  );
}
