'use client';

import Link from 'next/link';
import { useIntl } from 'react-intl';
import { Card } from '@/components/ui/Card';
import {
  BookmarkIcon,
  HandHeartIcon,
  BarChartIcon,
  SettingsIcon,
  ChevronRightIcon,
} from '@/components/ui/Icon';

const LINKS = [
  { href: '/hadith', title: 'Hadith Books (হাদীস গ্রন্থসমূহ)', desc: '৩৬,৩৯০টি বিশুদ্ধ হাদিসের ৭টি প্রধান সংকলন (তাহকীক ও বাংলা অর্থসহ)', iconEmoji: '📚' },
  { href: '/quran/juz', title: '30 Juz (পারা)', desc: 'Browse all 30 paras of the Holy Quran', iconEmoji: '📖' },
  { href: '/quran/mushaf', title: 'Mushaf Mode (মুসহাফ)', desc: '15-line authentic 604 Madani page reader', iconEmoji: '📜' },
  { href: '/quran/topics', title: 'Curated Topics & Duas', desc: 'Ayatul Kursi, Yaseen, Mulk, and thematic verses', iconEmoji: '✨' },
  { href: '/quran/bookmarks', labelId: 'more.bookmarks', descId: 'more.bookmarksDesc', Icon: BookmarkIcon },
  { href: '/duas', labelId: 'more.duas', descId: 'more.duasDesc', Icon: HandHeartIcon },
  { href: '/stats', labelId: 'more.stats', descId: 'more.statsDesc', Icon: BarChartIcon },
  { href: '/settings', labelId: 'more.settings', descId: 'more.settingsDesc', Icon: SettingsIcon },
] as const;

export default function MorePage() {
  const intl = useIntl();

  return (
    <div className="space-y-4 animate-fade-in">
      <header className="pt-2">
        <h1 className="bangla-display text-[24px] font-semibold text-text">
          {intl.formatMessage({ id: 'more.title' })}
        </h1>
        <p className="text-[14px] text-text-muted mt-1">
          {intl.formatMessage({ id: 'more.subtitle' })}
        </p>
      </header>

      <nav aria-label={intl.formatMessage({ id: 'more.title' })} className="space-y-2.5">
        {LINKS.map((item) => {
          const title = 'labelId' in item && item.labelId ? intl.formatMessage({ id: item.labelId }) : item.title;
          const desc = 'descId' in item && item.descId ? intl.formatMessage({ id: item.descId }) : item.desc;
          const IconComponent = 'Icon' in item ? item.Icon : null;
          const emoji = 'iconEmoji' in item ? item.iconEmoji : null;

          return (
            <Link key={item.href} href={item.href} className="block">
              <Card className="rounded-card border-gold-line bg-surface px-5 py-4 flex items-center gap-4 hover:bg-surface-highlight transition-colors">
                <span className="w-11 h-11 rounded-full bg-gold-veil text-gold-dark inline-flex items-center justify-center shrink-0 text-xl">
                  {IconComponent ? <IconComponent width={22} height={22} strokeWidth={1.75} /> : emoji}
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block text-[15px] font-medium text-text">
                    {title}
                  </span>
                  <span className="block text-[13px] text-text-muted truncate">
                    {desc}
                  </span>
                </span>
                <ChevronRightIcon
                  width={18}
                  height={18}
                  className="text-ink-4 shrink-0 rtl:rotate-180"
                />
              </Card>
            </Link>
          );
        })}
      </nav>

      {/* Text credits — required wherever Quran text is shown */}
      <Card className="rounded-card border-gold-line bg-surface px-5 py-4">
        <h2 className="text-[12px] font-semibold tracking-[0.12em] text-gold-dark">
          {intl.formatMessage({ id: 'more.credits.title' })}
        </h2>
        <dl className="mt-2 space-y-1.5 text-[13px] text-text-muted">
          <div className="flex gap-2">
            <dt className="shrink-0">{intl.formatMessage({ id: 'more.credits.arabic' })}</dt>
            <dd className="text-text">quran-uthmani (Tanzil Uthmani text)</dd>
          </div>
          <div className="flex gap-2">
            <dt className="shrink-0">{intl.formatMessage({ id: 'more.credits.bangla' })}</dt>
            <dd className="text-text bangla-ui">মুহিউদ্দীন খান</dd>
          </div>
          <div className="flex gap-2">
            <dt className="shrink-0">{intl.formatMessage({ id: 'more.credits.english' })}</dt>
            <dd className="text-text">Sahih International</dd>
          </div>
        </dl>
        <p className="text-[12px] text-ink-4 mt-3">
          {intl.formatMessage({ id: 'more.credits.note' })}
        </p>
      </Card>
    </div>
  );
}
