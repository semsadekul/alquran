'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { PageShell } from '@/components/ui/PageShell';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { getHighlights, removeHighlight, type Highlight } from '@/lib/storage/indexeddb';
import { Trash2 } from 'lucide-react';
import { cn } from '@/lib/cn';

const colorStyles: Record<string, string> = {
  yellow: 'border-l-yellow-400 bg-yellow-50 dark:bg-yellow-900/10',
  green: 'border-l-green-400 bg-green-50 dark:bg-green-900/10',
  blue: 'border-l-blue-400 bg-blue-50 dark:bg-blue-900/10',
  pink: 'border-l-pink-400 bg-pink-50 dark:bg-pink-900/10',
};

export default function HighlightsPage() {
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getHighlights()
      .then(data => setHighlights(data.sort((a, b) => b.timestamp - a.timestamp)))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string) => {
    await removeHighlight(id);
    setHighlights(prev => prev.filter(h => h.id !== id));
  };

  return (
    <PageShell
      eyebrow="Library"
      title="Highlights"
      lede="Verses you've highlighted during study."
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
            <Card key={h.id} className={cn('p-4 border-l-4', colorStyles[h.color] || colorStyles.yellow)}>
              <div className="flex items-center justify-between mb-2">
                <Link
                  href={`/quran/surahs/${h.surah}#verse-${h.ayah}`}
                  className="text-sm font-medium text-accent hover:underline"
                >
                  Surah {h.surah}:{h.ayah}
                </Link>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-ink-4">
                    {new Date(h.timestamp).toLocaleDateString()}
                  </span>
                  <button
                    onClick={() => handleDelete(h.id)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-ink-3 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    aria-label="Delete highlight"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <p className="text-sm text-ink-3 leading-relaxed">
                Verse highlighted in your reading session.
              </p>
            </Card>
          ))}
        </div>
      )}
    </PageShell>
  );
}
