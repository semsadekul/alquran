'use client';

import { useState, useEffect } from 'react';
import { useIntl } from 'react-intl';
import Link from 'next/link';
import { ContinueReadingHero, type ContinueSurah } from '@/components/home/ContinueReadingHero';
import { ShortcutTiles } from '@/components/home/ShortcutTiles';
import { DailyAyah } from '@/components/ui/DailyAyah';
import { SettingsIcon, FlameIcon } from '@/components/ui/Icon';
import { GoalCelebrationModal } from '@/components/ui/GoalCelebrationModal';
import { readRecentSurahs, readStats } from '@/lib/storage';
import { readKhatamPlan, type KhatamPlan } from '@/lib/khatam';
import { useLocale } from '@/components/providers/LocaleProvider';
import { formatCount } from '@/lib/format';

interface RecentSurah {
  surah: ContinueSurah & { englishNameTranslation?: string };
  lastRead: number;
  lastAyah?: number;
}

export default function HomePage() {
  const intl = useIntl();
  const { locale } = useLocale();
  const [recentSurahs, setRecentSurahs] = useState<RecentSurah[]>([]);
  const [streak, setStreak] = useState(0);
  const [shields, setShields] = useState(1);
  const [dailyGoal, setDailyGoal] = useState(5);
  const [todayReads, setTodayReads] = useState(0);
  const [activeKhatam, setActiveKhatam] = useState<KhatamPlan | null>(null);

  useEffect(() => {
    setRecentSurahs(readRecentSurahs() as RecentSurah[]);

    const stats = readStats();
    const today = new Date().toISOString().slice(0, 10);
    setStreak(stats.streakDays ?? 0);
    setShields(stats.graceShields ?? 1);
    setDailyGoal(stats.dailyGoal ?? 5);
    setTodayReads(stats.activity?.[today] ?? 0);
    setActiveKhatam(readKhatamPlan());
  }, []);

  const current = recentSurahs[0];

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Goal Celebration Modal */}
      <GoalCelebrationModal />

      {/* Greeting + settings */}
      <header className="flex items-center justify-between gap-4 pt-2 pb-1">
        <div className="min-w-0">
          <p className="text-[14px] text-text-muted">
            {intl.formatMessage({ id: 'home.salaam' })}
          </p>
          <h1 className="bangla-display text-[24px] font-semibold text-text mt-0.5 truncate">
            {intl.formatMessage({ id: 'home.headline' })}
          </h1>
        </div>
        <Link
          href="/settings"
          aria-label={intl.formatMessage({ id: 'nav.settings' })}
          className="shrink-0 w-11 h-11 rounded-full border border-gold-line-strong text-gold-dark inline-flex items-center justify-center hover:bg-gold-veil transition-colors"
        >
          <SettingsIcon width={24} height={24} strokeWidth={1.75} />
        </Link>
      </header>

      <ContinueReadingHero
        surah={current?.surah ?? null}
        lastAyah={current?.lastAyah}
      />

      <DailyAyah />

      <ShortcutTiles />

      {/* Mini Active Khatam Banner if active */}
      {activeKhatam && (
        <Link
          href="/stats"
          className="flex items-center justify-between rounded-card border border-gold-line bg-surface p-4 hover:bg-surface-highlight transition-colors"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">📖</span>
            <div>
              <p className="text-xs text-text-muted">{activeKhatam.title}</p>
              <p className="text-sm font-semibold text-text">
                Page {activeKhatam.currentPage} of 604 ({Math.round((activeKhatam.completedPages.length / 604) * 100)}%)
              </p>
            </div>
          </div>
          <span className="text-xs text-gold-dark font-medium">Continue Khatam →</span>
        </Link>
      )}

      {/* Streak strip with Grace Shield badge */}
      <Link
        href="/stats"
        className="flex items-center justify-between rounded-card border border-gold-line bg-surface px-5 py-3.5 hover:bg-surface-highlight transition-colors"
      >
        <span className="flex items-center gap-2.5 min-w-0">
          <FlameIcon width={20} height={20} className="text-gold-dark shrink-0" />
          <span className="text-[14px] text-text truncate">
            {intl.formatMessage({ id: 'home.readingStreak' })}
          </span>
          {shields > 0 && (
            <span className="text-xs px-1.5 py-0.5 rounded bg-forest/10 dark:bg-gold-veil text-gold-dark font-medium flex items-center gap-1">
              🛡️ {shields}
            </span>
          )}
        </span>
        <span className="text-[13px] text-text-muted tabular-nums shrink-0">
          <span className="font-semibold text-gold-dark">
            {intl.formatMessage(
              { id: 'home.streak.value' },
              {
                days: formatCount(streak, locale),
                read: formatCount(todayReads, locale),
                goal: formatCount(dailyGoal, locale),
              }
            )}
          </span>
        </span>
      </Link>
    </div>
  );
}
