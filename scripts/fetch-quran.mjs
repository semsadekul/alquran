// scripts/fetch-quran.mjs
// ------------------------------------------------------------------
// Downloads the Quran corpus from alquran.cloud and writes one JSON
// file per surah into public/data/verses/{surahNumber}.json, plus a
// manifest (public/data/verses-manifest.json) recording the editions,
// retrieval date, ayah counts and a checksum of the corpus.
//
//   Usage:  node scripts/fetch-quran.mjs
//
// Editions:
//   - arabic:  quran-uthmani (Uthmani script)
//   - bangla:  bn.bengali    (Muhiuddin Khan)
//   - english: en.sahih      (Sahih International)
//
// Licensing of these editions has NOT been confirmed in writing — see the
// About/credits work before monetising. Do not describe them as public domain.
//
// The script is strict by design: any HTTP failure, missing surah or empty
// ayah field aborts the run instead of silently publishing blank text.
// ------------------------------------------------------------------

import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import {
  CORPUS_DIR,
  EDITIONS,
  TOTAL_AYAHS,
  TOTAL_SURAHS,
  normalizeText,
  writeManifest,
} from './corpus-utils.mjs';

async function fetchEdition(edition) {
  const url = `https://api.alquran.cloud/v1/quran/${edition}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${edition} -> HTTP ${res.status}`);
  const json = await res.json();
  const surahs = json?.data?.surahs;
  if (!Array.isArray(surahs) || surahs.length !== TOTAL_SURAHS) {
    throw new Error(`${edition} -> unexpected payload (expected ${TOTAL_SURAHS} surahs)`);
  }
  return surahs;
}

function requireText(value, where) {
  const text = normalizeText(value).trim();
  if (!text) throw new Error(`Empty text at ${where}`);
  return text;
}

async function fetchBengaliPronunciation() {
  const url = 'https://raw.githubusercontent.com/Khalidhassan3011/al_quran/main/lib/src/data/full_quran_data.dart';
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Bengali pronunciation -> HTTP ${res.status}`);
  const text = await res.text();
  const startIdx = text.indexOf('[');
  const endIdx = text.lastIndexOf(']');
  const jsonStr = text.slice(startIdx, endIdx + 1).replace(/,\s*([\]}])/g, '$1');
  const surahs = JSON.parse(jsonStr);
  if (!Array.isArray(surahs) || surahs.length !== TOTAL_SURAHS) {
    throw new Error(`Bengali pronunciation -> unexpected payload (expected ${TOTAL_SURAHS} surahs)`);
  }
  return surahs;
}

async function main() {
  console.log('Downloading Quran corpus from alquran.cloud and pronunciation sources …');
  const [arabic, bangla, english, transliteration, banglaPronunciation] = await Promise.all([
    fetchEdition(EDITIONS.arabic),
    fetchEdition(EDITIONS.bangla),
    fetchEdition(EDITIONS.english),
    fetchEdition(EDITIONS.transliteration),
    fetchBengaliPronunciation(),
  ]);

  await mkdir(CORPUS_DIR, { recursive: true });

  const written = [];
  let totalAyahs = 0;

  for (const surah of arabic) {
    const number = surah.number;
    const banglaSurah = bangla.find((s) => s.number === number);
    const englishSurah = english.find((s) => s.number === number);
    const translitSurah = transliteration.find((s) => s.number === number);
    const bnPronSurah = banglaPronunciation.find((s) => s.number === number);

    if (!banglaSurah || !englishSurah || !translitSurah || !bnPronSurah) {
      throw new Error(`Surah ${number} missing from an edition`);
    }
    if (
      banglaSurah.ayahs.length !== surah.ayahs.length ||
      englishSurah.ayahs.length !== surah.ayahs.length ||
      translitSurah.ayahs.length !== surah.ayahs.length ||
      bnPronSurah.ayahs.length !== surah.ayahs.length
    ) {
      throw new Error(`Surah ${number} has mismatched ayah counts across editions`);
    }

    const ayahs = surah.ayahs.map((ayah, index) => ({
      number: ayah.numberInSurah,
      arabic: requireText(ayah.text, `${number}:${ayah.numberInSurah} arabic`),
      transliteration: requireText(translitSurah.ayahs[index]?.text, `${number}:${ayah.numberInSurah} transliteration`),
      banglaTransliteration: requireText(bnPronSurah.ayahs[index]?.pronunciation_bn, `${number}:${ayah.numberInSurah} bangla pronunciation`),
      bangla: requireText(banglaSurah.ayahs[index]?.text, `${number}:${ayah.numberInSurah} bangla`),
      english: requireText(englishSurah.ayahs[index]?.text, `${number}:${ayah.numberInSurah} english`),
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
    const raw = JSON.stringify(payload);
    await writeFile(path.join(CORPUS_DIR, `${number}.json`), raw, 'utf8');
    written.push({ data: payload });
  }

  if (totalAyahs !== TOTAL_AYAHS) {
    throw new Error(`Expected ${TOTAL_AYAHS} ayahs, got ${totalAyahs}`);
  }

  const manifest = await writeManifest(written);
  console.log(
    `Done — wrote ${written.length} surah files (${totalAyahs} ayahs) and the manifest ` +
      `(corpus ${manifest.corpusHash.slice(0, 12)}).`
  );
}

main().catch((err) => {
  console.error(`Fetch failed: ${err.message}`);
  process.exit(1);
});
