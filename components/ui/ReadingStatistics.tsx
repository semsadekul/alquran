'use client';

import { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { ProgressRing } from '../ui/ProgressRing';
import { getSurah } from '../../lib/data/quran';
import { readStats, setDailyGoal, type ReadingStats, type GoalUnit } from '../../lib/storage';

export function ReadingStatistics() {
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
          label="Total Reads"
          value={(stats.totalReads || 0).toLocaleString()}
        />
        <StatCard
          icon="✨"
          label="Verses Read"
          value={(stats.totalVerses || 0).toLocaleString()}
        />
        <StatCard
          icon="📿"
          label="Surahs Completed"
          value={`${stats.totalSurahs || 0}/114`}
        />
        <StatCard
          icon="⏱️"
          label="Time Spent"
          value={formatMinutes(stats.totalMinutes || 0)}
        />
      </div>

      {/* Reading Streak & Daily Goal */}
      <Card variant="elevated" className="p-6 bg-gradient-to-br from-gold/10 to-gold-dark/10 border-gold/20">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="flex items-center gap-4">
            <ProgressRing
              value={((stats.streakDays || 0) / 30) * 100}
              size="sm"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-text">{stats.streakDays || 0} Day Streak</h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-forest/10 dark:bg-gold-veil text-gold-dark font-medium flex items-center gap-1">
                  🛡️ {shields}/3 Shields
                </span>
              </div>
              <p className="text-xs text-text-muted mt-0.5">
                {shields > 0
                  ? 'Your streak is protected by Grace Shield.'
                  : 'Read 7 days in a row to earn a Grace Shield.'}
              </p>
              <div className="flex gap-1 mt-2">
                {generateWeekDots(stats.streakDays || 0).map((active, i) => (
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
              <p className="text-xs text-text/70 uppercase tracking-wider">Daily Goal</p>
              <button
                type="button"
                onClick={() => setEditingGoal(!editingGoal)}
                className="text-xs text-gold-dark font-medium hover:underline"
              >
                {editingGoal ? 'Done' : 'Change'}
              </button>
            </div>
            <p className="text-2xl font-bold text-text">
              {currentGoal} {currentUnit}
            </p>
          </div>
        </div>

        {/* Goal Selector Drawer */}
        {editingGoal && (
          <div className="mt-4 pt-4 border-t border-gold/20 animate-fade-in">
            <p className="text-xs text-text-muted mb-2 font-medium">Select your daily reading goal:</p>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {[
                { val: 5, unit: 'ayahs' as GoalUnit, label: '5 Ayahs' },
                { val: 10, unit: 'ayahs' as GoalUnit, label: '10 Ayahs' },
                { val: 20, unit: 'ayahs' as GoalUnit, label: '20 Ayahs' },
                { val: 10, unit: 'minutes' as GoalUnit, label: '10 Mins' },
                { val: 20, unit: 'minutes' as GoalUnit, label: '20 Mins' },
                { val: 4, unit: 'pages' as GoalUnit, label: '4 Pages' },
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
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Weekly Activity */}
      <Card variant="elevated" className="p-6">
        <h3 className="text-lg font-bold text-text mb-4">This Week</h3>
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
        <h3 className="text-lg font-bold text-text mb-4">Most Read Surahs</h3>
        <div className="space-y-3">
          {(stats.favoriteSurahs || []).slice(0, 5).map((surah, index) => (
            <div key={surah.number} className="flex items-center gap-3">
              <Badge tone="gold" size="sm">{index + 1}</Badge>
              <div className="flex-1">
                <p className="font-medium text-text">Surah {surah.name}</p>
                <p className="text-sm text-text/60">
                  {getSurah(surah.number)?.englishName ?? `Surah ${surah.number}`}
                </p>
              </div>
              <div className="text-sm text-text/70">
                {surah.count} {surah.count === 1 ? 'time' : 'times'}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Milestones */}
      <Card variant="elevated" className="p-6">
        <h3 className="text-lg font-bold text-text mb-4">Milestones</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <MilestoneBadge
            icon="🎯"
            label="First Read"
            achieved={(stats.totalReads || 0) > 0}
          />
          <MilestoneBadge
            icon="📚"
            label="100 Verses"
            achieved={(stats.totalVerses || 0) >= 100}
          />
          <MilestoneBadge
            icon="🌟"
            label="Complete Juz"
            achieved={(stats.totalVerses || 0) >= 240}
          />
          <MilestoneBadge
            icon="🔥"
            label="7-Day Streak"
            achieved={(stats.streakDays || 0) >= 7}
          />
          <MilestoneBadge
            icon="💎"
            label="30-Day Streak"
            achieved={(stats.streakDays || 0) >= 30}
          />
          <MilestoneBadge
            icon="🏆"
            label="Full Quran"
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
  return (
    <div className={`p-4 rounded-lg text-center transition-all ${
      achieved 
        ? 'bg-gradient-to-br from-gold-dark/20 to-gold/20 border border-gold/30' 
        : 'bg-surface-highlight opacity-50 grayscale'
    }`}>
      <div className="text-2xl mb-2">{icon}</div>
      <div className="text-sm font-medium">{label}</div>
      {achieved && (
        <div className="text-xs text-success mt-1">✓ Unlocked</div>
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


