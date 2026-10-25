// lib/srs.ts
// SM-2 spaced-repetition scheduling for Hifz review.
//
// The stored fields mirror the columns added to hifz_ayah_progress so the same
// state can be pushed to the database unchanged. Dates are local calendar days
// (YYYY-MM-DD), matching a Postgres DATE column.

import { STORAGE_PREFIX } from './storage';

export interface ReviewState {
  /** SM-2 easiness factor, never below MIN_EASE. */
  easeFactor: number;
  intervalDays: number;
  repetitions: number;
  /** Local calendar day (YYYY-MM-DD) the ayah is next due; null means never reviewed. */
  dueDate: string | null;
  /** Epoch ms of the last review. */
  lastReviewed: number | null;
}

export type ReviewGrade = 'again' | 'hard' | 'good' | 'easy';

export interface ReviewItem {
  key: string;
  surah: number;
  ayah: number;
  state: ReviewState;
  /** Days past the due date; 0 when due today. */
  overdueDays: number;
}

export const MIN_EASE = 1.3;
export const DEFAULT_REVIEW_STATE: ReviewState = {
  easeFactor: 2.5,
  intervalDays: 0,
  repetitions: 0,
  dueDate: null,
  lastReviewed: null,
};

const SRS_KEY = `${STORAGE_PREFIX}srs_state`;

/** Self-assessment to SM-2 quality. */
const GRADE_QUALITY: Record<ReviewGrade, number> = {
  again: 0,
  hard: 3,
  good: 4,
  easy: 5,
};

export function toDateKey(ms: number): string {
  const d = new Date(ms);
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${month}-${day}`;
}

function addDays(ms: number, days: number): string {
  const d = new Date(ms);
  d.setDate(d.getDate() + days);
  return toDateKey(d.getTime());
}

function daysBetween(fromKey: string, toKey: string): number {
  const [fy, fm, fd] = fromKey.split('-').map(Number);
  const [ty, tm, td] = toKey.split('-').map(Number);
  const from = new Date(fy, fm - 1, fd).getTime();
  const to = new Date(ty, tm - 1, td).getTime();
  return Math.round((to - from) / 86_400_000);
}

export function reviewKey(surah: number, ayah: number): string {
  return `${surah}:${ayah}`;
}

export function parseReviewKey(key: string): { surah: number; ayah: number } | null {
  const [surah, ayah] = key.split(':').map(Number);
  if (!Number.isInteger(surah) || !Number.isInteger(ayah)) return null;
  if (surah < 1 || surah > 114 || ayah < 1) return null;
  return { surah, ayah };
}

/**
 * Applies one SM-2 review. A failing grade resets the repetition count and
 * makes the ayah due again immediately; passing grades walk 1 day, 6 days,
 * then the previous interval multiplied by the updated easiness factor.
 */
export function scheduleReview(
  state: ReviewState,
  grade: ReviewGrade,
  now: number = Date.now(),
): ReviewState {
  const quality = GRADE_QUALITY[grade];
  const base = { ...DEFAULT_REVIEW_STATE, ...state };
  const delta = 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02);
  const easeFactor = Math.max(MIN_EASE, base.easeFactor + delta);

  if (quality < 3) {
    return {
      easeFactor,
      intervalDays: 0,
      repetitions: 0,
      dueDate: toDateKey(now),
      lastReviewed: now,
    };
  }

  const repetitions = base.repetitions + 1;
  const intervalDays =
    repetitions === 1
      ? 1
      : repetitions === 2
        ? 6
        : Math.max(1, Math.round(Math.max(base.intervalDays, 1) * easeFactor));

  return {
    easeFactor,
    intervalDays,
    repetitions,
    dueDate: addDays(now, intervalDays),
    lastReviewed: now,
  };
}

/** True when the ayah has never been reviewed or its due day has arrived. */
export function isDue(state: ReviewState, now: number = Date.now()): boolean {
  if (!state.dueDate) return true;
  return state.dueDate <= toDateKey(now);
}

export function buildReviewQueue(
  states: Record<string, ReviewState>,
  now: number = Date.now(),
  limit = Infinity,
): ReviewItem[] {
  const today = toDateKey(now);
  const queue: ReviewItem[] = [];

  for (const [key, state] of Object.entries(states)) {
    if (!isDue(state, now)) continue;
    const parsed = parseReviewKey(key);
    if (!parsed) continue;
    queue.push({
      key,
      ...parsed,
      state,
      overdueDays: state.dueDate ? Math.max(0, daysBetween(state.dueDate, today)) : 0,
    });
  }

  queue.sort(
    (a, b) =>
      b.overdueDays - a.overdueDays || a.surah - b.surah || a.ayah - b.ayah,
  );
  return queue.slice(0, limit);
}

// ─── Local persistence ───────────────────────────────────────────────

export function readReviewStates(): Record<string, ReviewState> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(SRS_KEY);
    return raw ? (JSON.parse(raw) as Record<string, ReviewState>) : {};
  } catch {
    return {};
  }
}

export function saveReviewStates(states: Record<string, ReviewState>): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SRS_KEY, JSON.stringify(states));
  } catch {
    /* storage full or unavailable — non-critical */
  }
}

/** Fired whenever the deck changes, so due counts update without a reload. */
export const SRS_UPDATED_EVENT = 'alquran:srs-updated';

function notifyUpdated(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event(SRS_UPDATED_EVENT));
  window.dispatchEvent(new CustomEvent('alquran_storage_changed', { detail: { key: SRS_KEY } }));
}

/**
 * Merges local and remote SRS review states using last-reviewed timestamp.
 */
export function mergeReviewStates(
  local: Record<string, ReviewState>,
  remote: Record<string, ReviewState>,
): Record<string, ReviewState> {
  const merged: Record<string, ReviewState> = { ...local };
  for (const [key, remoteState] of Object.entries(remote)) {
    const localState = merged[key];
    if (!localState) {
      merged[key] = remoteState;
    } else {
      const remoteTime = remoteState.lastReviewed ?? 0;
      const localTime = localState.lastReviewed ?? 0;
      if (remoteTime >= localTime) {
        merged[key] = remoteState;
      }
    }
  }
  return merged;
}

/**
 * Adds an ayah to the review deck if it isn't tracked yet, due today. Practising
 * an ayah in a Hifz session is what enrols it.
 */
export function ensureScheduled(
  surah: number,
  ayah: number,
  now: number = Date.now(),
): boolean {
  const key = reviewKey(surah, ayah);
  const states = readReviewStates();
  if (states[key]) return false;
  saveReviewStates({
    ...states,
    [key]: { ...DEFAULT_REVIEW_STATE, dueDate: toDateKey(now) },
  });
  notifyUpdated();
  return true;
}

/** Records a graded review for one ayah and returns its new state. */
export function recordReview(
  surah: number,
  ayah: number,
  grade: ReviewGrade,
  now: number = Date.now(),
): ReviewState {
  const key = reviewKey(surah, ayah);
  const states = readReviewStates();
  const next = scheduleReview(states[key] ?? DEFAULT_REVIEW_STATE, grade, now);
  saveReviewStates({ ...states, [key]: next });
  notifyUpdated();
  return next;
}

/** Number of ayahs due for review today, for goal/progress UI. */
export function countDue(states: Record<string, ReviewState>, now: number = Date.now()): number {
  return buildReviewQueue(states, now).length;
}
