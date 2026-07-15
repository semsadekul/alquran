import { getSurahs } from '@/lib/data/quran';
import { SurahListClient } from '@/components/quran/SurahListClient';
import type { Surah } from '@alquran/types';

export default function SurahListPage() {
  const allSurahs = getSurahs() as Surah[];

  return (
    <div className="shell">
      <section className="hero">
        <p className="eyebrow">Quran</p>
        <h1>সূরা সমূহ (Surahs)</h1>
        <p className="lede">All 114 Surahs of the Holy Quran.</p>
      </section>

      <SurahListClient initialSurahs={allSurahs} />
    </div>
  );
}
