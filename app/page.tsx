'use client';

import { useState, useEffect } from 'react';
import { useIntl } from 'react-intl';
import Link from 'next/link';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { DailyAyah } from '../components/ui/DailyAyah';
import { readStats } from '../lib/storage';
import { SearchIcon, ScrollIcon, StarIcon, BarChartIcon, SettingsIcon } from '@/components/ui/Icon';

interface Surah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  banglaName?: string;
  numberOfAyahs: number;
  revelationType: string;
}

interface RecentSurah {
  surah: Surah;
  lastRead: number;
  lastAyah?: number;
}

const QUICK_ACTIONS = [
  { href: '/search', labelId: 'home.quickAction.search', descId: 'home.quickAction.searchDesc', icon: SearchIcon },
  { href: '/quran/library', labelId: 'home.quickAction.library', descId: 'home.quickAction.libraryDesc', icon: ScrollIcon },
  { href: '/quran/hifz', labelId: 'home.quickAction.hifz', descId: 'home.quickAction.hifzDesc', icon: StarIcon },
  { href: '/stats', labelId: 'home.quickAction.stats', descId: 'home.quickAction.statsDesc', icon: BarChartIcon },
  { href: '/settings', labelId: 'home.quickAction.settings', descId: 'home.quickAction.settingsDesc', icon: SettingsIcon },
];

function getGreetingMessage(intl: { formatMessage: ({ id }: { id: string }) => string }): string {
  const hour = new Date().getHours();
  if (hour < 12) {
    return intl.formatMessage({ id: 'home.greeting.morning' });
  } else if (hour < 17) {
    return intl.formatMessage({ id: 'home.greeting.afternoon' });
  } else {
    return intl.formatMessage({ id: 'home.greeting.evening' });
  }
}

export default function HomePage() {
  const intl = useIntl();
  const [greeting, setGreeting] = useState(getGreetingMessage(intl));
  const [recentSurahs, setRecentSurahs] = useState<RecentSurah[]>([]);
  const [streak, setStreak] = useState(0);
  const [dailyGoal, setDailyGoal] = useState(5);
  const [todayReads, setTodayReads] = useState(0);

  useEffect(() => {
    // Load recently opened surahs
    const stored = localStorage.getItem('alquran_recent_surahs');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setRecentSurahs(parsed.slice(0, 5));
      } catch (e) {
        console.error('Failed to parse recent surahs', e);
      }
    }

    // Load real reading stats (no hardcoded zeros)
    const stats = readStats();
    const today = new Date().toISOString().slice(0, 10);
    setStreak(stats.streakDays ?? 0);
    setDailyGoal(stats.dailyGoal ?? 5);
    setTodayReads(stats.activity?.[today] ?? 0);
  }, []);

  const continueHref =
    recentSurahs.length > 0
      ? `/quran/surahs/${recentSurahs[0].surah.number}`
      : '/quran/library';

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Greeting Header */}
      <header className="text-center lg:text-left animate-slide-up">
        <div className="inline-block px-4 py-1 rounded-full bg-surface-highlight border border-border-subtle mb-4">
          <p className="text-sm font-medium text-gold-dark" style={{ fontFamily: 'var(--font-arabic)' }}>
            {greeting}
          </p>
        </div>
        <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-semibold text-text mb-2 leading-tight">
          {greeting}
        </h1>
        <p className="text-lg md:text-xl text-text-muted bangla-ui">
          {greeting}
        </p>
      </header>

      {/* Daily Ayah Widget */}
      <div className="animate-slide-up stagger-1">
        <DailyAyah />
      </div>

      {/* Reading Streak & Stats */}
      <Card variant="elevated" className="p-6 bg-surface-highlight border-border-subtle animate-slide-up stagger-2">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl" aria-hidden="true">🔥</span>
              <div>
                <h2 className="font-display text-xl font-semibold text-text">
                  {intl.formatMessage({ id: 'home.readingStreak' })}
                </h2>
                <p className="text-sm text-text-muted">
                  {intl.formatMessage({ id: 'home.readingStreak.subtitle' })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div>
                <span className="font-display text-3xl font-bold text-gold-dark">{streak}</span>
                <span className="text-text-muted ml-1">
                  {intl.formatMessage({ id: 'home.readingStreak.days' })}
                </span>
              </div>
              <div className="h-8 w-px bg-border" />
              <div>
                <span className="font-display text-3xl font-bold text-gold-dark">
                  {todayReads}/{dailyGoal}
                </span>
                <span className="text-text-muted ml-1">
                  {intl.formatMessage({ id: 'home.readingStreak.dailyGoal' })}
                </span>
              </div>
            </div>
          </div>
          <Link href={continueHref}>
            <Button variant="primary">
              {intl.formatMessage({ id: 'home.continueReading' })}
            </Button>
          </Link>
        </div>
      </Card>

      {/* Recently Opened Surahs */}
      {recentSurahs.length > 0 && (
        <section className="animate-slide-up stagger-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl font-semibold text-text">
              {intl.formatMessage({ id: 'home.recentlyOpened' })}
            </h2>
            <Link href="/quran/library" className="text-sm text-gold-dark hover:underline">
              {intl.formatMessage({ id: 'home.viewAll' })}
            </Link>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 lg:mx-0 lg:px-0">
            {recentSurahs.map((item, index) => (
              <Link
                key={item.surah.number}
                href={`/quran/surahs/${item.surah.number}`}
                className="flex-shrink-0 w-64 animate-slide-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <Card variant="interactive" className="p-4 h-full">
                  <div className="flex items-center justify-between mb-2">
                    <Badge tone="classic">{item.surah.number}</Badge>
                    <span className="text-xs text-text-muted">
                      {formatTimeAgo(item.lastRead)}
                    </span>
                  </div>
                  <h3 className="font-semibold text-text mb-1 truncate">
                    {item.surah.englishName}
                  </h3>
                  <p className="text-sm text-text-muted truncate mb-2">
                    {item.surah.englishNameTranslation}
                  </p>
                  <p 
                    className="text-sm text-text-muted/70 truncate mb-3 bangla-ui"
                  >
                    {item.surah.banglaName || `সূরা ${item.surah.number}`}
                  </p>
                  {item.lastAyah && (
                    <div className="text-xs text-text-muted">
                      {intl.formatMessage({ id: 'home.lastRead' }, { ayah: item.lastAyah })}
                    </div>
                  )}
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Quick Actions Grid */}
      <section className="animate-slide-up stagger-3">
        <h2 className="font-display text-xl font-semibold text-text mb-4">
          {intl.formatMessage({ id: 'home.quickActions' })}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {QUICK_ACTIONS.map((action, index) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.href}
                href={action.href}
                className="block animate-slide-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <Card variant="interactive" className="p-4 h-full bg-surface text-text border-border hover:border-gold/30">
                  <div className="w-10 h-10 rounded-md flex items-center justify-center bg-surface-highlight text-gold-dark mb-3">
                    <Icon width={20} height={20} />
                  </div>
                  <h3 className="font-semibold text-sm text-text">
                    {intl.formatMessage({ id: action.labelId })}
                  </h3>
                  <p className="text-xs text-text-muted mt-0.5">
                    {intl.formatMessage({ id: action.descId })}
                  </p>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function formatTimeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'Just now';
}
