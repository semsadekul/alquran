'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

interface VerseData {
  number: number;
  surah: number;
  surahName: string;
  numberOfAyahs: number;
  ayah: number;
  arabic: string;
  bangla: string;
  english: string;
  transliteration: string;
  banglaTransliteration?: string;
}

function CompareContent() {
  const searchParams = useSearchParams();
  const surahNum = parseInt(searchParams.get('surah') || '1', 10);
  const ayahNum = parseInt(searchParams.get('ayah') || '1', 10);

  const [verse, setVerse] = useState<VerseData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch('/search-index.json')
      .then(res => res.json())
      .then(allVerses => {
        const match = allVerses.find((v: VerseData) => v.surah === surahNum && v.ayah === ayahNum);
        setVerse(match || null);
      })
      .catch(() => setVerse(null))
      .finally(() => setLoading(false));
  }, [surahNum, ayahNum]);

  if (loading) {
    return (
      <div className="page-container">
        <div className="empty-state">
          <p>Loading verse comparison...</p>
        </div>
      </div>
    );
  }

  if (!verse) {
    return (
      <div className="page-container">
        <div className="empty-state">
          <p>Select a verse to compare translations.</p>
          <Link className="reader-nav-btn" href="/quran/surahs">Browse Surahs</Link>
        </div>
      </div>
    );
  }

  const translations = [
    { label: 'Bangla (Muhiuddin Khan)', text: verse.bangla, lang: 'bn' },
    { label: 'English (Saheeh International)', text: verse.english, lang: 'en' },
    { label: 'Transliteration', text: verse.transliteration, lang: 'en' }
  ];

  if (verse.banglaTransliteration) {
    translations.push({ label: 'Bangla Pronunciation', text: verse.banglaTransliteration, lang: 'bn' });
  }

  return (
    <div className="page-container">
      <Link className="back-link" href={`/quran/surahs/${surahNum}`}>← {verse.surahName}</Link>

      <section className="page-hero">
        <p className="eyebrow">Translation Comparison</p>
        <h1>{verse.surahName} — {surahNum}:{ayahNum}</h1>
        <p className="lede">Translation Comparison</p>
      </section>

      <div className="compare-arabic-block">
        <div className="verse-arabic">{verse.arabic}</div>
      </div>

      <div className="compare-grid">
        {translations.map(t => (
          <div className="compare-card" key={t.label}>
            <div className="compare-label">{t.label}</div>
            <div className={`compare-text ${t.lang === 'bn' ? 'bengali' : ''}`}>
              {t.text}
            </div>
          </div>
        ))}
      </div>

      <nav className="reader-nav" style={{ marginTop: 32 }}>
        {ayahNum > 1 ? (
          <Link className="reader-nav-btn" href={`/quran/compare?surah=${surahNum}&ayah=${ayahNum - 1}`}>
            ← Previous
          </Link>
        ) : <span />}
        {ayahNum < verse.numberOfAyahs ? (
          <Link className="reader-nav-btn" href={`/quran/compare?surah=${surahNum}&ayah=${ayahNum + 1}`}>
            Next →
          </Link>
        ) : <span />}
      </nav>
    </div>
  );
}

export default function ComparePage() {
  return (
    <Suspense fallback={<div className="page-container"><div className="empty-state"><p>Loading...</p></div></div>}>
      <CompareContent />
    </Suspense>
  );
}
