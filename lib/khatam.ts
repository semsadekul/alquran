// lib/khatam.ts
// Quran Khatam (complete recitation) planner, pace tracking, and storage.

export interface KhatamPlan {
  id: string;
  title: string;
  targetDays: number; // e.g. 30, 60, 90, 365
  startDate: string; // ISO YYYY-MM-DD
  targetDate: string; // ISO YYYY-MM-DD
  currentPage: number; // 1 to 604
  completedPages: number[];
  completedAt?: string | null;
}

export interface KhatamProgress {
  totalPages: number;
  pagesCompleted: number;
  percentComplete: number;
  daysElapsed: number;
  daysRemaining: number;
  dailyPacePages: number;
  expectedPage: number;
  isAhead: boolean;
  status: 'on_track' | 'ahead' | 'behind' | 'completed';
}

const KHATAM_STORAGE_KEY = 'alquran_khatam_plan';
const TOTAL_MUSHAF_PAGES = 604;

function formatDate(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function readKhatamPlan(): KhatamPlan | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(KHATAM_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as KhatamPlan) : null;
  } catch {
    return null;
  }
}

export function saveKhatamPlan(plan: KhatamPlan): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(KHATAM_STORAGE_KEY, JSON.stringify(plan));
    window.dispatchEvent(new CustomEvent('alquran_khatam_updated', { detail: plan }));
  } catch {
    /* storage full — non-critical */
  }
}

export function createKhatamPlan(targetDays: number, title?: string, startPage = 1): KhatamPlan {
  const now = new Date();
  const target = new Date(now);
  target.setDate(target.getDate() + targetDays);

  const planTitle =
    title ||
    (targetDays === 30
      ? '30-Day Ramadan / Monthly Khatam'
      : targetDays === 60
        ? '60-Day Khatam'
        : targetDays === 90
          ? '90-Day Khatam'
          : `${targetDays}-Day Khatam`);

  const plan: KhatamPlan = {
    id: `khatam_${Date.now()}`,
    title: planTitle,
    targetDays,
    startDate: formatDate(now),
    targetDate: formatDate(target),
    currentPage: Math.max(1, Math.min(startPage, TOTAL_MUSHAF_PAGES)),
    completedPages: startPage > 1 ? Array.from({ length: startPage - 1 }, (_, i) => i + 1) : [],
    completedAt: null,
  };

  saveKhatamPlan(plan);
  return plan;
}

export function markPageCompleted(pageNumber: number): KhatamPlan | null {
  const plan = readKhatamPlan();
  if (!plan) return null;

  const validPage = Math.max(1, Math.min(pageNumber, TOTAL_MUSHAF_PAGES));
  const set = new Set(plan.completedPages);
  set.add(validPage);

  const completedPages = Array.from(set).sort((a, b) => a - b);
  const isFinished = completedPages.length >= TOTAL_MUSHAF_PAGES;

  const updated: KhatamPlan = {
    ...plan,
    currentPage: Math.min(validPage + 1, TOTAL_MUSHAF_PAGES),
    completedPages,
    completedAt: isFinished ? new Date().toISOString() : plan.completedAt,
  };

  saveKhatamPlan(updated);
  return updated;
}

export function calculateKhatamProgress(plan: KhatamPlan): KhatamProgress {
  const pagesCompleted = plan.completedPages.length;
  const percentComplete = Math.min(100, Math.round((pagesCompleted / TOTAL_MUSHAF_PAGES) * 100));

  const start = new Date(plan.startDate).getTime();
  const end = new Date(plan.targetDate).getTime();
  const now = Date.now();

  const totalDurationDays = Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)));
  const daysElapsed = Math.max(0, Math.floor((now - start) / (1000 * 60 * 60 * 24)));
  const daysRemaining = Math.max(0, Math.ceil((end - now) / (1000 * 60 * 60 * 24)));

  const pagesRemaining = Math.max(0, TOTAL_MUSHAF_PAGES - pagesCompleted);
  const dailyPacePages =
    daysRemaining > 0 ? Math.ceil(pagesRemaining / daysRemaining) : pagesRemaining;

  const expectedPage = Math.min(
    TOTAL_MUSHAF_PAGES,
    Math.round((daysElapsed / totalDurationDays) * TOTAL_MUSHAF_PAGES)
  );

  let status: KhatamProgress['status'] = 'on_track';
  if (pagesCompleted >= TOTAL_MUSHAF_PAGES) {
    status = 'completed';
  } else if (pagesCompleted > expectedPage + 2) {
    status = 'ahead';
  } else if (pagesCompleted < expectedPage - 2) {
    status = 'behind';
  }

  return {
    totalPages: TOTAL_MUSHAF_PAGES,
    pagesCompleted,
    percentComplete,
    daysElapsed,
    daysRemaining,
    dailyPacePages: Math.max(1, dailyPacePages),
    expectedPage,
    isAhead: pagesCompleted >= expectedPage,
    status,
  };
}

export function deleteKhatamPlan(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(KHATAM_STORAGE_KEY);
  window.dispatchEvent(new CustomEvent('alquran_khatam_updated', { detail: null }));
}
