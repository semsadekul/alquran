const fs = require('fs');
const path = require('path');
const https = require('https');

const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
}

const resources = [
  {
    name: 'surahs',
    url: 'https://api.alquran.cloud/v1/surah',
    varName: 'quranSurahs'
  },
  {
    name: 'quran-uthmani',
    url: 'https://api.alquran.cloud/v1/quran/quran-uthmani',
    varName: 'quranArabic'
  },
  {
    name: 'bn.bengali',
    url: 'https://api.alquran.cloud/v1/quran/bn.bengali',
    varName: 'quranBangla'
  },
  {
    name: 'en.sahih',
    url: 'https://api.alquran.cloud/v1/quran/en.sahih',
    varName: 'quranEnglish'
  },
  {
    name: 'en.transliteration',
    url: 'https://api.alquran.cloud/v1/quran/en.transliteration',
    varName: 'quranTranslit'
  }
];

function downloadFile(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`Failed to download ${url}: status code ${res.statusCode}`));
        return;
      }
      let rawData = '';
      res.on('data', (chunk) => { rawData += chunk; });
      res.on('end', () => {
        try {
          // Parse to verify it's valid JSON
          JSON.parse(rawData);
          resolve(rawData);
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

async function run() {
  // First, convert the existing bangla_pronunciation.json if it exists
  const bpJsonPath = path.join(dataDir, 'bangla_pronunciation.json');
  const bpJsPath = path.join(dataDir, 'bangla_pronunciation.js');
  if (fs.existsSync(bpJsonPath)) {
    try {
      console.log('Converting bangla_pronunciation.json to JS...');
      const content = fs.readFileSync(bpJsonPath, 'utf8');
      fs.writeFileSync(bpJsPath, `window.banglaPronunciation = ${content};`, 'utf8');
      console.log('Successfully converted bangla_pronunciation.js');
    } catch (e) {
      console.error('Failed to convert bangla_pronunciation.json:', e.message);
    }
  }

  for (const res of resources) {
    const jsonPath = path.join(dataDir, `${res.name}.json`);
    const jsPath = path.join(dataDir, `${res.name}.js`);

    try {
      console.log(`Downloading ${res.name} from ${res.url}...`);
      const data = await downloadFile(res.url);

      console.log(`Saving ${res.name}.json...`);
      fs.writeFileSync(jsonPath, data, 'utf8');

      console.log(`Converting ${res.name} to JS format...`);
      fs.writeFileSync(jsPath, `window.${res.varName} = ${data};`, 'utf8');
      console.log(`Successfully saved and converted ${res.name}!\n`);
    } catch (error) {
      console.error(`Error processing ${res.name}:`, error.message);
    }
  }
  console.log('All offline database files processed successfully!');
}

run();
