const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', '..', '..', 'data');
const PUBLIC_DIR = path.join(__dirname, '..', 'public');
function readJsonFile(filename) {
  const filePath = path.join(DATA_DIR, filename);
  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw);
}

function buildIndex() {
  console.log('Building search index...');
  const arabic = readJsonFile('quran-uthmani.json');
  const bangla = readJsonFile('bn.bengali.json');
  const english = readJsonFile('en.sahih.json');
  const translit = readJsonFile('en.transliteration.json');

  const allVerses = [];

  for (let surahNumber = 1; surahNumber <= 114; surahNumber++) {
    const arSurah = arabic.data.surahs[surahNumber - 1];
    const bnSurah = bangla.data.surahs[surahNumber - 1];
    const enSurah = english.data.surahs[surahNumber - 1];
    const trSurah = translit.data.surahs[surahNumber - 1];

    if (!arSurah || !bnSurah || !enSurah || !trSurah) continue;

    for (let i = 0; i < arSurah.ayahs.length; i++) {
      allVerses.push({
        number: arSurah.ayahs[i].number,
        surah: surahNumber,
        surahName: enSurah.englishName,
        numberOfAyahs: arSurah.ayahs.length,
        ayah: arSurah.ayahs[i].numberInSurah,
        arabic: arSurah.ayahs[i].text,
        bangla: bnSurah.ayahs[i].text,
        english: enSurah.ayahs[i].text,
        transliteration: trSurah.ayahs[i].text,
      });
    }
  }

  if (!fs.existsSync(PUBLIC_DIR)) {
    fs.mkdirSync(PUBLIC_DIR, { recursive: true });
  }

  const outputPath = path.join(PUBLIC_DIR, 'search-index.json');
  fs.writeFileSync(outputPath, JSON.stringify(allVerses));
  console.log(`Search index built with ${allVerses.length} verses at ${outputPath}`);
}

buildIndex();
