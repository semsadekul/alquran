'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { getSurahs } from '@/lib/data/quran';
import {
  SRS_UPDATED_EVENT,
  buildReviewQueue,
  readReviewStates,
  recordReview,
  scheduleReview,
  type ReviewGrade,
  type ReviewItem,
} from '@/lib/srs';

type Phase = 'idle' | 'reviewing' | 'done';

const GRADES: ReviewGrade[] = ['again', 'hard', 'good', 'easy'];

const GRADE_TONE: Record<ReviewGrade, string> = {
  again: 'border-error/40 text-error hover:bg-error/10',
  hard: 'border-gold-line text-text hover:bg-surface-highlight',
  good: 'border-gold/40 text-gold-dark hover:bg-gold/10',
  easy: 'border-success/40 text-success hover:bg-success/10',
};

type Tally = Record<ReviewGrade, number>;

const EMPTY_TALLY: Tally = { again: 0, hard: 0, good: 0, easy: 0 };

export default function DailyReview() {
  const intl = useIntl();
  const label = (id: string, values?: Record<string, string | number>) =>
    intl.formatMessage({ id }, values);

  const [mounted, setMounted] = useState(false);
  const [phase, setPhase] = useState<Phase>('idle');
  const [deckSize, setDeckSize] = useState(0);
  const [due, setDue] = useState(0);
  const [queue, setQueue] = useState<ReviewItem[]>([]);
  const [index, setIndex] = useState(0);
  const [tally, setTally] = useState<Tally>(EMPTY_TALLY);
  const [revealed, setRevealed] = useState(false);
  const [ayahText, setAyahText] = useState<string | null>(null);
  const [textFailed, setTextFailed] = useState(false);
  const verseCache = useRef<Map<number, Record<number, string>>>(new Map());

  const surahs = getSurahs();
  const current = queue[index] ?? null;

  const refresh = useCallback(() => {
    const states = readReviewStates();
    setDeckSize(Object.keys(states).length);
    setDue(buildReviewQueue(states).length);
  }, []);

  // Read local state after mount, then keep the due count live as sessions run.
  useEffect(() => {
    setMounted(true);
    refresh();
    const onUpdated = () => refresh();
    window.addEventListener(SRS_UPDATED_EVENT, onUpdated);
    window.addEventListener('focus', onUpdated);
    return () => {
      window.removeEventListener(SRS_UPDATED_EVENT, onUpdated);
      window.removeEventListener('focus', onUpdated);
    };
  }, [refresh]);

  // Load the Arabic text for the ayah being reviewed.
  useEffect(() => {
    if (phase !== 'reviewing' || !current) return;
    let cancelled = false;
    setRevealed(false);
    setTextFailed(false);

    const apply = (map: Record<number, string>) => {
      if (cancelled) return;
      const text = map[current.ayah];
      if (text) setAyahText(text);
      else setTextFailed(true);
    };

    const cached = verseCache.current.get(current.surah);
    if (cached) {
      apply(cached);
      return;
    }

    setAyahText(null);
    (async () => {
      try {
        const res = await fetch(`/data/verses/${current.surah}.json`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const payload = await res.json();
        const map: Record<number, string> = {};
        (payload?.ayahs ?? []).forEach((verse: { number: number; arabic: string }) => {
          map[verse.number] = verse.arabic;
        });
        verseCache.current.set(current.surah, map);
        apply(map);
      } catch {
        if (!cancelled) setTextFailed(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [phase, current]);

  const start = () => {
    const dueItems = buildReviewQueue(readReviewStates());
    if (dueItems.length === 0) {
      refresh();
      return;
    }
    setQueue(dueItems);
    setIndex(0);
    setTally(EMPTY_TALLY);
    setAyahText(null);
    setPhase('reviewing');
  };

  const grade = (value: ReviewGrade) => {
    if (!current) return;
    recordReview(current.surah, current.ayah, value);
    setTally((prev) => ({ ...prev, [value]: prev[value] + 1 }));
    if (index + 1 >= queue.length) {
      refresh();
      setPhase('done');
    } else {
      setIndex((i) => i + 1);
    }
  };

  /** Short "when will I see this again" hint shown under each grade. */
  const nextLabel = (value: ReviewGrade) => {
    if (!current) return '';
    const next = scheduleReview(current.state, value);
    return next.intervalDays === 0
      ? label('hifz.review.nextToday')
      : label('hifz.review.nextDays', { days: next.intervalDays });
  };

  if (!mounted) {
    return (
      <Card variant="elevated" className="p-5 min-h-[120px]" aria-busy="true">
        <div className="h-4 w-32 bg-surface-highlight rounded shimmer" />
      </Card>
    );
  }

  // ─── Idle ──────────────────────────────────────────────────────────
  if (phase === 'idle') {
    return (
      <Card
        variant="elevated"
        className="p-5 border-gold/20 bg-gradient-to-br from-gold/10 to-gold-dark/5"
      >
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-text">
              {label('hifz.review.title')}
            </h2>
            <p className="text-sm text-text/70 mt-1">
              {due > 0
                ? label('hifz.review.dueToday', { count: due })
                : label('hifz.review.noneDue')}
            </p>
            {deckSize === 0 && (
              <p className="text-xs text-text-muted mt-2">{label('hifz.review.emptyDeck')}</p>
            )}
          </div>
          <Button
            variant="primary"
            onClick={start}
            disabled={due === 0}
            className="bg-gradient-to-r from-gold to-gold-dark text-white hover:from-gold-dark hover:to-gold-dark"
          >
            {label('hifz.review.start')}
          </Button>
        </div>
      </Card>
    );
  }

  // ─── Done ──────────────────────────────────────────────────────────
  if (phase === 'done') {
    const total = GRADES.reduce((sum, value) => sum + tally[value], 0);
    return (
      <Card variant="elevated" className="p-5 border-success/30">
        <h2 className="text-lg font-semibold text-text">{label('hifz.review.doneTitle')}</h2>
        <p className="text-sm text-text/70 mt-1">
          {label('hifz.review.doneBody', { count: total })}
        </p>
        <div className="flex flex-wrap gap-2 mt-3">
          {GRADES.filter((value) => tally[value] > 0).map((value) => (
            <span
              key={value}
              className="rounded-full border border-gold-line px-2.5 py-1 text-xs text-text-muted"
            >
              {label(`hifz.review.grade.${value}`)} · {tally[value]}
            </span>
          ))}
        </div>
        <Button variant="outline" className="mt-4" onClick={() => setPhase('idle')}>
          {label('hifz.review.close')}
        </Button>
      </Card>
    );
  }

  // ─── Reviewing ─────────────────────────────────────────────────────
  const surah = current ? surahs.find((s) => s.number === current.surah) : undefined;

  return (
    <Card variant="elevated" className="p-5 border-gold/30">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold text-text truncate">
            {label('hifz.review.title')}
          </h2>
          {current && (
            <p className="text-xs text-text-muted">
              {surah?.englishName ?? `Surah ${current.surah}`} {current.surah}:{current.ayah}
              {current.overdueDays > 0 && (
                <span className="ml-2 text-warning">
                  · {label('hifz.review.overdue', { days: current.overdueDays })}
                </span>
              )}
            </p>
          )}
        </div>
        <span className="text-xs text-text-muted shrink-0">
          {label('hifz.review.progress', { current: index + 1, total: queue.length })}
        </span>
      </div>

      <div className="rounded-xl border border-gold-line bg-surface px-4 py-6 text-center">
        {textFailed ? (
          <p className="text-sm text-text-muted">{label('hifz.review.loadFailed')}</p>
        ) : ayahText === null ? (
          <div className="h-8 w-2/3 mx-auto bg-surface-highlight rounded shimmer" />
        ) : (
          <p
            dir="rtl"
            lang="ar"
            className={`text-2xl md:text-3xl font-arabic text-text leading-relaxed transition ${
              revealed ? '' : 'blur-md select-none'
            }`}
            style={{ fontFamily: 'var(--font-arabic)' }}
            aria-hidden={!revealed}
          >
            {ayahText}
          </p>
        )}

        <div className="mt-4 flex items-center justify-center gap-3">
          {!revealed && !textFailed && (
            <Button variant="outline" size="sm" onClick={() => setRevealed(true)}>
              {label('hifz.review.reveal')}
            </Button>
          )}
          {current && (
            <Link
              href={`/quran/surahs/${current.surah}#ayah-${current.ayah}`}
              className="text-xs text-text-muted hover:text-text hover:underline"
            >
              {label('hifz.review.open')}
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4">
        {GRADES.map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => grade(value)}
            aria-label={`${label(`hifz.review.grade.${value}`)} — ${nextLabel(value)}`}
            className={`rounded-lg border px-2 py-2.5 text-sm font-medium transition-colors ${GRADE_TONE[value]}`}
          >
            <span className="block">{label(`hifz.review.grade.${value}`)}</span>
            <span className="block text-[11px] font-normal opacity-70">{nextLabel(value)}</span>
          </button>
        ))}
      </div>
    </Card>
  );
}
