import type { Metadata } from 'next';
import Link from 'next/link';
import { cn } from '@/lib/cn';

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
    <div className="flex min-h-screen">
      <aside className="hidden md:flex flex-col w-56 shrink-0 border-r border-line bg-surface-muted p-4 gap-6 sticky top-0 h-screen overflow-y-auto">
        <div className="flex flex-col gap-1">
          <Link
            className="text-sm text-ink-3 hover:text-ink transition-colors min-h-[44px] inline-flex items-center"
            href="/"
          >
            &larr; Home
          </Link>
          <h2 className="text-lg font-bold text-ink">Quran</h2>
        </div>
        <nav className="flex flex-col gap-1">
          {quranNav.map(item => (
            <Link
              key={item.href}
              className={cn(
                'rounded-xl px-3 py-2 text-sm font-medium min-h-[44px] inline-flex items-center',
                'text-ink-2 hover:text-ink hover:bg-[var(--surface-hover)] transition-colors'
              )}
              href={item.href}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}
