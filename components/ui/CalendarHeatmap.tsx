'use client';

import { useState, useEffect } from 'react';
import { Card } from './Card';

interface ActivityDay {
  date: string;
  count: number;
}

interface HeatmapProps {
  weeks?: number;
}

export function CalendarHeatmap({ weeks = 26 }: HeatmapProps) {
  const [days, setDays] = useState<ActivityDay[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Load reading stats from localStorage
    let activity: Record<string, number> = {};
    try {
      const stored = localStorage.getItem('alquran_reading_stats');
      if (stored) {
        const parsed = JSON.parse(stored);
        activity = parsed.activity || {};
      }
    } catch {
      activity = {};
    }
    setDays(buildDays(activity, weeks));
  }, [weeks]);

  if (!mounted) return null;

  // Calculate grid columns
  const totalDays = weeks * 7;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Group by weeks (columns)
  const weeksData: ActivityDay[][] = [];
  for (let w = 0; w < weeks; w++) {
    const column: ActivityDay[] = [];
    for (let d = 0; d < 7; d++) {
      const date = new Date(today);
      date.setDate(date.getDate() - (totalDays - 1 - w * 7 - d));
      const key = date.toISOString().split('T')[0];
      const day = days.find((x) => x.date === key);
      column.push(day || { date: key, count: 0 });
    }
    weeksData.push(column);
  }

  const maxCount = Math.max(1, ...days.map((d) => d.count));
  const activeDays = days.filter((d) => d.count > 0).length;
  const totalReads = days.reduce((sum, d) => sum + d.count, 0);

  return (
    <Card variant="elevated" className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-text">Reading Activity</h3>
          <p className="text-sm text-text/70">
            {activeDays} active days · {totalReads} verses
          </p>
        </div>
        {/* Legend */}
        <div className="flex items-center gap-1.5 text-[10px] text-text/60">
          <span>Less</span>
          {[0, 1, 2, 3, 4].map((level) => (
            <span
              key={level}
              className="w-2.5 h-2.5 rounded-[3px]"
              style={{
                backgroundColor:
                  level === 0
                    ? 'var(--surface-highlight)'
                    : `rgba(184, 150, 74, ${0.25 + level * 0.18})`,
              }}
            />
          ))}
          <span>More</span>
        </div>
      </div>

      {/* Heatmap grid */}
      <div className="overflow-x-auto pb-2">
        <div className="flex gap-1 min-w-max">
          {weeksData.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-1">
              {week.map((day, di) => {
                const level =
                  day.count === 0
                    ? 0
                    : Math.ceil((day.count / maxCount) * 4);
                const isToday =
                  day.date === today.toISOString().split('T')[0];
                return (
                  <div
                    key={`${wi}-${di}`}
                    title={`${day.date}: ${day.count} ${
                      day.count === 1 ? 'verse' : 'verses'
                    }`}
                    className={`w-3 h-3 rounded-[3px] transition-transform hover:scale-125 ${
                      isToday ? 'ring-2 ring-primary/50' : ''
                    }`}
                    style={{
                      backgroundColor:
                        level === 0
                          ? 'var(--surface-highlight)'
                          : `rgba(184, 150, 74, ${0.25 + level * 0.18})`,
                    }}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Day labels */}
      <div className="flex gap-1 mt-1 min-w-max text-[10px] text-text/50">
        <div className="flex flex-col gap-1 mr-1">
          {['M', 'W', 'F', 'S'].map((label, i) => (
            <span key={i} className="h-3 leading-3">
              {label}
            </span>
          ))}
        </div>
      </div>
    </Card>
  );
}

function buildDays(activity: Record<string, number>, weeks: number): ActivityDay[] {
  const totalDays = weeks * 7;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const result: ActivityDay[] = [];
  for (let i = 0; i < totalDays; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const key = date.toISOString().split('T')[0];
    result.push({ date: key, count: activity[key] || 0 });
  }
  return result;
}
