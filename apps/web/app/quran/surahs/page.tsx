import { getSurahs } from '@/lib/data/quran';
import { SurahListClient } from '@/components/quran/SurahListClient';
import type { Surah } from '@alquran/types';
import { PageShell } from '@/components/ui/PageShell';

export default function SurahListPage() {
  const allSurahs = getSurahs() as Surah[];

  return (
    <PageShell
      title="সূরা সমূহ"
      eyebrow="Quran"
      lede="All 114 Surahs of the Holy Quran."
    >
      <SurahListClient initialSurahs={allSurahs} />
    </PageShell>
  );
}
