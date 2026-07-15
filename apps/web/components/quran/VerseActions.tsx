'use client';

import { Play, Bookmark, Copy, Share2, MoreHorizontal } from 'lucide-react';
import { useState } from 'react';
import { ReaderAyah } from './types';

interface VerseActionsProps {
  verse: ReaderAyah;
  onPlay: () => void;
}

export function VerseActions({ verse, onPlay }: VerseActionsProps) {
  const [isBookmarked, setIsBookmarked] = useState(false);

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    // TODO: integrate with useLocalStorage to save bookmark
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(verse.arabic + '\n\n' + verse.bangla);
    // Optional: show a toast
  };

  return (
    <div className="verse-actions-web">
      <button 
        className="verse-action-btn-web" 
        onClick={onPlay}
        aria-label="Play verse"
      >
        <Play size={18} />
        <span>Play</span>
      </button>
      
      <button 
        className={`verse-action-btn-web icon-only ${isBookmarked ? 'active' : ''}`} 
        onClick={handleBookmark}
        aria-label="Bookmark"
      >
        <Bookmark size={18} fill={isBookmarked ? 'currentColor' : 'none'} />
      </button>

      <button 
        className="verse-action-btn-web icon-only" 
        onClick={handleCopy}
        aria-label="Copy verse"
      >
        <Copy size={18} />
      </button>
      
      <style jsx>{`
        .verse-actions-web {
          display: flex;
          gap: 8px;
          align-items: center;
        }
        .verse-action-btn-web {
          display: flex;
          align-items: center;
          gap: 6px;
          background: var(--surface-muted);
          border: 1px solid var(--border);
          color: var(--text-2);
          padding: 6px 12px;
          border-radius: var(--radius-full);
          font-size: 0.85rem;
          font-weight: 500;
          cursor: pointer;
          transition: all var(--duration-fast);
        }
        .verse-action-btn-web.icon-only {
          padding: 6px 8px;
        }
        .verse-action-btn-web:hover,
        .verse-action-btn-web.active {
          background: var(--surface);
          border-color: var(--accent);
          color: var(--accent);
        }
      `}</style>
    </div>
  );
}
