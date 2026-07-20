'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from '@/components/providers/ThemeProvider';
import { useLocale } from '@/components/providers/LocaleProvider';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { Sun, Moon, Monitor, Menu, X } from 'lucide-react';
import { useCallback, useState } from 'react';
import { cn } from '@/lib/cn';

const desktopNavLinks = [
  { label: 'Home', href: '/', id: 'home' },
  { label: 'Quran', href: '/quran', id: 'quran' },
  { label: 'Hifz', href: '/quran/hifz', id: 'hifz' },
  { label: 'Duas', href: '/duas', id: 'duas' },
];

export function Header() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { locale, setLocale, t } = useLocale();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = useCallback(
    (href: string) => {
      if (href === '/') return pathname === '/';
      return pathname.startsWith(href);
    },
    [pathname],
  );

  const cycleTheme = useCallback(() => {
    const order = ['light', 'dark', 'system'] as const;
    const next = order[(order.indexOf(theme) + 1) % order.length];
    setTheme(next);
  }, [theme, setTheme]);

  const ThemeIcon = theme === 'dark' ? Moon : theme === 'light' ? Sun : Monitor;

  return (
    <>
      <header className="sticky top-0 z-40 bg-gradient-to-br from-[#0a3622] to-[#145338] text-white shadow-lg border-b border-[#1a5e3f]/50 pt-[env(safe-area-inset-top)]">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 h-[68px] relative z-10">
          {/* Logo */}
          <div className="flex flex-col leading-tight">
            <Link
              href="/"
              className="font-serif font-bold text-lg tracking-[0.15em] text-[var(--color-majestic-gold)]"
            >
              AL-QURAN
            </Link>
            <Link href="/" className="text-xs text-white/80" style={{ fontFamily: 'var(--font-bengali-ui)' }}>
              আল-কুরআন
            </Link>
          </div>

          {/* Desktop Centered Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {desktopNavLinks.map((link) => (
              <Link
                key={link.id}
                href={link.href}
                className={cn(
                  'relative text-sm font-medium transition-colors duration-200 group',
                  isActive(link.href)
                    ? 'text-[var(--color-majestic-gold)]'
                    : 'text-white/70 hover:text-white',
                )}
              >
                {t(`nav.${link.id}`) || link.label}
                <span
                  className={cn(
                    'absolute -bottom-1 left-0 right-0 h-[2px] bg-[var(--color-majestic-gold)] transition-transform duration-300 origin-left',
                    isActive(link.href) ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100',
                  )}
                />
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Theme toggle */}
            <button
              type="button"
              onClick={cycleTheme}
              className="w-9 h-9 flex items-center justify-center rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              aria-label={`Theme: ${theme}`}
            >
              <ThemeIcon size={18} />
            </button>

            {/* Language toggle */}
            <div className="flex rounded-full overflow-hidden backdrop-blur-sm border border-white/15 bg-white/8">
              <button
                type="button"
                onClick={() => setLocale('en')}
                className={cn(
                  'px-3 py-1.5 text-xs font-medium transition-colors',
                  locale === 'en'
                    ? 'text-white bg-white/15'
                    : 'text-white/60 hover:text-white hover:bg-white/5',
                )}
              >
                EN
              </button>
              <div className="w-px bg-white/20" />
              <button
                type="button"
                onClick={() => setLocale('bn')}
                className={cn(
                  'px-3 py-1.5 text-xs font-medium transition-colors',
                  locale === 'bn'
                    ? 'text-white bg-white/15'
                    : 'text-white/60 hover:text-white hover:bg-white/5',
                )}
              >
                BN
              </button>
            </div>

            {/* Mobile menu button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden w-9 h-9 flex items-center justify-center rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden" onClick={() => setMobileMenuOpen(false)}>
          <div className="absolute inset-0 bg-[var(--overlay)]" />
          <div
            className="absolute top-0 right-0 w-72 h-full bg-surface border-l border-line p-6 animate-[slideInRight_0.3s_var(--ease-decelerate)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-8">
              <span className="font-semibold text-ink">{t('nav.settings')}</span>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="w-11 h-11 flex items-center justify-center rounded-xl text-ink-3 hover:text-ink hover:bg-[var(--surface-hover)]"
                aria-label="Close menu"
              >
                <X size={20} />
              </button>
            </div>
            <nav className="flex flex-col gap-2">
              {desktopNavLinks.map((link) => (
                <Link
                  key={link.id}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'px-4 py-3 rounded-xl text-base font-medium transition-colors',
                    isActive(link.href)
                      ? 'bg-accent-subtle text-accent'
                      : 'text-ink-2 hover:bg-[var(--surface-hover)]',
                  )}
                >
                  {t(`nav.${link.id}`) || link.label}
                </Link>
              ))}
            </nav>

            {/* Theme picker in mobile menu */}
            <div className="mt-8 pt-6 border-t border-line">
              <p className="text-sm text-ink-3 mb-3">{t('settings.theme')}</p>
              <SegmentedControl
                segments={[
                  { id: 'light', label: t('settings.light') },
                  { id: 'dark', label: t('settings.dark') },
                  { id: 'system', label: t('settings.system') },
                ]}
                value={theme}
                onChange={(id) => setTheme(id as 'light' | 'dark' | 'system')}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
