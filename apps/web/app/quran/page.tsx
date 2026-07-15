import Link from 'next/link';
import { ContinueReading } from '../../components/ContinueReading';
import { SearchOmnibox } from '../../components/SearchOmnibox';

const quickActions = [
  { title: 'সূরা তালিকা (Surah List)', description: 'Explore all 114 Surahs of the Quran.', href: '/quran/surahs' },
  { title: 'Search', description: 'Find verses by Arabic, Bangla, English, or transliteration.', href: '/search' },
  { title: 'Bookmarks', description: 'Jump back to your saved verses.', href: '/library' },
  { title: 'Settings', description: 'Adjust reading display, font, and language options.', href: '/settings' }
];

export default function QuranHomePage() {
  return (
    <main className="shell">
      <section className="hero" style={{ marginBottom: '40px' }}>
        <p className="eyebrow">Al Quran</p>
        <h1>কুরআন মাজীদ</h1>
      </section>

      <SearchOmnibox />
      <ContinueReading />

      <h2 style={{ marginBottom: '16px', fontFamily: 'var(--font-bengali-ui)' }}>কুইক লিংক</h2>
      <section className="grid">
        {quickActions.map(action => (
          <Link className="card card-link" href={action.href} key={action.title}>
            <h2>{action.title}</h2>
            <p>{action.description}</p>
          </Link>
        ))}
      </section>
    </main>
  );
}
