'use client';

import { useIntl } from 'react-intl';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useTheme } from '@/components/providers/ThemeProvider';
import { NAV_ITEMS } from '@/lib/nav';
import { SunIcon, MoonIcon, SearchIcon } from '@/components/ui/Icon';
import { ProfileMenu } from './ProfileMenu';

const pageLabels: Record<string, string> = {
  '/': 'pageHome',
  '/quran/library': 'pageSurahs',
  '/quran/hifz': 'pageHifz',
  '/quran/surahs': 'pageSurah',
  '/search': 'pageSearch',
  '/duas': 'pageDuas',
  '/stats': 'pageStats',
  '/settings': 'pageSettings',
};

function titleFromPath(pathname: string, intl: { formatMessage: ({ id }: { id: string }) => string }): string {
  // Check each key directly first
  if (pathname === '/' || pathname === '') return intl.formatMessage({ id: 'pageHome' });
  
  // Check for exact prefix matches in order
  for (const [prefix, messageId] of Object.entries(pageLabels)) {
    if (prefix !== '/' && pathname.startsWith(prefix)) {
      return intl.formatMessage({ id: messageId });
    }
  }
  
  // Fallback: try to match a nav item
  const match = NAV_ITEMS.find((i) => i.href !== '/' && pathname.startsWith(i.href));
  return match ? intl.formatMessage({ id: `nav.${match.key.toLowerCase()}` }) : '';
}

export function TopBar() {
  const pathname = usePathname();
  const intl = useIntl();
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const title = titleFromPath(pathname, intl);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="sticky top-0 z-30 h-16 bg-surface/85 backdrop-blur-md border-b border-border-subtle">
      <div className="h-full px-4 sm:px-6 flex items-center justify-between gap-4">
        {/* Page title */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="hidden sm:block">
            <p className="eyebrow leading-none">
              {intl.formatMessage({ id: 'topbar.section' })}
            </p>
            <h2 className="font-display text-lg sm:text-xl font-semibold text-text leading-tight mt-1 truncate">
              {title}
            </h2>
          </div>
          <div className="sm:hidden">
            <span
              aria-hidden="true"
              className="block w-9 h-9 rounded-md flex items-center justify-center text-[#1a1814] shadow-soft"
              style={{
                background:
                  'linear-gradient(135deg, var(--gold-light), var(--gold) 60%, var(--gold-dark))',
              }}
            >
              <span className="font-arabic text-lg leading-none" style={{ fontFamily: 'var(--font-arabic)' }}>
                ق
              </span>
            </span>
          </div>
        </div>

        {/* Right cluster */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Quick search trigger (mobile compact) */}
          <a
            href="/search"
            aria-label={intl.formatMessage({ id: 'topbar.search.q' })}
            className="inline-flex items-center justify-center w-10 h-10 rounded-md text-ink-2 hover:text-gold-dark hover:bg-surface-highlight transition-colors"
          >
            <SearchIcon width={18} height={18} />
          </a>

          {/* Theme toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={intl.formatMessage(
              { id: 'topbar.theme.toggle' },
              { theme: theme === 'dark' ? intl.formatMessage({ id: 'topbar.theme.light' }) : intl.formatMessage({ id: 'topbar.theme.dark' }) },
            )}
            className="inline-flex items-center justify-center w-10 h-10 rounded-md text-ink-2 hover:text-gold-dark hover:bg-surface-highlight transition-colors"
          >
            {mounted && theme === 'dark' ? (
              <SunIcon width={18} height={18} />
            ) : (
              <MoonIcon width={18} height={18} />
            )}
          </button>

          {/* Profile */}
          <ProfileMenu />
        </div>
      </div>
    </header>
  );
}
