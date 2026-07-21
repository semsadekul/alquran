'use client';

import Link from 'next/link';
import { Bookmark, Search, Library, BookOpen, Flame, Target } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useHifzState } from '../hooks/useHifzState';
import { useReadingStreak } from '../hooks/useReadingStreak';
import { useRouter } from 'next/navigation';
import { DailyVerse } from '@/components/DailyVerse';
import { Card } from '@/components/ui/Card';
import { Progress } from '@/components/ui/Progress';
import { cn } from '@/lib/cn';

interface LastReadData {
  surah: number;
  ayah: number;
  surahName?: string;
  arabicPreview?: string;
  numberOfAyahs?: number;
}

const DEFAULT_LAST_READ: LastReadData = {
  surah: 18,
  ayah: 1,
  surahName: 'Al-Kahf',
  arabicPreview: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
  numberOfAyahs: 110,
};

export default function HomePage() {
  const router = useRouter();
  const { state: hifzState } = useHifzState();
  const { streak, recordReading } = useReadingStreak();
  const [lastRead, setLastRead] = useState<LastReadData>(DEFAULT_LAST_READ);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('alquran_last_read');
      if (saved) {
        const parsed = JSON.parse(saved) as LastReadData;
        setLastRead({ ...DEFAULT_LAST_READ, ...parsed });
      }
    } catch {
      // Use defaults
    }
  }, []);

  // Record reading when page loads (simulating reading activity)
  useEffect(() => {
    if (lastRead.ayah > 0) {
      recordReading(lastRead.ayah);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleContinueReading = () => {
    router.push(`/quran/surahs/${lastRead.surah}#verse-${lastRead.ayah}`);
  };

  const circumference = 2 * Math.PI * 40;
  const hifzPercent = (hifzState.memorizedSurahs.length / 114) * 100;
  const strokeDashoffset =
    circumference - (hifzPercent / 100) * circumference;
  const progressPercent = lastRead.numberOfAyahs
    ? Math.round((lastRead.ayah / lastRead.numberOfAyahs) * 100)
    : 0;

  const goalPercent = streak.dailyGoal > 0
    ? Math.min(100, (streak.todayVerses / streak.dailyGoal) * 100)
    : 0;

  return (
    <div className="flex flex-col gap-6 pb-8">
      {/* Daily Verse - Hero Section */}
      <DailyVerse />

      {/* Reading Goals & Streaks Card */}
      <Card className="bg-gradient-to-br from-[#0a3622] to-[#145338] text-white border border-[#1a5e3f]/40">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <Flame size={18} className="text-[var(--color-majestic-gold)]" />
            Reading Streak
          </h3>
          <div className="flex items-center gap-1 text-sm text-white/70">
            <Target size={14} />
            <span>{streak.todayVerses}/{streak.dailyGoal} verses</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-[var(--color-majestic-gold)]">{streak.currentStreak}</div>
            <div className="text-xs text-white/60">Day Streak</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-[var(--color-majestic-gold)]">{streak.longestStreak}</div>
            <div className="text-xs text-white/60">Best Streak</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-[var(--color-majestic-gold)]">{streak.totalDaysRead}</div>
            <div className="text-xs text-white/60">Total Days</div>
          </div>
        </div>

        <Progress value={goalPercent} label="Daily Goal Progress" size="sm" />
      </Card>

      {/* Desktop 2-Column Hero Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Continue Reading Card */}
        <div
          onClick={handleContinueReading}
          className="bg-gradient-to-br from-[#0a3622] to-[#145338] rounded-2xl p-5 md:p-6 shadow-lg relative overflow-hidden border border-[#1a5e3f]/40 group cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-[1.01]"
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(197,160,89,0.08),transparent_60%)]" />
          <div className="absolute top-0 left-12 right-12 h-px bg-gradient-to-r from-transparent via-[#c5a059]/20 to-transparent" />

          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className="text-white/60 text-[10px] font-semibold uppercase tracking-[0.12em] mb-2">
                Continue Reading
              </p>
              <h2 className="text-[var(--color-majestic-gold)] text-xl font-semibold font-serif flex items-baseline gap-2">
                {lastRead.surahName}
              </h2>
              <p className="text-white/50 text-xs mt-0.5">
                Verse {lastRead.ayah}
              </p>
            </div>
            <Bookmark
              className="text-[var(--color-majestic-gold)] fill-[var(--color-majestic-gold)] drop-shadow-[0_0_8px_rgba(197,160,89,0.4)]"
              size={20}
            />
          </div>

          <div className="mt-4 relative z-10">
            <p
              dir="rtl"
              lang="ar"
              className="text-white text-right font-arabic text-xl md:text-2xl leading-loose mb-3 opacity-90"
            >
              {lastRead.arabicPreview}
            </p>

            <div className="flex items-center gap-3 mt-2">
              <div className="h-1.5 flex-1 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#c5a059] to-[#e2c275] shadow-[0_0_10px_rgba(197,160,89,0.4)] transition-all duration-1000"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <span className="text-[var(--color-majestic-gold)] text-xs font-bold tabular-nums">
                {progressPercent}%
              </span>
            </div>
          </div>
        </div>

        {/* Hifz Track Card */}
        <div className="bg-gradient-to-br from-[#c5a059] via-[#d4b06a] to-[#e2c275] rounded-2xl p-5 md:p-6 shadow-lg relative overflow-hidden border border-[#e2c275]/30">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(10,54,34,0.08),transparent_50%)]" />

          <h3 className="font-semibold text-lg text-[#2a1f0a] relative z-10">
            Hifz Track: My Memorization
          </h3>

          <div className="flex justify-between items-center mt-4 relative z-10">
            {/* Circular Progress */}
            <div className="relative w-24 h-24 flex items-center justify-center">
              <svg
                className="w-full h-full transform -rotate-90"
                viewBox="0 0 100 100"
              >
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  className="stroke-[#a8843e] opacity-25"
                  strokeWidth="8"
                  fill="none"
                  strokeLinecap="round"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  className="stroke-[#0a3622] transition-all duration-1000"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center text-[#2a1f0a]">
                <span className="text-2xl font-bold leading-none">
                  {hifzState.memorizedSurahs.length}
                </span>
                <span className="text-[8px] font-semibold text-center leading-tight opacity-70 uppercase mt-1">
                  Surahs
                  <br />
                  memorized
                </span>
              </div>
            </div>

            {/* Goal & Actions */}
            <div className="flex flex-col items-end">
              <p className="text-[#2a1f0a] font-bold text-lg">
                Surah {hifzState.currentGoalSurah}
              </p>
              <p className="text-[#2a1f0a]/60 text-xs font-medium mb-3">
                (Goal: {hifzState.dailyGoalVerses} Verses)
              </p>
              <Link
                href="/quran/hifz"
                className="bg-gradient-to-br from-[#0a3622] to-[#145338] text-white text-xs font-semibold py-2.5 px-6 rounded-full shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
              >
                Daily Revise
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2">
        <Link
          href="/quran"
          className="group bg-gradient-to-br from-[#0a3622] to-[#145338] text-white rounded-2xl p-4 md:px-6 flex items-center gap-4 h-24 md:h-28 shadow-md border border-[#1a5e3f]/30 hover:border-[var(--color-majestic-gold)]/40 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
        >
          <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-[var(--color-majestic-gold-light)] group-hover:scale-110 transition-transform duration-300 shadow-inner shrink-0">
            <BookOpen size={24} />
          </div>
          <div className="flex-1">
            <span className="block text-base md:text-lg font-semibold">
              Quran
            </span>
            <span
              className="block text-xs text-[var(--color-majestic-gold)] opacity-80 mt-0.5"
              style={{ fontFamily: 'var(--font-bengali-ui)' }}
            >
              আল-কুরআন
            </span>
          </div>
        </Link>

        <Link
          href="/search"
          className="group bg-gradient-to-br from-[#0a3622] to-[#145338] text-white rounded-2xl p-4 md:px-6 flex items-center gap-4 h-24 md:h-28 shadow-md border border-[#1a5e3f]/30 hover:border-[var(--color-majestic-gold)]/40 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
        >
          <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-[var(--color-majestic-gold-light)] group-hover:scale-110 transition-transform duration-300 shadow-inner shrink-0">
            <Search size={24} />
          </div>
          <div className="flex-1">
            <span className="block text-base md:text-lg font-semibold">
              Search
            </span>
            <span
              className="block text-xs text-[var(--color-majestic-gold)] opacity-80 mt-0.5"
              style={{ fontFamily: 'var(--font-bengali-ui)' }}
            >
              অনুসন্ধান
            </span>
          </div>
        </Link>

        <Link
          href="/library"
          className="group bg-gradient-to-br from-[#0a3622] to-[#145338] text-white rounded-2xl p-4 md:px-6 flex items-center gap-4 h-24 md:h-28 shadow-md border border-[#1a5e3f]/30 hover:border-[var(--color-majestic-gold)]/40 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
        >
          <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-[var(--color-majestic-gold-light)] group-hover:scale-110 transition-transform duration-300 shadow-inner shrink-0">
            <Library size={24} />
          </div>
          <div className="flex-1">
            <span className="block text-base md:text-lg font-semibold">
              Library
            </span>
            <span
              className="block text-xs text-[var(--color-majestic-gold)] opacity-80 mt-0.5"
              style={{ fontFamily: 'var(--font-bengali-ui)' }}
            >
              লাইব্রেরি
            </span>
          </div>
        </Link>
      </div>
    </div>
  );
}
