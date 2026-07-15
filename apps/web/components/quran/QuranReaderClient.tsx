'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { AudioDock } from './AudioDock';
import type { ReaderAyah, ReaderSurah } from './types';
import { useAudioPlayback } from './useAudioPlayback';
import { useReadingProgress } from '../../hooks/useReadingProgress';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import { VerseActions } from './VerseActions';
import { ReadingSettings } from './ReadingSettings';
import { ReaderPreferences } from '@alquran/types';
import { useLocalStorage } from '../../hooks/useLocalStorage';

const defaultPrefs: ReaderPreferences = {
  theme: 'dark',
  arabicFontSize: 38,
  banglaFontSize: 16,
  englishFontSize: 15,
  showArabic: true,
  showBangla: true,
  showEnglish: true,
  showTransliteration: false,
  showBanglaTransliteration: false,
  lineSpacing: 'normal',
  readingMode: 'study'
};

export function QuranReaderClient({
  surah,
  verses,
  showBismillah
}: {
  surah: ReaderSurah;
  verses: ReaderAyah[];
  showBismillah: boolean;
}) {
  const playback = useAudioPlayback(surah);
  const activeAyahKey = playback.state.activeAyahKey;
  const activeRef = useRef<HTMLDivElement | null>(null);

  // Use custom hooks
  useReadingProgress(surah.number, surah.englishName);
  
  const [preferences, setPreferences] = useLocalStorage<ReaderPreferences>('alquran_preferences', defaultPrefs);

  useKeyboardShortcuts({
    onNextVerse: () => {
      // Logic for next verse can be built into playback or scrolled manually
      if (playback.state.isPlaying && playback.currentAyah) {
        const nextAyahNum = playback.currentAyah.ayah + 1;
        if (nextAyahNum <= surah.numberOfAyahs) {
          const nextVerse = verses.find(v => v.ayah === nextAyahNum);
          if (nextVerse) playback.playAyah(nextVerse, verses);
        }
      } else {
        // Just scroll down a bit
        window.scrollBy({ top: 100, behavior: 'smooth' });
      }
    },
    onPrevVerse: () => {
      window.scrollBy({ top: -100, behavior: 'smooth' });
    },
    onTogglePlay: () => {
      if (playback.state.isPlaying) playback.togglePlayPause();
      else playback.playCurrentSurahFromStart(verses); // simplified
    }
  });

  useEffect(() => {
    if (activeRef.current) {
      activeRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [activeAyahKey]);

  return (
    <div 
      className="reader-page"
      style={{
        '--arabic-size-multiplier': preferences.arabicFontSize / 38,
        '--translation-size-multiplier': preferences.banglaFontSize / 16,
      } as React.CSSProperties}
    >
      <header className="reader-header">
        <div className="header-nav-row">
          <Link className="back-link" href="/quran/surahs">← সূরা তালিকা</Link>
          <ReadingSettings 
            preferences={preferences} 
            onChange={(newPrefs) => setPreferences({ ...preferences, ...newPrefs })} 
          />
        </div>
        
        <div className="surah-header-card">
          <div className="surah-header-number">{surah.number}</div>
          <div className="surah-header-name-ar">{surah.name}</div>
          <h1 className="surah-header-name-en">{surah.englishName}</h1>
          <p className="surah-header-translation">{surah.englishNameTranslation}</p>
          <div className="surah-header-meta">
            <span>{surah.revelationType}</span>
            <span>{surah.numberOfAyahs} Ayahs</span>
          </div>
          <div className="reader-header-actions">
            <button className="reader-action-btn" onClick={() => playback.playCurrentSurahFromStart(verses)}>
              ▶ Play Surah
            </button>
            <Link className="reader-action-btn secondary" href="/quran/hifz">
              Hifz Mode
            </Link>
          </div>
          {playback.state.errorMessage && (
            <p className="reader-audio-error">{playback.state.errorMessage}</p>
          )}
        </div>
      </header>

      {showBismillah && (
        <div className="bismillah-block">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</div>
      )}

      <div className="verses-container reader-content">
        {verses.map(verse => {
          const key = `${verse.surah}-${verse.ayah}`;
          const isActive = activeAyahKey === key;
          return (
            <article
              className={`verse-card ${isActive ? 'verse-card-active' : ''}`}
              key={verse.number}
              data-ayah={verse.ayah}
              ref={isActive ? activeRef : null}
            >
              <div className="verse-top-controls-web">
                <div className="verse-badge">{verse.surah}:{verse.ayah}</div>
                <VerseActions 
                  verse={verse} 
                  onPlay={() => playback.playAyah(verse, verses)} 
                />
              </div>

              {preferences.showArabic && (
                <div className="verse-arabic">{verse.arabic}</div>
              )}
              
              {preferences.showBangla && (
                <div className="verse-translation">
                  <span className="translation-label">Bangla</span>
                  <p className="verse-bangla">{verse.bangla}</p>
                </div>
              )}
              
              {preferences.showEnglish && (
                <div className="verse-translation">
                  <span className="translation-label">English</span>
                  <p className="verse-english">{verse.english}</p>
                </div>
              )}
              
              {preferences.showTransliteration && (
                <div className="verse-transliteration">
                  <span className="translation-label">Transliteration</span>
                  <p>{verse.transliteration}</p>
                </div>
              )}
              
              {preferences.showBanglaTransliteration && verse.banglaTransliteration && (
                <div className="verse-transliteration">
                  <span className="translation-label">Bangla Pronunciation</span>
                  <p>{verse.banglaTransliteration}</p>
                </div>
              )}
            </article>
          );
        })}
      </div>

      <nav className="reader-nav">
        {surah.number > 1 ? (
          <Link className="reader-nav-btn" href={`/quran/surahs/${surah.number - 1}`}>
            ← Previous Surah
          </Link>
        ) : <span />}
        {surah.number < 114 ? (
          <Link className="reader-nav-btn" href={`/quran/surahs/${surah.number + 1}`}>
            Next Surah →
          </Link>
        ) : <span />}
      </nav>

      <AudioDock playback={playback} currentSurah={surah} />

      <style jsx>{`
        .header-nav-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }
        .reader-page {
          max-width: 900px;
          margin: 0 auto;
          padding: 24px;
        }
        .surah-header-card {
          background: linear-gradient(to bottom right, var(--surface), var(--surface-muted));
          border: 1px solid var(--border);
          border-radius: var(--radius-xl);
          padding: 40px 24px;
          text-align: center;
          margin-bottom: 40px;
          position: relative;
          overflow: hidden;
        }
        .surah-header-number {
          position: absolute;
          top: 24px;
          left: 24px;
          width: 48px;
          height: 48px;
          background: var(--surface-elevated);
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          color: var(--text-2);
          transform: rotate(45deg);
        }
        .surah-header-number::after {
          content: '${surah.number}';
          position: absolute;
          transform: rotate(-45deg);
        }
        .surah-header-name-ar {
          font-family: var(--font-arabic);
          font-size: 3rem;
          color: var(--arabic-text);
          margin-bottom: 16px;
        }
        .surah-header-name-en {
          font-size: 1.5rem;
          margin-bottom: 4px;
        }
        .surah-header-translation {
          color: var(--text-3);
          font-size: 0.95rem;
          margin-bottom: 16px;
        }
        .surah-header-meta {
          display: flex;
          justify-content: center;
          gap: 16px;
          color: var(--text-4);
          font-size: 0.85rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-bottom: 32px;
        }
        .reader-header-actions {
          display: flex;
          justify-content: center;
          gap: 16px;
        }
        .reader-action-btn {
          background: var(--accent);
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: var(--radius-full);
          font-weight: 600;
          cursor: pointer;
          transition: background var(--duration-fast);
        }
        .reader-action-btn:hover {
          background: var(--accent-hover);
        }
        .reader-action-btn.secondary {
          background: var(--surface-muted);
          color: var(--text-1);
          border: 1px solid var(--border);
        }
        .bismillah-block {
          font-family: var(--font-arabic);
          font-size: 2.5rem;
          text-align: center;
          color: var(--arabic-text);
          margin-bottom: 48px;
        }
        .verse-card {
          padding: 32px 0;
          border-bottom: 1px solid var(--border-subtle);
          transition: background-color var(--duration-slow), border-color var(--duration-slow);
        }
        .verse-card:last-child {
          border-bottom: none;
        }
        .verse-top-controls-web {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }
        .verse-badge {
          background: var(--surface-muted);
          color: var(--text-2);
          padding: 4px 12px;
          border-radius: var(--radius-full);
          font-weight: 600;
          font-size: 0.85rem;
        }
        .verse-arabic {
          margin-bottom: 32px;
        }
        .verse-translation {
          margin-bottom: 24px;
        }
        .translation-label {
          display: block;
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--accent);
          margin-bottom: 8px;
          font-weight: 700;
        }
        .verse-transliteration p {
          font-style: italic;
          color: var(--text-3);
        }
        .reader-nav {
          display: flex;
          justify-content: space-between;
          margin-top: 64px;
          padding-top: 32px;
          border-top: 1px solid var(--border);
        }
        .reader-nav-btn {
          color: var(--text-2);
          font-weight: 500;
          transition: color var(--duration-fast);
        }
        .reader-nav-btn:hover {
          color: var(--accent);
        }
      `}</style>
    </div>
  );
}
