'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BookOpen, Heart, BookHeart, Library } from 'lucide-react';
import { useLocale } from '@/components/providers/LocaleProvider';
import { cn } from '@/lib/cn';
import { useCallback } from 'react';

const navLinks = [
  { href: '/', id: 'home', icon: Home },
  { href: '/quran', id: 'quran', icon: BookOpen },
  { href: '/quran/hifz', id: 'hifz', icon: Heart },
  { href: '/duas', id: 'duas', icon: BookHeart },
  { href: '/library', id: 'library', icon: Library },
];

export function BottomNav() {
  const pathname = usePathname();
  const { t } = useLocale();

  const isActive = useCallback(
    (href: string) => {
      if (href === '/') return pathname === '/';
      // Longest-match wins: /quran/hifz highlights Hifz, not Quran
      const matches = navLinks
        .filter((l) => pathname.startsWith(l.href))
        .sort((a, b) => b.href.length - a.href.length);
      return matches[0]?.href === href;
    },
    [pathname],
  );

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 bg-gradient-to-br from-[#0a3622] to-[#145338] border-t border-[#1a5e3f]/50 z-50 md:hidden shadow-[0_-4px_20px_rgba(0,0,0,0.2)]"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="max-w-md mx-auto flex justify-between items-center px-2 pt-2 pb-1">
        {navLinks.map((link) => {
          const Icon = link.icon;
          const active = isActive(link.href);
          return (
            <Link
              href={link.href}
              key={link.id}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 min-w-[56px] min-h-[48px] relative transition-colors duration-200',
                active
                  ? 'text-[var(--color-majestic-gold)]'
                  : 'text-white/40 hover:text-white/70',
              )}
            >
              <div
                className={cn(
                  'relative p-1.5 rounded-full transition-all duration-200',
                  active && 'bg-white/10',
                )}
              >
                <Icon
                  size={22}
                  className={active ? 'stroke-[2.5px]' : 'stroke-[1.8px]'}
                />
                {active && (
                  <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[var(--color-majestic-gold)] shadow-[0_0_6px_rgba(197,160,89,0.6)]" />
                )}
              </div>
              <span
                className={cn(
                  'text-[9px] font-medium tracking-wider',
                  active ? 'opacity-100' : 'opacity-60',
                )}
              >
                {t(`nav.${link.id}`)}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
