export interface Surah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  banglaName?: string;
  numberOfAyahs: number;
  revelationType: 'Meccan' | 'Medinan';
}

export interface Ayah {
  number: number;          // absolute verse number across entire Quran
  surah: number;
  ayah: number;            // verse number within surah
  arabic: string;
  bangla: string;
  english: string;
  transliteration: string;
  banglaTransliteration?: string;
  urdu?: string;
  juz?: number;
  page?: number;
  hizbQuarter?: number;
}

export interface Bookmark {
  id: string;
  surah: number;
  ayah: number;
  surahName: string;
  textPreview: string;
  timestamp: number;
}

export interface ReadingPosition {
  surah: number;
  ayah: number;
  surahName: string;
  timestamp: number;
  scrollY?: number;
  arabicPreview?: string;
  numberOfAyahs?: number;
}

export interface ReaderPreferences {
  theme: 'dark' | 'light' | 'system';
  arabicFontSize: number;       // px value, default 38
  banglaFontSize: number;       // px value, default 16
  englishFontSize: number;      // px value, default 15
  showArabic: boolean;
  showBangla: boolean;
  showEnglish: boolean;
  showUrdu: boolean;
  showTransliteration: boolean;
  showBanglaTransliteration: boolean;
  lineSpacing: 'compact' | 'normal' | 'spacious';
  readingMode: 'translation' | 'arabic-only' | 'study';
}

export interface AudioState {
  isPlaying: boolean;
  currentSurah: number | null;
  currentAyah: number | null;
  reciter: string;
  volume: number;
  playbackRate: number;
  repeatMode: 'none' | 'ayah' | 'range' | 'surah';
}

export interface HifzSession {
  surah: number;
  startAyah: number;
  endAyah: number;
  repeatCount: number;
  delayBetweenRepeats: number;    // milliseconds
  hiddenLayers: ('arabic' | 'bangla' | 'english' | 'transliteration')[];
  completedAyahs: number[];
}

export interface DailyVerse {
  surah: number;
  ayah: number;
  arabic: string;
  bangla: string;
  english: string;
  date: string;                    // ISO date string
}

export interface ReadingStreak {
  currentStreak: number;
  longestStreak: number;
  lastReadDate: string;            // ISO date string
  totalDaysRead: number;
}
