'use client';

import { useEffect, useState } from 'react';
import { PageShell } from '@/components/ui/PageShell';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';

interface Note {
  id: string;
  source: string;
  sourceId: string;
  content: string;
  updatedAt: string;
}

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Will connect to API when auth is wired
    setLoading(false);
  }, []);

  return (
    <PageShell
      eyebrow="Library"
      title="Notes"
      lede="Your study notes attached to verses, hadith, and book passages."
    >
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      ) : notes.length === 0 ? (
        <EmptyState
          title="No notes yet"
          hint="Add notes while reading to see them here."
          action={
            <Button href="/quran/surahs" variant="gold">
              Browse Surahs
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {notes.map(note => (
            <Card key={note.id} className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-accent">
                  {note.source} &mdash; {note.sourceId}
                </span>
                <span className="text-xs text-ink-4">
                  {new Date(note.updatedAt).toLocaleDateString()}
                </span>
              </div>
              <p className="text-sm text-ink-2 leading-relaxed">{note.content}</p>
            </Card>
          ))}
        </div>
      )}
    </PageShell>
  );
}
