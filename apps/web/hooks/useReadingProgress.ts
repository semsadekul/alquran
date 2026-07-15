import { useEffect } from 'react';
import { ReadingPosition } from '@alquran/types';

export function useReadingProgress(surahNumber: number, surahName: string) {
  useEffect(() => {
    let timeoutId: number;

    const handleScroll = () => {
      // Debounce saving
      window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        // Find the topmost visible verse
        const verseCards = document.querySelectorAll('.verse-card');
        let topmostVerse: Element | null = null;
        let minTop = Infinity;

        verseCards.forEach(card => {
          const rect = card.getBoundingClientRect();
          if (rect.top >= 0 && rect.top < window.innerHeight && rect.top < minTop) {
            minTop = rect.top;
            topmostVerse = card;
          }
        });

        if (topmostVerse) {
          const ayahNumber = parseInt((topmostVerse as Element).getAttribute('data-ayah') || '1', 10);
          
          const position: ReadingPosition = {
            surah: surahNumber,
            ayah: ayahNumber,
            surahName: surahName,
            timestamp: Date.now(),
            scrollY: window.scrollY
          };
          
          localStorage.setItem('alquran_last_read', JSON.stringify(position));
        }
      }, 500);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.clearTimeout(timeoutId);
    };
  }, [surahNumber, surahName]);
}
