/**
 * Juz (Para) data for the 30 divisions of the Quran.
 * Each juz contains the starting surah and ayah.
 */

export interface JuzInfo {
  number: number;
  nameEn: string;
  nameBn: string;
  startSurah: number;
  startAyah: number;
  endSurah: number;
  endAyah: number;
}

export const JUZ_DATA: JuzInfo[] = [
  { number: 1, nameEn: 'Alif Lam Mim', nameBn: 'আলিফ লাম মীম', startSurah: 1, startAyah: 1, endSurah: 2, endAyah: 141 },
  { number: 2, nameEn: 'Sayaqool', nameBn: 'সাইয়াকূলু', startSurah: 2, startAyah: 142, endSurah: 2, endAyah: 252 },
  { number: 3, nameEn: 'Tilkar Rusul', nameBn: 'তিলকার রুসুল', startSurah: 2, startAyah: 253, endSurah: 3, endAyah: 92 },
  { number: 4, nameEn: 'Lan Tanaloo', nameBn: 'লান তানালূ', startSurah: 3, startAyah: 93, endSurah: 4, endAyah: 23 },
  { number: 5, nameEn: 'Wal Muhsanat', nameBn: 'ওয়াল মুহসানাত', startSurah: 4, startAyah: 24, endSurah: 4, endAyah: 147 },
  { number: 6, nameEn: 'La Yuhibbullah', nameBn: 'লা ইউহিব্বুল্লাহ', startSurah: 4, startAyah: 148, endSurah: 5, endAyah: 81 },
  { number: 7, nameEn: 'Wa Idha Samiu', nameBn: 'ওয়া ইযা সমিউ', startSurah: 5, startAyah: 82, endSurah: 6, endAyah: 110 },
  { number: 8, nameEn: 'Wa Lau Annana', nameBn: 'ওয়া লাউ আন্নানা', startSurah: 6, startAyah: 111, endSurah: 7, endAyah: 87 },
  { number: 9, nameEn: 'Qalal Malao', nameBn: 'ক্বালাল মালাউ', startSurah: 7, startAyah: 88, endSurah: 8, endAyah: 40 },
  { number: 10, nameEn: 'Walamu', nameBn: 'ওয়ালামু', startSurah: 8, startAyah: 41, endSurah: 9, endAyah: 92 },
  { number: 11, nameEn: 'Yatazeroon', nameBn: 'ইাতাযিরূন', startSurah: 9, startAyah: 93, endSurah: 11, endAyah: 5 },
  { number: 12, nameEn: 'Wama Min Dabbatin', nameBn: 'ওয়া মা মিন দাব্বাতিন', startSurah: 11, startAyah: 6, endSurah: 12, endAyah: 52 },
  { number: 13, nameEn: 'Wa Ma Ubarriu', nameBn: 'ওয়া মা উবাররিউ', startSurah: 12, startAyah: 53, endSurah: 14, endAyah: 52 },
  { number: 14, nameEn: 'Rubama', nameBn: 'রুবামা', startSurah: 15, startAyah: 1, endSurah: 16, endAyah: 128 },
  { number: 15, nameEn: 'Subhanallazi', nameBn: 'সুবহানাল্লাযী', startSurah: 17, startAyah: 1, endSurah: 18, endAyah: 74 },
  { number: 16, nameEn: 'Alam Yakn', nameBn: 'আলাম ইয়াকুন', startSurah: 18, startAyah: 75, endSurah: 20, endAyah: 135 },
  { number: 17, nameEn: 'Iqtaraba Lin Nas', nameBn: 'ইকতারাবা লিন্নাস', startSurah: 21, startAyah: 1, endSurah: 22, endAyah: 78 },
  { number: 18, nameEn: 'Qad Aflaha', nameBn: 'ক্বাদ আফলাহা', startSurah: 23, startAyah: 1, endSurah: 25, endAyah: 20 },
  { number: 19, nameEn: 'Wa Qalallazina', nameBn: 'ওয়া ক্বালalলাযীনা', startSurah: 25, startAyah: 21, endSurah: 27, endAyah: 55 },
  { number: 20, nameEn: 'Aman Khalaqa', nameBn: 'আমান খালাকা', startSurah: 27, startAyah: 56, endSurah: 29, endAyah: 45 },
  { number: 21, nameEn: 'Utlu Ma Uhiya', nameBn: 'উতলু মা উহিইয়া', startSurah: 29, startAyah: 46, endSurah: 33, endAyah: 30 },
  { number: 22, nameEn: 'Wa May Yaqnut', nameBn: 'ওয়া মাই ইয়াকনুত', startSurah: 33, startAyah: 31, endSurah: 36, endAyah: 27 },
  { number: 23, nameEn: 'Wa Ma Li', nameBn: 'ওয়া মা লি', startSurah: 36, startAyah: 28, endSurah: 39, endAyah: 31 },
  { number: 24, nameEn: 'Faman Azlamu', nameBn: 'ফা মান আজলামু', startSurah: 39, startAyah: 32, endSurah: 41, endAyah: 46 },
  { number: 25, nameEn: 'Alaiha Musalliqoon', nameBn: 'আলাইহা মুসাল্লিকূন', startSurah: 41, startAyah: 47, endSurah: 45, endAyah: 37 },
  { number: 26, nameEn: 'Ha Mim', nameBn: 'হা মীম', startSurah: 46, startAyah: 1, endSurah: 51, endAyah: 30 },
  { number: 27, nameEn: 'Qala Fama Khatbukum', nameBn: 'ক্বালা ফামা খাতবুকুম', startSurah: 51, startAyah: 31, endSurah: 57, endAyah: 29 },
  { number: 28, nameEn: 'Qad Sami Allahu', nameBn: 'ক্বাদ সামি আল্লাহু', startSurah: 58, startAyah: 1, endSurah: 66, endAyah: 12 },
  { number: 29, nameEn: 'Tabarakallazi', nameBn: 'তাবারাকাল্লাযী', startSurah: 67, startAyah: 1, endSurah: 77, endAyah: 50 },
  { number: 30, nameEn: 'Amma', nameBn: 'আম্মা', startSurah: 78, startAyah: 1, endSurah: 114, endAyah: 6 },
];

export function getJuzStart(juzNumber: number): { surah: number; ayah: number } | null {
  const juz = JUZ_DATA.find(j => j.number === juzNumber);
  return juz ? { surah: juz.startSurah, ayah: juz.startAyah } : null;
}

export function getJuzForVerse(surah: number, ayah: number): number {
  // This is a simplified lookup - in production, you'd use the actual juz data from the Quran JSON
  // For now, we'll use a mapping based on common knowledge
  const juzMap: [number, number, number][] = [
    [1, 1, 1], [2, 142, 1], [3, 253, 1], [4, 93, 1], [5, 24, 1],
    [6, 148, 1], [7, 82, 1], [8, 111, 1], [9, 88, 1], [10, 41, 1],
    [11, 93, 1], [12, 6, 1], [13, 53, 1], [14, 1, 15], [15, 1, 17],
    [16, 75, 1], [17, 1, 21], [18, 1, 23], [19, 21, 25], [20, 56, 27],
    [21, 46, 29], [22, 31, 33], [23, 28, 36], [24, 32, 39], [25, 47, 41],
    [26, 1, 46], [27, 31, 51], [28, 1, 58], [29, 1, 67], [30, 1, 78],
  ];

  // Simplified: return juz based on surah number ranges
  if (surah <= 2) {
    if (surah === 1) return 1;
    if (ayah <= 141) return 1;
    if (ayah <= 252) return 2;
    return 3;
  }
  if (surah <= 4) {
    if (ayah <= 23) return 4;
    if (ayah <= 147) return 5;
    return 6;
  }
  // For a complete implementation, we'd need the actual juz mapping per verse
  // This is a placeholder that returns an estimated juz
  return Math.min(30, Math.max(1, Math.ceil(surah / 4)));
}
