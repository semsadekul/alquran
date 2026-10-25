'use client';

import { useState, useEffect } from 'react';
import { useIntl } from 'react-intl';
import Link from 'next/link';
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
    <aside className="hidden lg:flex flex-col w-64 fixed left-0 top-0 h-full bg-surface border-r border-border z-40">
      {/* Brand */}
      <div className="px-6 pt-7 pb-6 border-b border-border-subtle">
        <Link href="/" className="flex items-center gap-3 group">
          <div
            aria-hidden="true"
            className="w-11 h-11 rounded-md flex items-center justify-center text-[#1a1814] shadow-soft transition-transform group-hover:scale-[1.03]"
            style={{
              background:
                'linear-gradient(135deg, var(--gold-light), var(--gold) 60%, var(--gold-dark))',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.3), 0 4px 12px -4px rgba(184,150,74,0.5)',
            }}
          >
            <span
              className="font-arabic text-2xl leading-none"
              style={{ fontFamily: 'var(--font-arabic)' }}
            >
              ق
            </span>
          </div>
          <div>
            <h1 className="font-display text-xl font-semibold text-text leading-none">
              {intl.formatMessage({ id: 'nav.home' }).replace('Home', 'Al Quran')}
            </h1>
            <p className="bangla-ui text-xs text-text-muted mt-1">আল কুরআন</p>
          </div>
        </Link>
      </div>

      {/* Primary nav */}
      <nav className="flex-1 px-3 py-5 overflow-y-auto" aria-label={intl.formatMessage({ id: 'nav.sections' })}>
        <p className="eyebrow px-3 mb-3">
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
                    'group relative flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors duration-200',
                    active
                      ? 'bg-surface-highlight text-gold-dark font-medium'
                      : 'text-ink-2 hover:text-ink hover:bg-surface-highlight',
                  ].join(' ')}
                >
                  {active && (
                    <span
                      aria-hidden="true"
                      className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-[2px] rounded-r-full bg-gold"
                    />
                  )}
                  <Icon
                    width={18}
                    height={18}
                    className={active ? 'text-gold-dark' : 'text-ink-3 group-hover:text-ink-2'}
                  />
                  <span>{label}</span>
                  {/* Show Bengali suffix ONLY when locale is 'bn' */}
                  {locale === 'bn' && item.bengali && (
                    <span className="bangla-ui ml-auto text-xs text-ink-4">{item.bengali}</span>
                  )}
                </Link>

                {/* Hadith 7 Major Collections sub-links when inside Hadith */}
                {isHadith && hadithActive && (
                  <ul className="mt-1 ml-6 pl-2 border-l border-border-subtle space-y-0.5">
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
                              'block px-2.5 py-1.5 text-xs rounded transition-colors',
                              isBookActive
                                ? 'text-gold-dark font-medium bg-gold/10'
                                : 'text-ink-3 hover:text-ink-1 hover:bg-surface-highlight',
                            ].join(' ')}
                          >
                            <span className="truncate block">
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

        <p className="eyebrow px-3 mb-3">
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
                    'group relative flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors duration-200',
                    active
                      ? 'bg-surface-highlight text-gold-dark font-medium'
                      : 'text-ink-2 hover:text-ink hover:bg-surface-highlight',
                  ].join(' ')}
                >
                  {active && (
                    <span
                      aria-hidden="true"
                      className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-[2px] rounded-r-full bg-gold"
                    />
                  )}
                  <Icon
                    width={18}
                    height={18}
                    className={active ? 'text-gold-dark' : 'text-ink-3 group-hover:text-ink-2'}
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
        <div className="rounded-lg bg-surface-highlight border border-border-subtle p-4">
          <div className="flex items-center gap-3">
            <ProgressRing value={done} max={goal} size="sm" gradient="gold" animated={false} />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-text-muted uppercase tracking-wider font-medium">
                {intl.formatMessage({ id: 'home.readingStreak.dailyGoal' })}
              </p>
              <p className="font-display text-lg font-semibold text-text leading-tight mt-0.5">
                {done} / {goal}
              </p>
              {streak > 0 && (
                <p className="text-xs text-gold-dark mt-0.5">
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
