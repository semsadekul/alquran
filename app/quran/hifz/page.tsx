'use client';

import { useState, useEffect } from 'react';
import { useIntl } from 'react-intl';
import Link from 'next/link';
import HifzSession from './HifzSession';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { AchievementBadge } from '@/components/ui/AchievementBadge';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Confetti } from '@/components/ui/Confetti';
import { Modal } from '@/components/ui/Modal';
import { clearAppKeys } from '@/lib/storage';

interface RevisionHistory {
  [verseKey: string]: string;
}

interface Achievement {
  id: string;
  titleId: string;
  descId: string;
  icon: React.ReactNode;
  condition: (memorized: number[], history: RevisionHistory, streak: number) => boolean;
}

const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_surah',
    titleId: 'achievement.firstMilestone.title',
    descId: 'achievement.firstMilestone.desc',
    icon: '📖',
    condition: (memorized) => memorized.length >= 1,
  },
  {
    id: 'ten_surahs',
    titleId: 'achievement.dedicatedStudent.title',
    descId: 'achievement.dedicatedStudent.desc',
    icon: '📚',
    condition: (memorized) => memorized.length >= 10,
  },
  {
    id: 'thirty_surahs',
    titleId: 'achievement.hafizTraining.title',
    descId: 'achievement.hafizTraining.desc',
    icon: '🌟',
    condition: (memorized) => memorized.length >= 30,
  },
  {
    id: 'seven_day_streak',
    titleId: 'achievement.consistentLearner.title',
    descId: 'achievement.consistentLearner.desc',
    icon: '🔥',
    condition: (_, __, streak) => streak >= 7,
  },
  {
    id: 'thirty_day_streak',
    titleId: 'achievement.masterOfConsistency.title',
    descId: 'achievement.masterOfConsistency.desc',
    icon: '💎',
    condition: (_, __, streak) => streak >= 30,
  },
  {
    id: 'perfect_week',
    titleId: 'achievement.perfectWeek.title',
    descId: 'achievement.perfectWeek.desc',
    icon: '✓',
    condition: (_, __, streak) => streak >= 7,
  },
];

function getLocalStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

export default function HifzDashboardPage() {
  const intl = useIntl();
  const [mounted, setMounted] = useState(false);
  const [memorizedSurahs, setMemorizedSurahs] = useState<number[]>([]);
  const [revisionHistory, setRevisionHistory] = useState<RevisionHistory>({});
  const [achievements, setAchievements] = useState<string[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  useEffect(() => {
    setMounted(true);
    setMemorizedSurahs(getLocalStorage('alquran_hifz_memorized', []));
    setRevisionHistory(getLocalStorage('alquran_hifz_revision_history', {}));
    setAchievements(getLocalStorage('alquran_hifz_achievements', []));
  }, []);

  const calculateStreak = () => {
    let streak = 0;
    const today = new Date();

    for (let i = 0; i < 365; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      const hasRevision = Object.values(revisionHistory).some((historyDate) =>
        historyDate.startsWith(dateStr)
      );

      if (hasRevision) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }

    return streak;
  };

  const revisionStreak = calculateStreak();
  const progress = memorizedSurahs.length > 0 ? (memorizedSurahs.length / 114) * 100 : 0;
  const unlockedAchievements = ACHIEVEMENTS.filter((a) =>
    a.condition(memorizedSurahs, revisionHistory, revisionStreak)
  ).map((a) => a.id);

  useEffect(() => {
    if (!mounted) return;
    const newlyUnlocked = unlockedAchievements.filter((id) => !achievements.includes(id));
    if (newlyUnlocked.length > 0) {
      setShowConfetti(true);
      const merged = [...new Set([...achievements, ...unlockedAchievements])];
      setAchievements(merged);
      localStorage.setItem('alquran_hifz_achievements', JSON.stringify(merged));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <Confetti trigger={showConfetti} onComplete={() => setShowConfetti(false)} />

      {/* Header */}
      <header className="text-center lg:text-left">
        <div className="inline-block px-4 py-1 rounded-full bg-surface-highlight border border-border-subtle mb-4">
          <p className="text-sm font-medium text-gold-dark">
            {intl.formatMessage({ id: 'hifz.memorization' })}
          </p>
        </div>
        <h1 className="font-display text-3xl md:text-4xl font-semibold text-text">
          {intl.formatMessage({ id: 'hifz.title' })}
        </h1>
      </header>

      {/* Compact progress strip */}
      <Card
        variant="elevated"
        className="p-5 bg-gradient-to-br from-gold/10 to-gold-dark/10 border-gold/20"
      >
        <div className="flex flex-col sm:flex-row items-center gap-5">
          <ProgressRing value={progress} size="sm" />
          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-xl font-bold text-text">
              {intl.formatMessage({ id: 'hifz.of114' }, { count: memorizedSurahs.length })}
            </h2>
            <p className="text-text/70 text-sm mb-2">
              {intl.formatMessage({ id: 'hifz.percent' }, { percent: Math.round(progress) })}
            </p>
            <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
              <Badge tone="gold">{memorizedSurahs.length} Surahs</Badge>
              <Badge tone="success">🔥 {revisionStreak}-day streak</Badge>
            </div>
          </div>
        </div>
      </Card>

      {/* Hifz session — the memorization tool, front and center */}
      <section aria-label="Hifz session">
        <HifzSession />
      </section>

      {/* Achievements */}
      <section>
        <h2 className="text-xl font-bold text-text mb-4">
          {intl.formatMessage({ id: 'hifz.achievements' })}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {ACHIEVEMENTS.map((achievement) => {
            const isUnlocked = unlockedAchievements.includes(achievement.id);
            return (
              <AchievementBadge
                key={achievement.id}
                icon={achievement.icon}
                title={intl.formatMessage({ id: achievement.titleId })}
                description={intl.formatMessage({ id: achievement.descId })}
                unlocked={isUnlocked}
              />
            );
          })}
        </div>
      </section>

      {/* Actions */}
      <section className="flex flex-wrap gap-3">
        <Link href="/quran/library">
          <Button variant="primary">
            📖 {intl.formatMessage({ id: 'hifz.browseSurahs' })}
          </Button>
        </Link>
        <Button variant="ghost" onClick={() => setConfirmReset(true)}>
          🗑️ {intl.formatMessage({ id: 'hifz.resetData' })}
        </Button>
      </section>

      {/* Reset confirmation */}
      <Modal
        isOpen={confirmReset}
        onClose={() => setConfirmReset(false)}
        title={intl.formatMessage({ id: 'settings.resetConfirm.title' })}
        size="sm"
      >
        <p className="text-sm text-text/70 mb-5">
          {intl.formatMessage({ id: 'settings.resetConfirm.desc' })}
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setConfirmReset(false)}>
            {intl.formatMessage({ id: 'settings.modal.cancel' })}
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              clearAppKeys([
                'alquran_hifz_memorized',
                'alquran_hifz_revision_history',
                'alquran_hifz_achievements',
              ]);
              setConfirmReset(false);
              window.location.reload();
            }}
          >
            {intl.formatMessage({ id: 'hifz.resetData' })}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
