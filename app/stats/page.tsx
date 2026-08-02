'use client';

import { useState, useEffect } from 'react';
import { useIntl } from 'react-intl';
import Link from 'next/link';
import { ReadingStatistics } from '../../components/ui/ReadingStatistics';
import { CalendarHeatmap } from '../../components/ui/CalendarHeatmap';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { readStats } from '../../lib/storage';

export default function StatsPage() {
  const intl = useIntl();
  const [ready, setReady] = useState(false);
  const [hasData, setHasData] = useState(false);

  useEffect(() => {
    const stats = readStats();
    const activity = stats.activity ?? {};
    setHasData((stats.totalReads ?? 0) > 0 || Object.keys(activity).length > 0);
    setReady(true);
  }, []);

  if (!ready) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <header className="text-center lg:text-left">
        <div className="inline-block px-4 py-1 rounded-full bg-surface-highlight border border-border-subtle mb-4">
          <p className="text-sm font-medium text-gold-dark">
            {intl.formatMessage({ id: 'stats.overallProgress' })}
          </p>
        </div>
        <h1 className="font-display text-3xl md:text-4xl font-semibold text-text mb-2">
          {intl.formatMessage({ id: 'stats.title' })}
        </h1>
        <p className="text-lg text-text/70" style={{ fontFamily: 'var(--font-bengali-ui)' }}>
          {intl.formatMessage({ id: 'stats.overallProgress' })}
        </p>
      </header>

      {hasData ? (
        <>
          <div className="animate-slide-up stagger-1">
            <CalendarHeatmap weeks={26} />
          </div>
          <ReadingStatistics />
        </>
      ) : (
        <Card variant="elevated" className="p-12 text-center">
          <div className="text-5xl mb-4" aria-hidden="true">
            🌙
          </div>
          <h2 className="text-xl font-bold text-text mb-2">
            {intl.formatMessage({ id: 'home.continueReading' })}
          </h2>
          <p className="text-text/70 mb-6 max-w-md mx-auto">
            {intl.formatMessage({ id: 'stats.goalProgress' }, { done: 0, goal: 5 })}
          </p>
          <Link href="/quran/library">
            <Button variant="primary">
              {intl.formatMessage({ id: 'hifz.browseSurahs' })}
            </Button>
          </Link>
        </Card>
      )}
    </div>
  );
}
