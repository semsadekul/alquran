'use client';

import { useIntl } from 'react-intl';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { MOBILE_NAV_ITEMS, SECTION_ICONS } from '@/lib/nav';
import { useLocale } from '@/components/providers/LocaleProvider';

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
      aria-label="Primary"
      className="lg:hidden fixed bottom-0 inset-x-0 z-50 bg-surface/95 backdrop-blur-md border-t border-border"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex items-stretch justify-around h-16 max-w-xl mx-auto px-1">
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
                'relative flex-1 flex flex-col items-center justify-center gap-0.5 px-1 transition-all duration-200',
                active ? 'text-gold-dark' : 'text-ink-3',
              ].join(' ')}
            >
              {active && (
                <span
                  aria-hidden="true"
                  className="absolute top-0 h-[2px] w-8 rounded-full bg-gold"
                />
              )}
              <Icon
                width={20}
                height={20}
                strokeWidth={active ? 2 : 1.5}
                className={active ? 'scale-105 transition-transform' : 'transition-transform'}
              />
              <span
                className={[
                  'text-[10px] font-medium tracking-wide',
                  active ? 'text-gold-dark' : 'text-text-muted',
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
