'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useIntl } from 'react-intl';
import { useAppAuth } from '@/components/providers/AuthProvider';
import {
  ChevronDownIcon,
  BarChartIcon,
  SettingsIcon,
  StarIcon,
  LogInIcon,
  LogOutIcon,
} from '@/components/ui/Icon';

interface StatsSnapshot {
  streakDays: number;
  totalReads: number;
  totalVerses: number;
  dailyGoal: number;
  todayReads: number;
}

function readStats(): StatsSnapshot {
  try {
    const raw = localStorage.getItem('alquran_reading_stats');
    if (!raw) throw null;
    const p = JSON.parse(raw);
    const today = new Date().toISOString().slice(0, 10);
    const activity: Record<string, number> = p?.activity ?? {};
    return {
      streakDays: p?.streakDays ?? 0,
      totalReads: p?.totalReads ?? 0,
      totalVerses: p?.totalVerses ?? 0,
      dailyGoal: p?.dailyGoal ?? 5,
      todayReads: activity[today] ?? 0,
    };
  } catch {
    return { streakDays: 0, totalReads: 0, totalVerses: 0, dailyGoal: 5, todayReads: 0 };
  }
}

function UserAvatar({
  imageUrl,
  initials,
  size,
}: {
  imageUrl: string | null;
  initials: string;
  size: 'sm' | 'md';
}) {
  const dims =
    size === 'sm'
      ? 'w-8 h-8 text-xs'
      : 'w-10 h-10 text-sm';
  if (imageUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={imageUrl}
        alt={initials}
        className={`${dims} rounded-full object-cover border border-gold/50`}
      />
    );
  }
  return (
    <span
      className={`${dims} rounded-full flex items-center justify-center font-bold bg-gold border border-gold-light text-[#1a1814]`}
    >
      {initials}
    </span>
  );
}

export function ProfileMenu() {
  const intl = useIntl();
  const { enabled, isLoaded, isSignedIn, user, signOut, openUserProfile } = useAppAuth();
  const [open, setOpen] = useState(false);
  const [stats, setStats] = useState<StatsSnapshot>(readStats());
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setStats(readStats());
  }, [open]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Keyboard close
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open]);

  const done = stats.todayReads;
  const goal = stats.dailyGoal;
  const pct = Math.min(100, (done / goal) * 100);
  const authLoading = enabled && !isLoaded;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="true"
        aria-expanded={open}
        aria-label="Account & reading progress menu"
        className={[
          'inline-flex items-center gap-2 rounded-full p-1.5 transition-colors',
          open ? 'bg-surface-highlight' : 'hover:bg-surface-highlight',
        ].join(' ')}
      >
        {/* Avatar / progress badge */}
        {isSignedIn && user ? (
          <span className="ring-2 ring-gold/40 rounded-full transition-transform duration-200">
            <UserAvatar
              imageUrl={user.imageUrl}
              initials={user.initials}
              size="sm"
            />
          </span>
        ) : (
          <span
            aria-hidden="true"
            className={[
              'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold',
              'border transition-transform duration-200 shadow-sm',
              stats.streakDays > 0
                ? 'bg-gold border-gold-light text-[#1a1814] scale-105'
                : 'bg-surface-highlight border-border-subtle text-gold-dark',
            ].join(' ')}
          >
            {stats.streakDays > 0 ? `🔥${stats.streakDays}` : '📖'}
          </span>
        )}
        <ChevronDownIcon
          width={14}
          height={14}
          className={`text-ink-3 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Popover dropdown */}
      {open && (
        <div
          role="dialog"
          aria-label="Account and reading progress"
          className={[
            'absolute right-0 top-full mt-2 w-64 rounded-xl border border-border',
            'bg-surface-elevated shadow-elevated p-4 z-50 animate-fade-in',
          ].join(' ')}
        >
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            {authLoading ? (
              <>
                <span className="w-10 h-10 rounded-full bg-surface-highlight animate-pulse" />
                <div className="space-y-1.5">
                  <div className="h-3 w-28 bg-surface-highlight animate-pulse rounded" />
                  <div className="h-2.5 w-20 bg-surface-highlight animate-pulse rounded" />
                </div>
              </>
            ) : isSignedIn && user ? (
              <>
                <UserAvatar imageUrl={user.imageUrl} initials={user.initials} size="md" />
                <div className="min-w-0">
                  <p className="font-display font-semibold text-text truncate">
                    {user.name ?? user.email ?? 'Reader'}
                  </p>
                  {user.email && (
                    <p className="text-xs text-text-muted truncate">{user.email}</p>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      openUserProfile();
                    }}
                    className="text-xs font-medium text-gold-dark hover:text-gold transition-colors"
                  >
                    {intl.formatMessage({ id: 'auth.manageAccount' })}
                  </button>
                </div>
              </>
            ) : (
              <>
                <span
                  aria-hidden="true"
                  className={[
                    'w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold',
                    'border',
                    stats.streakDays > 0
                      ? 'bg-gold border-gold-light text-[#1a1814]'
                      : 'bg-surface-highlight border-border-subtle text-gold-dark',
                  ].join(' ')}
                >
                  📖
                </span>
                <div className="min-w-0">
                  <p className="font-display font-semibold text-text truncate">
                    {intl.formatMessage({ id: 'auth.guestReader' })}
                  </p>
                  <p className="text-xs text-text-muted">
                    {stats.streakDays > 0
                      ? `${stats.streakDays}-day streak active`
                      : 'Read daily to build streak'}
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Mini stats */}
          <div className="space-y-2.5 mb-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-text-muted">🔥 Streak</span>
              <span className="text-sm font-semibold text-text">{stats.streakDays} days</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-text-muted">📖 Total reads</span>
              <span className="text-sm font-semibold text-text">{stats.totalReads}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-text-muted">📜 Verses</span>
              <span className="text-sm font-semibold text-text">{stats.totalVerses}</span>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-text-muted">Today&apos;s goal</span>
                <span className="text-xs font-medium text-ink-2">{done}/{goal}</span>
              </div>
              <div className="h-2 rounded-full bg-surface-highlight overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500 ease-out"
                  style={{
                    width: `${pct}%`,
                    background:
                      'linear-gradient(90deg, var(--gold-dark), var(--gold), var(--gold-light))',
                  }}
                />
              </div>
            </div>
          </div>

          <hr className="border-border-subtle mb-3" />

          {/* Direct Links */}
          <div className="space-y-1">
            <Link
              href="/stats"
              className="flex items-center gap-2 text-sm text-ink-2 hover:text-gold-dark hover:bg-surface-highlight rounded-md px-2 py-1.5 transition-colors"
              onClick={() => setOpen(false)}
            >
              <BarChartIcon width={16} height={16} className="text-gold-dark" />
              <span>Statistics</span>
            </Link>
            <Link
              href="/quran/hifz"
              className="flex items-center gap-2 text-sm text-ink-2 hover:text-gold-dark hover:bg-surface-highlight rounded-md px-2 py-1.5 transition-colors"
              onClick={() => setOpen(false)}
            >
              <StarIcon width={16} height={16} className="text-gold-dark" />
              <span>Hifz Dashboard</span>
            </Link>
            <Link
              href="/settings"
              className="flex items-center gap-2 text-sm text-ink-2 hover:text-gold-dark hover:bg-surface-highlight rounded-md px-2 py-1.5 transition-colors"
              onClick={() => setOpen(false)}
            >
              <SettingsIcon width={16} height={16} className="text-gold-dark" />
              <span>Settings</span>
            </Link>
          </div>

          <hr className="border-border-subtle my-3" />

          {/* Auth actions */}
          {enabled &&
            (isSignedIn ? (
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  signOut();
                }}
                className="w-full flex items-center justify-center gap-2 text-sm font-medium text-ink-2 hover:text-red-400 hover:bg-red-500/10 rounded-md px-2 py-2 transition-colors"
              >
                <LogOutIcon width={16} height={16} />
                {intl.formatMessage({ id: 'auth.signOut' })}
              </button>
            ) : (
              <div className="space-y-2">
                <Link
                  href="/sign-in"
                  onClick={() => setOpen(false)}
                  className="w-full flex items-center justify-center gap-2 rounded-lg bg-gold text-[#1a1814] text-sm font-semibold py-2 hover:bg-gold-light transition-colors"
                >
                  <LogInIcon width={16} height={16} />
                  {intl.formatMessage({ id: 'auth.signIn' })}
                </Link>
                <Link
                  href="/sign-up"
                  onClick={() => setOpen(false)}
                  className="w-full flex items-center justify-center gap-2 rounded-lg border border-border text-sm font-medium text-ink-2 py-2 hover:bg-surface-highlight transition-colors"
                >
                  {intl.formatMessage({ id: 'auth.signUp' })}
                </Link>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
