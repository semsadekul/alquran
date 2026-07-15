import { createAyahReference } from '@alquran/quran';
import Link from 'next/link';
import { SearchOmnibox } from '../components/SearchOmnibox';
import { ContinueReading } from '../components/ContinueReading';
import { DailyVerse } from '../components/DailyVerse';

const domains = [
  { title: 'Quran', description: 'Read, listen, study, and memorize the Holy Quran.', href: '/quran' },
  { title: 'Search', description: 'Find verses and topics instantly.', href: '/search' },
  { title: 'Library', description: 'Your bookmarks, highlights, notes, and collections.', href: '/library' },
  { title: 'Offline', description: 'Download content packs for offline reading.', href: '/offline' },
  { title: 'Settings', description: 'Display, reading, and app preferences.', href: '/settings' }
];

export default function HomePage() {
  return (
    <main className="shell">
      <SearchOmnibox />
      <ContinueReading />
      <DailyVerse />

      <section className="hero" style={{ display: 'none' }}>
        <p className="eyebrow">Al Quran — পবিত্র কুরআন</p>
        <h1>The Best Quran App in Bangladesh</h1>
        <p className="lede">
          Read, listen, search, and study the Quran — designed for clarity, offline reliability, and Bangla-first excellence.
        </p>
        <div className="meta-row">
          <span>Reference: {createAyahReference(2, 2)}</span>
          <span>Offline-first</span>
          <span>Bangla-first</span>
        </div>
      </section>

      <div style={{ marginBottom: '40px' }}>
        <h2 style={{ marginBottom: '16px', fontFamily: 'var(--font-bengali-ui)' }}>কুইক অ্যাক্সেস</h2>
        <section className="grid">
          {domains.map(domain => (
            <Link className="card card-link" href={domain.href} key={domain.title}>
              <h2>{domain.title}</h2>
              <p>{domain.description}</p>
            </Link>
          ))}
        </section>
      </div>
    </main>
  );
}
