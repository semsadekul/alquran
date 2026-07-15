import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Quran — Al Quran Ecosystem',
  description: 'Read, listen, study, and memorize the Holy Quran in Bengali, English, and Arabic.'
};

const quranNav = [
  { label: 'Quran Home', href: '/quran' },
  { label: 'Surah List', href: '/quran/surahs' },
  { label: 'Hifz Mode', href: '/quran/hifz' },
  { label: 'Bookmarks', href: '/library/bookmarks' },
  { label: 'Search', href: '/search' }
];

export default function QuranLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="layout-with-rail">
      <aside className="side-rail">
        <div className="rail-header">
          <Link className="rail-brand" href="/">← Home</Link>
          <h2 className="rail-title">Quran</h2>
        </div>
        <nav className="rail-nav">
          {quranNav.map(item => (
            <Link className="rail-link" href={item.href} key={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="rail-content">{children}</main>
    </div>
  );
}
