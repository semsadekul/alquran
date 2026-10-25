'use client';

import { useIntl } from 'react-intl';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { MOBILE_NAV_ITEMS, SECTION_ICONS } from '@/lib/nav';
import { useLocale } from '@/components/providers/LocaleProvider';

/**
 * Five-tab bottom bar: Home · Quran · Search · Hifz · More.
 *
 * The bar owns the safe-area inset so its 64px of content stays above the
 * home indicator on iOS; each tab is a 64px-tall target with a 24×3px gold
 * indicator on the active one (the design's marker) and a scale-down press
 * state. Labels are 12px so Bangla and Arabic stay legible at arm's length.
 */
export function MobileNav() {
  const pathname = usePathname();
  const intl = useIntl();
  const { locale } = useLocale();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <nav
      aria-label={intl.formatMessage({ id: 'nav.primary' })}
      className="lg:hidden fixed bottom-0 inset-x-0 z-50 bg-surface/95 backdrop-blur-md border-t border-gold-line"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex items-stretch h-16 max-w-xl mx-auto px-1">
        {MOBILE_NAV_ITEMS.map((item) => {
          const Icon = SECTION_ICONS[item.key];
          const active = isActive(item.href);
          const label = intl.formatMessage({ id: `nav.${item.key.toLowerCase()}` });

          return (
            <Link
              key={item.key}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              aria-label={label}
              className={[
                'group relative flex-1 flex flex-col items-center justify-center gap-1 px-1',
                'transition-transform duration-150 active:scale-95',
              ].join(' ')}
            >
              {active && (
                <span
                  aria-hidden="true"
                  className="absolute top-0 h-[3px] w-6 rounded-b-full bg-gold"
                />
              )}

              <Icon
                width={24}
                height={24}
                strokeWidth={active ? 2 : 1.75}
                className={[
                  'transition-colors duration-150',
                  active ? 'text-gold-dark' : 'text-ink-3 group-hover:text-gold-dark',
                ].join(' ')}
              />

              <span
                lang={locale === 'bn' ? 'bn' : undefined}
                className={[
                  'max-w-full truncate text-[12px] leading-none',
                  active ? 'font-semibold text-gold-dark' : 'font-medium text-text-muted',
                ].join(' ')}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
