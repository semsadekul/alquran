import Link from 'next/link';
import { PageShell } from '@/components/ui/PageShell';
import { Card } from '@/components/ui/Card';
import { ContinueReading } from '@/components/ContinueReading';
import { SearchOmnibox } from '@/components/SearchOmnibox';

const quickActions = [
  { title: 'সূরা তালিকা', description: 'Explore all 114 Surahs of the Quran.', href: '/quran/surahs' },
  { title: 'Search', description: 'Find verses by Arabic, Bangla, English, or transliteration.', href: '/search' },
  { title: 'Bookmarks', description: 'Jump back to your saved verses.', href: '/library/bookmarks' },
  { title: 'Settings', description: 'Adjust reading display, font, and language options.', href: '/settings' },
];

export default function QuranHomePage() {
  return (
    <PageShell title="কুরআন মাজীদ" eyebrow="Al Quran">
      <SearchOmnibox />
      <ContinueReading />

      <h2 className="text-xl font-semibold text-ink mb-4 mt-8" style={{ fontFamily: 'var(--font-bengali-ui)' }}>
        কুইক লিংক
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickActions.map((action) => (
          <Link href={action.href} key={action.title}>
            <Card variant="interactive" className="h-full">
              <h3 className="font-semibold text-ink mb-1">{action.title}</h3>
              <p className="text-sm text-ink-3">{action.description}</p>
            </Card>
          </Link>
        ))}
      </div>
    </PageShell>
  );
}
