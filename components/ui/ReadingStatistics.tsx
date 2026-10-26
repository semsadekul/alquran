'use client';

import { useState, useEffect } from 'react';
import { useIntl } from 'react-intl';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { ProgressRing } from '../ui/ProgressRing';
import { getSurah } from '../../lib/data/quran';
import { readStats, setDailyGoal, type ReadingStats, type GoalUnit } from '../../lib/storage';

export function ReadingStatistics() {
  const intl = useIntl();
  const [stats, setStats] = useState<ReadingStats | null>(null);
  const [mounted, setMounted] = useState(false);
  const [editingGoal, setEditingGoal] = useState(false);

  useEffect(() => {
    setMounted(true);
    setStats(readStats());

    const handleUpdated = () => {
      setStats(readStats());
    };
    window.addEventListener('alquran_stats_updated', handleUpdated);
    return () => window.removeEventListener('alquran_stats_updated', handleUpdated);
  }, []);

  if (!mounted || !stats) return null;

  const currentUnit = stats.dailyGoalUnit || 'ayahs';
  const currentGoal = stats.dailyGoal || 5;
  const streakDays = stats.streakDays || 0;
  const shields = stats.graceShields ?? 1;

  const handleSelectGoal = (val: number, unit: GoalUnit) => {
    setDailyGoal(val, unit);
    setEditingGoal(false);
  };

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon="📖"
          label={intl.formatMessage({ id: 'stats.totalReads' })}
          value={(stats.totalReads || 0).toLocaleString()}
        />
        <StatCard
          icon="✨"
          label={intl.formatMessage({ id: 'stats.versesRead' })}
          value={(stats.totalVerses || 0).toLocaleString()}
        />
        <StatCard
          icon="📿"
          label={intl.formatMessage({ id: 'stats.surahsCompleted' })}
          value={`${stats.totalSurahs || 0}/114`}
        />
        <StatCard
          icon="⏱️"
          label={intl.formatMessage({ id: 'stats.timeSpent' })}
          value={formatMinutes(stats.totalMinutes || 0)}
        />
      </div>

      {/* Reading Streak & Daily Goal */}
      <Card variant="elevated" className="p-6 bg-gradient-to-br from-gold/10 to-gold-dark/10 border-gold/20">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="flex items-center gap-4">
            <ProgressRing
              value={(streakDays / 30) * 100}
              size="sm"
              decorative
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-text">
                  {intl.formatMessage({ id: 'stats.dayStreak' }, { count: streakDays })}
                </h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-forest/10 dark:bg-gold-veil text-gold-dark font-medium flex items-center gap-1">
                  {intl.formatMessage({ id: 'stats.shields' }, { count: shields })}
                </span>
              </div>
              <p className="text-xs text-text-muted mt-0.5">
                {streakDays > 0 && shields > 0
                  ? intl.formatMessage({ id: 'stats.shieldProtected' })
                  : intl.formatMessage({ id: 'stats.shieldEarn' })}
              </p>
              <div className="flex gap-1 mt-2">
                {generateWeekDots(streakDays).map((active, i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full ${active ? 'bg-gold' : 'bg-gold/20'}`}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="sm:ml-auto text-center sm:text-right">
            <div className="flex items-center justify-center sm:justify-end gap-2 mb-1">
              <p className="text-xs text-text/70 uppercase tracking-wider">
                {intl.formatMessage({ id: 'stats.dailyGoal' })}
              </p>
              <button
                type="button"
                onClick={() => setEditingGoal(!editingGoal)}
                className="text-xs text-gold-dark font-medium hover:underline"
              >
                {editingGoal
                  ? intl.formatMessage({ id: 'action.done' })
                  : intl.formatMessage({ id: 'action.change' })}
              </button>
            </div>
            <p className="text-2xl font-bold text-text">
              {intl.formatMessage(
                { id: `stats.goal.${currentUnit}` },
                { count: currentGoal }
              )}
            </p>
          </div>
        </div>

        {/* Goal Selector Drawer */}
        {editingGoal && (
          <div className="mt-4 pt-4 border-t border-gold/20 animate-fade-in">
            <p className="text-xs text-text-muted mb-2 font-medium">
              {intl.formatMessage({ id: 'stats.selectGoal' })}
            </p>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {[
                { val: 5, unit: 'ayahs' as GoalUnit },
                { val: 10, unit: 'ayahs' as GoalUnit },
                { val: 20, unit: 'ayahs' as GoalUnit },
                { val: 10, unit: 'minutes' as GoalUnit },
                { val: 20, unit: 'minutes' as GoalUnit },
                { val: 4, unit: 'pages' as GoalUnit },
              ].map((opt) => (
                <button
                  key={`${opt.val}_${opt.unit}`}
                  type="button"
                  onClick={() => handleSelectGoal(opt.val, opt.unit)}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-all ${
                    currentGoal === opt.val && currentUnit === opt.unit
                      ? 'bg-forest text-forest-ink border-transparent shadow-sm'
                      : 'border-gold-line bg-surface text-text hover:bg-surface-highlight'
                  }`}
                >
                  {intl.formatMessage(
                    { id: `stats.goal.${opt.unit}` },
                    { count: opt.val }
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Weekly Activity */}
      <Card variant="elevated" className="p-6">
        <h3 className="text-lg font-bold text-text mb-4">
          {intl.formatMessage({ id: 'stats.thisWeek' })}
        </h3>
        <div className="grid grid-cols-7 gap-2">
          {(stats.weekData || []).map((day, index) => (
            <div key={index} className="text-center">
              <div className="text-xs text-text/60 mb-1">
                {day.date}
              </div>
              <div className={`h-16 rounded-lg flex items-end justify-center ${
                day.verses > 0 
                  ? 'bg-gradient-to-t from-primary/70 to-primary/30' 
                  : 'bg-surface-highlight'
              }`}>
                {day.verses > 0 && (
                  <div className="text-xs text-text font-medium pb-1">
                    {day.verses}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Favorite Surahs */}
      <Card variant="elevated" className="p-6">
        <h3 className="text-lg font-bold text-text mb-4">
          {intl.formatMessage({ id: 'stats.mostReadSurahs' })}
        </h3>
        <div className="space-y-3">
          {(stats.favoriteSurahs || []).slice(0, 5).map((surah, index) => (
            <div key={surah.number} className="flex items-center gap-3">
              <Badge tone="gold" size="sm">{index + 1}</Badge>
              <div className="flex-1">
                <p className="font-medium text-text">
                  {intl.formatMessage({ id: 'stats.surahName' }, { name: surah.name })}
                </p>
                <p className="text-sm text-text/60">
                  {getSurah(surah.number)?.englishName ?? `Surah ${surah.number}`}
                </p>
              </div>
              <div className="text-sm text-text/70">
                {intl.formatMessage({ id: 'stats.readTimes' }, { count: surah.count })}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Milestones */}
      <Card variant="elevated" className="p-6">
        <h3 className="text-lg font-bold text-text mb-4">
          {intl.formatMessage({ id: 'stats.milestones' })}
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <MilestoneBadge
            icon="🎯"
            label={intl.formatMessage({ id: 'stats.milestone.firstRead' })}
            achieved={(stats.totalReads || 0) > 0}
          />
          <MilestoneBadge
            icon="📚"
            label={intl.formatMessage({ id: 'stats.milestone.verses100' })}
            achieved={(stats.totalVerses || 0) >= 100}
          />
          <MilestoneBadge
            icon="🌟"
            label={intl.formatMessage({ id: 'stats.milestone.completeJuz' })}
            achieved={(stats.totalVerses || 0) >= 240}
          />
          <MilestoneBadge
            icon="🔥"
            label={intl.formatMessage({ id: 'stats.milestone.streak7' })}
            achieved={streakDays >= 7}
          />
          <MilestoneBadge
            icon="💎"
            label={intl.formatMessage({ id: 'stats.milestone.streak30' })}
            achieved={streakDays >= 30}
          />
          <MilestoneBadge
            icon="🏆"
            label={intl.formatMessage({ id: 'stats.milestone.fullQuran' })}
            achieved={(stats.totalVerses || 0) >= 6236}
          />
        </div>
      </Card>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <Card variant="interactive" className="p-4 text-center">
      <div className="text-2xl mb-2">{icon}</div>
      <div className="text-lg font-bold text-text">{value}</div>
      <div className="text-sm text-text/70">{label}</div>
    </Card>
  );
}

function MilestoneBadge({ icon, label, achieved }: { icon: string; label: string; achieved: boolean }) {
  const intl = useIntl();
  return (
    <div className={`p-4 rounded-lg text-center transition-all ${
      achieved 
        ? 'bg-gradient-to-br from-gold-dark/20 to-gold/20 border border-gold/30' 
        : 'bg-surface-highlight opacity-50 grayscale'
    }`}>
      <div className="text-2xl mb-2">{icon}</div>
      <div className="text-sm font-medium">{label}</div>
      {achieved && (
        <div className="text-xs text-success mt-1">
          {intl.formatMessage({ id: 'stats.unlocked' })}
        </div>
      )}
    </div>
  );
}

function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

function generateWeekDots(streakDays: number): boolean[] {
  return Array.from({ length: 7 }, (_, i) => i < Math.min(streakDays, 7));
}
