import { readFileSync } from 'node:fs';
import { join } from 'node:path';

export interface SurahMeta {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: string;
}

interface LegacySurahPayload {
  code: number;
  status: string;
  data: SurahMeta[];
}

const DATA_DIR = join(process.cwd(), '..', '..', 'data');

function readJsonFile<T>(filename: string): T {
  const filePath = join(DATA_DIR, filename);
  const raw = readFileSync(filePath, 'utf-8');
  return JSON.parse(raw) as T;
}

export function getSurahs(): SurahMeta[] {
  const payload = readJsonFile<LegacySurahPayload>('surahs.json');
  return payload.data;
}

export function getSurahByNumber(number: number): SurahMeta | undefined {
  return getSurahs().find(s => s.number === number);
}

export interface AyahRecord {
  number: number;
  surah: number;
  ayah: number;
  arabic: string;
  bangla: string;
  english: string;
  transliteration: string;
  banglaTransliteration?: string;
  urdu?: string;
}

interface LegacyVerseSource {
  data: {
    surahs: Array<{
      number: number;
      name: string;
      englishName: string;
      englishNameTranslation: string;
      revelationType: string;
      ayahs: Array<{
        number: number;
        text: string;
        numberInSurah: number;
        juz: number;
        manzil: number;
        page: number;
        ruku: number;
        hizbQuarter: number;
      }>;
    }>;
  };
}

function loadSurahVerses(surahNumber: number): AyahRecord[] {
  const arabic = readJsonFile<LegacyVerseSource>('quran-uthmani.json');
  const bangla = readJsonFile<LegacyVerseSource>('bn.bengali.json');
  const english = readJsonFile<LegacyVerseSource>('en.sahih.json');
  const translit = readJsonFile<LegacyVerseSource>('en.transliteration.json');
  const bnPronRaw = readJsonFile<Record<string, string>>('bangla_pronunciation.json');

  // Load Urdu translation (optional - may not exist)
  let urduSurahs: Array<{ number: number; ayahs: Array<{ number: number; text: string; numberInSurah: number }> }> | null = null;
  try {
    const urduData = readJsonFile<LegacyVerseSource>('ur.urd.json');
    urduSurahs = urduData.data.surahs;
  } catch {
    // Urdu translation not available
  }

  const arSurah = arabic.data.surahs[surahNumber - 1];
  const bnSurah = bangla.data.surahs[surahNumber - 1];
  const enSurah = english.data.surahs[surahNumber - 1];
  const trSurah = translit.data.surahs[surahNumber - 1];
  const urSurah = urduSurahs?.[surahNumber - 1];

  if (!arSurah || !bnSurah || !enSurah || !trSurah) return [];

  const records: AyahRecord[] = [];
  for (let i = 0; i < arSurah.ayahs.length; i++) {
    const ar = arSurah.ayahs[i];
    const bn = bnSurah.ayahs[i];
    const en = enSurah.ayahs[i];
    const tr = trSurah.ayahs[i];
    const ur = urSurah?.ayahs[i];

    const ayahNum = ar.numberInSurah;
    const absoluteNum = ar.number;

    let bnKey = ayahNum === 1 ? `${surahNumber}_1` : `${absoluteNum}_${ayahNum}`;
    let bnTranslit = bnPronRaw[bnKey] || '';

    // Legacy hardcoded fixes
    if (surahNumber === 26 && ayahNum === 1) {
      bnTranslit = 'তא-ছিম মীম।';
    } else if (surahNumber === 26 && ayahNum === 227) {
      bnTranslit = 'ইল্লাল্লাযীনা আ-মানূ ওয\'আমিলুস সালিহা-তি ওয\'আকিরুল্লَا-হা কাছীরাওঁ ওয\'আনতাছারূ মিম বা\'দি মَا-জুলিমূ; ওয\'আছাইয\'আলামুল্লَاযীনা জালামূ আইয\'আ মুনকালাবিইঁ ইয\'আনকালিবূ ন।';
    }

    records.push({
      number: absoluteNum,
      surah: surahNumber,
      ayah: ayahNum,
      arabic: ar.text,
      bangla: bn.text,
      english: en.text,
      transliteration: tr.text,
      banglaTransliteration: bnTranslit,
      urdu: ur?.text || '',
    });
  }

  return records;
}

// Cache per-surge since this is static data
const surahVersesCache = new Map<number, AyahRecord[]>();

export function getVersesBySurah(surahNumber: number): AyahRecord[] {
  const cached = surahVersesCache.get(surahNumber);
  if (cached) return cached;
  const verses = loadSurahVerses(surahNumber);
  surahVersesCache.set(surahNumber, verses);
  return verses;
}
