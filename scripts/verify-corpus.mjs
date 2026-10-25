// scripts/verify-corpus.mjs
// ------------------------------------------------------------------
// Build gate for the Quran corpus. Fails (non-zero exit) on any defect,
// so a corrupted or half-downloaded corpus can never ship.
//
//   node scripts/verify-corpus.mjs              # local checks + manifest
//   node scripts/verify-corpus.mjs --remote     # + letter-by-letter diff
//                                               #   against quran-uthmani
//   node scripts/verify-corpus.mjs --write-manifest
//
// `--remote` compares every ayah's Arabic, letter by letter, with the named
// reference edition (alquran.cloud quran-uthmani) and reports the first
// mismatches. Run it before a release; the default run needs no network.
// ------------------------------------------------------------------

import {
  EDITIONS,
  MANIFEST_PATH,
  TOTAL_AYAHS,
  TOTAL_SURAHS,
  computeCorpusHash,
  normalizeText,
  readCorpus,
  readManifest,
  readMetadataAyahCounts,
  writeManifest,
} from './corpus-utils.mjs';

const args = new Set(process.argv.slice(2));
const remote = args.has('--remote');
const writeManifestFlag = args.has('--write-manifest');

const problems = [];
const fail = (message) => problems.push(message);
const BAD_CHARS = /[\uFEFF\u200B\u200E\u200F\u00A0]|[\u0000-\u0008\u000B\u000C\u000E-\u001F]/;

function checkText(value, where) {
  if (typeof value !== 'string' || !value.trim()) {
    fail(`${where}: empty or missing text`);
    return;
  }
  if (BAD_CHARS.test(value)) {
    fail(`${where}: contains a byte-order mark, zero-width or control character`);
  }
}

async function localChecks() {
  const entries = await readCorpus();

  if (entries.length !== TOTAL_SURAHS) {
    fail(`expected ${TOTAL_SURAHS} surah files, found ${entries.length}`);
  }

  const metadata = await readMetadataAyahCounts();
  if (metadata.size !== TOTAL_SURAHS) {
    fail(`lib/data/quran.ts declares ${metadata.size} surahs, expected ${TOTAL_SURAHS}`);
  }

  let total = 0;
  for (const [index, { file, data }] of entries.entries()) {
    const expectedNumber = index + 1;
    if (!/^\d+\.json$/.test(file) || Number(file.replace('.json', '')) !== expectedNumber) {
      fail(`${file}: unexpected filename for surah ${expectedNumber}`);
    }
    if (data.surah !== expectedNumber) {
      fail(`${file}: declares surah ${data.surah}, expected ${expectedNumber}`);
    }

    const ayahs = data.ayahs;
    if (!Array.isArray(ayahs) || ayahs.length === 0) {
      fail(`${file}: missing ayah array`);
      continue;
    }

    const metadataCount = metadata.get(expectedNumber);
    if (metadataCount !== undefined && metadataCount !== ayahs.length) {
      fail(`${file}: ${ayahs.length} ayahs, metadata declares ${metadataCount}`);
    }
    if (data.numberOfAyahs !== undefined && data.numberOfAyahs !== ayahs.length) {
      fail(`${file}: numberOfAyahs ${data.numberOfAyahs} but ${ayahs.length} ayahs present`);
    }

    for (const [ayahIndex, ayah] of ayahs.entries()) {
      const where = `${expectedNumber}:${ayahIndex + 1}`;
      if (ayah.number !== ayahIndex + 1) {
        fail(`${where}: ayah number is ${ayah.number}, expected ${ayahIndex + 1}`);
      }
      checkText(ayah.arabic, `${where} arabic`);
      checkText(ayah.bangla, `${where} bangla`);
      checkText(ayah.english, `${where} english`);
    }
    total += ayahs.length;
  }

  if (total !== TOTAL_AYAHS) fail(`expected ${TOTAL_AYAHS} ayahs, counted ${total}`);

  const manifest = await readManifest();
  if (writeManifestFlag) {
    const written = await writeManifest(entries);
    console.log(`Wrote ${MANIFEST_PATH} (corpus ${written.corpusHash.slice(0, 12)}).`);
  } else if (!manifest) {
    fail('public/data/verses-manifest.json is missing — run `node scripts/fetch-quran.mjs`');
  } else {
    const hash = computeCorpusHash(entries);
    if (manifest.corpusHash !== hash) {
      fail(
        `corpus checksum ${hash.slice(0, 12)} does not match the manifest ` +
          `${String(manifest.corpusHash).slice(0, 12)} — regenerate the corpus and manifest`
      );
    }
    if (manifest.ayahCount !== total) {
      fail(`manifest declares ${manifest.ayahCount} ayahs, corpus has ${total}`);
    }
    if (manifest.surahCount !== entries.length) {
      fail(`manifest declares ${manifest.surahCount} surahs, corpus has ${entries.length}`);
    }
    const editions = manifest.editions ?? {};
    for (const [key, value] of Object.entries(EDITIONS)) {
      if (editions[key] !== value) {
        fail(`manifest edition "${key}" is ${editions[key] ?? 'missing'}, expected ${value}`);
      }
    }
  }

  return entries;
}

async function remoteChecks(entries) {
  console.log(`Comparing every ayah with ${EDITIONS.arabic} …`);
  const res = await fetch(`https://api.alquran.cloud/v1/quran/${EDITIONS.arabic}`);
  if (!res.ok) {
    fail(`reference fetch failed: HTTP ${res.status}`);
    return;
  }
  const reference = (await res.json())?.data?.surahs;
  if (!Array.isArray(reference)) {
    fail('reference edition returned no surahs');
    return;
  }

  let compared = 0;
  let mismatches = 0;
  for (const { data } of entries) {
    const refSurah = reference.find((s) => s.number === data.surah);
    if (!refSurah) {
      fail(`surah ${data.surah} missing from the reference edition`);
      continue;
    }
    if (refSurah.ayahs.length !== data.ayahs.length) {
      fail(`surah ${data.surah}: ayah count differs from the reference`);
      continue;
    }
    for (const [index, ayah] of data.ayahs.entries()) {
      const expected = normalizeText(refSurah.ayahs[index].text);
      const actual = normalizeText(ayah.arabic);
      compared += 1;
      if (expected !== actual) {
        mismatches += 1;
        if (mismatches <= 10) {
          fail(`${data.surah}:${ayah.number} Arabic differs from the reference`);
        }
      }
    }
  }
  console.log(`Compared ${compared} ayahs, ${mismatches} mismatch(es).`);
}

async function main() {
  const entries = await localChecks();
  if (remote) await remoteChecks(entries);

  if (problems.length > 0) {
    console.error(`\nCorpus verification failed (${problems.length} problem(s)):`);
    for (const problem of problems.slice(0, 40)) console.error(`  - ${problem}`);
    if (problems.length > 40) console.error(`  … and ${problems.length - 40} more`);
    process.exit(1);
  }

  console.log(
    `Corpus OK — ${entries.length} surahs, ` +
      `${entries.reduce((sum, { data }) => sum + data.ayahs.length, 0)} ayahs.`
  );
}

main().catch((err) => {
  console.error(`Verification crashed: ${err.stack ?? err.message}`);
  process.exit(1);
});
