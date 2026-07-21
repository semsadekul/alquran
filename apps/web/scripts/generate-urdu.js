/**
 * Generate ur.urd.json (Urdu translation) from the AlQuran Cloud API.
 * Run: node scripts/generate-urdu.js
 */
const fs = require('fs');
const path = require('path');
const https = require('https');

const OUTPUT_PATH = path.join(__dirname, '..', '..', '..', 'data', 'ur.urd.json');

function fetch(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'AlQuran-Web-Builder' } }, (res) => {
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
    }).on('error', reject);
  });
}

async function fetchSurah(surahNumber) {
  const apiUrl = `https://api.alquran.cloud/v1/surah/${surahNumber}/editions/ur.urd`;
  const raw = await fetch(apiUrl);
  const json = JSON.parse(raw);

  if (json.code !== 200 || !json.data || !json.data[0]) {
    return null;
  }

  const surahEntry = json.data[0];
  const ayahs = surahEntry.ayahs.map((ayah) => ({
    number: ayah.numberInSurah,
    text: ayah.text.replace(/^\uFEFF/, ''), // strip BOM
    numberInSurah: ayah.numberInSurah,
  }));

  return {
    number: surahEntry.number,
    ayahs,
  };
}

async function main() {
  console.log('Fetching Urdu translations from AlQuran Cloud API...');

  const surahs = [];
  const total = 114;

  for (let i = 1; i <= total; i++) {
    process.stdout.write(`\rProgress: ${i}/${total}`);
    try {
      const surah = await fetchSurah(i);
      if (surah) {
        surahs.push(surah);
      }
    } catch (err) {
      console.log(`\nError on surah ${i}:`, err.message);
    }

    // Rate limiting — 200ms between requests
    if (i % 10 === 0) {
      await new Promise((r) => setTimeout(r, 2000));
    } else {
      await new Promise((r) => setTimeout(r, 200));
    }
  }

  console.log(`\n\nSuccess! Generated data for ${surahs.length} surahs`);

  const output = {
    code: 200,
    status: 'OK',
    data: {
      surahs,
    },
  };

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2), 'utf-8');
  console.log(`Written to ${OUTPUT_PATH}`);
}

main().catch((err) => {
  console.error('Fatal error:', err.message);
  process.exit(1);
});
