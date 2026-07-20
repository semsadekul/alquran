import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DATA_DIR = join(__dirname, '..', '..', '..', 'data');
const PUBLIC_DIR = join(__dirname, '..', 'public', 'data');

function readJsonFile(filename) {
  const filePath = join(DATA_DIR, filename);
  const raw = readFileSync(filePath, 'utf-8');
  return JSON.parse(raw);
}

// Bengali surah names for reference badges
const SURAH_NAMES_BN = {
  1: 'আল-ফাতিহা', 2: 'আল-বাকারা', 3: 'আলে ইমরান', 4: 'আন-নিসা',
  5: 'আল-মায়িদা', 6: 'আল-আন\'আম', 7: 'আল-আ\'রাফ', 8: 'আল-আনফাল',
  9: 'আত-তাওবা', 10: 'ইউনুস', 11: 'হুদ', 12: 'ইউসুফ',
  13: 'আর-রা\'দ', 14: 'ইবরাহিম', 15: 'আল-হিজর', 16: 'আন-নাহল',
  17: 'বনী ইসরাঈল', 18: 'আল-কাহফ', 19: 'মারইয়াম', 20: 'তা-হা',
  21: 'আল-আম্বিয়া', 22: 'আল-হাজ্জ', 23: 'আল-মু\'মিনূন', 24: 'আন-নূর',
  25: 'আল-ফুরকান', 26: 'আশ-শু\'আরা', 27: 'আন-নামল', 28: 'আল-কাসাস',
  29: 'আল-আনকাবূত', 30: 'আর-রূম', 31: 'লুকমান', 32: 'আস-সাজদা',
  33: 'আল-আহযাব', 34: 'সাবা', 35: 'ফাতির', 36: 'ইয়াসীন',
  37: 'আস-সাফফাত', 38: 'সোয়াদ', 39: 'আয-যুমার', 40: 'গাফির',
  41: 'ফুসসিলাত', 42: 'আশ-শূরা', 43: 'আয-যুখরুফ', 44: 'আদ-দুখান',
  45: 'আল-জাসিয়া', 46: 'আল-আহকাফ', 47: 'মুহাম্মদ', 48: 'আল-ফাতহ',
  49: 'আল-হুজুরাত', 50: 'কাফ', 51: 'আয-যারিয়াত', 52: 'আত-তূর',
  53: 'আন-নাজম', 54: 'আল-ক্বামার', 55: 'আর-রাহমান', 56: 'আল-ওয়াক্বি\'আ',
  57: 'আল-হাদীদ', 58: 'আল-মুজাদালা', 59: 'আল-হাশর', 60: 'আল-মুমতাহানা',
  61: 'আস-সাফ', 62: 'আল-জুমু\'আ', 63: 'আল-মুনাফিকূন', 64: 'আত-তাগাবুন',
  65: 'আত-তালাক', 66: 'আত-তাহরীম', 67: 'আল-মুলক', 68: 'আল-ক্বালাম',
  69: 'আল-হাক্কা', 70: 'আল-মা\'আরিজ', 71: 'নূহ', 72: 'আল-জিন',
  73: 'আল-মুজাম্মিল', 74: 'আল-মুদ্দাসসির', 75: 'আল-ক্বিয়ামা', 76: 'আল-ইনসান',
  77: 'আল-মুরসালাত', 78: 'আন-নাবা', 79: 'আন-নাযি\'আত', 80: 'আবাসা',
  81: 'আত-তাকভীর', 82: 'আল-ইনফিতার', 83: 'আল-মুতাফফিফীন', 84: 'আল-ইনশিক্বাক',
  85: 'আল-বুরূজ', 86: 'আত-তারিক', 87: 'আল-আ\'লা', 88: 'আল-গাশিয়া',
  89: 'আল-ফাজর', 90: 'আল-বালাদ', 91: 'আশ-শামস', 92: 'আল-লাইল',
  93: 'আদ-দুহা', 94: 'আলাম নাশরাহ', 95: 'আত-তীন', 96: 'আল-আলাক',
  97: 'আল-ক্বদর', 98: 'আল-বাইয়্যিনা', 99: 'আয-যালযালা', 100: 'আল-আদিয়াত',
  101: 'আল-ক্বারি\'আ', 102: 'আত-তাকাসুর', 103: 'আল-আসর', 104: 'আল-হুমাযা',
  105: 'আল-ফীল', 106: 'কুরাইশ', 107: 'আল-মাউন', 108: 'আল-কাওসার',
  109: 'আল-কাফিরূন', 110: 'আন-নাসর', 111: 'আল-মাসাদ', 112: 'আল-ইখলাস',
  113: 'আল-ফালাক', 114: 'আন-নাস',
};

// English surah names
const SURAH_NAMES_EN = {
  1: 'Al-Fatiha', 2: 'Al-Baqara', 3: 'Aal-e-Imran', 4: 'An-Nisa',
  5: 'Al-Ma\'ida', 6: 'Al-An\'am', 7: 'Al-A\'raf', 8: 'Al-Anfal',
  9: 'At-Tawba', 10: 'Yunus', 11: 'Hud', 12: 'Yusuf',
  13: 'Ar-Ra\'d', 14: 'Ibrahim', 15: 'Al-Hijr', 16: 'An-Nahl',
  17: 'Al-Isra', 18: 'Al-Kahf', 19: 'Maryam', 20: 'Ta-Ha',
  21: 'Al-Anbiya', 22: 'Al-Hajj', 23: 'Al-Mu\'minun', 24: 'An-Nur',
  25: 'Al-Furqan', 26: 'Ash-Shu\'ara', 27: 'An-Naml', 28: 'Al-Qasas',
  29: 'Al-Ankabut', 30: 'Ar-Rum', 31: 'Luqman', 32: 'As-Sajda',
  33: 'Al-Ahzab', 34: 'Saba', 35: 'Fatir', 36: 'Ya-Sin',
  37: 'As-Saffat', 38: 'Sad', 39: 'Az-Zumar', 40: 'Ghafir',
  41: 'Fussilat', 42: 'Ash-Shura', 43: 'Az-Zukhruf', 44: 'Ad-Dukhan',
  45: 'Al-Jathiya', 46: 'Al-Ahqaf', 47: 'Muhammad', 48: 'Al-Fath',
  49: 'Al-Hujurat', 50: 'Qaf', 51: 'Adh-Dhariyat', 52: 'At-Tur',
  53: 'An-Najm', 54: 'Al-Qamar', 55: 'Ar-Rahman', 56: 'Al-Waqi\'a',
  57: 'Al-Hadid', 58: 'Al-Mujadila', 59: 'Al-Hashr', 60: 'Al-Mumtahana',
  61: 'As-Saff', 62: 'Al-Jumu\'a', 63: 'Al-Munafiqun', 64: 'At-Taghabun',
  65: 'At-Talaq', 66: 'At-Tahrim', 67: 'Al-Mulk', 68: 'Al-Qalam',
  69: 'Al-Haqqa', 70: 'Al-Ma\'arij', 71: 'Nuh', 72: 'Al-Jinn',
  73: 'Al-Muzzammil', 74: 'Al-Muddaththir', 75: 'Al-Qiyama', 76: 'Al-Insan',
  77: 'Al-Mursalat', 78: 'An-Naba', 79: 'An-Nazi\'at', 80: 'Abasa',
  81: 'At-Takwir', 82: 'Al-Infitar', 83: 'Al-Mutaffifin', 84: 'Al-Inshiqaq',
  85: 'Al-Buruj', 86: 'At-Tariq', 87: 'Al-A\'la', 88: 'Al-Ghashiya',
  89: 'Al-Fajr', 90: 'Al-Balad', 91: 'Ash-Shams', 92: 'Al-Layl',
  93: 'Ad-Duha', 94: 'Al-Inshirah', 95: 'At-Tin', 96: 'Al-Alaq',
  97: 'Al-Qadr', 98: 'Al-Bayyina', 99: 'Az-Zalzala', 100: 'Al-Adiyat',
  101: 'Al-Qari\'a', 102: 'At-Takathur', 103: 'Al-Asr', 104: 'Al-Humaza',
  105: 'Al-Fil', 106: 'Quraysh', 107: 'Al-Ma\'un', 108: 'Al-Kawthar',
  109: 'Al-Kafirun', 110: 'An-Nasr', 111: 'Al-Masad', 112: 'Al-Ikhlas',
  113: 'Al-Falaq', 114: 'An-Nas',
};

// Manually defined dua groupings with meaningful titles
// Each entry has refs (consecutive ayah ranges from same surah) and a title
const DUA_DEFINITIONS = [
  { refs: [{ surah: 2, ayahStart: 127, ayahEnd: 128 }], en: 'Dua for Building the Kaaba', bn: 'কাবা নির্মাণের দু\'আ' },
  { refs: [{ surah: 2, ayahStart: 201, ayahEnd: 201 }], en: 'Dua for Good in This World and the Hereafter', bn: 'দুনিয়া ও আখিরাতের কল্যাণের দু\'আ' },
  { refs: [{ surah: 2, ayahStart: 250, ayahEnd: 250 }], en: 'Dua of the Army for Steadfastness', bn: 'সৈন্যদলের অবিচলতার দু\'আ' },
  { refs: [{ surah: 2, ayahStart: 260, ayahEnd: 260 }], en: 'Dua of Ibrahim for Acceptance', bn: 'ইবরাহিম (আ.)-এর কবুলের দু\'আ' },
  { refs: [{ surah: 2, ayahStart: 285, ayahEnd: 286 }], en: 'Dua for Forgiveness and Mercy', bn: 'ক্ষমা ও রহমতের দু\'আ' },
  { refs: [{ surah: 3, ayahStart: 8, ayahEnd: 9 }], en: 'Dua for Steadfastness on the Straight Path', bn: 'সিরাতুল মুস্তাকীমে স্থির থাকার দু\'আ' },
  { refs: [{ surah: 3, ayahStart: 16, ayahEnd: 16 }], en: 'Dua for Forgiveness and Paradise', bn: 'ক্ষমা ও জান্নাতের দু\'আ' },
  { refs: [{ surah: 3, ayahStart: 26, ayahEnd: 27 }], en: 'Dua of the Believers for Divine Help', bn: 'মুমিনদের সাহায্যের দু\'আ' },
  { refs: [{ surah: 3, ayahStart: 38, ayahEnd: 38 }], en: 'Dua of Zakariya for Righteous Offspring', bn: 'যাকারিয়া (আ.)-এর সন্তানের দু\'আ' },
  { refs: [{ surah: 3, ayahStart: 53, ayahEnd: 53 }], en: 'Dua for Faith and Steadfastness', bn: 'ঈমান ও অবিচলতার দু\'আ' },
  { refs: [{ surah: 3, ayahStart: 147, ayahEnd: 147 }], en: 'Dua of the Believers in Battle', bn: 'যুদ্ধে মুমিনদের দু\'আ' },
  { refs: [{ surah: 3, ayahStart: 191, ayahEnd: 194 }], en: 'Dua for Forgiveness, Mercy, and Protection', bn: 'ক্ষমা, রহমত ও রক্ষার দু\'আ' },
  { refs: [{ surah: 5, ayahStart: 83, ayahEnd: 83 }], en: 'Dua of the Believers for Righteousness', bn: 'মুমিনদের তাকওয়ার দু\'আ' },
  { refs: [{ surah: 7, ayahStart: 23, ayahEnd: 23 }], en: 'Dua of the People of A\'raf', bn: 'আল-আ\'রাফের অধিবাসীদের দু\'আ' },
  { refs: [{ surah: 7, ayahStart: 47, ayahEnd: 47 }], en: 'Dua of the Righteous Entering Paradise', bn: 'জান্নাতে প্রবেশকারীদের দু\'আ' },
  { refs: [{ surah: 7, ayahStart: 89, ayahEnd: 89 }], en: 'Dua of Shu\'ayb for Forgiveness', bn: 'শু\'আয়েব (আ.)-এর ক্ষমার দু\'আ' },
  { refs: [{ surah: 7, ayahStart: 126, ayahEnd: 126 }], en: 'Dua of Musa and the Believers', bn: 'মূসা (আ.) ও মুমিনদের দু\'আ' },
  { refs: [{ surah: 10, ayahStart: 85, ayahEnd: 86 }], en: 'Dua of the Believers in Yunus', bn: 'ইউনুসে মুমিনদের দু\'আ' },
  { refs: [{ surah: 14, ayahStart: 38, ayahEnd: 38 }, { surah: 14, ayahStart: 40, ayahEnd: 41 }], en: 'Dua of Ibrahim for Parents and Believers', bn: 'ইবরাহিম (আ.)-এর পিতামাতা ও মুমিনদের দু\'আ' },
  { refs: [{ surah: 18, ayahStart: 10, ayahEnd: 10 }], en: 'Dua of the Youth in the Cave', bn: 'গুহার যুবকদের দু\'আ' },
  { refs: [{ surah: 21, ayahStart: 83, ayahEnd: 84 }], en: 'Dua of Ayyub for Relief', bn: 'আইয়ূব (আ.)-এর কষ্ট নিবারণের দু\'আ' },
  { refs: [{ surah: 21, ayahStart: 87, ayahEnd: 87 }], en: 'Dua of Yunus from the Belly of the Whale', bn: 'ইউনুস (আ.)-এর মাছের পেট থেকে দু\'আ' },
  { refs: [{ surah: 21, ayahStart: 89, ayahEnd: 89 }], en: 'Dua of Zakariya in Distress', bn: 'যাকারিয়া (আ.)-এর সংকটের দু\'আ' },
  { refs: [{ surah: 23, ayahStart: 97, ayahEnd: 97 }], en: 'Dua for Protection from Shaytan', bn: 'শয়তান থেকে আশ্রয়ের দু\'আ' },
  { refs: [{ surah: 23, ayahStart: 109, ayahEnd: 109 }], en: 'Dua of the Believers for Mercy and Forgiveness', bn: 'মুমিনদের রহমত ও ক্ষমার দু\'আ' },
  { refs: [{ surah: 25, ayahStart: 65, ayahEnd: 65 }], en: 'Dua for Mercy and Refuge from Evil', bn: 'রহমত ও অনিষ্ট থেকে আশ্রয়ের দু\'আ' },
  { refs: [{ surah: 25, ayahStart: 74, ayahEnd: 74 }], en: 'Dua for Spouses and Offspring as Comfort', bn: 'স্ত্রী ও সন্তানদের চক্ষুর শীতলতার দু\'আ' },
  { refs: [{ surah: 40, ayahStart: 7, ayahEnd: 9 }], en: 'Dua of the Believers for Forgiveness', bn: 'মুমিনদের ক্ষমার দু\'আ' },
  { refs: [{ surah: 59, ayahStart: 10, ayahEnd: 10 }], en: 'Dua for Righteousness and Forgiveness', bn: 'সৎকর্ম ও ক্ষমার দু\'আ' },
  { refs: [{ surah: 60, ayahStart: 4, ayahEnd: 5 }], en: 'Dua of Ibrahim as a Separate Nation', bn: 'ইবরাহিম (আ.)-এর উম্মত হওয়ার দু\'আ' },
  { refs: [{ surah: 66, ayahStart: 8, ayahEnd: 8 }], en: 'Dua of the Believers in At-Tahrim', bn: 'আত-তাহরীমে মুমিনদের দু\'আ' },
];

function buildDuas() {
  console.log('Building duas data...');

  const arabic = readJsonFile('quran-uthmani.json');
  const bangla = readJsonFile('bn.bengali.json');
  const english = readJsonFile('en.sahih.json');
  const translit = readJsonFile('en.transliteration.json');

  function getVerse(surahNum, ayahNum) {
    const arSurah = arabic.data.surahs[surahNum - 1];
    const bnSurah = bangla.data.surahs[surahNum - 1];
    const enSurah = english.data.surahs[surahNum - 1];
    const trSurah = translit.data.surahs[surahNum - 1];

    if (!arSurah || !bnSurah || !enSurah || !trSurah) return null;

    const arVerse = arSurah.ayahs.find(a => a.numberInSurah === ayahNum);
    const bnVerse = bnSurah.ayahs.find(a => a.numberInSurah === ayahNum);
    const enVerse = enSurah.ayahs.find(a => a.numberInSurah === ayahNum);
    const trVerse = trSurah.ayahs.find(a => a.numberInSurah === ayahNum);

    if (!arVerse || !bnVerse || !enVerse || !trVerse) return null;

    return {
      surah: surahNum,
      ayah: ayahNum,
      arabic: arVerse.text,
      bangla: bnVerse.text,
      english: enVerse.text,
      transliteration: trVerse.text,
    };
  }

  const duas = DUA_DEFINITIONS.map((def, idx) => {
    const verses = [];
    for (const ref of def.refs) {
      for (let ayahNum = ref.ayahStart; ayahNum <= ref.ayahEnd; ayahNum++) {
        const verse = getVerse(ref.surah, ayahNum);
        if (verse) {
          verses.push(verse);
        } else {
          console.warn(`Warning: Could not find verse ${ref.surah}:${ayahNum}`);
        }
      }
    }

    return {
      id: idx + 1,
      titleEn: def.en,
      titleBn: def.bn,
      refs: def.refs,
      surahNameEn: SURAH_NAMES_EN[def.refs[0].surah] || '',
      surahNameBn: SURAH_NAMES_BN[def.refs[0].surah] || '',
      verses,
    };
  });

  const validDuas = duas.filter(d => d.verses.length > 0);

  if (!existsSync(PUBLIC_DIR)) {
    mkdirSync(PUBLIC_DIR, { recursive: true });
  }

  const outputPath = join(PUBLIC_DIR, 'duas.json');
  writeFileSync(outputPath, JSON.stringify(validDuas, null, 2), 'utf-8');
  console.log(`Duas built: ${validDuas.length} duas, ${validDuas.reduce((s, d) => s + d.verses.length, 0)} verses`);
  console.log(`Output: ${outputPath}`);
}

buildDuas();
