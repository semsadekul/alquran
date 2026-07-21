const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', '..', '..', 'data');
const PUBLIC_DIR = path.join(__dirname, '..', 'public', 'data');

function readJsonFile(filename) {
  const filePath = path.join(DATA_DIR, filename);
  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw);
}

function buildDailyVerses() {
  console.log('Building daily verses data...');

  const arabic = readJsonFile('quran-uthmani.json');
  const bangla = readJsonFile('bn.bengali.json');
  const english = readJsonFile('en.sahih.json');

  // Pre-defined list of beautiful verses for daily rotation
  const dailyVerses = [
    [1, 1], [1, 2], [1, 3], [1, 4], [1, 5], [1, 6], [1, 7],
    [2, 255], [2, 285], [2, 286],
    [3, 8], [3, 26], [3, 27], [3, 190], [3, 191], [3, 192], [3, 193], [3, 194], [3, 195],
    [4, 1], [4, 135],
    [5, 3], [5, 32], [5, 67], [5, 116],
    [6, 12], [6, 54], [6, 103], [6, 160], [6, 161], [6, 162], [6, 163], [6, 164], [6, 165],
    [7, 23],
    [9, 18], [9, 40], [9, 51], [9, 128], [9, 129],
    [10, 57], [10, 58], [10, 107],
    [11, 6], [11, 88], [11, 90],
    [12, 53], [12, 87], [12, 101],
    [13, 11], [13, 28],
    [14, 7], [14, 34], [14, 41],
    [15, 9], [15, 99], [15, 100],
    [16, 125], [16, 126], [16, 127], [16, 128],
    [17, 23], [17, 24], [17, 80],
    [18, 1], [18, 10], [18, 23], [18, 24], [18, 39], [18, 40], [18, 69], [18, 109], [18, 110],
    [19, 2], [19, 30], [19, 31], [19, 32], [19, 33], [19, 64], [19, 65],
    [20, 1], [20, 2], [20, 3], [20, 4], [20, 5], [20, 6], [20, 7], [20, 8], [20, 9], [20, 10],
    [20, 11], [20, 12], [20, 13], [20, 14], [20, 15], [20, 16], [20, 17], [20, 18], [20, 19], [20, 20],
    [20, 25], [20, 26], [20, 27], [20, 28], [20, 29], [20, 30], [20, 31], [20, 32], [20, 33], [20, 34],
    [20, 114],
    [21, 30], [21, 83], [21, 87], [21, 88], [21, 89], [21, 90], [21, 91], [21, 92], [21, 93], [21, 94],
    [22, 1], [22, 2], [22, 3], [22, 4], [22, 5], [22, 6], [22, 7], [22, 8], [22, 9], [22, 10],
    [23, 1], [23, 2], [23, 3], [23, 4], [23, 5], [23, 6], [23, 7], [23, 8], [23, 9], [23, 10],
    [24, 1], [24, 2], [24, 3], [24, 4], [24, 5], [24, 6], [24, 7], [24, 8], [24, 9], [24, 10],
    [25, 1], [25, 2], [25, 3], [25, 4], [25, 5], [25, 6], [25, 7], [25, 8], [25, 9], [25, 10],
    [26, 1], [26, 2], [26, 3], [26, 4], [26, 5], [26, 6], [26, 7], [26, 8], [26, 9], [26, 10],
    [27, 1], [27, 2], [27, 3], [27, 4], [27, 5], [27, 6], [27, 7], [27, 8], [27, 9], [27, 10],
    [28, 1], [28, 2], [28, 3], [28, 4], [28, 5], [28, 6], [28, 7], [28, 8], [28, 9], [28, 10],
    [29, 1], [29, 2], [29, 3], [29, 4], [29, 5], [29, 6], [29, 7], [29, 8], [29, 9], [29, 10],
    [30, 1], [30, 2], [30, 3], [30, 4], [30, 5], [30, 6], [30, 7], [30, 8], [30, 9], [30, 10],
    [36, 1], [36, 2], [36, 3], [36, 4], [36, 5], [36, 6], [36, 7], [36, 8], [36, 9], [36, 10],
    [41, 37],
    [55, 1], [55, 2], [55, 3], [55, 4], [55, 5], [55, 6], [55, 7], [55, 8], [55, 9], [55, 10],
    [56, 1], [56, 2], [56, 3], [56, 4], [56, 5], [56, 6], [56, 7], [56, 8], [56, 9], [56, 10],
    [59, 22], [59, 23], [59, 24],
    [67, 1], [67, 2], [67, 3], [67, 4], [67, 5], [67, 6], [67, 7], [67, 8], [67, 9], [67, 10],
    [96, 1], [96, 2], [96, 3], [96, 4], [96, 5],
    [112, 1], [112, 2], [112, 3], [112, 4],
    [113, 1], [113, 2], [113, 3], [113, 4], [113, 5],
    [114, 1], [114, 2], [114, 3], [114, 4], [114, 5], [114, 6],
  ];

  const surahs = arabic.data.surahs;

  const result = dailyVerses.map(([surahNum, ayahNum]) => {
    const arSurah = surahs[surahNum - 1];
    if (!arSurah) return null;

    const ayah = arSurah.ayahs.find(a => a.numberInSurah === ayahNum);
    if (!ayah) return null;

    const bnSurah = bangla.data.surahs[surahNum - 1];
    const enSurah = english.data.surahs[surahNum - 1];

    const bnAyah = bnSurah?.ayahs.find(a => a.numberInSurah === ayahNum);
    const enAyah = enSurah?.ayahs.find(a => a.numberInSurah === ayahNum);

    return {
      surah: surahNum,
      ayah: ayahNum,
      arabic: ayah.text,
      bangla: bnAyah?.text || '',
      english: enAyah?.text || '',
      surahName: arSurah.englishName,
    };
  }).filter(Boolean);

  if (!fs.existsSync(PUBLIC_DIR)) {
    fs.mkdirSync(PUBLIC_DIR, { recursive: true });
  }

  const outputPath = path.join(PUBLIC_DIR, 'daily-verses.json');
  fs.writeFileSync(outputPath, JSON.stringify(result));
  console.log(`Daily verses built: ${result.length} verses at ${outputPath}`);
}

buildDailyVerses();
