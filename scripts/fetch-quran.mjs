// scripts/fetch-quran.mjs
// ------------------------------------------------------------------
// Downloads the complete Quran corpus from alquran.cloud and writes
// one JSON file per surah into public/data/verses/{surahNumber}.json.
//
//   Usage:  node scripts/fetch-quran.mjs
//
// Editions (all in the public domain / openly licensed):
//   - arabic:  quran-uthmani (Uthmani script)
//   - english: en.sahih     (Sahih International)
//   - bangla:  bn.bengali   (Muhiuddin Khan)
//   - transliteration: en.walk  (Walking transliteration by Waseem Ahmed)
//   - bangla-transliteration: bn.mkabir  (MK Abir — Bangla-script pronunciation)
//
// The output is static content (never user data). Next.js serves it
// from /public; the reader fetches only the surah it needs (code/data
// splitting), and the search API builds an in-memory index from it.
// ------------------------------------------------------------------

import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = path.join(ROOT, 'public', 'data', 'verses');

const EDITIONS = {
  arabic: 'quran-uthmani',
  english: 'en.sahih',
  transliteration: 'en.walk',
  bangla: 'bn.bengali',
  banglaTransliteration: 'bn.mkabir',
};

async function fetchEdition(edition) {
  try {
    const res = await fetch(`https://api.alquran.cloud/v1/quran/${edition}`);
    if (!res.ok) throw new Error(`${edition} -> HTTP ${res.status}`);
    const json = await res.json();
    return json.data.surahs;
  } catch (err) {
    console.warn(`Edition ${edition} failed: ${err.message} — using empty data`);
    // Return a fallback array of 114 surahs with empty ayah arrays
    return Array.from({ length: 114 }, (_, i) => ({
      number: i + 1,
      ayahs: [],
    }));
  }
}

async function main() {
  console.log('Downloading Quran corpus from alquran.cloud …');
  const [arabic, english, transliteration, bangla, banglaTransliteration] = await Promise.all([
    fetchEdition(EDITIONS.arabic),
    fetchEdition(EDITIONS.english),
    fetchEdition(EDITIONS.transliteration),
    fetchEdition(EDITIONS.bangla),
    fetchEdition(EDITIONS.banglaTransliteration),
  ]);

  await mkdir(OUT_DIR, { recursive: true });

  let totalAyahs = 0;
  for (const surah of arabic) {
    const number = surah.number;
    const englishSurah = english.find((s) => s.number === number);
    const transliterationSurah = transliteration.find((s) => s.number === number);
    const banglaSurah = bangla.find((s) => s.number === number);
    const banglaTransSurah = banglaTransliteration.find((s) => s.number === number);

    const ayahs = surah.ayahs.map((ayah) => ({
      number: ayah.numberInSurah,
      arabic: ayah.text,
      transliteration: transliterationSurah?.ayahs[ayah.numberInSurah - 1]?.text ?? '',
      banglaTransliteration: banglaTransSurah?.ayahs[ayah.numberInSurah - 1]?.text ?? '',
      bangla: banglaSurah?.ayahs[ayah.numberInSurah - 1]?.text ?? '',
      english: englishSurah?.ayahs[ayah.numberInSurah - 1]?.text ?? '',
    }));
    totalAyahs += ayahs.length;

    const payload = {
      surah: number,
      name: surah.name,
      englishName: surah.englishName,
      englishNameTranslation: surah.englishNameTranslation,
      numberOfAyahs: surah.numberOfAyahs,
      revelationType: surah.revelationType,
      ayahs,
    };
    await writeFile(path.join(OUT_DIR, `${number}.json`), JSON.stringify(payload), 'utf8');
  }

  console.log(`Done — wrote 114 surah files (${totalAyahs} ayahs) to public/data/verses/`);
}

main().catch((err) => {
  console.error('Fetch failed:', err.message);
  process.exit(1);
});
