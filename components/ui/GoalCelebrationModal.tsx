'use client';

import { useState, useEffect } from 'react';
import { useIntl } from 'react-intl';
import { Confetti } from './Confetti';
import { Button } from './Button';
import { FlameIcon, CloseIcon } from './Icon';
import { GOAL_REACHED_EVENT, SHIELD_USED_EVENT, readStats } from '@/lib/storage';

interface CelebrationPayload {
  goal: number;
  unit: string;
  streakDays: number;
  shieldUsed?: boolean;
}

export function GoalCelebrationModal() {
  const intl = useIntl();
  const [isOpen, setIsOpen] = useState(false);
  const [payload, setPayload] = useState<CelebrationPayload | null>(null);

  useEffect(() => {
    const handleGoalReached = (e: Event) => {
      const detail = (e as CustomEvent<CelebrationPayload>).detail;
      setPayload(detail);
      setIsOpen(true);
    };

    const handleShieldUsed = (e: Event) => {
      const detail = (e as CustomEvent<{ streakDays: number; remainingShields: number }>).detail;
      setPayload({
        goal: 0,
        unit: 'ayahs',
        streakDays: detail.streakDays,
        shieldUsed: true,
      });
      setIsOpen(true);
    };

    window.addEventListener(GOAL_REACHED_EVENT, handleGoalReached);
    window.addEventListener(SHIELD_USED_EVENT, handleShieldUsed);

    return () => {
      window.removeEventListener(GOAL_REACHED_EVENT, handleGoalReached);
      window.removeEventListener(SHIELD_USED_EVENT, handleShieldUsed);
    };
  }, []);

  if (!isOpen) return null;

  const stats = readStats();
  const streak = payload?.streakDays ?? stats.streakDays ?? 1;
  const shields = stats.graceShields ?? 1;

  return (
    <>
      <Confetti duration={4000} />

      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
        role="dialog"
        aria-modal="true"
        aria-labelledby="celebration-title"
      >
        <div
          className="relative w-full max-w-md rounded-2xl bg-surface border border-gold-line shadow-2xl p-6 sm:p-8 text-center animate-scale-up"
          style={{ fontFamily: 'var(--font-bengali-ui)' }}
        >
          {/* Close button */}
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            aria-label={intl.formatMessage({ id: 'action.close' })}
            className="absolute top-4 right-4 p-2 text-text-muted hover:text-text rounded-full hover:bg-surface-highlight transition-colors"
          >
            <CloseIcon className="w-5 h-5" />
          </button>

          {/* Icon Badge */}
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-tr from-gold-veil to-gold/20 border border-gold/40 flex items-center justify-center text-3xl shadow-inner">
            {payload?.shieldUsed ? '🛡️' : '🌟'}
          </div>

          {/* Heading */}
          <h2 id="celebration-title" className="text-2xl font-bold text-text mb-1.5 font-display">
            {payload?.shieldUsed
              ? intl.formatMessage({ id: 'celebration.shieldTitle' })
              : intl.formatMessage({ id: 'celebration.goalTitle' })}
          </h2>
          <p className="text-sm text-text-muted mb-5">
            {payload?.shieldUsed
              ? intl.formatMessage({ id: 'celebration.shieldDesc' })
              : intl.formatMessage({ id: 'celebration.goalDesc' })}
          </p>

          {/* Streak Banner */}
          <div className="mb-5 p-4 rounded-xl bg-forest/5 dark:bg-gold-veil/20 border border-gold-line flex items-center justify-around">
            <div className="flex items-center gap-2">
              <FlameIcon className="w-6 h-6 text-gold-dark" />
              <div className="text-left">
                <p className="text-xs text-text-muted uppercase font-sans">
                  {intl.formatMessage({ id: 'celebration.currentStreak' })}
                </p>
                <p className="text-xl font-bold text-text">
                  {intl.formatMessage({ id: 'celebration.days' }, { count: streak })}
                </p>
              </div>
            </div>

            <div className="h-8 w-px bg-gold-line" />

            <div className="flex items-center gap-2">
              <span className="text-xl">🛡️</span>
              <div className="text-left">
                <p className="text-xs text-text-muted uppercase font-sans">
                  {intl.formatMessage({ id: 'celebration.graceShields' })}
                </p>
                <p className="text-xl font-bold text-text">{shields}/3</p>
              </div>
            </div>
          </div>

          {/* Prophetic Hadith on Consistency */}
          <div className="p-3.5 rounded-xl bg-surface-highlight/70 border border-border-subtle mb-6 text-xs text-text/80 leading-relaxed">
            <p className="font-arabic text-sm text-text mb-1" dir="rtl">
              أَحَبُّ الأَعْمَالِ إِلَى اللَّهِ أَدْوَمُهَا وَإِنْ قَلَّ
            </p>
            <p className="italic text-text-muted">
              {intl.formatMessage({ id: 'celebration.hadith' })}
            </p>
            <p className="text-[10px] text-text-muted/70 mt-0.5">
              {intl.formatMessage({ id: 'celebration.hadithSource' })}
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="primary"
              onClick={() => setIsOpen(false)}
              className="flex-1 bg-gradient-to-r from-gold to-gold-dark text-white font-medium py-2.5"
            >
              {intl.formatMessage({ id: 'celebration.continue' })}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
