'use client';

import { useState, useEffect } from 'react';
import { useIntl } from 'react-intl';
import Link from 'next/link';
import { Card } from './Card';
import { Button } from './Button';

interface DailyAyah {
  arabic: string;
  bangla: string;
  english: string;
  surah: string;
  ayah: number;
}

const DAILY_AYAHS: DailyAyah[] = [
  {
    arabic: 'إِنَّ مَعَ الْعُسْرِ يُسْرًا',
    bangla: 'নিশ্চয়ই কষ্টের সাথেই স্বস্তি আছে',
    english: 'Indeed, with hardship comes ease.',
    surah: 'Ash-Sharh',
    ayah: 6,
  },
  {
    arabic: 'فَإِنَّ مَعَ الْعُسْرِ يُسْرًا',
    bangla: 'নিশ্চয়ই কষ্টের সাথেই স্বস্তি আছে',
    english: 'Indeed, with hardship comes ease.',
    surah: 'Ash-Sharh',
    ayah: 5,
  },
  {
    arabic: 'وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ',
    bangla: 'যে ব্যক্তি আল্লাহর উপর ভরসা করে, তার জন্য আল্লাহই যথেষ্ট',
    english: 'And whoever relies upon Allah - then He is sufficient for him.',
    surah: 'At-Talaq',
    ayah: 3,
  },
  {
    arabic: 'إِنَّ اللّهَ مَعَ الصَّابِرِينَ',
    bangla: 'নিশ্চয়ই আল্লাহ ধৈর্যশীলদের সাথে আছেন',
    english: 'Indeed, Allah is with the patient.',
    surah: 'Al-Baqarah',
    ayah: 153,
  },
  {
    arabic: 'وَهُوَ مَعَكُمْ أَيْنَ مَا كُنتُمْ',
    bangla: 'তোমরা যেক্ষানেই থাক না কেন তিনি তোমাদের সাথে আছেন',
    english: 'And He is with you wherever you are.',
    surah: 'Al-Hadid',
    ayah: 4,
  },
  {
    arabic: 'رَبَّنَا أَفْرِغْ عَلَيْنَا صَبْرًا وَثَبِّتْ أَقْدَامَنَا',
    bangla: 'হে আমাদের রব! আমাদের উপর ধৈর্য ঢেলে দিন এবং আমাদের পা স্থির রাখুন',
    english: 'Our Lord, pour upon us patience and plant firmly our feet.',
    surah: 'Al-Baqarah',
    ayah: 250,
  },
];

export function DailyAyah() {
  const intl = useIntl();
  const [index, setIndex] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const dayOfYear = Math.floor(
      (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) /
        (1000 * 60 * 60 * 24)
    );
    setIndex(dayOfYear % DAILY_AYAHS.length);
  }, []);

  if (!mounted) return null;

  const ayah = DAILY_AYAHS[index];

  return (
    <Card
      variant="hero"
      className="relative overflow-hidden mb-6"
    >
      {/* Decorative pattern */}
      <div className="absolute inset-0 opacity-[0.06] islamic-pattern" />

      {/* Content */}
      <div className="relative z-10 p-6 md:p-8 text-center">
        {/* Label */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-dark/20 text-gold-dark text-xs font-medium mb-5">
          {intl.formatMessage({ id: 'home.dailyAyah.label' })}
        </div>

        {/* Arabic */}
        <p
          dir="rtl"
          lang="ar"
          className="text-2xl md:text-4xl font-arabic text-gold-dark leading-loose mb-4"
        >
          {ayah.arabic}
        </p>

        {/* Bangla */}
        <p
          className="text-text/90 text-base md:text-lg mb-2"
          style={{ fontFamily: 'var(--font-bengali-ui)' }}
        >
          {ayah.bangla}
        </p>

        {/* English */}
        <p className="text-text-muted text-sm italic mb-4">
          &quot;{ayah.english}&quot;
        </p>

        {/* Reference */}
        <p className="text-text-muted text-xs uppercase tracking-widest mb-5">
          — {ayah.surah} · {ayah.ayah}
        </p>

        {/* Actions */}
        <div className="flex items-center justify-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIndex((i) => (i + 1) % DAILY_AYAHS.length)}
            className="bg-gold-dark/10 border-border-subtle text-text hover:bg-gold-dark/20"
          >
            🔄 {intl.formatMessage({ id: 'dailyAyah.another' })}
          </Button>
          <Link href="/search">
            <Button
              variant="outline"
              size="sm"
              className="bg-gold-dark/10 border-border-subtle text-text hover:bg-gold-dark/20"
            >
              📖 {intl.formatMessage({ id: 'dailyAyah.readMore' })}
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
}
