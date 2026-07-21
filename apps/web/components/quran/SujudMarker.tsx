'use client';

import { cn } from '@/lib/cn';

/**
 * The 15 verses of prostration (Sajdah) in the Quran.
 * When reciting or reading these verses, it is recommended to prostrate.
 */
export const SUJUD_AYAHS = new Set([
  '7-206',   // Al-A'raf
  '13-15',   // Ar-Ra'd
  '16-50',   // An-Nahl
  '17-109',  // Al-Isra
  '19-58',   // Maryam
  '22-18',   // Al-Hajj
  '22-77',   // Al-Hajj
  '25-60',   // Al-Furqan
  '27-26',   // An-Naml
  '32-15',   // As-Sajdah
  '38-24',   // Sad
  '41-38',   // Fussilat
  '53-62',   // An-Najm
  '84-21',   // Al-Inshiqaq
  '96-19',   // Al-Alaq
]);

interface SujudMarkerProps {
  surah: number;
  ayah: number;
  onClick?: () => void;
  className?: string;
}

export function SujudMarker({ surah, ayah, onClick, className }: SujudMarkerProps) {
  const key = `${surah}-${ayah}`;
  if (!SUJUD_AYAHS.has(key)) return null;

  return (
    <button
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium',
        'bg-amber-100 dark:bg-amber-900/30',
        'text-amber-800 dark:text-amber-200',
        'border border-amber-200 dark:border-amber-700/50',
        'hover:bg-amber-200 dark:hover:bg-amber-800/40',
        'transition-colors duration-200',
        'cursor-pointer',
        className,
      )}
      aria-label={`Sajdah verse: Surah ${surah}, Verse ${ayah}. It is recommended to prostrate when reading this verse.`}
      title="Verse of Prostration"
    >
      <span className="text-sm" aria-hidden="true">🕌</span>
      <span>Sajdah</span>
    </button>
  );
}
