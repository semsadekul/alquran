'use client';

import { useEffect, useState } from 'react';
import { PageShell } from '@/components/ui/PageShell';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';

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
    <PageShell
      eyebrow="Library"
      title="Highlights"
      lede="Verses and passages you've highlighted during study."
    >
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      ) : highlights.length === 0 ? (
        <EmptyState
          title="No highlights yet"
          hint="Highlight verses while reading to see them here."
          action={
            <Button href="/quran/surahs" variant="gold">
              Browse Surahs
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {highlights.map(h => (
            <Card key={h.id} className="p-4">
              <div
                className="flex items-center justify-between mb-2"
                style={{ borderLeft: `3px solid ${h.color}`, paddingLeft: 12 }}
              >
                <span className="text-sm font-medium text-accent">
                  {h.source} &mdash; {h.sourceId}
                </span>
              </div>
              {h.text && (
                <p className="text-sm text-ink-3 leading-relaxed line-clamp-2">{h.text}</p>
              )}
            </Card>
          ))}
        </div>
      )}
    </PageShell>
  );
}
