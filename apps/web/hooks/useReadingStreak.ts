'use client';

import { useState, useCallback, useEffect } from 'react';

export interface ReadingStreak {
  currentStreak: number;
  longestStreak: number;
  lastReadDate: string;
  totalDaysRead: number;
  dailyGoal: number;
  todayVerses: number;
}

const STORAGE_KEY = 'alquran_reading_streak';

function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0];
}

function daysBetween(date1: string, date2: string): number {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return Math.ceil((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
}

export function useReadingStreak() {
  const [streak, setStreak] = useState<ReadingStreak>({
    currentStreak: 0,
    longestStreak: 0,
    lastReadDate: '',
    totalDaysRead: 0,
    dailyGoal: 10,
    todayVerses: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as ReadingStreak;
        const today = getTodayDateString();

        // Reset today's count if it's a new day
        if (parsed.lastReadDate !== today) {
          parsed.todayVerses = 0;
        }

        setStreak(parsed);
      }
    } catch (error) {
      console.error('Error loading reading streak:', error);
    }
    setLoading(false);
  }, []);

  const saveStreak = useCallback((newStreak: ReadingStreak) => {
    setStreak(newStreak);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newStreak));
  }, []);

  const recordReading = useCallback((verseCount: number = 1) => {
    setStreak((prev) => {
      const today = getTodayDateString();
      let newStreak = { ...prev };

      if (prev.lastReadDate === today) {
        // Already read today, just increment count
        newStreak.todayVerses = prev.todayVerses + verseCount;
      } else {
        const daysDiff = prev.lastReadDate
          ? daysBetween(prev.lastReadDate, today)
          : 999;

        if (daysDiff <= 1) {
          // Consecutive day
          newStreak.currentStreak = prev.currentStreak + 1;
        } else if (daysDiff > 1) {
          // Streak broken
          newStreak.currentStreak = 1;
        } else {
          // First time reading
          newStreak.currentStreak = 1;
        }

        newStreak.lastReadDate = today;
        newStreak.todayVerses = verseCount;
        newStreak.totalDaysRead = prev.totalDaysRead + 1;
      }

      newStreak.longestStreak = Math.max(newStreak.longestStreak, newStreak.currentStreak);

      saveStreak(newStreak);
      return newStreak;
    });
  }, [saveStreak]);

  const setDailyGoal = useCallback((goal: number) => {
    setStreak((prev) => {
      const newStreak = { ...prev, dailyGoal: goal };
      saveStreak(newStreak);
      return newStreak;
    });
  }, [saveStreak]);

  return { streak, recordReading, setDailyGoal, loading };
}
