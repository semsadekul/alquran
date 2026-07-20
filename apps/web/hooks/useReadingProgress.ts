import { useEffect } from 'react';
import { ReadingPosition } from '@alquran/types';

export function useReadingProgress(surahNumber: number, surahName: string, numberOfAyahs?: number) {
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    const handleScroll = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        // Find the topmost visible verse by ID pattern verse-{n}
        const verseEls = document.querySelectorAll('[id^="verse-"]');
        let bestEl: HTMLElement | undefined;
        let minTop = Infinity;

        verseEls.forEach((node) => {
          const el = node as HTMLElement;
          const rect = el.getBoundingClientRect();
          if (rect.top >= 0 && rect.top < window.innerHeight && rect.top < minTop) {
            minTop = rect.top;
            bestEl = el;
          }
        });

        if (bestEl) {
          const ayahNumber = parseInt(bestEl.id.replace('verse-', ''), 10) || 1;
          const arabicEl = bestEl.querySelector('[dir="rtl"]');
          const arabicPreview = arabicEl?.textContent?.slice(0, 80) ?? '';

          const position: ReadingPosition = {
            surah: surahNumber,
            ayah: ayahNumber,
            surahName,
            timestamp: Date.now(),
            scrollY: window.scrollY,
            arabicPreview,
            numberOfAyahs,
          };

          localStorage.setItem('alquran_last_read', JSON.stringify(position));
        }
      }, 500);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timeoutId);
    };
  }, [surahNumber, surahName, numberOfAyahs]);
}
