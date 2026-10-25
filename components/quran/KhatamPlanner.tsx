'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  readKhatamPlan,
  createKhatamPlan,
  markPageCompleted,
  deleteKhatamPlan,
  calculateKhatamProgress,
  type KhatamPlan,
  type KhatamProgress,
} from '@/lib/khatam';
import { readStats } from '@/lib/storage';

export function KhatamPlanner() {
  const [plan, setPlan] = useState<KhatamPlan | null>(null);
  const [progress, setProgress] = useState<KhatamProgress | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<number>(30);
  const [customStartPage, setCustomStartPage] = useState<number>(1);
  const [isCreating, setIsCreating] = useState(false);
  const [shields, setShields] = useState(1);

  useEffect(() => {
    const refresh = () => {
      const currentPlan = readKhatamPlan();
      setPlan(currentPlan);
      if (currentPlan) {
        setProgress(calculateKhatamProgress(currentPlan));
      } else {
        setProgress(null);
      }
      const stats = readStats();
      setShields(stats.graceShields ?? 1);
    };

    refresh();

    const handleKhatamUpdated = () => refresh();
    window.addEventListener('alquran_khatam_updated', handleKhatamUpdated);
    window.addEventListener('alquran_stats_updated', handleKhatamUpdated);

    return () => {
      window.removeEventListener('alquran_khatam_updated', handleKhatamUpdated);
      window.removeEventListener('alquran_stats_updated', handleKhatamUpdated);
    };
  }, []);

  const handleStartPlan = (days: number) => {
    const newPlan = createKhatamPlan(days, undefined, customStartPage);
    setPlan(newPlan);
    setProgress(calculateKhatamProgress(newPlan));
    setIsCreating(false);
  };

  const handleMarkPage = () => {
    if (!plan) return;
    const updated = markPageCompleted(plan.currentPage);
    if (updated) {
      setPlan(updated);
      setProgress(calculateKhatamProgress(updated));
    }
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to cancel your active Khatam plan?')) {
      deleteKhatamPlan();
      setPlan(null);
      setProgress(null);
    }
  };

  if (!plan || isCreating) {
    return (
      <Card variant="elevated" className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-forest/10 dark:bg-gold-veil text-gold-dark text-xs font-semibold uppercase tracking-wider mb-2">
              <span>📖</span> Khatam Planner
            </div>
            <h3 className="text-xl font-bold text-text">Finish the Holy Quran</h3>
            <p className="text-sm text-text-muted mt-0.5">
              Set a structured reading plan with smart daily pacing and streak protection.
            </p>
          </div>
          {isCreating && (
            <Button variant="ghost" size="sm" onClick={() => setIsCreating(false)}>
              Back
            </Button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
          {[
            { days: 30, title: '30 Days', pace: '~20 pages / day', tone: 'Ramadan / Monthly' },
            { days: 60, title: '60 Days', pace: '~10 pages / day', tone: '2 Months' },
            { days: 90, title: '90 Days', pace: '~7 pages / day', tone: 'Quarterly' },
            { days: 365, title: '1 Year', pace: '~2 pages / day', tone: 'Gentle Habit' },
          ].map((item) => (
            <button
              key={item.days}
              type="button"
              onClick={() => setSelectedDuration(item.days)}
              className={`p-4 rounded-xl border text-left transition-all ${
                selectedDuration === item.days
                  ? 'border-gold bg-gold-veil/40 ring-1 ring-gold shadow-sm'
                  : 'border-border-subtle bg-surface hover:bg-surface-highlight'
              }`}
            >
              <p className="font-bold text-text text-base">{item.title}</p>
              <p className="text-xs text-gold-dark font-medium mt-0.5">{item.pace}</p>
              <p className="text-[11px] text-text-muted mt-1">{item.tone}</p>
            </button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <div className="flex items-center gap-2 text-sm text-text">
            <span>Start from page:</span>
            <input
              type="number"
              min={1}
              max={604}
              value={customStartPage}
              onChange={(e) => setCustomStartPage(Number(e.target.value))}
              className="w-20 px-2 py-1.5 rounded-lg border border-gold-line bg-surface text-text text-center text-sm font-semibold"
            />
            <span className="text-xs text-text-muted">(1 to 604)</span>
          </div>

          <Button
            variant="primary"
            onClick={() => handleStartPlan(selectedDuration)}
            className="w-full sm:w-auto bg-gradient-to-r from-gold to-gold-dark text-white px-6 py-2.5 font-medium shadow-md"
          >
            Start {selectedDuration}-Day Khatam →
          </Button>
        </div>
      </Card>
    );
  }

  const {
    pagesCompleted,
    percentComplete,
    daysRemaining,
    dailyPacePages,
    status,
  } = progress || {
    pagesCompleted: 0,
    percentComplete: 0,
    daysRemaining: plan.targetDays,
    dailyPacePages: 20,
    status: 'on_track',
  };

  const statusLabel =
    status === 'completed'
      ? 'Khatam Complete! 🎉'
      : status === 'ahead'
        ? 'Ahead of Schedule 🚀'
        : status === 'behind'
          ? 'Needs Catch-up ⏳'
          : 'On Track ✨';

  const statusClass =
    status === 'completed' || status === 'ahead'
      ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
      : status === 'behind'
        ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30'
        : 'bg-gold/10 text-gold-dark border-gold/30';

  return (
    <Card variant="elevated" className="p-6">
      {/* Top row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">📖</span>
            <h3 className="text-xl font-bold text-text font-display">{plan.title}</h3>
            <span className={`text-xs px-2.5 py-0.5 rounded-full border font-medium ${statusClass}`}>
              {statusLabel}
            </span>
          </div>
          <p className="text-xs text-text-muted">
            Target: {plan.targetDate} · {daysRemaining} days remaining
          </p>
        </div>

        {/* Grace Shield Pill */}
        <div className="flex items-center gap-2 self-start sm:self-auto px-3 py-1.5 rounded-xl bg-forest/5 dark:bg-gold-veil/20 border border-gold-line text-xs">
          <span>🛡️</span>
          <div>
            <span className="font-semibold text-text">{shields}/3</span>
            <span className="text-text-muted ml-1">Shields Active</span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-text-muted mb-1.5">
          <span>
            Page <strong className="text-text font-semibold">{plan.currentPage}</strong> of 604 ({pagesCompleted} read)
          </span>
          <span className="font-bold text-gold-dark">{percentComplete}% Complete</span>
        </div>
        <div className="w-full h-3 rounded-full bg-surface-highlight overflow-hidden border border-border-subtle p-0.5">
          <div
            className="h-full rounded-full bg-gradient-to-r from-gold to-gold-dark transition-all duration-500"
            style={{ width: `${Math.max(percentComplete, 2)}%` }}
          />
        </div>
      </div>

      {/* Pace Summary & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-surface-highlight/50 border border-border-subtle">
        <div className="space-y-0.5">
          <p className="text-xs text-text-muted">Today&apos;s Recommended Pace</p>
          <p className="text-sm font-semibold text-text">
            Read <span className="text-gold-dark font-bold">{dailyPacePages} pages</span> today (Page {plan.currentPage} to {Math.min(604, plan.currentPage + dailyPacePages - 1)})
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href={`/quran/mushaf?page=${plan.currentPage}`}>
            <Button variant="primary" size="sm" className="bg-gradient-to-r from-gold to-gold-dark text-white font-medium">
              Read Page {plan.currentPage} →
            </Button>
          </Link>
          <Button variant="outline" size="sm" onClick={handleMarkPage} className="border-gold-line text-text">
            Mark Page Done ✓
          </Button>
          <button
            type="button"
            onClick={handleDelete}
            title="Reset Khatam"
            className="p-2 text-text-muted hover:text-red-500 rounded-lg hover:bg-surface-highlight transition-colors text-xs"
          >
            ✕
          </button>
        </div>
      </div>
    </Card>
  );
}
