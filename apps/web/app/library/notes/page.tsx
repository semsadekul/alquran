'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { PageShell } from '@/components/ui/PageShell';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { getNotes, removeNote, type Note } from '@/lib/storage/indexeddb';
import { Trash2 } from 'lucide-react';
import { cn } from '@/lib/cn';

const colorStyles: Record<string, string> = {
  yellow: 'bg-yellow-100 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-700',
  green: 'bg-green-100 dark:bg-green-900/20 border-green-300 dark:border-green-700',
  blue: 'bg-blue-100 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700',
  pink: 'bg-pink-100 dark:bg-pink-900/20 border-pink-300 dark:border-pink-700',
};

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getNotes()
      .then(data => setNotes(data.sort((a, b) => b.timestamp - a.timestamp)))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string) => {
    await removeNote(id);
    setNotes(prev => prev.filter(n => n.id !== id));
  };

  return (
    <PageShell
      eyebrow="Library"
      title="Notes"
      lede="Your study notes attached to Quran verses."
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
            <Card key={note.id} className={cn('p-4 border-l-4', colorStyles[note.color] || colorStyles.yellow)}>
              <div className="flex items-center justify-between mb-2">
                <Link
                  href={`/quran/surahs/${note.surah}#verse-${note.ayah}`}
                  className="text-sm font-medium text-accent hover:underline"
                >
                  Surah {note.surah}:{note.ayah}
                </Link>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-ink-4">
                    {new Date(note.timestamp).toLocaleDateString()}
                  </span>
                  <button
                    onClick={() => handleDelete(note.id)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-ink-3 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    aria-label="Delete note"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <p className="text-sm text-ink-2 leading-relaxed whitespace-pre-wrap">{note.text}</p>
            </Card>
          ))}
        </div>
      )}
    </PageShell>
  );
}
