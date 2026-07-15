'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Calendar } from 'lucide-react';

export function DailyVerse() {
  const [verseData, setVerseData] = useState<{surah: number, ayah: number} | null>(null);

  useEffect(() => {
    // A deterministic algorithm seeded by date to pick a verse.
    // For demo purposes, we'll select a fixed known beautiful verse, 
    // but in reality this would map daysSinceEpoch to a verse mapping array.
    const date = new Date();
    const daysSinceEpoch = Math.floor(date.getTime() / 86400000);
    
    // Fallback static verse if no local database mapping is present in this component
    // Example: Surah Taha (20), Ayah 114: "My Lord, increase me in knowledge."
    setVerseData({
      surah: 20,
      ayah: 114
    });
  }, []);

  if (!verseData) return null;

  return (
    <div className="daily-verse-card">
      <div className="dv-header">
        <Calendar size={18} className="dv-icon" />
        <span className="dv-label">আজকের আয়াত</span>
      </div>
      <div className="dv-content">
        <p className="dv-arabic">وَقُل رَّبِّ زِدْنِي عِلْمًا</p>
        <p className="dv-bangla">এবং বলুন, "হে আমার পালনকর্তা, আমার জ্ঞান বৃদ্ধি করুন।"</p>
        <Link href={`/quran/surahs/${verseData.surah}#ayah-${verseData.ayah}`} className="dv-link">
          সূরা ত্বোয়া-হা, আয়াত ১১৪
        </Link>
      </div>
      <style jsx>{`
        .daily-verse-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-left: 4px solid var(--warm);
          border-radius: var(--radius-lg);
          padding: 24px;
          margin-bottom: 32px;
        }
        .dv-header {
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--text-3);
          margin-bottom: 24px;
        }
        .dv-label {
          font-family: var(--font-bengali-ui);
          font-weight: 600;
          font-size: 0.95rem;
        }
        .dv-arabic {
          font-family: var(--font-arabic);
          font-size: 2rem;
          color: var(--arabic-text);
          direction: rtl;
          text-align: right;
          margin-bottom: 16px;
          line-height: 2;
        }
        .dv-bangla {
          font-family: var(--font-bengali);
          font-size: 1.1rem;
          color: var(--text-2);
          margin-bottom: 24px;
          line-height: 1.6;
        }
        .dv-link {
          display: inline-block;
          font-family: var(--font-bengali-ui);
          color: var(--accent);
          font-weight: 600;
          font-size: 0.95rem;
        }
        .dv-link:hover {
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
}
