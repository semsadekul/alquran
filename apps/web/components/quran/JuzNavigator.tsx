'use client';

import { useRouter } from 'next/navigation';
import { JUZ_DATA } from '@/lib/data/juz';
import { cn } from '@/lib/cn';
import { useAnnounce } from '@/components/ui/Announce';

interface JuzNavigatorProps {
  currentJuz?: number;
  className?: string;
}

export function JuzNavigator({ currentJuz, className }: JuzNavigatorProps) {
  const router = useRouter();
  const { announce } = useAnnounce();

  const handleJuzChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const juzNumber = Number(e.target.value);
    if (juzNumber) {
      const juz = JUZ_DATA.find(j => j.number === juzNumber);
      if (juz) {
        announce(`Navigating to ${juz.nameEn}`);
        router.push(`/quran/surahs/${juz.startSurah}#verse-${juz.startAyah}`);
      }
    }
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <label htmlFor="juz-navigator" className="text-xs text-ink-3 font-medium whitespace-nowrap">
        Juz:
      </label>
      <select
        id="juz-navigator"
        value={currentJuz || ''}
        onChange={handleJuzChange}
        className="bg-[var(--surface)] border border-[var(--border)] text-ink-2 text-sm rounded-xl px-3 py-2 min-h-[40px] min-w-[120px] focus:outline-none focus:ring-2 focus:ring-[var(--border-focus)] transition-colors cursor-pointer"
        aria-label="Jump to Juz"
      >
        <option value="">Select Juz</option>
        {JUZ_DATA.map(juz => (
          <option key={juz.number} value={juz.number}>
            {juz.number} — {juz.nameEn}
          </option>
        ))}
      </select>
    </div>
  );
}
