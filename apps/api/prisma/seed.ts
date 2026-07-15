import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'fs';
import { join } from 'path';

const prisma = new PrismaClient();

const DATA_DIR = join(__dirname, '..', '..', '..', 'data');

function readJson<T>(filename: string): T {
  return JSON.parse(readFileSync(join(DATA_DIR, filename), 'utf-8')) as T;
}

interface LegacySurahPayload {
  data: Array<{
    number: number;
    name: string;
    englishName: string;
    englishNameTranslation: string;
    numberOfAyahs: number;
    revelationType: string;
  }>;
}

interface LegacyVersePayload {
  data: {
    surahs: Array<{
      number: number;
      ayahs: Array<{
        number: number;
        text: string;
        numberInSurah: number;
      }>;
    }>;
  };
}

async function seedSurahs() {
  console.log('Seeding surahs...');
  const surahs = readJson<LegacySurahPayload>('surahs.json');

  for (const s of surahs.data) {
    await prisma.quranSurah.upsert({
      where: { number: s.number },
      update: {},
      create: {
        number: s.number,
        name: s.name,
        englishName: s.englishName,
        englishNameTranslation: s.englishNameTranslation,
        numberOfAyahs: s.numberOfAyahs,
        revelationType: s.revelationType
      }
    });
  }
  console.log(`Seeded ${surahs.data.length} surahs`);
}

async function seedVerses() {
  console.log('Seeding verses...');
  const arabic = readJson<LegacyVersePayload>('quran-uthmani.json');
  const bangla = readJson<LegacyVersePayload>('bn.bengali.json');
  const english = readJson<LegacyVersePayload>('en.sahih.json');
  const translit = readJson<LegacyVersePayload>('en.transliteration.json');
  const bnPronRaw = readJson<Record<string, string>>('bangla_pronunciation.json');

  let count = 0;

  for (let sIdx = 0; sIdx < 114; sIdx++) {
    const arSurah = arabic.data.surahs[sIdx];
    const bnSurah = bangla.data.surahs[sIdx];
    const enSurah = english.data.surahs[sIdx];
    const trSurah = translit.data.surahs[sIdx];

    const surahNum = arSurah.number;

    for (let aIdx = 0; aIdx < arSurah.ayahs.length; aIdx++) {
      const ar = arSurah.ayahs[aIdx];
      const bn = bnSurah.ayahs[aIdx];
      const en = enSurah.ayahs[aIdx];
      const tr = trSurah.ayahs[aIdx];

      const ayahNum = ar.numberInSurah;
      const absoluteNum = ar.number;

      let bnKey = ayahNum === 1 ? `${surahNum}_1` : `${absoluteNum}_${ayahNum}`;
      let bnTranslit = bnPronRaw[bnKey] || '';

      if (surahNum === 26 && ayahNum === 1) bnTranslit = 'তা-ছিম মীম।';
      if (surahNum === 26 && ayahNum === 227) {
        bnTranslit = 'ইল্লাল্লাযীনা আ-মানূ ওয়া \'আমিলুস সালিহা-তি ওয়া যাকারুল্লা-হা কাছীরাওঁ ওয়ানতাছারূ মিম বা\'দি মা-জুলিমূ; ওয়া ছাইয়া\'লামুল্লাযীনা জলামূ আইয়া মুনকালাবিইঁ ইয়ানকালিবূ ন।';
      }

      await prisma.quranAyah.upsert({
        where: { number: absoluteNum },
        update: {},
        create: {
          number: absoluteNum,
          surahNumber: surahNum,
          ayahInSurah: ayahNum,
          arabic: ar.text,
          bangla: bn.text,
          english: en.text,
          transliteration: tr.text,
          banglaTransliteration: bnTranslit || null
        }
      });

      count++;
    }
  }

  console.log(`Seeded ${count} verses`);
}

async function main() {
  console.log('Starting Quran data seed...');
  await seedSurahs();
  await seedVerses();
  console.log('Seed complete!');
}

main()
  .catch(e => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
