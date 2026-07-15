'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BookOpen } from 'lucide-react';
import { ReadingPosition } from '@alquran/types';

export function ContinueReading() {
  const [position, setPosition] = useState<ReadingPosition | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('alquran_last_read');
    if (saved) {
      try {
        setPosition(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse last read position');
      }
    }
  }, []);

  if (!position) {
    return (
      <div className="continue-reading empty">
        <p>No reading history yet.</p>
        <Link href="/quran/surahs/1" className="start-btn">Start Reading Al-Fatiha</Link>
        <style jsx>{`
          .empty {
            background: var(--surface);
            border: 1px dashed var(--border);
            border-radius: var(--radius-lg);
            padding: 32px;
            text-align: center;
            color: var(--text-3);
          }
          .start-btn {
            display: inline-block;
            margin-top: 16px;
            color: var(--accent);
            font-weight: 600;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="continue-reading">
      <div className="cr-header">
        <BookOpen size={20} className="cr-icon" />
        <span className="cr-label">Continue Reading</span>
      </div>
      
      <div className="cr-content">
        <div>
          <h3 className="cr-surah">{position.surahName}</h3>
          <p className="cr-ayah">Ayah {position.ayah}</p>
        </div>
        <Link href={`/quran/surahs/${position.surah}#ayah-${position.ayah}`} className="resume-btn">
          Resume
        </Link>
      </div>

      <style jsx>{`
        .continue-reading {
          background: linear-gradient(135deg, var(--surface) 0%, var(--surface-muted) 100%);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 24px;
          margin-bottom: 24px;
        }
        .cr-header {
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--text-3);
          margin-bottom: 16px;
        }
        .cr-label {
          font-size: 0.875rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .cr-content {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
        }
        .cr-surah {
          font-size: 1.5rem;
          color: var(--text-1);
          margin-bottom: 4px;
        }
        .cr-ayah {
          color: var(--text-2);
          font-size: 0.95rem;
        }
        .resume-btn {
          background: var(--accent);
          color: white;
          padding: 8px 24px;
          border-radius: var(--radius-full);
          font-weight: 600;
          transition: background-color var(--duration-fast);
        }
        .resume-btn:hover {
          background: var(--accent-hover);
        }
      `}</style>
    </div>
  );
}
