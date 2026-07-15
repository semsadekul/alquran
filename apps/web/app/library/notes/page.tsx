'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

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
    <div className="page-container">
      <section className="page-hero">
        <p className="eyebrow">Library</p>
        <h1>Notes</h1>
        <p className="lede">Your study notes attached to verses, hadith, and book passages.</p>
      </section>

      {loading ? (
        <div className="empty-state">Loading notes…</div>
      ) : notes.length === 0 ? (
        <div className="empty-state">
          <p>No notes yet. Add notes while reading to see them here.</p>
          <Link className="reader-nav-btn" href="/quran/surahs">Browse Surahs</Link>
        </div>
      ) : (
        <div className="notes-list">
          {notes.map(note => (
            <div className="note-card" key={note.id}>
              <div className="note-header">
                <span className="note-source">{note.source} — {note.sourceId}</span>
                <span className="note-date">{new Date(note.updatedAt).toLocaleDateString()}</span>
              </div>
              <p className="note-content">{note.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
