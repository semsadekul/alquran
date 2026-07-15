import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';
import { MobileNav } from '../components/MobileNav';
import { ScrollProgress } from '../components/ScrollProgress';
import { BackToTop } from '../components/BackToTop';

export const metadata: Metadata = {
  title: 'Al Quran Ecosystem',
  description: 'Modern Bengali Islamic ecosystem for Quran, Hadith, Books, Search, and AI.'
};

const topLinks = [
  { label: 'হোম', href: '/' },
  { label: 'কুরআন', href: '/quran' },
  { label: 'হিফয', href: '/quran/hifz' },
  { label: 'খুঁজুন', href: '/search' },
  { label: 'লাইব্রেরি', href: '/library' },
  { label: 'সেটিংস', href: '/settings' }
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="bn">
      <body>
        <ScrollProgress />
        <div className="app-shell">
          <header className="topbar">
            <Link className="topbar-brand" href="/">Al Quran</Link>
            <nav className="topbar-nav">
              {topLinks.map(link => (
                <Link className="topbar-link" href={link.href} key={link.href}>
                  {link.label}
                </Link>
              ))}
            </nav>
            <MobileNav links={topLinks} />
          </header>
          <div className="main-content">{children}</div>
          <footer className="footer">
            <p>© {new Date().getFullYear()} Al Quran — পবিত্র কুরআন</p>
          </footer>
        </div>
        <BackToTop />
      </body>
    </html>
  );
}
