'use client';

import { useState, useEffect } from 'react';
import { useIntl } from 'react-intl';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useLocale } from '@/components/providers/LocaleProvider';
import { NAV_ITEMS, SECTION_ICONS } from '@/lib/nav';
import { ProgressRing } from '@/components/ui/ProgressRing';

export function DesktopSidebar() {
  const pathname = usePathname();
  const intl = useIntl();
  const { locale } = useLocale();
  const [mounted, setMounted] = useState(false);
  const [streak, setStreak] = useState(0);
  const [goal, setGoal] = useState(5);
  const [done, setDone] = useState(0);

  useEffect(() => {
    setMounted(true);
    try {
      const raw = localStorage.getItem('alquran_reading_stats');
      if (raw) {
        const parsed = JSON.parse(raw);
        setStreak(parsed?.streakDays ?? 0);
        setGoal(parsed?.dailyGoal ?? 5);
        const today = new Date().toISOString().slice(0, 10);
        const activity = parsed?.activity ?? {};
        setDone(activity[today] ?? 0);
      }
    } catch {
      /* noop */
    }
  }, []);

  if (!mounted) return null;

  const primary = NAV_ITEMS.filter((i) => i.key !== 'Stats' && i.key !== 'Settings');
  const secondary = NAV_ITEMS.filter((i) => i.key === 'Stats' || i.key === 'Settings');

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <aside className="hidden lg:flex flex-col w-72 fixed left-0 top-0 h-full bg-surface border-r border-border z-40">
      {/* Brand */}
      <div className="px-6 py-6 border-b border-border-subtle">
        <Link href="/" className="flex items-center gap-3.5 group">
          <div className="relative w-11 h-11 shrink-0 rounded-xl overflow-hidden shadow-soft border border-gold-line/40 bg-surface-highlight flex items-center justify-center transition-transform group-hover:scale-[1.04]">
            <Image
              src="/icon-mark.png"
              alt="Al Quran Logo"
              width={44}
              height={44}
              className="w-full h-full object-contain p-0.5"
              priority
            />
          </div>
          <div className="min-w-0">
            <h1 className="font-display text-lg font-bold text-text leading-tight group-hover:text-gold-dark transition-colors">
              আল কুরআন
            </h1>
            <p className="text-xs text-gold-dark font-medium tracking-wide mt-0.5">
              Al Quran &amp; Hadith
            </p>
          </div>
        </Link>
      </div>

      {/* Primary nav */}
      <nav className="flex-1 px-3.5 py-5 overflow-y-auto" aria-label={intl.formatMessage({ id: 'nav.sections' })}>
        <p className="text-[11px] font-bold uppercase tracking-wider text-text-muted px-3 mb-2.5">
          {intl.formatMessage({ id: 'topbar.section' })}
        </p>
        <ul className="space-y-1">
          {primary.map((item) => {
            const Icon = SECTION_ICONS[item.key];
            const active = isActive(item.href);
            const label = intl.formatMessage({ id: `nav.${item.key.toLowerCase()}` });
            const isHadith = item.key === 'Hadith';
            const hadithActive = pathname.startsWith('/hadith');

            return (
              <li key={item.key}>
                <Link
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={[
                    'group relative flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-[15px] font-medium transition-all duration-200',
                    active
                      ? 'bg-surface-highlight text-gold-dark font-semibold shadow-xs'
                      : 'text-text/80 hover:text-text hover:bg-surface-highlight',
                  ].join(' ')}
                >
                  {active && (
                    <span
                      aria-hidden="true"
                      className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full bg-gold-dark"
                    />
                  )}
                  <Icon
                    width={20}
                    height={20}
                    className={active ? 'text-gold-dark shrink-0' : 'text-text-muted group-hover:text-gold-dark shrink-0 transition-colors'}
                  />
                  <span>{label}</span>
                  {/* Show Bengali suffix ONLY when locale is 'bn' and it differs from the label */}
                  {locale === 'bn' && item.bengali && item.bengali !== label && (
                    <span aria-hidden="true" className="bangla-ui ml-auto text-xs text-text-muted">
                      {item.bengali}
                    </span>
                  )}
                </Link>

                {/* Hadith 7 Major Collections sub-links when inside Hadith */}
                {isHadith && hadithActive && (
                  <ul className="mt-1 ml-6 pl-2.5 border-l-2 border-gold-line/40 space-y-1 py-1">
                    {[
                      { id: 'bukhari', nameBn: 'সহীহ বুখারী', nameEn: 'Sahih al-Bukhari' },
                      { id: 'muslim', nameBn: 'সহীহ মুসলিম', nameEn: 'Sahih Muslim' },
                      { id: 'abudawud', nameBn: 'সুনান আবূ দাঊদ', nameEn: 'Sunan Abi Dawud' },
                      { id: 'tirmidhi', nameBn: 'জামে আত-তিরমিযী', nameEn: 'Jami` at-Tirmidhi' },
                      { id: 'nasai', nameBn: 'সুনান আন-নাসায়ী', nameEn: 'Sunan an-Nasa\'i' },
                      { id: 'ibnmajah', nameBn: 'সুনান ইবনে মাজাহ', nameEn: 'Sunan Ibn Majah' },
                      { id: 'malik', nameBn: 'মুয়াত্তা মালিক', nameEn: 'Muwatta Malik' },
                    ].map((book) => {
                      const bookHref = `/hadith/${book.id}`;
                      const isBookActive = pathname === bookHref || pathname.startsWith(`${bookHref}/`);
                      return (
                        <li key={book.id}>
                          <Link
                            href={bookHref}
                            className={[
                              'block px-3 py-1.5 text-sm font-medium rounded-lg transition-colors',
                              isBookActive
                                ? 'text-gold-dark font-semibold bg-gold/15'
                                : 'text-text-muted hover:text-text hover:bg-surface-highlight',
                            ].join(' ')}
                          >
                            <span className="truncate block bangla-ui">
                              {locale === 'bn' ? book.nameBn : book.nameEn}
                            </span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>

        <hr className="gold-rule my-5" />

        <p className="text-[11px] font-bold uppercase tracking-wider text-text-muted px-3 mb-2.5">
          {intl.formatMessage({ id: 'topbar.section' })}
        </p>
        <ul className="space-y-1">
          {secondary.map((item) => {
            const Icon = SECTION_ICONS[item.key];
            const active = isActive(item.href);
            const label = intl.formatMessage({ id: `nav.${item.key.toLowerCase()}` });
            return (
              <li key={item.key}>
                <Link
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={[
                    'group relative flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-[15px] font-medium transition-all duration-200',
                    active
                      ? 'bg-surface-highlight text-gold-dark font-semibold shadow-xs'
                      : 'text-text/80 hover:text-text hover:bg-surface-highlight',
                  ].join(' ')}
                >
                  {active && (
                    <span
                      aria-hidden="true"
                      className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full bg-gold-dark"
                    />
                  )}
                  <Icon
                    width={20}
                    height={20}
                    className={active ? 'text-gold-dark shrink-0' : 'text-text-muted group-hover:text-gold-dark shrink-0 transition-colors'}
                  />
                  <span>{label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Daily progress card */}
      <div className="px-4 pb-5 pt-3 border-t border-border-subtle">
        <div className="rounded-xl bg-surface-highlight border border-border-subtle p-4 shadow-xs">
          <div className="flex items-center gap-3.5">
            <ProgressRing value={done} max={goal} size="sm" gradient="gold" animated={false} decorative />
            <div className="flex-1 min-w-0">
              <p className="text-[11px] text-text-muted uppercase tracking-wider font-semibold">
                {intl.formatMessage({ id: 'home.readingStreak.dailyGoal' })}
              </p>
              <p className="font-display text-lg font-bold text-text leading-tight mt-0.5">
                {intl.formatMessage({ id: 'stats.goalProgress' }, { done, goal })}
              </p>
              {streak > 0 && (
                <p className="text-xs text-gold-dark font-medium mt-0.5">
                  🔥 {streak}-day streak
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
