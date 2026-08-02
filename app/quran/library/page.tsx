import { getSurahs } from '@/lib/data/quran';
import { SurahLibraryClient } from '../../../components/quran/SurahLibraryClient';

export const metadata = {
  title: 'All Surahs — Al Quran',
  description:
    'Browse all 114 surahs of the Holy Quran with Arabic, Bengali, and English translations.',
};

export default function QuranLibraryPage() {
  const surahs = getSurahs();
  return <SurahLibraryClient surahs={surahs} />;
}
